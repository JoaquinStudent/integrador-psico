import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/apiClient'
import { SESSION_STATUS, accionDeSesion as accion, duracion, etiquetaDe, fechaHora } from '../lib/status'
import type { Page, Session, SessionStatus } from '../types/api'

type Filtro = '' | SessionStatus

const FILTROS: [Filtro, string][] = [
  ['', 'Todas'], ['active', 'En curso'], ['completed', 'Completadas'],
  ['consent', 'Pendientes'], ['cancelled', 'Canceladas'],
]

export function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [filtro, setFiltro] = useState<Filtro>('')
  const [q, setQ] = useState('')

  useEffect(() => {
    api.get<Page<Session>>('/sessions?page_size=100')
      .then(data => setSessions(data.items))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  // Pendiente agrupa setup y consent: para el examinador es "todavía no empezó".
  const cuenta = useMemo(() => {
    const c: Record<string, number> = { '': sessions.length }
    for (const s of sessions) {
      const clave = s.status === 'setup' ? 'consent' : s.status
      c[clave] = (c[clave] ?? 0) + 1
    }
    return c
  }, [sessions])

  const visibles = useMemo(() => {
    const texto = q.trim().toLowerCase()
    return sessions.filter(s => {
      const clave = s.status === 'setup' ? 'consent' : s.status
      if (filtro && clave !== filtro) return false
      return !texto || (s.patient?.full_name ?? '').toLowerCase().includes(texto)
    })
  }, [sessions, filtro, q])

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Sesiones</h1>
          <p className="page-subtitle">Historial de evaluaciones del consultorio.</p>
        </div>
        <Link to="/sesiones/nueva" className="btn btn-primary">+ Nueva sesión</Link>
      </div>

      <div className="list-toolbar">
        <div className="search-bar">
          <input
            type="search"
            placeholder="Buscar por paciente…"
            aria-label="Buscar sesión por paciente"
            value={q}
            onChange={e => setQ(e.target.value)}
          />
        </div>
        <div className="filter-group" role="group" aria-label="Filtrar por estado">
          {FILTROS.map(([value, label]) => (
            <button
              key={value}
              className={`filter-chip${filtro === value ? ' active' : ''}`}
              aria-pressed={filtro === value}
              onClick={() => setFiltro(value)}
            >
              {label} <span className="filter-count">{cuenta[value] ?? 0}</span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="page-loading">Cargando sesiones…</div>
      ) : error ? (
        <div className="empty-state"><p>No se pudieron cargar las sesiones. Revisa tu conexión e inténtalo de nuevo.</p></div>
      ) : sessions.length === 0 ? (
        <div className="empty-state">
          <p>Aún no hay sesiones. Crea la primera para empezar a evaluar.</p>
          <Link to="/sesiones/nueva" className="btn btn-primary">+ Nueva sesión</Link>
        </div>
      ) : visibles.length === 0 ? (
        <div className="empty-state"><p>Ninguna sesión coincide con la búsqueda o el filtro.</p></div>
      ) : (
        <table className="data-table">
          <thead>
            <tr><th>Paciente</th><th>Test</th><th>Fecha</th><th>Duración</th><th>Estado</th><th /></tr>
          </thead>
          <tbody>
            {visibles.map(s => {
              const estado = etiquetaDe(SESSION_STATUS, s.status)
              const a = accion(s)
              return (
                <tr key={s.id}>
                  <td><strong>{s.patient?.full_name ?? 'Paciente'}</strong></td>
                  <td>{s.test.name}</td>
                  <td className="text-secondary">{fechaHora(s.started_at ?? s.created_at)}</td>
                  <td className="text-secondary">{duracion(s.started_at, s.completed_at)}</td>
                  <td><span className={`badge ${estado.badge}`}>{estado.label}</span></td>
                  <td className="cell-action"><Link to={a.to} className="btn-link">{a.label}</Link></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}
