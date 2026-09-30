import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { Stroke } from '../canvas/types'
import { DrawingCanvas } from '../canvas/DrawingCanvas'
import { useUndoRedo, useUndoRedoKeyboard } from '../canvas/useUndoRedo'
import { saveDrawingData } from '../lib/drawingData'
import { api } from '../lib/apiClient'
import { createSessionChannel, broadcastStroke, broadcastEraseStroke, broadcastStatus, broadcastMetrics } from '../lib/realtime'
import { serializeStrokes } from '../canvas/serialization'
import { calculateMetrics } from '../canvas/metricsCalculator'
import type { Session } from '../types/api'
import type { RealtimeChannel } from '@supabase/supabase-js'

const W = 1100, H = 850

export function PatientDrawingPage() {
  const { id: sessionId } = useParams()
  const navigate = useNavigate()
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen')
  const [saving, setSaving] = useState(false)
  const strokeState = useUndoRedo<Stroke[]>([])
  const channelRef = useRef<RealtimeChannel | null>(null)
  const sessionStartRef = useRef(Date.now())
  const firstStrokeTimeRef = useRef<number | null>(null)
  const eraseCountRef = useRef(0)
  // `started_at` del servidor. Es el reloj que cronometra el examinador, y se lee de
  // la sesión en vez de pasarse por la URL para que aguante una recarga de la tablet.
  const startedAtRef = useRef<string | null>(null)
  const finishedRef = useRef(false)

  useUndoRedoKeyboard(strokeState.undo, strokeState.redo)

  useEffect(() => {
    if (!sessionId) return
    api.get<Session>(`/sessions/${sessionId}`)
      .then(s => { startedAtRef.current = s.started_at ?? null })
      .catch(() => { /* sin esto el examinador cronometra desde su propia lectura */ })
  }, [sessionId])

  useEffect(() => {
    if (!sessionId) return
    const ch = createSessionChannel(sessionId)
    ch.subscribe()
    channelRef.current = ch
    return () => {
      broadcastStatus(ch, { connected: false })
      ch.unsubscribe()
    }
  }, [sessionId])

  // Un solo tick de 2 s emite metricas **y** estado. El estado va completo cada vez,
  // no solo cuando cambia: el broadcast no reenvia lo pasado, asi que un examinador
  // que abre o recarga el monitoreo a mitad de la toma se sincroniza en 2 s.
  useEffect(() => {
    const emitir = () => {
      const ch = channelRef.current
      if (!ch) return
      const m = calculateMetrics(strokeState.current, sessionStartRef.current, eraseCountRef.current, W, H, firstStrokeTimeRef.current)
      broadcastMetrics(ch, m)
      broadcastStatus(ch, {
        connected: true,
        orientation: 'horizontal',
        startedAt: startedAtRef.current,
        drawingStarted: strokeState.current.length > 0,
        patientFinished: finishedRef.current,
      })
    }
    emitir()
    const iv = setInterval(emitir, 2000)
    return () => clearInterval(iv)
  }, [strokeState.current])

  const handleStrokeComplete = useCallback((stroke: Stroke) => {
    const primero = !firstStrokeTimeRef.current
    if (primero) firstStrokeTimeRef.current = Date.now()
    const next = [...strokeState.current, stroke]
    strokeState.set(next)
    const ch = channelRef.current
    if (ch) {
      const [serialized] = serializeStrokes([stroke])
      broadcastStroke(ch, serialized)
      // El primer trazo no espera al tick: es lo que arranca la grabacion del
      // examinador, y hasta 2 s de audio perdido son 2 s de sesion sin registrar.
      if (primero) {
        broadcastStatus(ch, {
          connected: true,
          orientation: 'horizontal',
          startedAt: startedAtRef.current,
          drawingStarted: true,
        })
      }
    }
  }, [strokeState])

  const handleEraseStrokes = useCallback((remaining: Stroke[]) => {
    const removed = strokeState.current.length - remaining.length
    eraseCountRef.current += removed
    strokeState.set(remaining)
    if (channelRef.current) {
      const removedIndexes = strokeState.current
        .map((_, i) => i)
        .filter(i => !remaining.includes(strokeState.current[i]))
      broadcastEraseStroke(channelRef.current, removedIndexes)
    }
  }, [strokeState])

  const handleFinish = async () => {
    if (saving) return
    setSaving(true)
    const canvas = document.querySelector<HTMLCanvasElement>('.drawing-paper canvas')
    await saveDrawingData(sessionId!, strokeState.current, canvas)
    finishedRef.current = true
    if (channelRef.current) {
      const m = calculateMetrics(strokeState.current, sessionStartRef.current, eraseCountRef.current, W, H, firstStrokeTimeRef.current)
      broadcastMetrics(channelRef.current, m)
      broadcastStatus(channelRef.current, {
        connected: true,
        startedAt: startedAtRef.current,
        drawingStarted: true,
        patientFinished: true,
      })
    }
    navigate(`/sesion/${sessionId}/paciente/cierre`)
  }

  return (
    <div className="patient-fullscreen">
      <div className="drawing-paper">
        <DrawingCanvas
          strokes={strokeState.current}
          onStrokeComplete={handleStrokeComplete}
          onEraseStrokes={handleEraseStrokes}
          tool={tool}
          width={W}
          height={H}
        />
      </div>
      <div className="drawing-controls">
        <button className="drawing-btn" onClick={strokeState.undo} disabled={!strokeState.canUndo} title="Deshacer">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 10h10a5 5 0 0 1 0 10H9"/><polyline points="7 14 3 10 7 6"/></svg>
        </button>
        <button className={`drawing-btn${tool === 'eraser' ? ' active' : ''}`} onClick={() => setTool(t => t === 'eraser' ? 'pen' : 'eraser')} title="Borrador">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 20H7L3 16l9-9 8 8-4 4z"/><path d="M6.5 13.5l5-5"/></svg>
        </button>
        <button className="drawing-btn-finish" onClick={handleFinish} disabled={saving}>
          {saving ? 'Guardando...' : 'Terminé'}
        </button>
      </div>
    </div>
  )
}
