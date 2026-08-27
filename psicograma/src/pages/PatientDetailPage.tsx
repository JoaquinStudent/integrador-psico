import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { usePatient, getInitials, getAge, formatDate } from '../lib/patients'
import { supabase, supabaseConfigured } from '../lib/supabase'

type Tab = 'datos' | 'historial' | 'informes'

interface PatientSession {
  id: string
  test_type: string
  status: string
  started_at: string | null
  created_at: string
}

function usePatientSessions(patientId: string | undefined) {
  const [sessions, setSessions] = useState<PatientSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabaseConfigured || !patientId) { setLoading(false); return }
    supabase.from('sessions').select('id, test_type, status, started_at, created_at')
      .eq('patient_id', patientId).order('created_at', { ascending: false })
      .then(({ data }) => { setSessions((data as PatientSession[]) ?? []); setLoading(false) })
  }, [patientId])

  return { sessions, loading }
}

// ponytail: localStorage for notes, add clinical_notes column to patients table when needed
function usePatientNotes(patientId: string | undefined) {
  const key = `psicograma:notes:${patientId}`
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (!patientId) return
    try { setNotes(localStorage.getItem(key) ?? '') } catch { /* noop */ }
  }, [patientId, key])

  const save = (value: string) => {
    setNotes(value)
    try { localStorage.setItem(key, value) } catch { /* noop */ }
  }

  return { notes, save }
}

export function PatientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { patient, loading } = usePatient(id)
  const { sessions, loading: sessionsLoading } = usePatientSessions(id)
  const { notes, save: saveNotes } = usePatientNotes(id)
  const [tab, setTab] = useState<Tab>('historial')

  if (loading) return <div className="page-loading">Cargando...</div>
  if (!patient) return (
    <div className="empty-state">
      <p>Paciente no encontrado.</p>
      <Link to="/pacientes" className="btn btn-primary">Volver a pacientes</Link>
    </div>
  )

  return (
    <div>
      <div className="profile-header">
        <div className="profile-left">
          <div className="avatar avatar-lg">{getInitials(patient.full_name)}</div>
          <div className="profile-info">
            <h1 className="profile-name">{patient.full_name}</h1>
            <p className="profile-meta">
              {getAge(patient.birth_date)} años &middot;{' '}
              {patient.sex === 'F' ? 'Femenino' : 'Masculino'} &middot;{' '}
              DNI {patient.document_number}
            </p>
            <p className="text-secondary" style={{ fontSize: 13, marginTop: 4 }}>
              Registrado: {formatDate(patient.registered_at)}
            </p>
          </div>
        </div>
        <Link to="/sesiones/nueva" className="btn btn-primary">
          + Iniciar nueva evaluación
        </Link>
      </div>

      <div className="tabs">
        <button className={`tab${tab === 'datos' ? ' active' : ''}`} onClick={() => setTab('datos')}>
          Datos generales
        </button>
        <button className={`tab${tab === 'historial' ? ' active' : ''}`} onClick={() => setTab('historial')}>
          Historial de evaluaciones
        </button>
        <button className={`tab${tab === 'informes' ? ' active' : ''}`} onClick={() => setTab('informes')}>
          Informes
        </button>
      </div>

      <div className="detail-layout">
        <div className="detail-main">
          {tab === 'datos' && (
            <div className="card">
              <div className="detail-grid">
                <div className="detail-field">
                  <span className="detail-label">Nombre completo</span>
                  <span className="detail-value">{patient.full_name}</span>
                </div>
                <div className="detail-field">
                  <span className="detail-label">Documento</span>
                  <span className="detail-value">{patient.document_number}</span>
                </div>
                <div className="detail-field">
                  <span className="detail-label">Fecha de nacimiento</span>
                  <span className="detail-value">{formatDate(patient.birth_date)}</span>
                </div>
                <div className="detail-field">
                  <span className="detail-label">Sexo</span>
                  <span className="detail-value">{patient.sex === 'F' ? 'Femenino' : 'Masculino'}</span>
                </div>
                <div className="detail-field">
                  <span className="detail-label">Fecha de registro</span>
                  <span className="detail-value">{formatDate(patient.registered_at)}</span>
                </div>
                <div className="detail-field">
                  <span className="detail-label">Estado</span>
                  <span className="badge badge-green">Activo</span>
                </div>
              </div>
            </div>
          )}

          {tab === 'historial' && (
            sessionsLoading ? <div className="page-loading">Cargando...</div> :
            sessions.length === 0 ? (
              <div className="empty-state">
                <p>No hay evaluaciones registradas para este paciente.</p>
                <Link to="/sesiones/nueva" className="btn btn-primary">
                  + Iniciar primera evaluación
                </Link>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr><th>Test</th><th>Fecha</th><th>Estado</th><th></th></tr>
                </thead>
                <tbody>
                  {sessions.map(s => (
                    <tr key={s.id}>
                      <td>{s.test_type}</td>
                      <td className="text-secondary">{formatDate(s.started_at ?? s.created_at)}</td>
                      <td>
                        <span className={`badge ${s.status === 'completed' ? 'badge-green' : 'badge-amber'}`}>
                          {s.status === 'completed' ? 'Completada' : s.status === 'active' ? 'Activa' : s.status}
                        </span>
                      </td>
                      <td><Link to={`/sesion/${s.id}`} className="btn-link">Ver</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}

          {tab === 'informes' && (
            <div className="empty-state">
              <p>No hay informes generados para este paciente.</p>
            </div>
          )}
        </div>

        <aside className="detail-sidebar">
          <div className="card">
            <h3 className="sidebar-section-title">Notas clínicas</h3>
            <textarea
              className="notes-textarea"
              placeholder="Escribir notas sobre el paciente..."
              rows={5}
              value={notes}
              onChange={e => saveNotes(e.target.value)}
            />
          </div>
        </aside>
      </div>
    </div>
  )
}
