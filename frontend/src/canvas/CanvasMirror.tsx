import { useRef, useEffect, useCallback } from 'react'
import type { Stroke } from './types'
import { renderStrokes } from './StrokeRenderer'

interface Props {
  strokes: Stroke[]
  width?: number
  height?: number
}

export function CanvasMirror({ strokes, width = 1100, height = 850 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const render = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, width, height)
    renderStrokes(ctx, strokes)
  }, [strokes, width, height])

  useEffect(() => { render() }, [render])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ width: '100%', height: 'auto', borderRadius: 12, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
    />
  )
}
