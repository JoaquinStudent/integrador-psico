import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/apiClient'
import { formatDate } from '../lib/patients'
import type { Page, Session } from '../types/api'

export function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')

  useEffect(() => {
    setLoading(true)
    const query = status ? `&status=${encodeURIComponent(status)}` : ''
    api.get<Page<Session>>(`/sessions?page_size=100${query}`)
      .then(data => setSessions(data.items))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false))
  }, [status])

  if (loading) return <div className="page-loading">Cargando sesiones...</div>

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Sesiones</h1>
          <p className="page-subtitle">Historial de evaluaciones del consultorio.</p>
        </div>
        <Link to="/sesiones/nueva" className="btn btn-primary">+ Nueva sesión</Link>
      </div>
      <div className="filter-group">
        {[
          ['', 'Todas'], ['setup', 'Configuración'], ['consent', 'Consentimiento'],
          ['active', 'Activas'], ['completed', 'Completadas'],
        ].map(([value, label]) => (
          <button key={value} className={`filter-chip${status === value ? ' active' : ''}`} onClick={() => setStatus(value)}>
            {label}
          </button>
        ))}
      </div>
      {sessions.length === 0 ? (
        <div className="empty-state"><p>No hay sesiones para este filtro.</p></div>
      ) : (
        <table className="data-table">
          <thead><tr><th>Paciente</th><th>Test</th><th>Fecha</th><th>Estado</th><th /></tr></thead>
          <tbody>{sessions.map(session => (
            <tr key={session.id}>
              <td><strong>{session.patient?.full_name ?? 'Paciente'}</strong></td>
              <td>{session.test.name}</td>
              <td className="text-secondary">{formatDate(session.created_at)}</td>
              <td><span className={`badge ${session.status === 'completed' ? 'badge-green' : 'badge-amber'}`}>{session.status}</span></td>
              <td><Link to={`/sesion/${session.id}`} className="btn-link">Ver</Link></td>
            </tr>
          ))}</tbody>
        </table>
      )}
    </div>
  )
}
