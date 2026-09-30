/**
 * El guion de administración del PBLL, citado del manual.
 *
 * Es contenido clínico, no copy de interfaz: cada entrada lleva la sección del
 * manual que la origina para que el examinador pueda verificarla
 * (`sdd/manual-pbll/manual-persona-bajo-la-lluvia.md`). Vive en su propio archivo
 * y como datos puros justamente por eso — se revisa contra el manual sin leer JSX,
 * y quien lo corrija no necesita tocar un componente.
 *
 * Dos cosas que el manual deja claras y que el guion **no** debe ablandar:
 *
 *  - Ante la pregunta por el paraguas no se responde. Se reitera la consigna y se
 *    deja a elección del paciente, porque la aparición del paraguas es en sí un
 *    indicador (B-7). Un examinador que sugiere paraguas destruye el dato.
 *  - Si el paciente rota la hoja, se respeta. Modificar la posición del papel es la
 *    primera señal que el manual registra, no un error a corregir.
 */

export type Fase = 'espera' | 'consigna' | 'ejecucion' | 'cierre'

export interface PasoGuion {
  /** Rótulo de la fase, para el encabezado del panel. */
  titulo: string
  /** Lo que el examinador dice, literal. Sin comillas: las pone la vista. */
  decir?: string
  /** Lo que hace o evita hacer. */
  hacer: string[]
  /** Sección del manual. */
  fuente: string
}

export const GUION: Record<Fase, PasoGuion> = {
  espera: {
    titulo: 'Preparación',
    hacer: [
      'Entrega la hoja a lo largo (horizontal).',
      'Ten a mano lápiz HB y un borrador sin manchas.',
      'Conversa con el paciente antes de dar la consigna: el precalentamiento baja la ansiedad propia del examen.',
      'Con adultos importa más — suelen mostrarse reticentes cuando se les pide dibujar.',
    ],
    fuente: 'Consigna',
  },

  consigna: {
    titulo: 'Consigna',
    decir: 'Dibuje una persona bajo la lluvia',
    hacer: [
      'Nada más. La consigna es esa y no se amplía.',
      'Si pregunta por la calidad: no se evalúa el dibujo, haga lo que hiciere estará bien.',
      'Si pregunta si va con paraguas, paisaje u otra cosa: reitera la consigna y déjalo a su elección.',
    ],
    fuente: 'Consigna',
  },

  ejecucion: {
    titulo: 'Ejecución',
    hacer: [
      'No intervengas. Deja que resuelva solo.',
      'Registra la actitud, los comentarios que hace y todo dato llamativo.',
      'Si rota la hoja, respétalo: es un dato, no un error.',
    ],
    fuente: 'Consigna',
  },

  cierre: {
    titulo: 'Cierre',
    hacer: [
      'Registra la actitud con la que entregó el dibujo.',
      'Anota si tardó muy poco o demasiado: la dificultad para comenzar (TMP-01) y para concluir (TMP-02) se interpretan.',
      'Transcribe textual cualquier comentario final.',
    ],
    fuente: 'Consigna · A-5',
  },
}

/** La fase se deriva del estado que el monitoreo ya conoce. No hay estado nuevo. */
export function faseDeSesion(estado: {
  conectada: boolean
  trazos: number
  termino: boolean
}): Fase {
  if (estado.termino) return 'cierre'
  if (!estado.conectada) return 'espera'
  return estado.trazos > 0 ? 'ejecucion' : 'consigna'
}

export interface Respuesta {
  /** El código de la marca rápida que la dispara (`ObservationsPanel`). */
  marca: string
  situacion: string
  /** Lo que conviene decir, si hay algo que decir. */
  decir?: string
  /** Por qué, o qué no hacer. */
  nota: string
  fuente: string
}

/**
 * Qué responder a cada situación que el examinador marca.
 *
 * Los códigos son los mismos de las marcas rápidas: marcar lo que pasó y saber qué
 * hacer al respecto son el mismo gesto, así que la respuesta aparece al marcar.
 */
export const RESPUESTAS: Respuesta[] = [
  {
    marca: 'pregunto_por_el_paraguas',
    situacion: 'Preguntó por el paraguas',
    decir: 'Hazlo como tú quieras',
    nota: 'No le digas si va con paraguas o sin él. La aparición del paraguas es un indicador de importancia: si lo sugieres, el dato se pierde.',
    fuente: 'Consigna · B-7',
  },
  {
    marca: 'muestra_inseguridad',
    situacion: 'Muestra inseguridad o temor',
    decir: 'Estás haciendo bien las cosas, lo que haces es correcto',
    nota: 'Tranquilízalo sin evaluar el dibujo.',
    fuente: 'Consigna',
  },
  {
    marca: 'roto_la_hoja',
    situacion: 'Rotó la hoja',
    nota: 'Respeta la elección y no corrijas. Modificar la posición del papel se interpreta, junto con los demás datos, como oposición o rechazo de indicaciones.',
    fuente: 'Consigna · Interpretación',
  },
  {
    marca: 'pausa_prolongada',
    situacion: 'Pausa prolongada',
    nota: 'No intervengas ni lo apures. Los momentos de quietud se interpretan como lagunas o bloqueos (TMP-03), y el sistema ya los está midiendo.',
    fuente: 'A-5',
  },
  {
    marca: 'uso_borrador',
    situacion: 'Usó el borrador',
    nota: 'No lo comentes. Los borrados se interpretan aparte (B-3) y el sistema los cuenta solo.',
    fuente: 'B-3',
  },
  {
    marca: 'comentario_espontaneo',
    situacion: 'Comentario espontáneo',
    nota: 'Anótalo textual, sin parafrasear: reescribirlo altera el dato.',
    fuente: 'Consigna',
  },
]

export const RESPUESTA_POR_MARCA: Record<string, Respuesta> = Object.fromEntries(
  RESPUESTAS.map(r => [r.marca, r]),
)
