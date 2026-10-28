import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { mensajeDeError } from '../lib/apiClient'
import { usePatients } from '../lib/patients'
import { fechaHora } from '../lib/status'
import {
  APPOINTMENT_STATUS, cancelAppointment, createAppointment, intervalo, listAppointments,
  type Appointment,
} from '../lib/appointments'

const DURACIONES = [30, 45, 60, 90, 120]

/** Agenda: fecha y hora de cada entrevista, sin cruces. Con Google conectado se refleja allí. */
export function AppointmentsPage() {
  const navigate = useNavigate()
  const { patients } = usePatients()
  const [citas, setCitas] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [verPasadas, setVerPasadas] = useState(false)
  const [form, setForm] = useState({ patient_id: '', fecha: '', hora: '09:00', minutos: 60, notes: '' })

  const cargar = useCallback(() =>
    listAppointments().then(c => { setCitas(c); setLoadError(null) }).catch(e => setLoadError(mensajeDeError(e))).finally(() => setLoading(false)), [])
  useEffect(() => { void cargar() }, [cargar])

  const { proximas, pasadas } = useMemo(() => {
    const ahora = Date.now()
    const vigente = (c: Appointment) => c.status === 'scheduled' && new Date(c.ends_at).getTime() >= ahora
    return { proximas: citas.filter(vigente), pasadas: citas.filter(c => !vigente(c)).reverse() }
  }, [citas])

  const nombre = (c: Appointment) => patients.find(p => p.id === c.patient_id)?.full_name ?? c.patient_name

  async function agendar(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError(null); setAviso(null)
    try {
      const r = await createAppointment({
        patient_id: form.patient_id, test_code: 'PBLL', notes: form.notes.trim() || null,
        ...intervalo(form.fecha, form.hora, form.minutos),
      })
      if (r.google_sync === 'error') setAviso('Cita guardada, pero no se pudo reflejar en Google Calendar. Revisa la conexión en Ajustes.')
      setForm(f => ({ ...f, notes: '' }))
      await cargar()
    } catch (err) {
      setError(mensajeDeError(err))
    } finally {
      setSaving(false)
    }
  }

  async function cancelar(c: Appointment) {
    if (!window.confirm(`¿Cancelar la cita de ${nombre(c)} del ${fechaHora(c.starts_at)}?`)) return
    setError(null)
    try { await cancelAppointment(c.id); await cargar() } catch (err) { setError(mensajeDeError(err)) }
  }

  const fila = (c: Appointment, acciones: boolean) => {
    const st = APPOINTMENT_STATUS[c.status]
    return (
      <tr key={c.id}>
        <td>{fechaHora(c.starts_at)}</td>
        <td>{nombre(c)}</td>
        <td>{c.test_code}</td>
        <td><span className={`badge ${st.badge}`}>{st.label}</span>{c.en_google && <span title="En Google Calendar"> 📅</span>}</td>
        <td className="cell-action">
          {acciones && c.status === 'scheduled' && <>
            <button className="btn btn-primary" onClick={() => navigate(`/sesiones/nueva?cita=${c.id}`)}>Iniciar sesión</button>{' '}
            <button className="btn" onClick={() => cancelar(c)}>Cancelar</button>
          </>}
          {c.session_id && <button className="btn" onClick={() => navigate(`/sesion/${c.session_id}`)}>Abrir sesión</button>}
        </td>
      </tr>
    )
  }

  return (
    <div>
      <h1 className="page-title">Citas</h1>
      <p className="page-subtitle">Agenda las entrevistas para que no se crucen. Con Google conectado (Ajustes) cada cita aparece en tu calendario.</p>

      <form onSubmit={agendar} className="card" style={{ marginBottom: 24 }}>
        <h2 className="card-title">Nueva cita</h2>
        <div className="form-row">
          <div className="form-group" style={{ flex: 2 }}>
            <label className="form-label">Paciente</label>
            <select className="form-input" required value={form.patient_id} onChange={e => setForm({ ...form, patient_id: e.target.value })}>
              <option value="">Selecciona…</option>
              {patients.filter(p => p.is_active).map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Fecha</label>
            <input className="form-input" type="date" required value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Hora</label>
            <input className="form-input" type="time" required value={form.hora} onChange={e => setForm({ ...form, hora: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Duración</label>
            <select className="form-input" value={form.minutos} onChange={e => setForm({ ...form, minutos: Number(e.target.value) })}>
              {DURACIONES.map(m => <option key={m} value={m}>{m} min</option>)}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Nota (opcional, no se envía a Google)</label>
          <input className="form-input" maxLength={500} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
        </div>
        {error && <p style={{ color: '#C0523F' }}>{error}</p>}
        {aviso && <p style={{ color: '#C97A1F' }}>{aviso}</p>}
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Agendando…' : 'Agendar'}</button>
      </form>

      <h2 className="card-title">Próximas</h2>
      {loadError ? <p role="alert" style={{ color: '#C0523F' }}>No se pudo cargar la agenda: {loadError}</p>
        : loading ? <p style={{ color: '#6B6885' }}>Cargando…</p> : proximas.length === 0
        ? <p style={{ color: '#6B6885' }}>No hay citas pendientes.</p>
        : <table className="data-table"><thead><tr><th>Cuándo</th><th>Paciente</th><th>Test</th><th>Estado</th><th /></tr></thead>
            <tbody>{proximas.map(c => fila(c, true))}</tbody></table>}

      {pasadas.length > 0 && <>
        <button className="btn" style={{ margin: '24px 0 8px' }} onClick={() => setVerPasadas(v => !v)}>
          {verPasadas ? 'Ocultar' : 'Ver'} historial ({pasadas.length})
        </button>
        {verPasadas && <table className="data-table"><tbody>{pasadas.map(c => fila(c, false))}</tbody></table>}
      </>}
    </div>
  )
}
