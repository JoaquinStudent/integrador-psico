import { useCallback, useEffect, useRef, useState } from 'react'
import { api, mensajeDeError } from './apiClient'
import type { Recording, TranscriptSegment } from '../types/api'

/**
 * La grabación de una sesión, su transcripción y el audio para reproducirlo.
 *
 * Con `auto`, una grabación sin transcribir se manda a Whisper al abrir la pantalla.
 * Una sola vez por montaje: si falla, el error se muestra y el reintento es manual,
 * porque repetirlo solo gastaría el proveedor.
 */
export function useRecording(sessionId: string | undefined, auto = false) {
  const [recording, setRecording] = useState<Recording | null>(null)
  const [segments, setSegments] = useState<TranscriptSegment[]>([])
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [transcribing, setTranscribing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const intentado = useRef(false)

  const transcribe = useCallback(async (rec: Recording) => {
    setTranscribing(true)
    setError(null)
    try {
      setSegments(await api.post<TranscriptSegment[]>(`/recordings/${rec.id}/transcribe`))
      setRecording({ ...rec, transcribed_at: new Date().toISOString() })
    } catch (e) {
      setError(mensajeDeError(e))
    } finally {
      setTranscribing(false)
    }
  }, [])

  useEffect(() => {
    if (!sessionId) return
    let url: string | null = null
    let vivo = true
    ;(async () => {
      try {
        const ultima = (await api.get<Recording[]>(`/sessions/${sessionId}/recordings`))[0] ?? null
        if (!vivo) return
        setRecording(ultima)
        if (!ultima) return
        // El audio se baja con el token y se reproduce desde memoria: el bucket es privado.
        api.blob(`/recordings/${ultima.id}/audio`)
          .then(b => { if (vivo) { url = URL.createObjectURL(b); setAudioUrl(url) } })
          .catch(e => { if (vivo) setError(mensajeDeError(e)) })
        if (ultima.transcribed_at) {
          setSegments(await api.get<TranscriptSegment[]>(`/recordings/${ultima.id}/transcript`))
        } else if (auto && !intentado.current) {
          intentado.current = true
          await transcribe(ultima)
        }
      } catch (e) {
        if (vivo) setError(mensajeDeError(e))
      } finally {
        if (vivo) setLoading(false)
      }
    })()
    return () => { vivo = false; if (url) URL.revokeObjectURL(url) }
  }, [sessionId, auto, transcribe])

  return { recording, segments, audioUrl, loading, transcribing, error, transcribe }
}
