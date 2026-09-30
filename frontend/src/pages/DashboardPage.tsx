import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { api } from '../lib/apiClient'
import { formatDate } from '../lib/patients'
import type { DashboardSummary } from '../types/api'

interface RecentSession {
  id: string
  test: { name: string; code: string }
  status: string
  started_at: string | null
  patient?: { full_name: string } | null
}

function useDashboardData() {
  const [kpis, setKpis] = useState({ sessionsWeek: 0, pendingReports: 0, activePatients: 0 })
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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
    }).catch(() => setLoading(false))
  }, [])

  return { kpis, recentSessions, loading }
}

export function DashboardPage() {
  const { user } = useAuth()
  const { kpis, recentSessions, loading } = useDashboardData()
  const name = user?.user_metadata?.full_name?.split(' ')[0] ?? 'Doctor/a'

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Buenos días, {name}</h1>
          <p className="page-subtitle">Aquí está su resumen de actividad de hoy.</p>
        </div>
        <Link to="/sesiones/nueva" className="btn btn-primary">+ Nueva sesión</Link>
      </div>

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
                    <td className="text-secondary">{s.started_at ? formatDate(s.started_at) : '—'}</td>
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
          )}
        </div>

        <aside className="dashboard-sidebar">
          <h2 className="section-title">Próximas citas</h2>
          <div className="card">
            <p className="text-secondary empty-state-inline">Sin citas programadas.</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
