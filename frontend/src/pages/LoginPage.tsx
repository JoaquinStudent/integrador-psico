import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import './LoginPage.css'

export function LoginPage() {
  const { user, loading, signIn, signUp } = useAuth()
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (loading) return <div className="login-loading">Cargando...</div>
  if (user) return <Navigate to="/" replace />

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    const result = isRegister
      ? await signUp(email, password, fullName)
      : await signIn(email, password)

    if (result.error) {
      setError(result.error.message)
    }
    setSubmitting(false)
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <span className="login-logo">P</span>
          <h1>Psicograma</h1>
        </div>
        <p className="login-subtitle">
          {isRegister ? 'Crear cuenta profesional' : 'Inicia sesión para continuar'}
        </p>

        <form onSubmit={handleSubmit} className="login-form">
          {isRegister && (
            <label className="login-field">
              <span>Nombre completo</span>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Dra. María Ramírez"
                required
              />
            </label>
          )}
          <label className="login-field">
            <span>Correo electrónico</span>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              required
            />
          </label>
          <label className="login-field">
            <span>Contraseña</span>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </label>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-submit" disabled={submitting}>
            {submitting ? 'Cargando...' : isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
          </button>
        </form>

        <button className="login-toggle" onClick={() => { setIsRegister(!isRegister); setError('') }}>
          {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
        </button>
      </div>
    </div>
  )
}
