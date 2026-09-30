import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../lib/apiClient'

export function PatientWelcomePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [entrando, setEntrando] = useState(false)

  const start = async () => {
    if (!id || entrando) return
    setEntrando(true)
    // Pasar a `active` es lo que hace que el servidor selle `started_at`: de ahí sale
    // el cronómetro del examinador. Si la sesión ya estaba activa —la tablet se
    // reconecta— el PATCH es inocuo y se entra a dibujar igual.
    try {
      await api.patch(`/sessions/${id}`, { status: 'active' })
    } catch {
      // Sin ruido: la pantalla de dibujo lee la sesión y se entera del estado real.
    }
    navigate(`/sesion/${id}/paciente/dibujo`)
  }

  return (
    <div className="patient-fullscreen">
      <div className="patient-centered">
        <h1 className="patient-heading">Dibuja una persona bajo la lluvia</h1>
        <p className="patient-subtext">Puedes tomarte el tiempo que necesites</p>
        <button className="patient-cta" onClick={start} disabled={entrando}>
          {entrando ? 'Preparando...' : 'Comenzar'}
        </button>
      </div>
    </div>
  )
}
