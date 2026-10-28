import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { Stroke } from '../canvas/types'
import { DrawingCanvas } from '../canvas/DrawingCanvas'
import { useUndoRedo, useUndoRedoKeyboard } from '../canvas/useUndoRedo'
import { saveDrawingData } from '../lib/drawingData'
import { borrarBorrador, guardarBorrador, leerBorrador } from '../lib/drawingDraft'
import { api } from '../lib/apiClient'
import { createSessionChannel, broadcastStroke, broadcastEraseStroke, broadcastStatus, broadcastMetrics } from '../lib/realtime'
import { serializeStrokes } from '../canvas/serialization'
import { calculateMetrics } from '../canvas/metricsCalculator'
import { dimensiones, orientacionDeViewport, type Orientacion } from '../canvas/orientation'
import type { Session } from '../types/api'
import type { RealtimeChannel } from '@supabase/supabase-js'

/**
 * Lo único que el paciente ve es una hoja en blanco, lápiz, borrador y deshacer.
 * Nada de color, grosor, guías, cuadrícula ni mensajes de aliento: en un test
 * proyectivo todo eso es estímulo, y lo que se interpreta es lo que el paciente
 * hace sin que nadie se lo sugiera.
 */
export function PatientDrawingPage() {
  const { id: sessionId } = useParams()
  const navigate = useNavigate()
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen')
  const [confirmando, setConfirmando] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errorGuardado, setErrorGuardado] = useState(false)
  const strokeState = useUndoRedo<Stroke[]>([])
  const channelRef = useRef<RealtimeChannel | null>(null)

  // Un borrador local (tablet recargada a mitad de la toma) se recupera una sola vez.
  const borradorRef = useRef(sessionId ? leerBorrador(sessionId) : null)
  const inicioTomaRef = useRef(borradorRef.current?.inicioToma ?? Date.now())
  const firstStrokeTimeRef = useRef<number | null>(null)
  const eraseCountRef = useRef(borradorRef.current?.eraseCount ?? 0)
  // `started_at` del servidor. Es el reloj que cronometra el examinador, y se lee de
  // la sesión en vivo para que aguante una recarga de la tablet.
  const startedAtRef = useRef<string | null>(null)
  const finishedRef = useRef(false)

  // La hoja sigue a la pantalla hasta el primer trazo y ahí se fija: si el paciente
  // gira la tablet antes de empezar, esa es la posición que eligió (RF-17).
  const [orientacion, setOrientacion] = useState<Orientacion>(
    borradorRef.current?.orientation ?? orientacionDeViewport(window.innerWidth, window.innerHeight),
  )
  const fijadaRef = useRef(borradorRef.current !== null && borradorRef.current.strokes.length > 0)
  const orientacionRef = useRef(orientacion)
  orientacionRef.current = orientacion
  const { width: W, height: H } = dimensiones(orientacion)

  useUndoRedoKeyboard(strokeState.undo, strokeState.redo)

  // Recuperar el borrador.
  useEffect(() => {
    const b = borradorRef.current
    if (!b || b.strokes.length === 0) return
    strokeState.set(b.strokes)
    firstStrokeTimeRef.current = b.strokes[0].t0 ?? null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!sessionId) return
    api.get<Session>(`/sessions/${sessionId}`)
      .then(s => { startedAtRef.current = s.started_at ?? null })
      .catch(() => { /* sin esto el examinador cronometra desde su propia lectura */ })
  }, [sessionId])

  // La orientación se actualiza con la pantalla solo mientras la hoja está en blanco.
  useEffect(() => {
    const alGirar = () => {
      if (fijadaRef.current) return
      setOrientacion(orientacionDeViewport(window.innerWidth, window.innerHeight))
    }
    window.addEventListener('resize', alGirar)
    window.addEventListener('orientationchange', alGirar)
    return () => {
      window.removeEventListener('resize', alGirar)
      window.removeEventListener('orientationchange', alGirar)
    }
  }, [])

  // La pantalla no debe apagarse a mitad de una toma de varios minutos.
  useEffect(() => {
    let lock: WakeLockSentinel | null = null
    const pedir = () => {
      navigator.wakeLock?.request('screen').then(l => { lock = l }).catch(() => { /* opcional */ })
    }
    pedir()
    const alVolver = () => { if (document.visibilityState === 'visible') pedir() }
    document.addEventListener('visibilitychange', alVolver)
    return () => {
      document.removeEventListener('visibilitychange', alVolver)
      void lock?.release()
    }
  }, [])

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

  const estado = useCallback(() => ({
    connected: true,
    orientation: orientacionRef.current,
    startedAt: startedAtRef.current,
    drawingStarted: strokeState.current.length > 0,
    patientFinished: finishedRef.current,
  }), [strokeState])

  const metricas = useCallback(() => {
    const { width, height } = dimensiones(orientacionRef.current)
    return calculateMetrics(
      strokeState.current, inicioTomaRef.current, eraseCountRef.current, width, height,
      firstStrokeTimeRef.current,
    )
  }, [strokeState])

  // Un solo tick de 2 s emite metricas **y** estado. El estado va completo cada vez,
  // no solo cuando cambia: el broadcast no reenvia lo pasado, asi que un examinador
  // que abre o recarga el monitoreo a mitad de la toma se sincroniza en 2 s.
  useEffect(() => {
    const emitir = () => {
      const ch = channelRef.current
      if (!ch) return
      broadcastMetrics(ch, metricas())
      broadcastStatus(ch, estado())
    }
    emitir()
    const iv = setInterval(emitir, 2000)
    return () => clearInterval(iv)
  }, [strokeState.current, estado, metricas])

  // Cada cambio de la hoja queda en el borrador local.
  useEffect(() => {
    if (!sessionId || finishedRef.current) return
    if (strokeState.current.length === 0 && eraseCountRef.current === 0) return
    guardarBorrador(sessionId, {
      inicioToma: inicioTomaRef.current,
      orientation: orientacionRef.current,
      eraseCount: eraseCountRef.current,
      strokes: strokeState.current,
    })
  }, [sessionId, strokeState.current])

  const handleStrokeComplete = useCallback((stroke: Stroke) => {
    const primero = strokeState.current.length === 0 && !fijadaRef.current
    if (!firstStrokeTimeRef.current) firstStrokeTimeRef.current = stroke.t0 ?? Date.now()
    fijadaRef.current = true
    const next = [...strokeState.current, stroke]
    strokeState.set(next)
    const ch = channelRef.current
    if (ch) {
      const [serialized] = serializeStrokes([stroke])
      broadcastStroke(ch, serialized)
      // El primer trazo no espera al tick: es lo que arranca la grabacion del
      // examinador, y hasta 2 s de audio perdido son 2 s de sesion sin registrar.
      if (primero) broadcastStatus(ch, { ...estado(), drawingStarted: true })
    }
  }, [strokeState, estado])

  const handleEraseStrokes = useCallback((remaining: Stroke[]) => {
    const removed = strokeState.current.length - remaining.length
    eraseCountRef.current += removed
    const removedIndexes = strokeState.current
      .map((_, i) => i)
      .filter(i => !remaining.includes(strokeState.current[i]))
    strokeState.set(remaining)
    if (channelRef.current) broadcastEraseStroke(channelRef.current, removedIndexes)
  }, [strokeState])

  const terminar = async () => {
    if (saving) return
    setSaving(true)
    setErrorGuardado(false)
    try {
      await saveDrawingData(sessionId!, strokeState.current, {
        inicioToma: inicioTomaRef.current,
        orientation: orientacionRef.current,
      })
    } catch {
      // El dibujo sigue en pantalla y en el borrador local: se puede reintentar sin
      // perder nada. Antes la pantalla se quedaba en "Guardando..." sin decir por que.
      setSaving(false)
      setErrorGuardado(true)
      return
    }
    finishedRef.current = true
    borrarBorrador(sessionId!)
    const ch = channelRef.current
    if (ch) {
      broadcastMetrics(ch, metricas())
      broadcastStatus(ch, { ...estado(), drawingStarted: true, patientFinished: true })
    }
    navigate(`/sesion/${sessionId}/paciente/cierre`)
  }

  return (
    <div className="patient-fullscreen patient-drawing" onContextMenu={e => e.preventDefault()}>
      <div className="drawing-stage">
        <div
          className="drawing-paper"
          style={{ ['--ratio' as string]: W / H }}
          data-orientacion={orientacion}
        >
          <DrawingCanvas
            strokes={strokeState.current}
            onStrokeComplete={handleStrokeComplete}
            onEraseStrokes={handleEraseStrokes}
            tool={tool}
            width={W}
            height={H}
            disabled={confirmando || saving}
          />
        </div>
      </div>

      <div className="drawing-controls">
        <button className="drawing-btn" onClick={strokeState.undo} disabled={!strokeState.canUndo} aria-label="Deshacer" title="Deshacer">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 10h10a5 5 0 0 1 0 10H9"/><polyline points="7 14 3 10 7 6"/></svg>
        </button>
        <button
          className={`drawing-btn${tool === 'eraser' ? ' active' : ''}`}
          onClick={() => setTool(t => t === 'eraser' ? 'pen' : 'eraser')}
          aria-label="Borrador"
          aria-pressed={tool === 'eraser'}
          title="Borrador"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 20H7L3 16l9-9 8 8-4 4z"/><path d="M6.5 13.5l5-5"/></svg>
        </button>
        <button className="drawing-btn-finish" onClick={() => setConfirmando(true)} disabled={saving}>
          Terminé
        </button>
      </div>

      {(confirmando || errorGuardado) && (
        <div className="drawing-modal" role="dialog" aria-modal="true" aria-labelledby="titulo-confirmar">
          <div className="drawing-modal-card">
            {errorGuardado ? (
              <>
                <h2 id="titulo-confirmar">No se pudo guardar</h2>
                <p>Tu dibujo sigue aquí. Vamos a intentarlo de nuevo.</p>
                <div className="drawing-modal-actions">
                  <button className="patient-cta" onClick={terminar} disabled={saving}>
                    {saving ? 'Guardando…' : 'Intentar de nuevo'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 id="titulo-confirmar">¿Terminaste tu dibujo?</h2>
                <div className="drawing-modal-actions">
                  <button className="patient-cta secondary" onClick={() => setConfirmando(false)} disabled={saving}>
                    Seguir dibujando
                  </button>
                  <button className="patient-cta" onClick={terminar} disabled={saving}>
                    {saving ? 'Guardando…' : 'Sí, terminé'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
