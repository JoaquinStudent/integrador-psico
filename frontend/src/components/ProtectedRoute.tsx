import { Navigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) return <div style={{ padding: 40, color: '#6B6885' }}>Cargando...</div>
  if (!user) return <Navigate to="/login" replace />

  return <>{children}</>
}
