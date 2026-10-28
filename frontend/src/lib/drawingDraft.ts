import type { Stroke } from '../canvas/types'
import { serializeStrokes, deserializeStrokes } from '../canvas/serialization'
import type { Orientacion } from '../canvas/orientation'

/**
 * Borrador local de la toma. Si la tablet se recarga, se queda sin bateria o el
 * navegador se cierra a mitad del dibujo, la toma entera estaba solo en memoria.
 * El dibujo de un paciente no se puede repetir: la segunda vez ya no es la primera.
 *
 * Vive en el navegador de la tablet y se borra al guardar bien. Contiene trazos, no
 * datos del paciente.
 */
const clave = (sessionId: string) => `psicograma:borrador:${sessionId}`

export interface Borrador {
  inicioToma: number
  orientation: Orientacion
  eraseCount: number
  strokes: Stroke[]
}

export function guardarBorrador(sessionId: string, b: Borrador): void {
  try {
    localStorage.setItem(clave(sessionId), JSON.stringify({
      inicioToma: b.inicioToma,
      orientation: b.orientation,
      eraseCount: b.eraseCount,
      strokes: serializeStrokes(b.strokes),
    }))
  } catch { /* sin almacenamiento (modo privado, cuota): la toma sigue en memoria */ }
}

export function leerBorrador(sessionId: string): Borrador | null {
  try {
    const raw = localStorage.getItem(clave(sessionId))
    if (!raw) return null
    const d = JSON.parse(raw)
    if (!Array.isArray(d.strokes) || typeof d.inicioToma !== 'number') return null
    return {
      inicioToma: d.inicioToma,
      orientation: d.orientation === 'vertical' ? 'vertical' : 'horizontal',
      eraseCount: Number(d.eraseCount) || 0,
      strokes: deserializeStrokes(d.strokes),
    }
  } catch {
    return null
  }
}

export function borrarBorrador(sessionId: string): void {
  try { localStorage.removeItem(clave(sessionId)) } catch { /* nada que borrar */ }
}
