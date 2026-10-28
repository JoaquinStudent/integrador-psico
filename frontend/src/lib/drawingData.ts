import { api } from './apiClient'
import type { Stroke } from '../canvas/types'
import { serializeStrokes, deserializeStrokes } from '../canvas/serialization'
import { dimensiones, type Orientacion } from '../canvas/orientation'
import { offsetsDeTrazo } from '../canvas/timing'
import type { Drawing, DrawingInput } from '../types/api'

export interface Toma {
  /** Epoch ms de la consigna: el cero de todos los offsets del dibujo. */
  inicioToma: number
  orientation: Orientacion
}

export async function saveDrawingData(sessionId: string, strokes: Stroke[], toma: Toma) {
  const { width, height } = dimensiones(toma.orientation)
  const compact = serializeStrokes(strokes)
  const input: DrawingInput = {
    canvas_width: width,
    canvas_height: height,
    orientation: toma.orientation,
    strokes: compact.map((stroke, index) => ({
      stroke_index: index,
      tool: 'pen',
      ...offsetsDeTrazo(stroke.t0, stroke.points, toma.inicioToma),
      points: stroke.points,
    })),
  }
  await api.put(`/sessions/${sessionId}/drawing`, input)
}

export interface DibujoGuardado {
  strokes: Stroke[]
  width: number
  height: number
  orientation: Orientacion
}

export async function loadDrawingData(sessionId: string): Promise<DibujoGuardado> {
  const drawing = await api.get<Drawing>(`/sessions/${sessionId}/drawing`)
  return {
    width: drawing.canvas_width,
    height: drawing.canvas_height,
    orientation: drawing.orientation === 'vertical' ? 'vertical' : 'horizontal',
    strokes: deserializeStrokes(drawing.strokes.map(stroke => ({
      tool: stroke.tool,
      brush: { color: 0xff000000, size: 3 },
      points: stroke.points,
    })) as never[]),
  }
}
