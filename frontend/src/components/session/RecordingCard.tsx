import type { Recording, TranscriptSegment } from '../../types/api'
import { formatTime } from '../../canvas/metricsCalculator'

interface Props {
  recording: Recording | null
  segments: TranscriptSegment[]
  audioUrl: string | null
  loading: boolean
  transcribing: boolean
  error: string | null
  onTranscribe: () => void
}

/** Grabación de la sesión: reproductor y lo que Whisper entendió, con su minuto en el audio. */
export function RecordingCard({
  recording, segments, audioUrl, loading, transcribing, error, onTranscribe,
}: Props) {
  if (loading) return <p className="no-audio">Cargando grabación…</p>
  if (!recording) return <p className="no-audio">No se grabó audio en esta sesión.</p>

  return (
    <div className="recording-card">
      <div className="recording-head">
        <strong>Grabación de la sesión</strong>
        {recording.duration_seconds != null && (
          <span className="recording-duration">{formatTime(recording.duration_seconds * 1000)}</span>
        )}
      </div>

      {audioUrl
        ? <audio controls src={audioUrl} style={{ width: '100%' }} />
        : <p className="no-audio">Cargando audio…</p>}

      <div className="recording-transcript">
        <div className="recording-transcript-head">
          <strong>Transcripción</strong>
          {!recording.transcribed_at && (
            <button className="btn-transcribe" onClick={onTranscribe} disabled={transcribing}>
              {transcribing ? 'Transcribiendo…' : 'Transcribir con Whisper'}
            </button>
          )}
        </div>
        {error && <p className="transcription-error">{error}</p>}
        {transcribing && <p className="no-audio">Whisper está transcribiendo, unos segundos…</p>}
        {segments.length > 0 && (
          <ol className="recording-segments">
            {segments.map(s => (
              <li key={s.segment_index}>
                <span className="timeline-at">{formatTime(s.start_ms)}</span> {s.text.trim()}
              </li>
            ))}
          </ol>
        )}
        {recording.transcribed_at && segments.length === 0 && !transcribing && (
          <p className="no-audio">La transcripción no tiene texto.</p>
        )}
      </div>
    </div>
  )
}
