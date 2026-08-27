import { useState, useRef, useCallback } from 'react'
import { createAudioRecorder, type AudioRecorderState } from '../../lib/audioRecorder'
import { formatTime } from '../../canvas/metricsCalculator'

interface Props {
  sessionId: string
}

export function AudioRecorder({ sessionId }: Props) {
  const [state, setState] = useState<AudioRecorderState>({ status: 'idle', durationMs: 0 })
  const recorderRef = useRef<ReturnType<typeof createAudioRecorder> | null>(null)

  const handleToggle = useCallback(() => {
    if (state.status === 'idle' || state.status === 'done' || state.status === 'error') {
      const rec = createAudioRecorder(sessionId, setState)
      recorderRef.current = rec
      rec.start()
    } else if (state.status === 'recording') {
      recorderRef.current?.stop()
    }
  }, [sessionId, state.status])

  const isRecording = state.status === 'recording'
  const isUploading = state.status === 'uploading'

  return (
    <div className="audio-recorder">
      <button
        className={`audio-rec-btn ${isRecording ? 'recording' : ''}`}
        onClick={handleToggle}
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
