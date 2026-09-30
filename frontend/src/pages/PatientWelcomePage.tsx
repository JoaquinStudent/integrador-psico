import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../lib/apiClient'

export function PatientWelcomePage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const start = async () => {
    if (id) await api.patch(`/sessions/${id}`, { status: 'active' })
    navigate(`/sesion/${id}/paciente/dibujo`)
  }

  return (
    <div className="patient-fullscreen">
      <div className="patient-centered">
        <h1 className="patient-heading">Dibuja una persona bajo la lluvia</h1>
        <p className="patient-subtext">Puedes tomarte el tiempo que necesites</p>
        <button className="patient-cta" onClick={start}>
          Comenzar
        </button>
      </div>
    </div>
  )
}
