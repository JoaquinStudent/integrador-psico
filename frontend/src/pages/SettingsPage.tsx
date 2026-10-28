import { useEffect, useState } from 'react'
import { api, mensajeDeError } from '../lib/apiClient'
import type { Profile } from '../types/api'
import { googleComplete, googleConnectUrl, googleDisconnect, googleStatus, type GoogleStatus } from '../lib/appointments'
import { fechaHora } from '../lib/status'

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

  const [google, setGoogle] = useState<GoogleStatus | null>(null)
  const [googleMsg, setGoogleMsg] = useState<string | null>(null)
  useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    const code = q.get('google_code')
    const state = q.get('google_state')
    const resultado = q.get('google')
    // El código de Google no se deja en la barra de direcciones.
    if (code || state || resultado) window.history.replaceState(null, '', window.location.pathname)

    if (code && state) {
      // Se completa con la sesión del usuario: el servidor comprueba que el estado sea suyo.
      googleComplete(code, state)
        .then(g => { setGoogle(g); setGoogleMsg('Google Calendar conectado.') })
        .catch(() => { setGoogleMsg('No se pudo conectar con Google. Intenta de nuevo.'); googleStatus().then(setGoogle).catch(() => setGoogle(null)) })
      return
    }
    googleStatus().then(setGoogle).catch(() => setGoogle(null))
    if (resultado === 'cancelado') setGoogleMsg('No diste el permiso; nada cambió.')
  }, [])

  async function conectarGoogle() {
    try { window.location.href = (await googleConnectUrl()).url } catch (e) { setError(mensajeDeError(e)) }
  }
  async function desconectarGoogle() {
    try { await googleDisconnect(); setGoogle(await googleStatus()); setGoogleMsg('Google Calendar desconectado. Tus citas siguen en la app.') }
    catch (e) { setError(mensajeDeError(e)) }
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

      <div className="card" style={{ maxWidth: 480, marginTop: 32 }}>
        <h2 className="card-title">Google Calendar</h2>
        <p style={{ color: '#6B6885', fontSize: 14 }}>
          Refleja tus citas en tu calendario. El evento lleva solo las iniciales del paciente, nunca su nombre ni documento.
        </p>
        {googleMsg && <p style={{ color: '#2F7D5B' }}>{googleMsg}</p>}
        {google === null ? <p style={{ color: '#6B6885' }}>No se pudo consultar el estado.</p>
          : !google.configured ? <p style={{ color: '#C97A1F' }}>El servidor no tiene credenciales de Google configuradas.</p>
          : google.connected ? <>
              <p>Conectado desde {fechaHora(google.connected_at)}.</p>
              <button type="button" className="btn" onClick={desconectarGoogle}>Desconectar</button>
            </>
          : <button type="button" className="btn btn-primary" onClick={conectarGoogle}>Conectar Google Calendar</button>}
      </div>
    </div>
  )
}
