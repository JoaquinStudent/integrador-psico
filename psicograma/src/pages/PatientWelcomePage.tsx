import { useNavigate, useParams } from 'react-router-dom'

export function PatientWelcomePage() {
  const { id } = useParams()
  const navigate = useNavigate()

  return (
    <div className="patient-fullscreen">
      <div className="patient-centered">
        <h1 className="patient-heading">Dibuja una persona bajo la lluvia</h1>
        <p className="patient-subtext">Puedes tomarte el tiempo que necesites</p>
        <button className="patient-cta" onClick={() => navigate(`/sesion/${id}/paciente/dibujo`)}>
          Comenzar
        </button>
      </div>
    </div>
  )
}
