export interface StrokeInput {
  x: number
  y: number
  timeMillis: number
  pressure?: number
}

export interface StrokeInputBatch {
  tool: string
  inputs: StrokeInput[]
}

export interface Brush {
  color: number
  size: number
}

export interface Stroke {
  inputs: StrokeInputBatch
  brush: Brush
}

export interface Offset {
  x: number
  y: number
}

export const DEFAULT_BRUSH: Brush = { color: 0xff000000, size: 3 }

export function colorToCSSRGBA(color: number): string {
  const a = ((color >> 24) & 0xff) / 255
  const r = (color >> 16) & 0xff
  const g = (color >> 8) & 0xff
  const b = color & 0xff
  return `rgba(${r}, ${g}, ${b}, ${a})`
}
