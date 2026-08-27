import { Link } from 'react-router-dom'

const TESTS = [
  {
    id: 'pbll',
    name: 'Persona bajo la lluvia',
    code: 'PBLL',
    description: 'Evalúa la imagen corporal y los mecanismos de defensa del sujeto ante condiciones ambientales adversas.',
    available: true,
    stats: { indicators: 149, population: 'Todas las edades', duration: '15 a 20 minutos' },
  },
  {
    id: 'htp',
    name: 'Casa-Árbol-Persona',
    code: 'HTP',
    description: 'Evalúa la percepción de sí mismo, el entorno familiar y la relación con el medio.',
    available: false,
  },
  {
    id: 'df',
    name: 'Dibujo de la Familia',
    code: 'DF',
    description: 'Explora la dinámica y los vínculos familiares percibidos por el sujeto.',
    available: false,
  },
  {
    id: 'dfh',
    name: 'Figura Humana',
    code: 'DFH',
    description: 'Evalúa el esquema corporal y aspectos de la personalidad.',
    available: false,
  },
]

export function TestCatalogPage() {
  return (
    <div>
      <h1 className="page-title">Tests disponibles</h1>
      <p className="page-subtitle">Selecciona el instrumento a aplicar en la sesión</p>

      <div className="test-grid">
        {TESTS.map(test => (
          <div key={test.id} className={`test-card${test.available ? ' available' : ' locked'}`}>
            <div className="test-card-header">
              {test.available ? (
                <span className="badge badge-green-dot">Disponible</span>
              ) : (
                <span className="badge badge-gray">Próximamente</span>
              )}
            </div>

            <h3 className="test-card-title">{test.name}</h3>
            <span className="test-card-code">{test.code}</span>
            <p className="test-card-desc">{test.description}</p>

            {test.available && test.stats && (
              <div className="test-card-stats">
                <div className="test-stat">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                  {test.stats.indicators} indicadores modelados
                </div>
                <div className="test-stat">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                  Población: {test.stats.population}
                </div>
                <div className="test-stat">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  Duración estimada: {test.stats.duration}
                </div>
              </div>
            )}

            {test.available ? (
              <Link to="/sesiones/nueva" className="btn btn-primary test-card-btn">
                Aplicar este test →
              </Link>
            ) : (
              <button className="btn btn-disabled test-card-btn" disabled>
                No disponible
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="info-banner">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        Los instrumentos adicionales se incorporarán en próximas versiones del sistema.
      </div>
    </div>
  )
}
