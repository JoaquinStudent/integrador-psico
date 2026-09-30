import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api, mensajeDeError } from '../lib/apiClient'
import { SessionTimeline } from '../components/session/SessionTimeline'
import type {
  Observations,
  Recording,
  TranscriptSegment,
  Verbalization,
} from '../types/api'

export function PostSessionPage() {
  const { id: sessionId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [patient, setPatient] = useState<{ full_name: string } | null>(null)
  const [notes, setNotes] = useState('')
  const [marks, setMarks] = useState<Observations['quick_marks']>([])
  const [segments, setSegments] = useState<TranscriptSegment[]>([])
  const [recording, setRecording] = useState<Recording | null>(null)
  const [verbalizations, setVerbalizations] = useState<Verbalization[]>([])
  const [transcribing, setTranscribing] = useState(false)
  const [promoviendo, setPromoviendo] = useState(false)
  const [transcribeError, setTranscribeError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const cargar = useCallback(async () => {
    if (!sessionId) return
    const session = await api.get<{ patient_id: string }>(`/sessions/${sessionId}`)
    setPatient(await api.get<{ full_name: string }>(`/patients/${session.patient_id}`))

    const observations = await api.get<Observations>(`/sessions/${sessionId}/observations`)
    setNotes(observations.additional_notes)
    setMarks(observations.quick_marks)

    setVerbalizations(await api.get<Verbalization[]>(`/sessions/${sessionId}/verbalizations`))

    const grabaciones = await api.get<Recording[]>(`/sessions/${sessionId}/recordings`)
    const ultima = grabaciones[0] ?? null
    setRecording(ultima)
    // Si ya se transcribió antes, se lee lo guardado en vez de volver a pagarle al
    // proveedor: la transcripción vive en `transcript_segments`, no en memoria.
    if (ultima?.transcribed_at) {
      setSegments(await api.get<TranscriptSegment[]>(`/recordings/${ultima.id}/transcript`))
    }
  }, [sessionId])

  useEffect(() => { void cargar() }, [cargar])

  async function handleTranscribe() {
    if (!recording) return
    setTranscribing(true)
    setTranscribeError(null)
    try {
      setSegments(
        await api.post<TranscriptSegment[]>(`/recordings/${recording.id}/transcribe`),
      )
      setRecording({ ...recording, transcribed_at: new Date().toISOString() })
    } catch (error) {
      // El error se muestra. Que el proveedor no esté disponible es información que el
      // examinador necesita para decidir si reintenta o escribe a mano.
      setTranscribeError(mensajeDeError(error))
    } finally {
      setTranscribing(false)
    }
  }

  /** Promueve una frase del audio a verbalización del paciente para el informe. */
  async function promover(texto: string, offsetMs: number) {
    if (!sessionId) return
    setPromoviendo(true)
    try {
      const nueva = await api.post<Verbalization>(`/sessions/${sessionId}/verbalizations`, {
        text: texto,
        offset_ms: offsetMs,
        source: 'transcription',
      })
      setVerbalizations(prev => [...prev, nueva])
    } catch (error) {
      setTranscribeError(mensajeDeError(error))
    } finally {
      setPromoviendo(false)
    }
  }

  async function quitar(verbalizationId: string) {
    if (!sessionId) return
    setPromoviendo(true)
    try {
      await api.del(`/sessions/${sessionId}/verbalizations/${verbalizationId}`)
      setVerbalizations(prev => prev.filter(v => v.id !== verbalizationId))
    } catch (error) {
      setTranscribeError(mensajeDeError(error))
    } finally {
      setPromoviendo(false)
    }
  }

  async function handleSave() {
    if (!sessionId) return
    setSaving(true)
    await api.put(`/sessions/${sessionId}/observations`, {
      additional_notes: notes,
      attitudes: [],
    })
    setSaving(false)
  }

  async function handleContinue() {
    await handleSave()
    navigate(`/sesion/${sessionId}/analisis`)
  }

  return (
    <div className="post-session-page">
      <div className="post-session-header">
        <h1>Observaciones Post-Sesion</h1>
        {patient && <span className="post-patient-name">{patient.full_name}</span>}
      </div>

      <div className="post-session-body">
        <div className="post-section">
          <div className="post-section-head">
            <h2>Línea de tiempo de la sesión</h2>
            {recording && !recording.transcribed_at && (
              <button className="btn-transcribe" onClick={handleTranscribe} disabled={transcribing}>
                {transcribing ? 'Transcribiendo...' : 'Transcribir con Whisper'}
              </button>
            )}
          </div>

          {!recording && <p className="no-audio">No se grabó audio en esta sesión.</p>}
          {transcribeError && <p className="transcription-error">{transcribeError}</p>}

          <SessionTimeline
            marks={marks}
            segments={segments}
            recording={recording}
            verbalizations={verbalizations}
            onPromote={promover}
            onRemove={quitar}
            ocupado={promoviendo}
          />

          {verbalizations.length > 0 && (
            <p className="timeline-hint">
              {verbalizations.length} {verbalizations.length === 1 ? 'frase' : 'frases'} irán al
              informe como verbalizaciones del paciente, en la sección 6. Se transcriben
              textuales, sin interpretar.
            </p>
          )}
        </div>

        <div className="post-section">
          <h2>Notas adicionales del examinador</h2>
          <textarea
            className="post-notes-input"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Agrega observaciones sobre la conducta del paciente, verbalizaciones, actitud durante la sesion..."
            rows={8}
          />
          <button className="btn-save-notes" onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar notas'}
          </button>
        </div>
      </div>

      <div className="post-session-footer">
        <button className="btn-back" onClick={() => navigate('/sesiones')}>Volver a sesiones</button>
        <button className="btn-continue" onClick={handleContinue}>Continuar al analisis</button>
      </div>
    </div>
  )
}
