import { supabase } from './supabase'

export interface TranscriptionSegment {
  timestamp: string
  text: string
}

export interface AudioRecorderState {
  status: 'idle' | 'recording' | 'uploading' | 'done' | 'error'
  durationMs: number
  error?: string
  storagePath?: string
}

export function createAudioRecorder(sessionId: string, onState: (s: AudioRecorderState) => void) {
  let mediaRecorder: MediaRecorder | null = null
  let chunks: Blob[] = []
  let startTime = 0
  let timerInterval: ReturnType<typeof setInterval> | undefined

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      // ponytail: webm/opus is universally supported; Whisper accepts it
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm'
      mediaRecorder = new MediaRecorder(stream, { mimeType })
      chunks = []
      startTime = Date.now()

      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data) }
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        clearInterval(timerInterval)
        await upload()
      }
      mediaRecorder.onerror = () => {
        stream.getTracks().forEach(t => t.stop())
        clearInterval(timerInterval)
        onState({ status: 'error', durationMs: Date.now() - startTime, error: 'Error de grabacion' })
      }

      mediaRecorder.start(1000) // chunk every 1s
      timerInterval = setInterval(() => {
        onState({ status: 'recording', durationMs: Date.now() - startTime })
      }, 500)
      onState({ status: 'recording', durationMs: 0 })
    } catch (err) {
      onState({ status: 'error', durationMs: 0, error: 'No se pudo acceder al microfono' })
    }
  }

  function stop() {
    if (mediaRecorder?.state === 'recording') {
      mediaRecorder.stop()
    }
  }

  async function upload() {
    const durationMs = Date.now() - startTime
    onState({ status: 'uploading', durationMs })

    const blob = new Blob(chunks, { type: 'audio/webm' })
    const path = `sessions/${sessionId}/audio_${Date.now()}.webm`

    const { error: uploadError } = await supabase.storage
      .from('audio-recordings')
      .upload(path, blob, { contentType: 'audio/webm', upsert: false })

    if (uploadError) {
      onState({ status: 'error', durationMs, error: uploadError.message })
      return
    }

    const { error: dbError } = await supabase.from('audio_recordings').insert({
      session_id: sessionId,
      storage_path: path,
      duration_seconds: Math.round(durationMs / 1000),
    })

    if (dbError) {
      onState({ status: 'error', durationMs, error: dbError.message })
      return
    }

    onState({ status: 'done', durationMs, storagePath: path })
  }

  return { start, stop }
}

export async function transcribeAudio(
  sessionId: string,
  storagePath: string
): Promise<{ transcription: TranscriptionSegment[]; duration_seconds: number } | null> {
  const { data, error } = await supabase.functions.invoke('transcribe-audio', {
    body: { session_id: sessionId, audio_path: storagePath },
  })
  if (error || data?.error) return null
  return data?.data ?? null
}
