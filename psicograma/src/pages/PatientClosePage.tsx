export function PatientClosePage() {
  return (
    <div className="patient-fullscreen">
      <div className="patient-centered">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#797581" strokeWidth="1.5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <h1 className="patient-heading" style={{ marginTop: 24 }}>Listo, hemos terminado</h1>
        <p className="patient-subtext">Gracias por tu participación</p>
      </div>
    </div>
  )
}
