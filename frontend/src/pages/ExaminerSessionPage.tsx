import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { Stroke } from '../canvas/types'
import type { LiveMetrics as MetricsType } from '../canvas/metricsCalculator'
import { formatTime } from '../canvas/metricsCalculator'
import { deserializeStrokes } from '../canvas/serialization'
import { CanvasMirror } from '../canvas/CanvasMirror'
import { LiveMetrics } from '../components/session/LiveMetrics'
import { ObservationsPanel } from '../components/session/ObservationsPanel'
import { ProtocolPanel } from '../components/session/ProtocolPanel'
import { TabletLinkCard } from '../components/session/TabletLinkCard'
import { useSession, finalizeSession } from '../lib/sessions'
import { createSessionChannel, subscribeToStrokes, subscribeToMetrics, subscribeToStatus, type TabletStatus } from '../lib/realtime'
import { AudioRecorder } from '../components/session/AudioRecorder'
import { createAudioRecorder, type AudioRecorderState } from '../lib/audioRecorder'
import { faseDeSesion } from '../lib/protocoloPbll'
import { api } from '../lib/apiClient'
import type { Consent } from '../types/api'
import type { RealtimeChannel } from '@supabase/supabase-js'

const EMPTY_METRICS: MetricsType = { elapsedMs: 0, latencyMs: 0, strokeCount: 0, pressureAvg: 0, pauseCount: 0, eraseCount: 0, areaPct: 0 }

/** Sin novedades de la tablet por más de esto, se la considera desconectada. */
const SIN_SENAL_MS = 6000

