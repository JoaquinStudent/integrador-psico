import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { Stroke } from '../canvas/types'
import { DrawingCanvas } from '../canvas/DrawingCanvas'
import { useUndoRedo, useUndoRedoKeyboard } from '../canvas/useUndoRedo'
import { saveDrawingData } from '../lib/drawingData'
import { createSessionChannel, broadcastStroke, broadcastEraseStroke, broadcastStatus, broadcastMetrics } from '../lib/realtime'
import { serializeStrokes } from '../canvas/serialization'
import { calculateMetrics } from '../canvas/metricsCalculator'
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

  useUndoRedoKeyboard(strokeState.undo, strokeState.redo)

  useEffect(() => {
    if (!sessionId) return
    const ch = createSessionChannel(sessionId)
    ch.subscribe()
    channelRef.current = ch
    broadcastStatus(ch, { connected: true, orientation: 'horizontal' })
    return () => {
      broadcastStatus(ch, { connected: false })
      ch.unsubscribe()
    }
  }, [sessionId])

  // Broadcast metrics every 2s
  useEffect(() => {
    const iv = setInterval(() => {
      if (!channelRef.current) return
      const m = calculateMetrics(strokeState.current, sessionStartRef.current, eraseCountRef.current, W, H, firstStrokeTimeRef.current)
      broadcastMetrics(channelRef.current, m)
    }, 2000)
    return () => clearInterval(iv)
  }, [strokeState.current])

  const handleStrokeComplete = useCallback((stroke: Stroke) => {
    if (!firstStrokeTimeRef.current) firstStrokeTimeRef.current = Date.now()
    const next = [...strokeState.current, stroke]
    strokeState.set(next)
    if (channelRef.current) {
      const [serialized] = serializeStrokes([stroke])
      broadcastStroke(channelRef.current, serialized)
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
    if (channelRef.current) {
      const m = calculateMetrics(strokeState.current, sessionStartRef.current, eraseCountRef.current, W, H, firstStrokeTimeRef.current)
      broadcastMetrics(channelRef.current, m)
      broadcastStatus(channelRef.current, { patientFinished: true })
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
