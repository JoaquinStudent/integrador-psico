import { api } from './apiClient'
import type { Stroke } from '../canvas/types'
import { serializeStrokes, deserializeStrokes } from '../canvas/serialization'
import type { Drawing, DrawingInput } from '../types/api'

export async function saveDrawingData(sessionId: string, strokes: Stroke[], canvas: HTMLCanvasElement | null) {
  void canvas
  const compact = serializeStrokes(strokes)
  const input: DrawingInput = {
    canvas_width: 1100,
    canvas_height: 850,
    orientation: 'horizontal',
    strokes: compact.map((stroke, index) => ({
      stroke_index: index,
      tool: 'pen',
      started_at_ms: stroke.points[0]?.t ?? 0,
      ended_at_ms: stroke.points[stroke.points.length - 1]?.t ?? 0,
      points: stroke.points,
    })),
  }
  await api.put(`/sessions/${sessionId}/drawing`, input)
}

export async function loadDrawingData(sessionId: string): Promise<Stroke[]> {
  const drawing = await api.get<Drawing>(`/sessions/${sessionId}/drawing`)
  return deserializeStrokes(drawing.strokes.map(stroke => ({
    tool: stroke.tool,
    brush: { color: 0xff000000, size: 3 },
    points: stroke.points,
  })) as never[])
}
