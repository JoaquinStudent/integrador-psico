import type { ReportStatus, SessionStatus } from '../types/api'

type Etiqueta = { label: string; badge: string }

/** Una sola fuente de verdad: el mismo estado se ve igual en listas, panel y ficha. */
export const SESSION_STATUS: Record<SessionStatus, Etiqueta> = {
  setup: { label: 'Por configurar', badge: 'badge-amber' },
  consent: { label: 'Esperando consentimiento', badge: 'badge-amber' },
  active: { label: 'En curso', badge: 'badge-purple' },
  completed: { label: 'Completada', badge: 'badge-green' },
  cancelled: { label: 'Cancelada', badge: 'badge-gray' },
}

export const REPORT_STATUS: Record<ReportStatus, Etiqueta> = {
  draft: { label: 'Borrador', badge: 'badge-amber' },
  validated: { label: 'Validado', badge: 'badge-green' },
}

/** Estado desconocido (la API creció y el frontend no): se muestra tal cual, sin romper. */
export const etiquetaDe = <K extends string>(tabla: Record<K, Etiqueta>, estado: string): Etiqueta =>
  tabla[estado as K] ?? { label: estado, badge: 'badge-gray' }

export function fechaHora(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' })
}

/** "12 min" a partir de dos instantes; vacío si la sesión no tiene ambos. */
export function duracion(inicio: string | null, fin: string | null): string {
  if (!inicio || !fin) return '—'
  const ms = new Date(fin).getTime() - new Date(inicio).getTime()
  if (!Number.isFinite(ms) || ms < 0) return '—'
  const min = Math.round(ms / 60000)
  return min < 1 ? '< 1 min' : min < 60 ? `${min} min` : `${Math.floor(min / 60)} h ${min % 60} min`
}

/** Qué hacer con una sesión según en qué punto quedó (listas y panel). */
export function accionDeSesion(s: { id: string; status: string }): { to: string; label: string } {
  if (s.status === 'completed') return { to: `/sesion/${s.id}/analisis`, label: 'Ver análisis' }
  if (s.status === 'cancelled') return { to: `/sesion/${s.id}`, label: 'Ver detalle' }
  if (s.status === 'setup') return { to: `/sesion/${s.id}`, label: 'Revisar' }
  return { to: `/sesion/${s.id}`, label: 'Continuar' }
}
