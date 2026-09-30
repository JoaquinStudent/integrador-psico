import { GUION, RESPUESTA_POR_MARCA, RESPUESTAS, type Fase } from '../../lib/protocoloPbll'

interface Props {
  fase: Fase
  /** Última marca rápida que tocó el examinador, para resaltar su respuesta. */
  marcaActiva: string | null
}

const ORDEN: Fase[] = ['espera', 'consigna', 'ejecucion', 'cierre']

export function ProtocolPanel({ fase, marcaActiva }: Props) {
  const paso = GUION[fase]
  const activa = marcaActiva ? RESPUESTA_POR_MARCA[marcaActiva] : undefined

  // Cuando hay una marca reciente se muestra solo su respuesta: el examinador
  // acaba de decir "pasó esto" y lo que necesita es qué hacer, no la lista entera.
  const respuestas = activa ? [activa] : RESPUESTAS

  return (
    <div className="protocol-panel">
      <div className="protocol-header">
        <h3 className="session-panel-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          Guion PBLL
        </h3>
        <div className="protocol-steps" aria-label={`Fase actual: ${paso.titulo}`}>
          {ORDEN.map(f => (
            <span key={f} className={`protocol-step${f === fase ? ' active' : ''}`}>
              {GUION[f].titulo}
            </span>
          ))}
        </div>
      </div>

      <div className="protocol-current">
        {paso.decir && (
          <p className="protocol-say">«{paso.decir}»</p>
        )}
        <ul className="protocol-do">
          {paso.hacer.map(linea => <li key={linea}>{linea}</li>)}
        </ul>
        <span className="protocol-source">Manual PBLL · {paso.fuente}</span>
      </div>

      <div className="protocol-answers">
        <span className="quick-marks-label">
          {activa ? 'Qué hacer ahora' : 'Si pasa esto'}
        </span>
        {respuestas.map(r => (
          <div key={r.marca} className={`protocol-answer${activa ? ' highlighted' : ''}`}>
            <span className="protocol-answer-situation">{r.situacion}</span>
            {r.decir && <p className="protocol-say sm">«{r.decir}»</p>}
            <p className="protocol-answer-note">{r.nota}</p>
            <span className="protocol-source">{r.fuente}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
