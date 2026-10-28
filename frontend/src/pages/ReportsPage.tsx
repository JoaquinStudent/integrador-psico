import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Toast } from '../components/ui/Toast'
import { getReport, listReports, saveReportSection, validateReport, downloadReportPdf } from '../lib/reports'
import { mensajeDeError } from '../lib/apiClient'
import { REPORT_STATUS, etiquetaDe, fechaHora } from '../lib/status'
import type { Report, ReportSection } from '../types/api'

export function ReportsPage() {
  const { id } = useParams<{ id: string }>()
  return id ? <ReportEditor reportId={id} /> : <ReportList />
}

const FILTROS_INFORME: [string, string][] = [['', 'Todos'], ['draft', 'Borradores'], ['validated', 'Validados']]

function ReportList() {
  const [reports, setReports] = useState<Report[]>([])
  const [filtro, setFiltro] = useState('')
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    listReports().then(setReports).catch(() => setError(true)).finally(() => setLoading(false))
  }, [])

  const cuenta = useMemo(() => ({
    '': reports.length,
    draft: reports.filter(r => r.status === 'draft').length,
    validated: reports.filter(r => r.status === 'validated').length,
  } as Record<string, number>), [reports])

  const visibles = useMemo(() => {
    const texto = q.trim().toLowerCase()
    return reports.filter(r =>
      (!filtro || r.status === filtro) && (!texto || (r.patient_name ?? '').toLowerCase().includes(texto)))
  }, [reports, filtro, q])

  return <div>
    <div className="page-header">
      <div>
        <h1 className="page-title">Informes</h1>
        <p className="page-subtitle">Borradores por revisar e informes ya validados.</p>
      </div>
    </div>

    <div className="list-toolbar">
      <div className="search-bar">
        <input type="search" placeholder="Buscar por paciente…" aria-label="Buscar informe por paciente"
          value={q} onChange={e => setQ(e.target.value)} />
      </div>
      <div className="filter-group" role="group" aria-label="Filtrar por estado">
        {FILTROS_INFORME.map(([value, label]) =>
          <button key={value} className={`filter-chip${filtro === value ? ' active' : ''}`}
            aria-pressed={filtro === value} onClick={() => setFiltro(value)}>
            {label} <span className="filter-count">{cuenta[value] ?? 0}</span>
          </button>)}
      </div>
    </div>

    {loading ? <div className="page-loading">Cargando informes…</div>
      : error ? <div className="empty-state"><p>No se pudieron cargar los informes. Revisa tu conexión e inténtalo de nuevo.</p></div>
      : reports.length === 0 ? <div className="empty-state">
          <p>Todavía no hay informes. Se generan desde el análisis de una sesión completada.</p>
          <Link to="/sesiones" className="btn btn-primary">Ir a sesiones</Link>
        </div>
      : visibles.length === 0 ? <div className="empty-state"><p>Ningún informe coincide con la búsqueda o el filtro.</p></div>
      : <table className="data-table">
          <thead><tr><th>Paciente</th><th>Estado</th><th>Última modificación</th><th>Validado</th><th /></tr></thead>
          <tbody>{visibles.map(report => {
            const estado = etiquetaDe(REPORT_STATUS, report.status)
            return <tr key={report.id}>
              <td><strong>{report.patient_name ?? 'Paciente'}</strong></td>
              <td><span className={`badge ${estado.badge}`}>{estado.label}</span></td>
              <td className="text-secondary">{fechaHora(report.updated_at ?? report.created_at)}</td>
              <td className="text-secondary">{fechaHora(report.validated_at)}</td>
              <td className="cell-action">
                <Link className="btn-link" to={`/informes/${report.id}`}>
                  {report.status === 'draft' ? 'Revisar y validar' : 'Ver informe'}
                </Link>
              </td>
            </tr>
          })}</tbody>
        </table>}
  </div>
}