export function ExaminerSessionPage() {
  const { id: sessionId } = useParams()
  const navigate = useNavigate()
  const { session, patient, loading } = useSession(sessionId)
  const [strokes, setStrokes] = useState<Stroke[]>([])
  const [metrics, setMetrics] = useState<MetricsType>(EMPTY_METRICS)
  const [tablet, setTablet] = useState<TabletStatus | null>(null)
  const [tabletViva, setTabletViva] = useState(false)
  const ultimaSenalRef = useRef(0)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [marcaActiva, setMarcaActiva] = useState<string | null>(null)
  const [audio, setAudio] = useState<AudioRecorderState>({ status: 'idle', durationMs: 0 })
  const [audioPermitido, setAudioPermitido] = useState(true)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const recorderRef = useRef<ReturnType<typeof createAudioRecorder> | null>(null)
  // Que la grabación automática ocurra una sola vez por sesión: si el examinador la
  // detiene a propósito, el siguiente trazo no debe volver a arrancarla.
  const autoArrancadaRef = useRef(false)

  // El consentimiento manda sobre la grabación. Es la casilla que el paciente firmó,
  // no una preferencia de la interfaz: sin autorización no se graba, ni a mano.
  useEffect(() => {
    if (!sessionId) return
    api.get<Consent>(`/sessions/${sessionId}/consent`)
      .then(c => setAudioPermitido(c.audio_authorized))
      .catch(() => setAudioPermitido(false))
  }, [sessionId])

  // El reloj arranca con el `started_at` que selló el servidor. Llega por dos vías —la
  // lectura inicial de la sesión y el estado que reemite la tablet— porque el
  // examinador suele abrir el monitoreo **antes** de que el paciente toque "Comenzar",
  // y entonces la lectura inicial trae `null`. Antes el efecto salía por el return y
  // el cronómetro se quedaba en 00:00 toda la sesión.
  const inicio = session?.started_at ?? tablet?.startedAt ?? null

  useEffect(() => {
    if (!inicio) return
    const desde = new Date(inicio).getTime()
    const tick = () => setElapsedMs(Date.now() - desde)
    tick()
    const iv = setInterval(tick, 1000)
    return () => clearInterval(iv)
  }, [inicio])

  // Vigilancia aparte de si la tablet sigue ahí. La tablet reemite su estado cada 2 s;
  // si dejó de hacerlo, se apagó o se cayó la red, y hay que decirlo.
  useEffect(() => {
    const iv = setInterval(
      () => setTabletViva(Date.now() - ultimaSenalRef.current < SIN_SENAL_MS),
      2000,
    )
    return () => clearInterval(iv)
  }, [])

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
      setTablet(s)
      ultimaSenalRef.current = Date.now()
      setTabletViva(true)
    })

    ch.subscribe()
    channelRef.current = ch
    return () => { ch.unsubscribe() }
  }, [sessionId])

  const arrancarGrabacion = useCallback(() => {
    if (!sessionId || !audioPermitido) return
    const rec = createAudioRecorder(sessionId, setAudio)
    recorderRef.current = rec
    rec.start()
  }, [sessionId, audioPermitido])

  // La grabación arranca con el primer trazo del paciente, no con un click: cuando el
  // examinador está conduciendo la toma no tiene una mano libre para el botón.
  useEffect(() => {
    if (!tablet?.drawingStarted || autoArrancadaRef.current) return
    if (!audioPermitido || audio.status !== 'idle') return
    autoArrancadaRef.current = true
    arrancarGrabacion()
  }, [tablet?.drawingStarted, audioPermitido, audio.status, arrancarGrabacion])

  const alternarGrabacion = useCallback(() => {
    if (audio.status === 'recording') {
      recorderRef.current?.stop()
      return
    }
    // Detener y volver a grabar produce una grabación nueva, no una continuación: cada
    // tramo se sube como su propio archivo y la sesión termina con varios. Es
    // deliberado —pausar y reanudar un MediaRecorder sin cortar pide mantener los
    // chunks vivos— y el post-sesión ya lista todas las grabaciones de la sesión.
    arrancarGrabacion()
  }, [audio.status, arrancarGrabacion])

  // La respuesta resaltada vuelve a la lista completa al rato. Sin esto el guion se
  // queda clavado en la última marca y deja de servir para lo que venga después.
  useEffect(() => {
    if (!marcaActiva) return
    const t = setTimeout(() => setMarcaActiva(null), 30000)
    return () => clearTimeout(t)
  }, [marcaActiva])

  const handleFinalize = async () => {
    if (!sessionId || !confirm('¿Finalizar esta sesión?')) return
    // Si quedó grabando, se cierra primero: el `onstop` del grabador es el que sube el
    // archivo, y salir de la pantalla sin pararlo pierde el audio de la sesión.
    if (audio.status === 'recording') recorderRef.current?.stop()
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

  const isFinished = tablet?.patientFinished === true
  // Conectada es "dijo que sí y sigue diciéndolo". Una tablet que se apaga deja de
  // reemitir, y sin esta comprobación quedaba marcada como conectada para siempre.
  const isConnected = tablet?.connected === true && (isFinished || tabletViva)
  const isDrawing = isConnected && !isFinished && strokes.length > 0
  const fase = faseDeSesion({ conectada: isConnected, trazos: strokes.length, termino: isFinished })

  return (
    <div className="examiner-session">
      <div className="session-bar">
        <div className="session-bar-left">
          <span className="session-patient-name">{patient?.full_name ?? '...'}</span>
          <span className="session-test-label">Persona bajo la lluvia (PBLL)</span>
        </div>
        <div className="session-bar-center">
          {inicio && <span className="recording-dot" />}
          <span className="session-timer">{formatTime(elapsedMs)}</span>
          <span className="session-timer-label">
            {inicio ? 'Sesión activa' : 'Sin iniciar'}
          </span>
          <AudioRecorder state={audio} onToggle={alternarGrabacion} allowed={audioPermitido} />
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
            {isConnected || strokes.length > 0 ? (
              <>
                <CanvasMirror strokes={strokes} />
                {isDrawing && (
                  <div className="drawing-indicator">Paciente dibujando...</div>
                )}
                {isFinished && (
                  <div className="drawing-indicator finished">Paciente ha terminado</div>
                )}
              </>
            ) : (
              <TabletLinkCard sessionId={sessionId!} />
            )}
          </div>
        </div>

        <div className="session-col-observations">
          <ProtocolPanel fase={fase} marcaActiva={marcaActiva} />
          <ObservationsPanel
            sessionId={sessionId!}
            elapsedMs={elapsedMs}
            onMark={setMarcaActiva}
          />
        </div>

        <div className="session-col-metrics">
          <LiveMetrics metrics={metrics} />
        </div>
      </div>
    </div>
  )
}
