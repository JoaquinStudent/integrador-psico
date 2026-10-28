import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { api } from '../lib/apiClient'
import type { DashboardSummary } from '../types/api'
import { SESSION_STATUS, accionDeSesion, etiquetaDe, fechaHora } from '../lib/status'
import { APPOINTMENT_STATUS, listAppointments, type Appointment } from '../lib/appointments'

interface RecentSession {
  id: string
  test: { name: string; code: string }
  status: string
  started_at: string | null
  created_at?: string
  patient?: { full_name: string } | null
}

function useDashboardData() {
  const [kpis, setKpis] = useState({ sessionsWeek: 0, pendingReports: 0, activePatients: 0 })
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [upcoming, setUpcoming] = useState<Appointment[]>([])

  useEffect(() => {
    // Las citas no bloquean el panel: si fallan, el panel sigue sin ellas.
    listAppointments()
      .then(c => setUpcoming(c.filter(x => x.status === 'scheduled' && new Date(x.ends_at) >= new Date()).slice(0, 5)))
      .catch(() => { /* sin citas */ })
    Promise.all([
      api.get<DashboardSummary>('/dashboard/summary'),
    ]).then(([summary]) => {
      setKpis({
        sessionsWeek: summary.sessions_this_week,
        pendingReports: summary.pending_analysis,
        activePatients: summary.active_patients,
      })
      setRecentSessions(summary.recent_sessions as RecentSession[])
      setLoading(false)
    }).catch(() => { setError(true); setLoading(false) })
  }, [])

  return { kpis, recentSessions, loading, error, upcoming }
}

/** Saludo según la hora del examinador; antes decía "Buenos días" a cualquier hora. */
function saludo(): string {
  const h = new Date().getHours()
  return h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches'
}

export function DashboardPage() {
  const { user } = useAuth()
  const { kpis, recentSessions, loading, error, upcoming } = useDashboardData()
  const name = user?.user_metadata?.full_name?.split(' ')[0] ?? 'Doctor/a'

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{saludo()}, {name}</h1>
          <p className="page-subtitle">Aquí está su resumen de actividad de hoy.</p>
        </div>
        <Link to="/sesiones/nueva" className="btn btn-primary">+ Nueva sesión</Link>
      </div>

      {error && (
        <p role="alert" style={{ color: '#C0523F', marginBottom: 16 }}>
          No se pudo cargar el resumen. Los números de abajo no son reales; recarga la página.
        </p>
      )}

      <div className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-label">Sesiones esta semana</span>
          <span className="kpi-value">{loading ? '—' : kpis.sessionsWeek}</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Informes pendientes</span>
          <span className="kpi-value">{loading ? '—' : kpis.pendingReports}</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Pacientes activos</span>
          <span className="kpi-value">{loading ? '—' : kpis.activePatients}</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Tiempo prom. por informe</span>
          <span className="kpi-value">--</span>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-main">
          <div className="section-header">
            <h2 className="section-title">Sesiones recientes</h2>
            <Link to="/sesiones" className="btn-link">Ver todas</Link>
          </div>
          {recentSessions.length === 0 ? (
            <div className="card">
              <div className="empty-state-inline">
                <p className="text-secondary">No hay sesiones registradas aún.</p>
                <Link to="/sesiones/nueva" className="btn-link">Crear primera sesión</Link>
              </div>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>Paciente</th><th>Test</th><th>Fecha</th><th>Estado</th><th></th></tr>
              </thead>
              <tbody>
                {recentSessions.map(s => (
                  <tr key={s.id}>
                    <td><strong>{s.patient?.full_name ?? '—'}</strong></td>
                    <td>{s.test.name}</td>
                    <td className="text-secondary">{fechaHora(s.started_at ?? s.created_at)}</td>
                    <td>
                      <span className={`badge ${etiquetaDe(SESSION_STATUS, s.status).badge}`}>
                        {etiquetaDe(SESSION_STATUS, s.status).label}
                      </span>
                    </td>
                    <td className="cell-action"><Link to={accionDeSesion(s).to} className="btn-link">{accionDeSesion(s).label}</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <aside className="dashboard-sidebar">
          <h2 className="section-title">Próximas citas</h2>
          <div className="card">
            {upcoming.length === 0 ? (
              <div className="empty-state-inline">
                <p className="text-secondary">Sin citas programadas.</p>
                <Link to="/citas" className="btn-link">Agendar una cita</Link>
              </div>
            ) : (
              <ul className="upcoming-list">
                {upcoming.map(c => (
                  <li key={c.id}>
                    <strong>{c.patient_name}</strong>
                    <span className="text-secondary">{fechaHora(c.starts_at)}</span>
                    <span className={`badge ${APPOINTMENT_STATUS[c.status].badge}`}>{APPOINTMENT_STATUS[c.status].label}</span>
                  </li>
                ))}
                <li><Link to="/citas" className="btn-link">Ver agenda</Link></li>
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
