import { supabase, supabaseConfigured } from './supabase'
import type { Stroke } from '../canvas/types'
import { serializeStrokes, deserializeStrokes } from '../canvas/serialization'

export async function saveDrawingData(sessionId: string, strokes: Stroke[], canvas: HTMLCanvasElement | null) {
  if (!supabaseConfigured) return

  const strokesJson = serializeStrokes(strokes)

  let finalImageUrl: string | null = null
  if (canvas) {
    const blob = await new Promise<Blob | null>(r => canvas.toBlob(r, 'image/png'))
    if (blob) {
      const path = `sessions/${sessionId}/drawing.png`
      const { error } = await supabase.storage.from('session-files').upload(path, blob, { upsert: true })
      if (!error) {
        const { data } = supabase.storage.from('session-files').getPublicUrl(path)
        finalImageUrl = data.publicUrl
      }
    }
  }

  await supabase.from('drawing_data').update({
    strokes_json: strokesJson,
    final_image_url: finalImageUrl,
  }).eq('session_id', sessionId)
}

export async function loadDrawingData(sessionId: string): Promise<Stroke[]> {
  if (!supabaseConfigured) return []
  const { data } = await supabase.from('drawing_data').select('strokes_json').eq('session_id', sessionId).single()
  if (!data?.strokes_json || !Array.isArray(data.strokes_json)) return []
  return deserializeStrokes(data.strokes_json as never[])
}
