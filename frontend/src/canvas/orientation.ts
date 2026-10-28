// Sin imports: se prueba con `node --test`.

export type Orientacion = 'horizontal' | 'vertical'

/**
 * Cómo se entrega la hoja. Guion del equipo (`lib/protocoloPbll.ts`, sección
 * "Consigna" del manual): "se entrega el papel a lo largo (horizontal)". Si el
 * paciente la usa de otro modo, el manual lo toma como "una primera señal" y manda
 * respetarlo: es un dato, no un error. Si se corrige la interpretación de "a lo
 * largo", este es el único lugar que cambia.
 */
export const ORIENTACION_ENTREGA: Orientacion = 'horizontal'

/** Hoja carta (22 × 28 cm): 28/22 ≈ 1,27. El lienzo guarda esa proporción. */
const LARGO = 1100
const ANCHO = 850

export function dimensiones(o: Orientacion): { width: number; height: number } {
  return o === 'horizontal' ? { width: LARGO, height: ANCHO } : { width: ANCHO, height: LARGO }
}

/** La hoja sigue a la pantalla mientras el paciente no ha trazado nada. */
export function orientacionDeViewport(ancho: number, alto: number): Orientacion {
  return alto > ancho ? 'vertical' : 'horizontal'
}

/** RF-17: ¿el paciente usó la hoja distinta a como se le entregó? */
export function giroLaHoja(final: Orientacion): boolean {
  return final !== ORIENTACION_ENTREGA
}
