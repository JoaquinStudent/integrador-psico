import { api, mensajeDeError } from './apiClient'

export interface TranscriptionSegment {
  timestamp: string
  text: string
}

export interface AudioRecorderState {
  status: 'idle' | 'recording' | 'uploading' | 'done' | 'error'
  durationMs: number
  error?: string
  storagePath?: string
  recordingId?: string
}

/**
 * Grabador de una sesion.
 *
 * `sessionStartedAtMs` es en que momento de la sesion se pulsa grabar, en el mismo
 * reloj que las marcas rapidas. Viaja con el archivo porque sin ese dato la
 * transcripcion no se puede cruzar con las marcas: la grabacion arranca con el primer
 * trazo del paciente, no con la sesion, y entre ambas cosas esta la latencia de inicio.
 */
export function createAudioRecorder(
  sessionId: string,
  onState: (s: AudioRecorderState) => void,
  sessionStartedAtMs = 0,
) {
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
    try {
      const recording = await api.upload<{ id: string; storage_path: string }>(
        `/sessions/${sessionId}/recordings`, blob, `audio_${Date.now()}.webm`,
        {
          duration_seconds: Math.round(durationMs / 1000),
          started_at_ms: Math.max(0, Math.round(sessionStartedAtMs)),
        },
      )
      onState({ status: 'done', durationMs, storagePath: recording.storage_path, recordingId: recording.id })
    } catch (error) {
      onState({ status: 'error', durationMs, error: mensajeDeError(error) })
      return
    }
  }

  return { start, stop }
}

/**
 * Pide la transcripción de una grabación.
 *
 * Recibe el **id** de la grabación, no su ruta en Storage. Antes pasaba la ruta —
 * `sessions/<uuid>/audio_123.webm`— a un endpoint que espera un UUID, así que
 * fallaba siempre con 422; y el `catch` vacío lo ocultaba, de modo que el
 * examinador no veía transcripción ni error: solo nada.
 *
 * Ahora el error se propaga. Que el proveedor no esté disponible es información que
 * el usuario necesita, no algo que convenga esconder.
 */
export async function transcribeAudio(
  recordingId: string
): Promise<{ transcription: TranscriptionSegment[]; duration_seconds: number }> {
  return api.post(`/recordings/${recordingId}/transcribe`)
}
