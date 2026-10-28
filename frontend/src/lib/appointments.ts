import { api } from './apiClient'

export type AppointmentStatus = 'scheduled' | 'started' | 'cancelled'

export interface Appointment {
  id: string
  patient_id: string
  patient_name: string
  test_code: string
  starts_at: string
  ends_at: string
  status: AppointmentStatus
  notes: string | null
  session_id: string | null
  en_google: boolean
  /** Solo en respuestas que escriben. `off` = sin Google conectado. */
  google_sync?: 'off' | 'ok' | 'error'
}

export interface GoogleStatus {
  configured: boolean
  connected: boolean
  connected_at: string | null
}

export const APPOINTMENT_STATUS: Record<AppointmentStatus, { label: string; badge: string }> = {
  scheduled: { label: 'Pendiente', badge: 'badge-amber' },
  started: { label: 'Iniciada', badge: 'badge-green' },
  cancelled: { label: 'Cancelada', badge: 'badge-gray' },
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Un id que viene de la URL no se confia: se valida antes de usarlo en una ruta de la API. */
export const esUuid = (v: string | null | undefined): v is string => !!v && UUID.test(v)

function idSeguro(id: string): string {
  if (!esUuid(id)) throw new Error('Identificador de cita invalido')
  return encodeURIComponent(id)
}

export const listAppointments = () => api.get<Appointment[]>('/appointments')

export const createAppointment = (body: {
  patient_id: string; test_code: string; starts_at: string; ends_at: string; notes: string | null
}) => api.post<Appointment>('/appointments', body)

export const rescheduleAppointment = (id: string, body: { starts_at: string; ends_at: string }) =>
  api.patch<Appointment>(`/appointments/${idSeguro(id)}`, body)

export const cancelAppointment = (id: string) => api.post<Appointment>(`/appointments/${idSeguro(id)}/cancel`)

/** Crea la sesion desde la cita y devuelve su id. */
export const startAppointment = (id: string) =>
  api.post<Appointment>(`/appointments/${idSeguro(id)}/start`)

/** "2026-11-03" + "10:00" + 60 min, en la hora local del navegador, con zona (ISO). */
export function intervalo(fecha: string, hora: string, minutos: number) {
  const ini = new Date(`${fecha}T${hora}:00`)
  return { starts_at: ini.toISOString(), ends_at: new Date(ini.getTime() + minutos * 60000).toISOString() }
}

export const googleStatus = () => api.get<GoogleStatus>('/integrations/google')
export const googleConnectUrl = () => api.post<{ url: string }>('/integrations/google/connect')
/** Cierra el flujo de OAuth con la sesion del usuario: el servidor exige que el estado sea suyo. */
export const googleComplete = (code: string, state: string) =>
  api.post<GoogleStatus>('/integrations/google/complete', { code, state })

export const googleDisconnect = () => api.del<void>('/integrations/google')
