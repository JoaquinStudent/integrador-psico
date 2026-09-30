import type { AudioRecorderState } from '../../lib/audioRecorder'
import { formatTime } from '../../canvas/metricsCalculator'

interface Props {
  state: AudioRecorderState
  onToggle: () => void
  /** `false` cuando el consentimiento no autorizó el audio: no se graba y se explica. */
  allowed: boolean
}

/**
 * Controles de grabación. El grabador ya no vive acá.
 *
 * Lo tiene `ExaminerSessionPage`, porque la grabación arranca sola con el primer
 * trazo del paciente y ese evento llega por el canal en vivo, no por un click. Este
 * componente solo muestra el estado y entrega el gesto manual de parar y reanudar,
 * que sigue siendo del examinador.
 */
export function AudioRecorder({ state, onToggle, allowed }: Props) {
  const isRecording = state.status === 'recording'
  const isUploading = state.status === 'uploading'

  if (!allowed) {
    return (
      <div className="audio-recorder">
        <span className="audio-rec-status audio-not-allowed" title="El consentimiento de esta sesión no autorizó la grabación de audio">
          Audio no autorizado
        </span>
      </div>
    )
  }

  return (
    <div className="audio-recorder">
      <button
        className={`audio-rec-btn ${isRecording ? 'recording' : ''}`}
        onClick={onToggle}
        disabled={isUploading}
        title={isRecording ? 'Detener grabacion' : 'Grabar audio'}
      >
        {isRecording ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>
        )}
      </button>
      <span className="audio-rec-status">
        {state.status === 'idle' && 'Sin grabar'}
        {isRecording && <><span className="rec-dot" />{formatTime(state.durationMs)}</>}
        {isUploading && 'Subiendo...'}
        {state.status === 'done' && `Grabado (${formatTime(state.durationMs)})`}
        {state.status === 'error' && <span className="audio-error">{state.error}</span>}
      </span>
    </div>
  )
}
