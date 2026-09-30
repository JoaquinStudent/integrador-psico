import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api, mensajeDeError } from '../lib/apiClient'
import { transcribeAudio, type TranscriptionSegment } from '../lib/audioRecorder'

export function PostSessionPage() {
  const { id: sessionId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [patient, setPatient] = useState<{ full_name: string } | null>(null)
  const [notes, setNotes] = useState('')
  const [transcription, setTranscription] = useState<TranscriptionSegment[]>([])
  // El id de la grabación, no su ruta en Storage: el endpoint de transcribir
  // identifica por id. Antes esto era `audioPath` y nunca se asignaba —no tenía
  // setter—, así que el botón de transcribir salía por el return temprano siempre.
  const [recordingId, setRecordingId] = useState<string | null>(null)
  const [transcribing, setTranscribing] = useState(false)
  const [transcribeError, setTranscribeError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!sessionId) return
    loadData()
  }, [sessionId])

  async function loadData() {
    const session = await api.get<{ patient_id: string }>(`/sessions/${sessionId}`)
    const patientData = await api.get<{ full_name: string }>(`/patients/${session.patient_id}`)
    setPatient(patientData)
    const observations = await api.get<{ additional_notes: string }>(`/sessions/${sessionId}/observations`)
    setNotes(observations.additional_notes)

    const grabaciones = await api.get<{ id: string }[]>(`/sessions/${sessionId}/recordings`)
    if (grabaciones.length > 0) setRecordingId(grabaciones[0].id)
  }

  async function handleTranscribe() {
    if (!sessionId || !recordingId) return
    setTranscribing(true)
    setTranscribeError(null)
    try {
      const result = await transcribeAudio(recordingId)
      setTranscription(result.transcription)
    } catch (error) {
      // El error se muestra. Que el proveedor no esté disponible es informacion que
      // el examinador necesita, no algo que convenga esconder: antes un catch vacío
      // dejaba la pantalla igual y parecía que el boton no hacía nada.
      setTranscribeError(mensajeDeError(error))
    } finally {
      setTranscribing(false)
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
        {/* Transcription panel */}
        <div className="post-section">
          <h2>Transcripcion de audio</h2>
          {recordingId ? (
            <>
              {transcription.length > 0 ? (
                <div className="transcription-list">
                  {transcription.map((t, i) => (
                    <div key={i} className="transcription-segment">
                      <span className="segment-time">{t.timestamp}</span>
                      <span className="segment-text">{t.text}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="transcription-empty">
                  <p>Audio disponible pero no transcrito.</p>
                  <button className="btn-transcribe" onClick={handleTranscribe} disabled={transcribing}>
                    {transcribing ? 'Transcribiendo...' : 'Transcribir con Whisper'}
                  </button>
                  {transcribeError && <p className="transcription-error">{transcribeError}</p>}
                </div>
              )}
            </>
          ) : (
            <p className="no-audio">No se grabo audio en esta sesion.</p>
          )}
        </div>

        {/* Observations editor */}
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
