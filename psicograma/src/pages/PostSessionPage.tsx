import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { transcribeAudio, type TranscriptionSegment } from '../lib/audioRecorder'

export function PostSessionPage() {
  const { id: sessionId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [patient, setPatient] = useState<{ full_name: string } | null>(null)
  const [notes, setNotes] = useState('')
  const [transcription, setTranscription] = useState<TranscriptionSegment[]>([])
  const [audioPath, setAudioPath] = useState<string | null>(null)
  const [transcribing, setTranscribing] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!sessionId) return
    loadData()
  }, [sessionId])

  async function loadData() {
    const [sessionRes, obsRes, audioRes] = await Promise.all([
      supabase.from('sessions').select('patient_id, patients(full_name)').eq('id', sessionId!).single(),
      supabase.from('observations').select('additional_notes').eq('session_id', sessionId!).single(),
      supabase.from('audio_recordings').select('storage_path, transcription_json').eq('session_id', sessionId!).limit(1).single(),
    ])

    if (sessionRes.data) {
      const p = sessionRes.data as unknown as { patients: { full_name: string } }
      setPatient(p.patients)
    }
    if (obsRes.data?.additional_notes) setNotes(obsRes.data.additional_notes)
    if (audioRes.data) {
      setAudioPath(audioRes.data.storage_path)
      if (audioRes.data.transcription_json && Array.isArray(audioRes.data.transcription_json)) {
        setTranscription(audioRes.data.transcription_json as TranscriptionSegment[])
      }
    }
  }

  async function handleTranscribe() {
    if (!sessionId || !audioPath) return
    setTranscribing(true)
    const result = await transcribeAudio(sessionId, audioPath)
    if (result) setTranscription(result.transcription)
    setTranscribing(false)
  }

  async function handleSave() {
    if (!sessionId) return
    setSaving(true)
    await supabase.from('observations').upsert({
      session_id: sessionId,
      additional_notes: notes,
    }, { onConflict: 'session_id' })
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
          {audioPath ? (
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
