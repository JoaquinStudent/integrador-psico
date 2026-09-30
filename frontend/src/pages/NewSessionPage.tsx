import { useRef, useState, type PointerEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePatients, getInitials } from '../lib/patients'
import { useAuth } from '../lib/auth'
import { createSession } from '../lib/sessions'
import type { Patient } from '../types/api'

const STEPS = ['Paciente', 'Test', 'Consentimiento'] as const

export function NewSessionPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { patients } = usePatients()
  const [step, setStep] = useState(0)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [patientSearch, setPatientSearch] = useState('')
  const [consent, setConsent] = useState({ audio: false, digital: false, confidential: false })
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | undefined>()
  const [creating, setCreating] = useState(false)
  const signatureRef = useRef<HTMLCanvasElement>(null)
  const drawingSignature = useRef(false)

  const canNext = step === 0 ? !!selectedPatient
    : step === 1 ? true
    : consent.audio && consent.digital && consent.confidential && !!signatureDataUrl

  const handleNext = async () => {
    if (step < 2) { setStep(s => s + 1); return }
    if (!selectedPatient || !user || creating) return
    setCreating(true)
    const { sessionId, error } = await createSession(selectedPatient.id, 'PBLL', {
      ...consent,
      signatureDataUrl,
    }, user.id)
    if (error || !sessionId) { setCreating(false); alert(error?.message ?? 'Error al crear sesión'); return }
    navigate(`/sesion/${sessionId}/paciente/bienvenida`)
  }

  const filteredPatients = patientSearch
    ? patients.filter(p => p.full_name.toLowerCase().includes(patientSearch.toLowerCase()) ||
        p.document_number.includes(patientSearch))
    : patients

  const signaturePoint = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = signatureRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height),
    }
  }

  const startSignature = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = signatureRef.current
    const point = signaturePoint(event)
    if (!canvas || !point) return
    canvas.setPointerCapture(event.pointerId)
    drawingSignature.current = true
    const context = canvas.getContext('2d')
    if (!context) return
    context.strokeStyle = '#251D4B'
    context.lineWidth = 3
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.beginPath()
    context.moveTo(point.x, point.y)
  }

  const moveSignature = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!drawingSignature.current) return
    const point = signaturePoint(event)
    const context = signatureRef.current?.getContext('2d')
    if (!point || !context) return
    context.lineTo(point.x, point.y)
    context.stroke()
  }

  const endSignature = () => {
    if (!drawingSignature.current) return
    drawingSignature.current = false
    const canvas = signatureRef.current
    if (canvas) setSignatureDataUrl(canvas.toDataURL('image/png'))
  }

  const clearSignature = () => {
    const canvas = signatureRef.current
    const context = canvas?.getContext('2d')
    if (canvas && context) context.clearRect(0, 0, canvas.width, canvas.height)
    setSignatureDataUrl(undefined)
  }

  return (
    <div>
      <div className="stepper">
        {STEPS.map((label, i) => (
          <div key={label} className="step-item">
            {i > 0 && <div className={`step-line${i <= step ? ' done' : ''}`} />}
            <div className={`step-circle${i < step ? ' done' : i === step ? ' active' : ''}`}>
              {i < step ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
              ) : i + 1}
            </div>
            <span className={`step-label${i === step ? ' active' : ''}`}>{label}</span>
          </div>
        ))}
      </div>

      <div className="wizard-layout">
        <div className="wizard-main">
          {step === 0 && (
            <div className="card">
              <h2 className="card-title">Seleccionar paciente</h2>
              <div className="search-bar" style={{ marginBottom: 16 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input placeholder="Buscar paciente..." value={patientSearch}
                  onChange={e => setPatientSearch(e.target.value)} />
              </div>
              {filteredPatients.length === 0 ? (
                <p className="text-secondary">No hay pacientes registrados. Registra uno primero en la sección Pacientes.</p>
              ) : (
                <div className="patient-select-list">
                  {filteredPatients.map(p => (
                    <button key={p.id}
                      className={`patient-select-item${selectedPatient?.id === p.id ? ' selected' : ''}`}
                      onClick={() => setSelectedPatient(p)}>
                      <span className="avatar avatar-sm">{getInitials(p.full_name)}</span>
                      <span>
                        <strong>{p.full_name}</strong>
                        <small className="text-secondary"> DNI {p.document_number}</small>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="card">
              <h2 className="card-title">Seleccionar test</h2>
              <div className="test-select-grid">
                <div className="test-select-card selected">
                  <span className="badge badge-green-dot">Disponible</span>
                  <h3>Persona bajo la lluvia</h3>
                  <span className="test-card-code">PBLL</span>
                  <p className="text-secondary" style={{ fontSize: 13, marginTop: 8 }}>
                    Evalúa la imagen corporal y los mecanismos de defensa del sujeto ante condiciones ambientales adversas.
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="card">
              <h2 className="card-title">Consentimiento informado</h2>
              <div className="consent-text">
                <p>
                  Este documento establece los términos bajo los cuales se realizará la sesión de evaluación
                  psicológica mediante técnicas proyectivas. Se informa que la sesión podrá incluir la grabación
                  de audio para un análisis clínico preciso y que los dibujos realizados por el paciente serán
                  almacenados digitalmente en su expediente clínico.
                </p>
                <p>
                  Toda la información obtenida será tratada con estricta confidencialidad, respetando los principios
                  éticos y legales vigentes para la protección de datos en el ámbito de la salud mental.
                </p>
              </div>

              <div className="checkbox-group">
                <label className="checkbox-item">
                  <input type="checkbox" checked={consent.audio}
                    onChange={e => setConsent(c => ({ ...c, audio: e.target.checked }))} />
                  <span>Autorizo la grabación de audio de la sesión</span>
                </label>
                <label className="checkbox-item">
                  <input type="checkbox" checked={consent.digital}
                    onChange={e => setConsent(c => ({ ...c, digital: e.target.checked }))} />
                  <span>Autorizo el almacenamiento digital del dibujo</span>
                </label>
                <label className="checkbox-item">
                  <input type="checkbox" checked={consent.confidential}
                    onChange={e => setConsent(c => ({ ...c, confidential: e.target.checked }))} />
                  <span>He sido informado del tratamiento confidencial de mis datos</span>
                </label>
              </div>

              <div className="warning-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C97A1F" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                <p>Si el paciente es menor de edad, el consentimiento debe ser firmado por su apoderado o tutor legal, presentando la identificación correspondiente.</p>
              </div>

              <div className="form-group" style={{ marginTop: 24 }}>
                <label className="form-label" style={{ textTransform: 'uppercase', fontSize: 12, letterSpacing: '0.05em' }}>
                  Firma del paciente / apoderado
                </label>
                <div className={`signature-area${signatureDataUrl ? ' has-signature' : ''}`}>
                  <canvas
                    ref={signatureRef}
                    width={760}
                    height={180}
                    aria-label="Área para dibujar la firma"
                    onPointerDown={startSignature}
                    onPointerMove={moveSignature}
                    onPointerUp={endSignature}
                    onPointerCancel={endSignature}
                  />
                  {!signatureDataUrl && <span className="signature-placeholder text-secondary">Firme aquí</span>}
                </div>
                <button type="button" className="signature-clear" onClick={clearSignature} disabled={!signatureDataUrl}>
                  Limpiar firma
                </button>
              </div>
            </div>
          )}
        </div>

        <aside className="wizard-sidebar">
          <div className="card">
            <h3 className="sidebar-section-title" style={{ textTransform: 'uppercase', fontSize: 12, letterSpacing: '0.05em' }}>
              Resumen de sesión
            </h3>

            <div className="summary-item">
              <span className="summary-label">Paciente</span>
              {selectedPatient ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <span className="avatar avatar-sm">{getInitials(selectedPatient.full_name)}</span>
                  <span><strong>{selectedPatient.full_name}</strong></span>
                </div>
              ) : (
                <span className="text-secondary">No seleccionado</span>
              )}
            </div>

            {step >= 1 && (
              <div className="summary-item">
                <span className="summary-label">Test seleccionado</span>
                <span><strong>Persona bajo la lluvia</strong></span>
              </div>
            )}

            {step >= 1 && (
              <div className="protocol-box">
                <span className="summary-label">Protocolo</span>
                <p style={{ fontSize: 13, marginTop: 4 }}>
                  La hoja se entregará en posición horizontal, según el protocolo estándar de este test proyectivo.
                  Asegúrese de contar con lápiz HB y borrador libre de manchas.
                </p>
              </div>
            )}

            {step >= 1 && (
              <div className="summary-item">
                <span className="text-secondary" style={{ fontSize: 13 }}>
                  Duración estimada: 45 min
                </span>
              </div>
            )}
          </div>
        </aside>
      </div>

      <div className="wizard-actions">
        {step > 0 && (
          <button className="btn btn-secondary" onClick={() => setStep(s => s - 1)}>
            ← Atrás
          </button>
        )}
        <button className="btn btn-primary" disabled={!canNext || creating} onClick={handleNext}>
          {creating ? 'Creando...' : step === 2 ? 'Comenzar sesión →' : 'Siguiente →'}
        </button>
      </div>
    </div>
  )
}
