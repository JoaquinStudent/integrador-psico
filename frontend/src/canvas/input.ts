// Sin imports: se prueba con `node --test`.

/**
 * Qué punteros dibujan. Un paciente apoya la mano mientras dibuja: sin este filtro la
 * palma deja trazos que ensucian justo lo que el manual interpreta (cantidad de
 * trazos, presión, sombreados, borrados).
 *
 * Reglas, en este orden:
 *  1. Si ya se vio un lápiz, el tacto se ignora (es la palma).
 *  2. Con un trazo en curso, cualquier otro puntero se ignora.
 */
export interface EstadoEntrada {
  /** `pointerId` del trazo en curso, o `null` si no hay. */
  activo: number | null
  vioLapiz: boolean
}

export const ESTADO_INICIAL: EstadoEntrada = { activo: null, vioLapiz: false }

export function decidir(
  e: EstadoEntrada,
  p: { pointerId: number; pointerType: string },
): { acepta: boolean; estado: EstadoEntrada } {
  const vioLapiz = e.vioLapiz || p.pointerType === 'pen'
  if (vioLapiz && p.pointerType === 'touch') return { acepta: false, estado: { ...e, vioLapiz } }
  if (e.activo !== null && e.activo !== p.pointerId) return { acepta: false, estado: { ...e, vioLapiz } }
  return { acepta: true, estado: { activo: p.pointerId, vioLapiz } }
}

export function soltar(e: EstadoEntrada, pointerId: number): EstadoEntrada {
  return e.activo === pointerId ? { ...e, activo: null } : e
}
