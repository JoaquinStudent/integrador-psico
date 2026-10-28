import { useEffect, useState } from 'react'
import { api, mensajeDeError } from '../lib/apiClient'
import type { Profile } from '../types/api'

/** RF-02: nombre, matrícula y especialidad. La matrícula firma el informe. */
export function SettingsPage() {
  const [form, setForm] = useState({ full_name: '', license_number: '', specialty: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.get<Profile>('/profile')
      .then(p => setForm({
        full_name: p.full_name,
        license_number: p.license_number ?? '',
        specialty: p.specialty ?? '',
      }))
      .catch(e => setError(mensajeDeError(e)))
      .finally(() => setLoading(false))
  }, [])

  const set = (campo: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(null)
    setForm(f => ({ ...f, [campo]: e.target.value }))
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError(null); setMessage(null)
    try {
      await api.patch<Profile>('/profile', {
        full_name: form.full_name,
        license_number: form.license_number.trim() || null,
        specialty: form.specialty.trim() || null,
      })
      setMessage('Perfil guardado.')
    } catch (err) {
      setError(mensajeDeError(err))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div style={{ padding: 40, color: '#6B6885' }}>Cargando perfil...</div>

  return (
    <div>
      <h1 className="page-title">Ajustes</h1>
      <p className="page-subtitle">Tu perfil profesional. La matrícula aparece en la firma de los informes.</p>
      <form onSubmit={guardar} style={{ maxWidth: 480 }}>
        <div className="form-group">
          <label className="form-label">Nombre completo</label>
          <input className="form-input" required value={form.full_name} onChange={set('full_name')} />
        </div>
        <div className="form-group">
          <label className="form-label">Número de matrícula profesional</label>
          <input className="form-input" value={form.license_number} onChange={set('license_number')} placeholder="CPsP 12345" />
        </div>
        <div className="form-group">
          <label className="form-label">Especialidad</label>
          <input className="form-input" value={form.specialty} onChange={set('specialty')} placeholder="Psicología clínica" />
        </div>
        {error && <p style={{ color: '#C0523F' }}>{error}</p>}
        {message && <p style={{ color: '#2F7D5B' }}>{message}</p>}
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</button>
      </form>
    </div>
  )
}
