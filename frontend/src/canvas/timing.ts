// Sin imports: se prueba con `node --test` sin transpilar nada.

/**
 * Instantes de un trazo como offsets desde el inicio de la toma (la consigna).
 *
 * El `t` de cada punto es relativo al propio trazo; lo que la API necesita
 * (`StrokeIn.started_at_ms`) es el offset absoluto, porque con él se calculan la
 * latencia de inicio y las pausas entre trazos (sección A-5 del manual). Mandar el
 * `t` del primer punto guardaba siempre 0, y por eso la latencia y las pausas
 * salían en cero en el análisis y en el informe.
 *
 * `t0` es el instante (epoch ms) del pen-down. Un borrador anterior a este cambio no
 * lo tiene: se degrada a offsets relativos en vez de inventar un reloj.
 */
export function offsetsDeTrazo(
  t0: number | undefined,
  puntos: { t: number }[],
  inicioToma: number,
): { started_at_ms: number; ended_at_ms: number } {
  const duracion = puntos.length ? puntos[puntos.length - 1].t : 0
  const inicio = t0 === undefined ? 0 : Math.max(0, Math.round(t0 - inicioToma))
  return { started_at_ms: inicio, ended_at_ms: inicio + Math.max(0, Math.round(duracion)) }
}

/** Huecos entre el fin de un trazo y el inicio del siguiente que superan el umbral. */
export function pausasEntreTrazos(
  trazos: { inicio: number; fin: number }[],
  umbralMs: number,
): number {
  const ordenados = [...trazos].sort((a, b) => a.inicio - b.inicio)
  let pausas = 0
  for (let i = 1; i < ordenados.length; i++) {
    if (ordenados[i].inicio - ordenados[i - 1].fin > umbralMs) pausas++
  }
  return pausas
}
