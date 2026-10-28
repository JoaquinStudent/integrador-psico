import { useRef, useEffect, useCallback } from 'react'
import type { Stroke } from './types'
import { DEFAULT_BRUSH } from './types'
import { StrokeBuilder } from './StrokeBuilder'
import { renderSegment, renderStrokes, isPointNearStroke } from './StrokeRenderer'
import { decidir, soltar, ESTADO_INICIAL } from './input'
import type { EstadoEntrada } from './input'

interface Props {
  strokes: Stroke[]
  onStrokeComplete: (stroke: Stroke) => void
  onEraseStrokes: (remainingStrokes: Stroke[]) => void
  tool: 'pen' | 'eraser'
  width?: number
  height?: number
  /** Sin entrada (p. ej. mientras se confirma "Terminé"). */
  disabled?: boolean
}

export function DrawingCanvas({
  strokes, onStrokeComplete, onEraseStrokes, tool, width = 1100, height = 850, disabled = false,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const builderRef = useRef<StrokeBuilder | null>(null)
  const entrada = useRef<EstadoEntrada>(ESTADO_INICIAL)
  const ultimo = useRef<{ x: number; y: number; pressure?: number } | null>(null)

  const fullRender = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, width, height)
    renderStrokes(ctx, strokes)
  }, [strokes, width, height])

  useEffect(() => { fullRender() }, [fullRender])

  /** Coordenadas del lienzo; la hoja se escala a la pantalla pero guarda su tamano. */
  const aLienzo = (clientX: number, clientY: number) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    return {
      x: (clientX - rect.left) * (width / rect.width),
      y: (clientY - rect.top) * (height / rect.height),
    }
  }

  const borrarEn = (x: number, y: number) => {
    const remaining = strokes.filter(s => !isPointNearStroke({ x, y }, s, 15))
    if (remaining.length < strokes.length) onEraseStrokes(remaining)
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled || !canvasRef.current) return
    const r = decidir(entrada.current, { pointerId: e.pointerId, pointerType: e.pointerType })
    entrada.current = r.estado
    if (!r.acepta) return
    canvasRef.current.setPointerCapture(e.pointerId)
    const { x, y } = aLienzo(e.clientX, e.clientY)

    if (tool === 'pen') {
      const builder = new StrokeBuilder(DEFAULT_BRUSH)
      builder.start(x, y, e.pressure, e.pointerType)
      builderRef.current = builder
      ultimo.current = { x, y, pressure: e.pressure > 0 ? e.pressure : undefined }
    } else {
      borrarEn(x, y)
    }
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (entrada.current.activo !== e.pointerId || !canvasRef.current) return

    if (tool === 'eraser') {
      const { x, y } = aLienzo(e.clientX, e.clientY)
      borrarEn(x, y)
      return
    }

    const builder = builderRef.current
    const ctx = canvasRef.current.getContext('2d')
    if (!builder || !ctx) return

    // Un lapiz reporta mas rapido de lo que React pinta: los eventos intermedios
    // conservan el trazo tal como lo hizo la mano, que es lo que se interpreta.
    const eventos = e.nativeEvent.getCoalescedEvents?.() ?? []
    for (const ev of eventos.length ? eventos : [e.nativeEvent]) {
      const { x, y } = aLienzo(ev.clientX, ev.clientY)
      const pressure = ev.pressure > 0 ? ev.pressure : undefined
      builder.addPoint(x, y, ev.pressure)
      const previo = ultimo.current
      if (previo) renderSegment(ctx, previo, { x, y, pressure }, DEFAULT_BRUSH)
      ultimo.current = { x, y, pressure }
    }
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (entrada.current.activo !== e.pointerId) return
    entrada.current = soltar(entrada.current, e.pointerId)
    ultimo.current = null
    if (tool === 'pen' && builderRef.current) {
      const stroke = builderRef.current.finish()
      builderRef.current = null
      if (stroke) onStrokeComplete(stroke)
      else fullRender() // un toque suelto: se borra la marca provisional
    }
  }

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ width: '100%', height: '100%', touchAction: 'none', cursor: tool === 'eraser' ? 'crosshair' : 'default' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onContextMenu={e => e.preventDefault()}
    />
  )
}