function ReportEditor({ reportId }: { reportId: string }) {
  const navigate = useNavigate()
  const [report, setReport] = useState<Report | null>(null)
  const [sections, setSections] = useState<ReportSection[]>([])
  const [saving, setSaving] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const pendientes = (useLocation().state as { pendientes?: string[] } | null)?.pendientes ?? []
  const [aviso, setAviso] = useState<string | null>(
    pendientes.length ? `El informe se generó, pero el asistente de redacción no respondió. Escribe a mano: ${pendientes.join(', ')}.` : null,
  )

  useEffect(() => { getReport(reportId).then(value => { setReport(value); setSections(value.sections) }).catch(e => setError(mensajeDeError(e))) }, [reportId])

  async function save(section: ReportSection) {
    if (!report || report.status !== 'draft') return
    setSaving(section.section_number); setError('')
    try { const updated = await saveReportSection(report.id, section); setReport(updated); setSections(updated.sections); setMessage('Guardado'); setTimeout(() => setMessage(''), 1800) }
    catch (e) { setError(mensajeDeError(e)) } finally { setSaving(null) }
  }

  async function validate() {
    if (!report || !window.confirm('¿Validar el informe? Después quedará bloqueado para edición.')) return
    try { const updated = await validateReport(report.id); setReport(updated); setSections(updated.sections) } catch (e) { setError(mensajeDeError(e)) }
  }

  async function pdf() { try { await downloadReportPdf(reportId) } catch (e) { setError(mensajeDeError(e)) } }
  if (error && !report) return <div className="empty-state"><p>{error}</p></div>
  if (!report) return <div className="page-loading">Cargando informe...</div>

  const incomplete = sections.some(section => !section.content.trim())
  return <div>
    <Toast message={aviso} tone="info" onClose={() => setAviso(null)} />
    <div className="page-header"><div><button className="btn-link" onClick={() => navigate('/informes')}>← Informes</button><h1 className="page-title">Informe psicológico</h1><p className="page-subtitle">{report.patient_name} · {report.status === 'validated' ? 'Validado' : 'Borrador'}</p></div>
      {report.status === 'validated' ? <button className="btn btn-primary" onClick={pdf}>Descargar PDF</button> : <button className="btn btn-primary" disabled={incomplete} onClick={validate}>Validar informe</button>}</div>
    {incomplete && report.status === 'draft' && <p className="validate-hint">Para validar el informe, completa todas las secciones (las vacías están marcadas en el índice).</p>}
    {error && <div className="form-error">{error}</div>}{message && <div className="form-success">{message}</div>}
    <div className="report-layout"><nav className="report-index">{sections.map(section => <a key={section.section_number} href={`#seccion-${section.section_number}`} className={!section.content ? 'report-index-empty' : ''}>{section.section_number}. {section.title}</a>)}</nav>
      <main>{sections.map(section => <ReportSectionEditor key={section.section_number} section={section} readOnly={report.status === 'validated'} saving={saving === section.section_number} onSave={save} />)}</main></div>
  </div>
}

function ReportSectionEditor({ section, readOnly, saving, onSave }: { section: ReportSection; readOnly: boolean; saving: boolean; onSave: (section: ReportSection) => void }) {
  const [content, setContent] = useState(section.content)
  // Sugerencia de la IA que el profesional todavía no revisó (solo la sección 9 lo exige).
  const pendiente = !readOnly && section.section_number === 9 && section.is_ai_generated && !section.edited_by_examiner
  useEffect(() => setContent(section.content), [section.content])
  return <section id={`seccion-${section.section_number}`} className={`card report-section${!content ? ' report-section-empty' : ''}`}>
    <div className="report-section-header"><h2>{section.section_number}. {section.title}</h2>{section.edited_by_examiner && <span className="badge badge-blue">Editado</span>}{section.is_ai_generated && <span className="badge badge-purple">Asistido</span>}</div>
    {pendiente && <p className="report-suggestion">
      <strong>Sugerencia del sistema, pendiente de tu revisión.</strong> No es una conclusión: acéptala, edítala
      o reemplázala con la tuya. El informe no se puede validar hasta que la revises.
    </p>}
    <textarea rows={section.section_number === 9 ? 7 : 5} value={content} readOnly={readOnly} onChange={e => setContent(e.target.value)} />
    {pendiente && content === section.content && <button className="btn btn-primary" disabled={saving} onClick={() => onSave({ ...section, content })}>{saving ? 'Guardando...' : 'Aceptar sugerencia'}</button>}
    {!readOnly && content !== section.content && <button className="btn btn-secondary" disabled={saving} onClick={() => onSave({ ...section, content })}>{saving ? 'Guardando...' : 'Guardar sección'}</button>}
  </section>
}
