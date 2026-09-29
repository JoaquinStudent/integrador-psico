import { useRef, useEffect, useCallback } from 'react'
import type { Stroke } from './types'
import { DEFAULT_BRUSH } from './types'
import { StrokeBuilder } from './StrokeBuilder'
import { renderStroke, renderStrokes, isPointNearStroke } from './StrokeRenderer'

interface Props {
  strokes: Stroke[]
  onStrokeComplete: (stroke: Stroke) => void
  onEraseStrokes: (remainingStrokes: Stroke[]) => void
  tool: 'pen' | 'eraser'
  width?: number
  height?: number
}

export function DrawingCanvas({ strokes, onStrokeComplete, onEraseStrokes, tool, width = 1100, height = 850 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const builderRef = useRef<StrokeBuilder | null>(null)
  const isDrawing = useRef(false)

  const fullRender = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, width, height)
    renderStrokes(ctx, strokes)
  }, [strokes, width, height])

  useEffect(() => { fullRender() }, [fullRender])

  const handlePointerDown = (e: React.PointerEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.setPointerCapture(e.pointerId)
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) * (width / rect.width)
    const y = (e.clientY - rect.top) * (height / rect.height)

    if (tool === 'pen') {
      isDrawing.current = true
      const builder = new StrokeBuilder(DEFAULT_BRUSH)
      builder.start(x, y, e.pressure, e.pointerType)
      builderRef.current = builder
    } else {
      isDrawing.current = true
      const remaining = strokes.filter(s => !isPointNearStroke({ x, y }, s, 15))
      if (remaining.length < strokes.length) onEraseStrokes(remaining)
    }
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing.current) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) * (width / rect.width)
    const y = (e.clientY - rect.top) * (height / rect.height)

    if (tool === 'pen' && builderRef.current) {
      builderRef.current.addPoint(x, y, e.pressure)
      const ctx = canvas.getContext('2d')
      if (ctx) {
        const preview = builderRef.current.getCurrentStroke()
        if (preview) {
          fullRender()
          renderStroke(ctx, preview)
        }
      }
    } else if (tool === 'eraser') {
      const remaining = strokes.filter(s => !isPointNearStroke({ x, y }, s, 15))
      if (remaining.length < strokes.length) onEraseStrokes(remaining)
    }
  }

  const handlePointerUp = () => {
    if (!isDrawing.current) return
    isDrawing.current = false
    if (tool === 'pen' && builderRef.current) {
      const stroke = builderRef.current.finish()
      builderRef.current = null
      if (stroke) onStrokeComplete(stroke)
      else fullRender()
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
    />
  )
}
