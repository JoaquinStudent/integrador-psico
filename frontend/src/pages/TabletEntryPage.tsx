import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, mensajeDeError } from '../lib/apiClient'
import type { Session } from '../types/api'

/**
 * Punto de entrada de la tablet: `/sesion/activa`.
 *
 * Existe para que la tablet pueda guardar **una** dirección en favoritos en vez de
 * teclear un UUID por sesión. Busca la sesión que este examinador tiene lista y
 * redirige a la pantalla que corresponde.
 *
 * `consent` primero, porque es la sesión recién creada que está esperando a la
 * tablet. `active` después, para que una tablet que se quedó sin batería a mitad de
 * la toma vuelva al dibujo en vez de reiniciar la sesión.
 */
export function TabletEntryPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelado = false

    async function buscar() {
      try {
        for (const [estado, destino] of [
          ['consent', 'bienvenida'],
          ['active', 'dibujo'],
        ] as const) {
          const page = await api.get<{ items: Session[] }>(`/sessions?status=${estado}`)
          const sesion = page.items[0]
          if (sesion && !cancelado) {
            navigate(`/sesion/${sesion.id}/paciente/${destino}`, { replace: true })
            return
          }
        }
        if (!cancelado) setError('No hay ninguna sesión lista todavía.')
      } catch (e) {
        if (!cancelado) setError(mensajeDeError(e))
      }
    }

    void buscar()
    return () => { cancelado = true }
  }, [navigate])

  return (
    <div className="patient-fullscreen">
      <div className="patient-centered">
        {error ? (
          <>
            <h1 className="patient-heading">Todo listo por aquí</h1>
            <p className="patient-subtext">{error}</p>
            <p className="patient-subtext">
              Pídele al profesional que cree la sesión y vuelve a cargar esta pantalla.
            </p>
          </>
        ) : (
          <p className="patient-subtext">Buscando tu sesión...</p>
        )}
      </div>
    </div>
  )
}
