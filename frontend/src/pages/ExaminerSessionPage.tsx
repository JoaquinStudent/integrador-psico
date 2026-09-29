import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { Stroke } from '../canvas/types'
import type { LiveMetrics as MetricsType } from '../canvas/metricsCalculator'
import { formatTime } from '../canvas/metricsCalculator'
import { deserializeStrokes } from '../canvas/serialization'
import { CanvasMirror } from '../canvas/CanvasMirror'
import { LiveMetrics } from '../components/session/LiveMetrics'
import { ObservationsPanel } from '../components/session/ObservationsPanel'
import { useSession, finalizeSession } from '../lib/sessions'
import { createSessionChannel, subscribeToStrokes, subscribeToMetrics, subscribeToStatus } from '../lib/realtime'
import { AudioRecorder } from '../components/session/AudioRecorder'
import type { RealtimeChannel } from '@supabase/supabase-js'

const EMPTY_METRICS: MetricsType = { elapsedMs: 0, latencyMs: 0, strokeCount: 0, pressureAvg: 0, pauseCount: 0, eraseCount: 0, areaPct: 0 }

export function ExaminerSessionPage() {
  const { id: sessionId } = useParams()
  const navigate = useNavigate()
  const { session, patient, loading } = useSession(sessionId)
  const [strokes, setStrokes] = useState<Stroke[]>([])
  const [metrics, setMetrics] = useState<MetricsType>(EMPTY_METRICS)
  const [tabletStatus, setTabletStatus] = useState<Record<string, unknown>>({})
  const [elapsedMs, setElapsedMs] = useState(0)
  const channelRef = useRef<RealtimeChannel | null>(null)

  // Local timer
  useEffect(() => {
    if (!session?.started_at) return
    const start = new Date(session.started_at).getTime()
    const iv = setInterval(() => setElapsedMs(Date.now() - start), 1000)
    return () => clearInterval(iv)
  }, [session?.started_at])

  // Realtime subscription
  useEffect(() => {
    if (!sessionId) return
    const ch = createSessionChannel(sessionId)

    subscribeToStrokes(ch,
      (strokeData) => {
        const [stroke] = deserializeStrokes([strokeData as never])
        if (stroke) setStrokes(prev => [...prev, stroke])
      },
      (indexes) => {
        setStrokes(prev => prev.filter((_, i) => !indexes.includes(i)))
      }
    )
    subscribeToMetrics(ch, (m) => setMetrics(m as MetricsType))
    subscribeToStatus(ch, (s) => {
      setTabletStatus(s)
      if (s.patientFinished) setTabletStatus(prev => ({ ...prev, patientFinished: true }))
    })

    ch.subscribe()
    channelRef.current = ch
    return () => { ch.unsubscribe() }
  }, [sessionId])

  const handleFinalize = async () => {
    if (!sessionId || !confirm('¿Finalizar esta sesión?')) return
    await finalizeSession(sessionId, {
      total_time_ms: metrics.elapsedMs,
      latency_ms: metrics.latencyMs,
      stroke_count: metrics.strokeCount,
      pressure_avg: metrics.pressureAvg,
      pause_count: metrics.pauseCount,
      erase_count: metrics.eraseCount,
      area_pct: metrics.areaPct,
    })
    navigate(`/sesion/${sessionId}/observaciones`)
  }

  if (loading) return <div style={{ padding: 40, color: '#6B6885' }}>Cargando sesión...</div>
  if (!session) return <div style={{ padding: 40 }}>Sesión no encontrada</div>

  const isConnected = tabletStatus.connected === true
  const isFinished = tabletStatus.patientFinished === true
  const isDrawing = isConnected && !isFinished && strokes.length > 0

  return (
    <div className="examiner-session">
      <div className="session-bar">
        <div className="session-bar-left">
          <span className="session-patient-name">{patient?.full_name ?? '...'}</span>
          <span className="session-test-label">Persona bajo la lluvia (PBLL)</span>
        </div>
        <div className="session-bar-center">
          <span className="recording-dot" />
          <span className="session-timer">{formatTime(elapsedMs)}</span>
          <span className="session-timer-label">Sesión activa</span>
          <AudioRecorder sessionId={sessionId!} />
        </div>
        <div className="session-bar-right">
          <button className="btn-finalize" onClick={handleFinalize}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
            Finalizar sesión
          </button>
        </div>
      </div>

      <div className="session-columns">
        <div className="session-col-canvas">
          <div className="session-panel-header">
            <h3 className="session-panel-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/></svg>
              Dibujo en tiempo real
            </h3>
            <div className="session-badges">
              <span className={`badge-status ${isConnected ? 'connected' : 'disconnected'}`}>
                <span className="status-dot" />
                {isConnected ? 'Tablet conectada' : 'Sin conexión'}
              </span>
              <span className="badge-info">Orientación: horizontal</span>
            </div>
          </div>
          <div className="mirror-container">
            <CanvasMirror strokes={strokes} />
            {isDrawing && (
              <div className="drawing-indicator">Paciente dibujando...</div>
            )}
            {isFinished && (
              <div className="drawing-indicator finished">Paciente ha terminado</div>
            )}
          </div>
        </div>

        <div className="session-col-observations">
          <ObservationsPanel sessionId={sessionId!} elapsedMs={elapsedMs} />
        </div>

        <div className="session-col-metrics">
          <LiveMetrics metrics={metrics} />
        </div>
      </div>
    </div>
  )
}
