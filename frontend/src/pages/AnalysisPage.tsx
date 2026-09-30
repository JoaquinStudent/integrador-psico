import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../lib/apiClient'
import { PBLL_INDICATORS, INDICATOR_SECTIONS, INDICATOR_CATEGORIES } from '../data/pbll-indicators'
import { analyzeDrawing } from '../lib/analyzeDrawing'
import type { SessionIndicator } from '../types/api'
import { generateReport } from '../lib/reports'

type Tab = 'objective' | 'detected' | 'verification'

export function AnalysisPage() {
  const { id: sessionId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('objective')
  const [indicators, setSessionIndicators] = useState<SessionIndicator[]>([])
  const [metrics, setMetrics] = useState<Record<string, unknown> | null>(null)
  const [patient, setPatient] = useState<{ full_name: string } | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!sessionId) return
    loadData()
  }, [sessionId])

  async function loadData() {
    try {
      const [metrics, indicators, session] = await Promise.all([
        api.get<Record<string, unknown>>(`/sessions/${sessionId}/metrics`),
        api.get<SessionIndicator[]>(`/sessions/${sessionId}/indicators`),
        api.get<{ patient_id: string }>(`/sessions/${sessionId}`),
      ])
      setMetrics(metrics)
      setSessionIndicators(indicators)
      const patientData = await api.get<{ full_name: string }>(`/patients/${session.patient_id}`)
      setPatient(patientData)
    } catch {
      setMetrics(null)
      setSessionIndicators([])
    }
  }

  async function runAnalysis() {
    if (!sessionId || !metrics) return
    setAnalyzing(true)
    const m = metrics as Record<string, unknown>
    const result = await analyzeDrawing({
      sessionId,
      metrics: {
        total_time_ms: (m.total_time_ms as number) ?? null,
        latency_ms: (m.latency_ms as number) ?? null,
        stroke_count: (m.stroke_count as number) ?? 0,
        pressure_avg: (m.pressure_avg as number) ?? null,
        pause_count: (m.pause_count as number) ?? 0,
        erase_count: (m.erase_count as number) ?? 0,
        area_pct: (m.area_pct as number) ?? null,
        sequence_start: (m.sequence_start as string) ?? null,
      },
      manualIndicators: indicators.filter(i => i.source === 'manual').map(i => i.code),
    })
    if (result) {
      await loadData()
    }
    setAnalyzing(false)
  }

  const toggleSessionIndicator = useCallback(async (code: string) => {
    if (!sessionId) return
    const existing = indicators.find(i => i.code === code)
    if (existing) {
      const newStatus = existing.status === 'validated' ? 'rejected' : 'validated'
      await api.put(`/sessions/${sessionId}/indicators/${code}`, { status: newStatus })
      setSessionIndicators(prev => prev.map(i => i.code === code ? { ...i, status: newStatus } : i))
    } else {
      const ind = PBLL_INDICATORS.find(i => i.code === code)
      if (!ind) return
      const created = await api.post<SessionIndicator[]>(`/sessions/${sessionId}/indicators/bulk`, {
        codes: [ind.code],
      })
      if (created[0]) setSessionIndicators(prev => [...prev, created[0]])
    }
  }, [sessionId, indicators])

  async function saveVerification() {
    setSaving(true)
    await new Promise(r => setTimeout(r, 300))
    setSaving(false)
  }

  const toggleSection = (sectionCode: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(sectionCode)) next.delete(sectionCode)
      else next.add(sectionCode)
      return next
    })
  }

  const validatedCount = indicators.filter(i => i.status === 'validated').length
  const totalManualSessionIndicators = PBLL_INDICATORS.filter(i => i.detection === 'manual' || i.detection === 'semi').length
  const autoDetected = indicators.filter(i => i.source === 'auto')
  const suggestions = indicators.filter(i => i.status === 'suggestion')

  async function openReport() {
    if (!sessionId) return
    try {
      const report = await generateReport(sessionId)
      // El informe se genera igual sin el redactor; avisar cuales quedaron en blanco
      // evita que el profesional crea que el sistema no midio nada.
      const pendientes = report.pending_sections ?? []
      if (pendientes.length > 0) {
        window.alert(
          `El informe se generó, pero el asistente de redacción no respondió. ` +
          `Escribe a mano estas secciones: ${pendientes.join(', ')}.`
        )
      }
      navigate(`/informes/${report.id}`)
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'No se pudo generar el informe')
    }
  }

  return (
    <div className="analysis-page">
      <div className="analysis-header">
        <h1>Analisis de Resultados - Persona bajo la lluvia</h1>
        <div className="analysis-notice">
          <span className="notice-icon">i</span>
          <p>Los siguientes indicadores requieren observacion directa del profesional. El sistema los presenta organizados para evitar omisiones, sin realizar deteccion automatica.</p>
        </div>
      </div>

      <div className="analysis-body">
        {/* Left: Drawing */}
        <div className="analysis-drawing">
          <div className="drawing-meta">
            <span className="drawing-label">Dibujo Original</span>
            {patient && <span className="drawing-patient">Paciente: {patient.full_name}</span>}
          </div>
          <div className="drawing-preview">
            <div className="drawing-placeholder">La imagen se cargará desde el Storage privado.</div>
          </div>
        </div>

        {/* Right: Tabs */}
        <div className="analysis-panel">
          <div className="analysis-tabs">
            <button className={tab === 'objective' ? 'active' : ''} onClick={() => setTab('objective')}>
              Medicion objetiva
            </button>
            <button className={tab === 'detected' ? 'active' : ''} onClick={() => setTab('detected')}>
              Elementos detectados
              {suggestions.length > 0 && <span className="tab-badge">{suggestions.length}</span>}
            </button>
            <button className={tab === 'verification' ? 'active' : ''} onClick={() => setTab('verification')}>
              Verificacion profesional
            </button>
          </div>

          <div className="analysis-tab-content">
            {tab === 'objective' && <ObjectiveTab metrics={metrics} onAnalyze={runAnalysis} analyzing={analyzing} />}
            {tab === 'detected' && <DetectedTab indicators={autoDetected} suggestions={suggestions} onToggle={toggleSessionIndicator} onReject={code => {
              if (sessionId) void api.put(`/sessions/${sessionId}/indicators/${code}`, { status: 'rejected' }).then(loadData)
            }} />}
            {tab === 'verification' && (
              <VerificationTab
                indicators={indicators}
                expandedSections={expandedSections}
                onToggleSection={toggleSection}
                onToggleSessionIndicator={toggleSessionIndicator}
              />
            )}
          </div>

          {/* Bottom bar */}
          <div className="analysis-bottom-bar">
            <div className="progress-info">
              <span className="progress-label">PROGRESO GENERAL</span>
              <span className="progress-count">{validatedCount} de {totalManualSessionIndicators}</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${totalManualSessionIndicators > 0 ? (validatedCount / totalManualSessionIndicators) * 100 : 0}%` }} />
            </div>
            <button className="btn-save-verification" onClick={openReport} disabled={saving}>
              Generar informe
            </button>
            <button className="btn-save-verification" onClick={saveVerification} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar verificacion'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ObjectiveTab({ metrics, onAnalyze, analyzing }: { metrics: Record<string, unknown> | null; onAnalyze: () => void; analyzing: boolean }) {
  if (!metrics) return <div className="tab-empty">No hay metricas para esta sesion.</div>

  const m = metrics as Record<string, unknown>
  const rows = [
    { label: 'Tiempo total', value: m.total_time_ms ? `${Math.round((m.total_time_ms as number) / 1000)}s` : 'N/A' },
    { label: 'Latencia', value: m.latency_ms ? `${Math.round((m.latency_ms as number) / 1000)}s` : 'N/A' },
    { label: 'Trazos', value: String(m.stroke_count ?? 0) },
    { label: 'Presion promedio', value: m.pressure_avg ? (m.pressure_avg as number).toFixed(2) : 'N/A' },
    { label: 'Pausas (>3s)', value: String(m.pause_count ?? 0) },
    { label: 'Borrados', value: String(m.erase_count ?? 0) },
    { label: 'Area ocupada', value: m.area_pct ? `${((m.area_pct as number) * 100).toFixed(1)}%` : 'N/A' },
    { label: 'Secuencia inicio', value: (m.sequence_start as string) ?? 'No registrada' },
  ]

  return (
    <div className="objective-tab">
      <table className="metrics-table">
        <tbody>
          {rows.map(r => (
            <tr key={r.label}>
              <td className="metric-label">{r.label}</td>
              <td className="metric-value">{r.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="btn-analyze" onClick={onAnalyze} disabled={analyzing}>
        {analyzing ? 'Analizando...' : 'Analizar con IA'}
      </button>
    </div>
  )
}

function DetectedTab({ indicators, suggestions, onToggle, onReject }: {
  indicators: SessionIndicator[]
  suggestions: SessionIndicator[]
  onToggle: (code: string) => void
  onReject: (code: string) => void
}) {
  const all = [...suggestions, ...indicators.filter(i => i.status !== 'suggestion')]

  if (all.length === 0) {
    return <div className="tab-empty">No hay indicadores detectados. Ejecuta el analisis con IA desde la pestana "Medicion objetiva".</div>
  }

  return (
    <div className="detected-tab">
      {suggestions.length > 0 && (
        <div className="suggestions-section">
          <h3>Sugerencias IA</h3>
          <p className="suggestion-hint">Acepta o rechaza cada sugerencia</p>
          {suggestions.map(s => (
            <div key={s.code} className="suggestion-row">
              <div className="suggestion-info">
                <span className="suggestion-code">{s.code}</span>
                <span className="suggestion-title">{s.title}</span>
                <span className={`confidence-badge ${s.confidence}`}>{s.confidence}</span>
              </div>
              <div className="suggestion-actions">
                <button className="btn-accept" onClick={() => onToggle(s.code)} title="Aceptar">✓</button>
                <button className="btn-reject" onClick={() => onReject(s.code)} title="Rechazar">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {indicators.filter(i => i.status === 'validated').length > 0 && (
        <div className="validated-section">
          <h3>Indicadores validados</h3>
          {indicators.filter(i => i.status === 'validated').map(i => (
            <div key={i.code} className="validated-row">
              <span className="validated-code">{i.code}</span>
              <span className="validated-title">{i.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function VerificationTab({ indicators, expandedSections, onToggleSection, onToggleSessionIndicator }: {
  indicators: SessionIndicator[]
  expandedSections: Set<string>
  onToggleSection: (code: string) => void
  onToggleSessionIndicator: (code: string) => void
}) {
  return (
    <div className="verification-tab">
      {INDICATOR_CATEGORIES.map(cat => (
        <div key={cat.code} className="verification-category">
          <h3 className="category-title">{cat.code}. {cat.name}</h3>
          {INDICATOR_SECTIONS
            .filter(s => (cat.sections as readonly string[]).includes(s.code))
            .map(section => {
              const sectionSessionIndicators = PBLL_INDICATORS.filter(
                i => i.section === section.code && (i.detection === 'manual' || i.detection === 'semi')
              )
              if (sectionSessionIndicators.length === 0) return null
              const markedCount = sectionSessionIndicators.filter(
                si => indicators.some(i => i.code === si.code && i.status === 'validated')
              ).length
              const isExpanded = expandedSections.has(section.code)

              return (
                <div key={section.code} className="verification-section">
                  <button className="section-header" onClick={() => onToggleSection(section.code)}>
                    <div>
                      <span className="section-name">{section.name}</span>
                      <span className="section-count">{markedCount} de {sectionSessionIndicators.length} marcados</span>
                    </div>
                    <span className={`chevron ${isExpanded ? 'open' : ''}`}>▾</span>
                  </button>
                  {isExpanded && (
                    <div className="section-items">
                      {sectionSessionIndicators.map(si => {
                        const existing = indicators.find(i => i.code === si.code)
                        const isChecked = existing?.status === 'validated'
                        const isSuggestion = existing?.status === 'suggestion'
                        return (
                          <label
                            key={si.code}
                            className={`indicator-row ${isChecked ? 'checked' : ''} ${isSuggestion ? 'suggested' : ''}`}
                            onClick={() => onToggleSessionIndicator(si.code)}
                          >
                            <div className="indicator-check">
                              <div className={`checkbox ${isChecked ? 'on' : ''}`}>
                                {isChecked && <span>✓</span>}
                              </div>
                              <span className="indicator-title">{si.title}</span>
                              {isSuggestion && <span className="ai-badge">IA</span>}
                            </div>
                            <button
                              className="info-btn"
                              onClick={(e) => { e.stopPropagation(); alert(si.interpretation) }}
                              title={si.interpretation}
                            >i</button>
                          </label>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
        </div>
      ))}
    </div>
  )
}
