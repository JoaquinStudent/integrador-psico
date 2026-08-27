import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { usePatients, getInitials, getAge, formatDate } from '../lib/patients'
import { useAuth } from '../lib/auth'
import { supabase, supabaseConfigured } from '../lib/supabase'
import type { Patient, PatientInsert, PatientUpdate } from '../types/database'

const FILTERS = ['Todos', 'Con evaluación pendiente', 'Menores de edad', 'Este mes'] as const
const PAGE_SIZE = 10

interface SessionCount { total: number; pending: number }

function useSessionCounts() {
  const [counts, setCounts] = useState<Map<string, SessionCount>>(new Map())

  useEffect(() => {
    if (!supabaseConfigured) return
    supabase.from('sessions').select('patient_id, status').then(({ data }) => {
      const map = new Map<string, SessionCount>()
      for (const s of data ?? []) {
        const pid = s.patient_id as string
        const prev = map.get(pid) ?? { total: 0, pending: 0 }
        prev.total++
        if (s.status !== 'completed') prev.pending++
        map.set(pid, prev)
      }
      setCounts(map)
    })
  }, [])

  return counts
}

export function PatientsPage() {
  const { patients, loading, createPatient, updatePatient } = usePatients()
  const { user } = useAuth()
  const sessionCounts = useSessionCounts()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<string>('Todos')
  const [page, setPage] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [editPatient, setEditPatient] = useState<Patient | null>(null)

  const filtered = useMemo(() => {
    let result = patients
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(p =>
        p.full_name.toLowerCase().includes(q) || p.document_number.includes(q)
      )
    }
    if (filter === 'Con evaluación pendiente') {
      result = result.filter(p => (sessionCounts.get(p.id)?.pending ?? 0) > 0)
    } else if (filter === 'Menores de edad') {
      result = result.filter(p => getAge(p.birth_date) < 18)
    } else if (filter === 'Este mes') {
      const now = new Date()
      result = result.filter(p => {
        const d = new Date(p.registered_at)
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      })
    }
    return result
  }, [patients, search, filter, sessionCounts])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageData = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const handleCreate = async (data: PatientInsert) => {
    const result = await createPatient(data)
    if (result?.error) return
    setShowModal(false)
  }

  const handleEdit = async (data: PatientInsert) => {
    if (!editPatient) return
    const result = await updatePatient(editPatient.id, data as PatientUpdate)
    if (result?.error) return
    setEditPatient(null)
  }

  if (loading) return <div className="page-loading">Cargando...</div>

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Pacientes</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Nuevo paciente
        </button>
      </div>

      <div className="search-bar">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input
          type="text"
          placeholder="Buscar por nombre o documento..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0) }}
        />
      </div>

      <div className="filter-group">
        {FILTERS.map(f => (
          <button
            key={f}
            className={`filter-chip${filter === f ? ' active' : ''}`}
            onClick={() => { setFilter(f); setPage(0) }}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p>{!supabaseConfigured
            ? 'Configura Supabase para gestionar pacientes.'
            : search || filter !== 'Todos'
              ? 'No se encontraron pacientes con esos criterios.'
              : 'No hay pacientes registrados.'
          }</p>
          {supabaseConfigured && !search && filter === 'Todos' && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              + Registrar primer paciente
            </button>
          )}
        </div>
      ) : (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Paciente</th>
                <th>Documento</th>
                <th>Edad</th>
                <th>Última evaluación</th>
                <th>Evaluaciones</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pageData.map(p => (
                <tr key={p.id}>
                  <td>
                    <Link to={`/pacientes/${p.id}`} className="patient-cell">
                      <span className="avatar">{getInitials(p.full_name)}</span>
                      <span className="patient-info">
                        <strong>{p.full_name}</strong>
                      </span>
                    </Link>
                  </td>
                  <td className="mono">{p.document_number}</td>
                  <td>{getAge(p.birth_date)} años</td>
                  <td className="text-secondary">{formatDate(p.registered_at)}</td>
                  <td>{sessionCounts.get(p.id)?.total ?? 0}</td>
                  <td>
                    {(sessionCounts.get(p.id)?.pending ?? 0) > 0
                      ? <span className="badge badge-amber">Pendiente</span>
                      : <span className="badge badge-green">Al día</span>
                    }
                  </td>
                  <td>
                    <button className="btn-link" onClick={() => setEditPatient(p)} style={{ marginRight: 8 }}>Editar</button>
                    <Link to={`/pacientes/${p.id}`} className="btn-link">Ver</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            <span className="text-secondary">Página {page + 1} de {totalPages}</span>
            <div className="pagination-buttons">
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)}>‹</button>
              <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>›</button>
            </div>
          </div>
        </>
      )}

      {showModal && (
        <PatientModal
          onClose={() => setShowModal(false)}
          onSubmit={handleCreate}
          userId={user?.id ?? ''}
        />
      )}

      {editPatient && (
        <PatientModal
          onClose={() => setEditPatient(null)}
          onSubmit={handleEdit}
          userId={user?.id ?? ''}
          initial={editPatient}
        />
      )}
    </div>
  )
}

function PatientModal({ onClose, onSubmit, userId, initial }: {
  onClose: () => void
  onSubmit: (data: PatientInsert) => Promise<void>
  userId: string
  initial?: Patient
}) {
  const [form, setForm] = useState({
    full_name: initial?.full_name ?? '',
    document_number: initial?.document_number ?? '',
    birth_date: initial?.birth_date ?? '',
    sex: (initial?.sex ?? 'M') as 'M' | 'F',
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    await onSubmit({ ...form, created_by: userId })
    setSubmitting(false)
  }

  const set = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">{initial ? 'Editar paciente' : 'Nuevo paciente'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nombre completo</label>
            <input className="form-input" required value={form.full_name}
              onChange={e => set('full_name', e.target.value)} placeholder="Nombre y apellidos" />
          </div>
          <div className="form-group">
            <label className="form-label">Número de documento</label>
            <input className="form-input" required value={form.document_number}
              onChange={e => set('document_number', e.target.value)} placeholder="DNI" />
          </div>
          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Fecha de nacimiento</label>
              <input className="form-input" type="date" required value={form.birth_date}
                onChange={e => set('birth_date', e.target.value)} />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Sexo</label>
              <select className="form-input" value={form.sex}
                onChange={e => set('sex', e.target.value)}>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Guardando...' : initial ? 'Guardar cambios' : 'Registrar paciente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
