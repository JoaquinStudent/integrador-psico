import type { Stroke, Offset } from './types'
import { colorToCSSRGBA } from './types'

export function renderStroke(ctx: CanvasRenderingContext2D, stroke: Stroke): void {
  const inputs = stroke.inputs.inputs
  if (inputs.length === 0) return

  ctx.strokeStyle = colorToCSSRGBA(stroke.brush.color)
  ctx.fillStyle = ctx.strokeStyle
  ctx.lineWidth = stroke.brush.size
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.globalCompositeOperation = 'source-over'

  const hasPressure = inputs.some(p => p.pressure !== undefined)

  if (hasPressure) {
    const baseWidth = stroke.brush.size
    for (let i = 0; i < inputs.length - 1; i++) {
      const p1 = inputs[i], p2 = inputs[i + 1]
      const avgP = ((p1.pressure ?? 1) + (p2.pressure ?? 1)) / 2
      ctx.lineWidth = baseWidth * avgP
      ctx.beginPath()
      ctx.moveTo(p1.x, p1.y)
      ctx.lineTo(p2.x, p2.y)
      ctx.stroke()
    }
    for (const p of inputs) {
      const r = (baseWidth * (p.pressure ?? 1)) / 2
      ctx.beginPath()
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
      ctx.fill()
    }
  } else {
    ctx.beginPath()
    if (inputs.length === 1) {
      ctx.arc(inputs[0].x, inputs[0].y, ctx.lineWidth / 2, 0, Math.PI * 2)
      ctx.fill()
      return
    }
    ctx.moveTo(inputs[0].x, inputs[0].y)
    if (inputs.length === 2) {
      ctx.lineTo(inputs[1].x, inputs[1].y)
    } else {
      for (let i = 1; i < inputs.length - 1; i++) {
        const cur = inputs[i], nxt = inputs[i + 1]
        ctx.quadraticCurveTo(cur.x, cur.y, (cur.x + nxt.x) / 2, (cur.y + nxt.y) / 2)
      }
      const last = inputs[inputs.length - 1], prev = inputs[inputs.length - 2]
      ctx.quadraticCurveTo(prev.x, prev.y, last.x, last.y)
    }
    ctx.stroke()
  }
}

export function renderStrokes(ctx: CanvasRenderingContext2D, strokes: Stroke[]): void {
  for (const s of strokes) renderStroke(ctx, s)
}

export function getStrokeBounds(stroke: Stroke) {
  const inputs = stroke.inputs.inputs
  if (inputs.length === 0) return null
  let left = inputs[0].x, top = inputs[0].y, right = inputs[0].x, bottom = inputs[0].y
  for (const p of inputs) {
    left = Math.min(left, p.x); top = Math.min(top, p.y)
    right = Math.max(right, p.x); bottom = Math.max(bottom, p.y)
  }
  const h = stroke.brush.size / 2
  return { left: left - h, top: top - h, right: right + h, bottom: bottom + h }
}

export function getStrokesBounds(strokes: Stroke[]) {
  let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity
  for (const s of strokes) {
    const b = getStrokeBounds(s)
    if (b) { left = Math.min(left, b.left); top = Math.min(top, b.top); right = Math.max(right, b.right); bottom = Math.max(bottom, b.bottom) }
  }
  return isFinite(left) ? { left, top, right, bottom } : null
}

export function isPointNearStroke(point: Offset, stroke: Stroke, tolerance = 10): boolean {
  const inputs = stroke.inputs.inputs
  const t = tolerance + stroke.brush.size / 2
  for (let i = 0; i < inputs.length - 1; i++) {
    if (ptSegDist(point, inputs[i], inputs[i + 1]) <= t) return true
  }
  for (const p of inputs) {
    if (Math.hypot(point.x - p.x, point.y - p.y) <= t) return true
  }
  return false
}

function ptSegDist(p: Offset, a: { x: number; y: number }, b: { x: number; y: number }): number {
  const dx = b.x - a.x, dy = b.y - a.y, len2 = dx * dx + dy * dy
  if (len2 === 0) return Math.hypot(p.x - a.x, p.y - a.y)
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2))
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy))
}
