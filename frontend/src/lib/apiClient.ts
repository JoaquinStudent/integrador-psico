/**
 * Cliente único contra la API de Psicograma.
 *
 * A partir de acá el navegador no consulta la base de datos: solo habla con este
 * backend. Supabase queda para dos cosas y nada más — el login y el canal de
 * sincronización en vivo.
 *
 * El token lo emite Supabase Auth; este cliente lo adjunta y, si venció, refresca
 * la sesión y reintenta una sola vez. Un segundo 401 significa que la sesión
 * murió de verdad y hay que volver al login.
 */

import { supabase } from './supabase'

/**
 * Dónde está la API.
 *
 * Sin `VITE_API_URL` se deduce del host desde el que se cargó la aplicación, no se
 * fija en `localhost`. La razón es la tablet del paciente: para ella `localhost` es
 * ella misma, así que un valor fijo la deja sin API. Deducirlo hace que el laptop en
 * `localhost:5173` pegue a `localhost:8000` y la tablet en `192.168.x.x:5173` pegue a
 * `192.168.x.x:8000`, sin configurar nada y sin una IP escrita en ningún archivo —
 * que además cambia cada vez que se cambia de red.
 *
 * `VITE_API_URL` sigue mandando cuando existe, que es lo que hará el despliegue.
 */
function apiBase(): string {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL
  const { protocol, hostname } = window.location
  return `${protocol}//${hostname}:8000`
}

const BASE = apiBase() + '/api/v1'

/** Error de la API con el cuerpo RFC 9457 ya desempaquetado. */
export class ApiError extends Error {
  // Campos declarados y asignados por separado: el proyecto compila con
  // `erasableSyntaxOnly`, que prohibe las parameter properties de TypeScript
  // porque no son sintaxis borrable a JavaScript plano.
  readonly status: number
  readonly title: string
  readonly detail: string

  constructor(status: number, title: string, detail: string) {
    super(detail || title)
    this.name = 'ApiError'
    this.status = status
    this.title = title
    this.detail = detail
  }

  /** El recurso existe pero no es de este examinador. */
  get isForbidden() {
    return this.status === 403
  }

  get isNotFound() {
    return this.status === 404
  }

  /** Conflicto de estado: validar un informe ya validado, analizar una sesión abierta. */
  get isConflict() {
    return this.status === 409
  }
}

async function accessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

async function toError(res: Response): Promise<ApiError> {
  // El backend responde application/problem+json, pero un 502 de un proxy puede
  // llegar como HTML: no se asume que el cuerpo sea JSON.
  let title = res.statusText
  let detail = ''
  try {
    const body = await res.json()
    title = body.title ?? title
    detail = body.detail ?? ''
  } catch {
    detail = `La API respondió ${res.status} sin cuerpo interpretable`
  }
  return new ApiError(res.status, title, detail)
}

type Options = {
  method?: string
  body?: unknown
  /** Para multipart. Si viene, no se fija Content-Type: lo pone el navegador con su boundary. */
  form?: FormData
  signal?: AbortSignal
}

async function send(path: string, opts: Options, retry = true): Promise<Response> {
  const token = await accessToken()
  const headers: Record<string, string> = {}
  if (token) headers.Authorization = `Bearer ${token}`
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json'

  const res = await fetch(`${BASE}${path}`, {
    method: opts.method ?? 'GET',
    headers,
    body: opts.form ?? (opts.body !== undefined ? JSON.stringify(opts.body) : undefined),
    signal: opts.signal,
  })

  // Un solo reintento tras refrescar. Sin el límite, un token irrecuperable
  // dejaría el cliente reintentando en bucle.
  if (res.status === 401 && retry) {
    const { data, error } = await supabase.auth.refreshSession()
    if (!error && data.session) return send(path, opts, false)
  }

  return res
}

async function request<T>(path: string, opts: Options = {}): Promise<T> {
  const res = await send(path, opts)
  if (!res.ok) throw await toError(res)
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export const api = {
  get: <T>(path: string, signal?: AbortSignal) => request<T>(path, { signal }),

  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),

  put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body }),

  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body }),

  del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),

  /** Subida de archivos: audio de la sesión, PNG del dibujo. */
  upload: <T>(path: string, file: Blob, filename: string) => {
    const form = new FormData()
    form.append('file', file, filename)
    return request<T>(path, { method: 'POST', form })
  },

  /** Descarga binaria, para el PDF del informe. */
  blob: async (path: string): Promise<Blob> => {
    const res = await send(path, {})
    if (!res.ok) throw await toError(res)
    return res.blob()
  },
}

/**
 * Mensaje para mostrarle al examinador. En español y sin volcados técnicos
 * (RNF-21): un stack trace en pantalla no le sirve a un psicólogo.
 */
export function mensajeDeError(e: unknown): string {
  if (e instanceof ApiError) {
    if (e.isForbidden) return 'No tienes acceso a este registro.'
    if (e.isNotFound) return 'El registro no existe o fue eliminado.'
    if (e.status === 401) return 'Tu sesión expiró. Vuelve a iniciar sesión.'
    if (e.status === 502) return 'Un servicio externo no respondió. Intenta de nuevo en un momento.'
    return e.detail || e.title
  }
  if (e instanceof TypeError) return 'No se pudo conectar con el servidor.'
  return 'Ocurrió un error inesperado.'
}
