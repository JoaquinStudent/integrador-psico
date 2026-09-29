import { useLocation } from 'react-router-dom'

export function PlaceholderPage() {
  const { pathname } = useLocation()
  const name = pathname.slice(1) || 'Página'
  return (
    <div>
      <h1 className="page-title" style={{ textTransform: 'capitalize' }}>{name}</h1>
      <p className="page-subtitle">Sprint 1 — próximamente.</p>
    </div>
  )
}
