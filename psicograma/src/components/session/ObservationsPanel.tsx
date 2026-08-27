import { useState, useRef, useCallback } from 'react'
import type { QuickMark } from '../../lib/observations'
import { saveObservations } from '../../lib/observations'
import { formatTime } from '../../canvas/metricsCalculator'

const QUICK_MARKS = [
  'Pausa prolongada',
  'Uso borrador',
  'Comentario espontáneo',
  'Muestra inseguridad',
  'Preguntó por el paraguas',
  'Rotó la hoja',
]

interface Props {
  sessionId: string
  elapsedMs: number
}

export function ObservationsPanel({ sessionId, elapsedMs }: Props) {
  const [notes, setNotes] = useState('')
  const [marks, setMarks] = useState<QuickMark[]>([])
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const debouncedSave = useCallback((newNotes: string, newMarks: QuickMark[]) => {
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => saveObservations(sessionId, newMarks, newNotes), 500)
  }, [sessionId])

  const handleNotesChange = (val: string) => {
    setNotes(val)
    debouncedSave(val, marks)
  }

  const handleQuickMark = (mark: string) => {
    const entry: QuickMark = { mark, timestamp: formatTime(elapsedMs) }
    const next = [...marks, entry]
    setMarks(next)
    saveObservations(sessionId, next, notes)
  }

  return (
    <div className="observations-panel">
      <h3 className="session-panel-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
        Observaciones
      </h3>
      <textarea
        className="observations-textarea"
        placeholder="Registra la actitud y los comentarios del paciente durante la ejecución..."
        value={notes}
        onChange={e => handleNotesChange(e.target.value)}
      />
      <div className="quick-marks-section">
        <span className="quick-marks-label">Marcas rápidas</span>
        <div className="quick-marks-list">
          {QUICK_MARKS.map(m => (
            <button
              key={m}
              className={`quick-mark-chip${m === 'Preguntó por el paraguas' ? ' amber' : ''}`}
              onClick={() => handleQuickMark(m)}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
      {marks.length > 0 && (
        <div className="quick-marks-log">
          {marks.map((m, i) => (
            <div key={i} className="quick-mark-entry">
              <span className="quick-mark-time">[{m.timestamp}]</span> {m.mark}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
