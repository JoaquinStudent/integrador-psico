import { formatTime } from '../../canvas/metricsCalculator'
import { RESPUESTA_POR_MARCA } from '../../lib/protocoloPbll'
import type { Recording, TranscriptSegment, Verbalization } from '../../types/api'

/** Etiquetas de las marcas rápidas, las mismas que ofrece el panel en vivo. */
const ETIQUETA: Record<string, string> = {
  pausa_prolongada: 'Pausa prolongada',
  uso_borrador: 'Usó el borrador',
  comentario_espontaneo: 'Comentario espontáneo',
  muestra_inseguridad: 'Muestra inseguridad',
  pregunto_por_el_paraguas: 'Preguntó por el paraguas',
  roto_la_hoja: 'Rotó la hoja',
}

interface Marca {
  mark_code: string
  marked_at_ms: number
}

interface Props {
  marks: Marca[]
  segments: TranscriptSegment[]
  recording: Recording | null
  verbalizations: Verbalization[]
  onPromote: (texto: string, offsetMs: number) => void
  onRemove: (verbalizationId: string) => void
  ocupado: boolean
}

type Fila =
  | { tipo: 'marca'; at: number; texto: string; fuente?: string }
  | { tipo: 'audio'; at: number; texto: string }

/**
 * Transcripción y marcas rápidas sobre un solo eje de minutos.
 *
 * El punto delicado es que las dos cosas llegan en **relojes distintos**: una marca
 * viene como offset desde el inicio de la sesión, y un segmento de audio como offset
 * desde el inicio de la grabación, que empezó más tarde —con el primer trazo—. La
 * diferencia es la latencia de inicio, que en este test es un indicador medido (TMP-01)
 * y puede ser de minutos.
 *
 * Por eso cada segmento se desplaza por `recording.started_at_ms`. Y si ese dato falta
 * —grabaciones anteriores a la migración 002— **no se inventa un cero**: se dice que el
 * audio no está alineado. Un minuto equivocado en un informe clínico es peor que un
 * minuto ausente, porque nadie lo revisa.
 */
export function SessionTimeline({
  marks, segments, recording, verbalizations, onPromote, onRemove, ocupado,
}: Props) {
  const alineado = recording?.started_at_ms != null
  const desplazamiento = recording?.started_at_ms ?? 0

  const filas: Fila[] = [
    ...marks.map(m => ({
      tipo: 'marca' as const,
      at: m.marked_at_ms,
      texto: ETIQUETA[m.mark_code] ?? m.mark_code,
      fuente: RESPUESTA_POR_MARCA[m.mark_code]?.fuente,
    })),
    ...(alineado
      ? segments.map(s => ({
          tipo: 'audio' as const,
          at: desplazamiento + s.start_ms,
          texto: s.text.trim(),
        }))
      : []),
  ].sort((a, b) => a.at - b.at || (a.tipo === 'marca' ? -1 : 1))

  // Una verbalización ya promovida se reconoce por su momento en la sesión, que es
  // justo lo que se guardó al promoverla.
  const promovida = new Map(verbalizations.map(v => [v.offset_ms ?? -1, v]))

  if (filas.length === 0) {
    return (
      <p className="timeline-empty">
        Todavía no hay nada en la línea de tiempo. Aparecen aquí las marcas rápidas de la
        sesión y, cuando transcribas el audio, lo que se dijo en cada momento.
      </p>
    )
  }

  return (
    <div className="session-timeline">
      {!alineado && segments.length > 0 && (
        <p className="timeline-warning">
          Esta grabación no guardó en qué momento de la sesión empezó, así que su
          transcripción no se puede situar en el eje sin inventar los minutos. Se muestra
          aparte, con sus tiempos relativos al audio.
        </p>
      )}

      <ol className="timeline-list">
        {filas.map((f, i) => {
          const ya = f.tipo === 'audio' ? promovida.get(f.at) : undefined
          return (
            <li key={`${f.tipo}-${f.at}-${i}`} className={`timeline-row ${f.tipo}`}>
              <span className="timeline-at">{formatTime(f.at)}</span>
              <span className="timeline-kind" aria-hidden="true">
                {f.tipo === 'marca' ? '◆' : '♪'}
              </span>
              <div className="timeline-body">
                <span className={f.tipo === 'audio' ? 'timeline-quote' : 'timeline-mark'}>
                  {f.tipo === 'audio' ? `«${f.texto}»` : f.texto}
                </span>
                {f.tipo === 'marca' && f.fuente && (
                  <span className="timeline-source">Manual · {f.fuente}</span>
                )}
              </div>
              {f.tipo === 'audio' && (
                ya ? (
                  <button
                    className="timeline-btn promoted"
                    onClick={() => onRemove(ya.id)}
                    disabled={ocupado}
                    title="Quitar del informe"
                  >
                    ✓ En el informe
                  </button>
                ) : (
                  <button
                    className="timeline-btn"
                    onClick={() => onPromote(f.texto, f.at)}
                    disabled={ocupado}
                    title="Registrar como verbalización del paciente en el informe"
                  >
                    + al informe
                  </button>
                )
              )}
            </li>
          )
        })}
      </ol>

      {!alineado && segments.length > 0 && (
        <ol className="timeline-list unaligned">
          {segments.map(s => (
            <li key={s.segment_index} className="timeline-row audio">
              <span className="timeline-at">{formatTime(s.start_ms)}</span>
              <span className="timeline-kind" aria-hidden="true">♪</span>
              <div className="timeline-body">
                <span className="timeline-quote">«{s.text.trim()}»</span>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
