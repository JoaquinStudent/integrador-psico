import type { Stroke } from './types'
import { DEFAULT_BRUSH } from './types'

interface CompactPoint { x: number; y: number; t: number; p?: number }
interface CompactStroke { tool: string; brush: { color: number; size: number }; points: CompactPoint[] }

export function serializeStrokes(strokes: Stroke[]): CompactStroke[] {
  return strokes.map(s => ({
    tool: s.inputs.tool,
    brush: { color: s.brush.color, size: s.brush.size },
    points: s.inputs.inputs.map(p => {
      const pt: CompactPoint = { x: Math.round(p.x * 10) / 10, y: Math.round(p.y * 10) / 10, t: p.timeMillis }
      if (p.pressure !== undefined) pt.p = Math.round(p.pressure * 100) / 100
      return pt
    }),
  }))
}

export function deserializeStrokes(data: CompactStroke[]): Stroke[] {
  return data.map(s => ({
    inputs: {
      tool: s.tool,
      inputs: s.points.map(p => ({
        x: p.x, y: p.y, timeMillis: p.t,
        ...(p.p !== undefined ? { pressure: p.p } : {}),
      })),
    },
    brush: s.brush ?? DEFAULT_BRUSH,
  }))
}
