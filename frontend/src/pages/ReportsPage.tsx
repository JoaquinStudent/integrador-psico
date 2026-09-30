import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getReport, listReports, saveReportSection, validateReport, downloadReportPdf } from '../lib/reports'
import { mensajeDeError } from '../lib/apiClient'
import type { Report, ReportSection } from '../types/api'

export function ReportsPage() {
  const { id } = useParams<{ id: string }>()
  return id ? <ReportEditor reportId={id} /> : <ReportList />
}

function ReportList() {
  const [reports, setReports] = useState<Report[]>([])
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    listReports(status).then(setReports).catch(() => setReports([])).finally(() => setLoading(false))
  }, [status])

  if (loading) return <div className="page-loading">Cargando informes...</div>
  return <div>
    <div className="page-header"><div><h1 className="page-title">Informes</h1><p className="page-subtitle">Informes de tus evaluaciones.</p></div></div>
    <div className="filter-group">
      {[['', 'Todos'], ['draft', 'Borradores'], ['validated', 'Validados']].map(([value, label]) =>
        <button key={value} className={`filter-chip${status === value ? ' active' : ''}`} onClick={() => setStatus(value)}>{label}</button>)}
    </div>
    {reports.length === 0 ? <div className="empty-state"><p>No hay informes para este filtro.</p></div> :
      <table className="data-table"><thead><tr><th>Paciente</th><th>Estado</th><th>Actualizado</th><th /></tr></thead>
        <tbody>{reports.map(report => <tr key={report.id}>
          <td><strong>{report.patient_name ?? 'Paciente'}</strong></td>
          <td><span className={`badge ${report.status === 'validated' ? 'badge-green' : 'badge-amber'}`}>{report.status === 'validated' ? 'Validado' : 'Borrador'}</span></td>
          <td>{new Date(report.updated_at ?? report.created_at ?? '').toLocaleDateString('es-PE')}</td>
          <td><Link className="btn-link" to={`/informes/${report.id}`}>Abrir</Link></td>
        </tr>)}</tbody></table>}
  </div>
}

function ReportEditor({ reportId }: { reportId: string }) {
  const navigate = useNavigate()
  const [report, setReport] = useState<Report | null>(null)
  const [sections, setSections] = useState<ReportSection[]>([])
  const [saving, setSaving] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

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
    <div className="page-header"><div><button className="btn-link" onClick={() => navigate('/informes')}>← Informes</button><h1 className="page-title">Informe psicológico</h1><p className="page-subtitle">{report.patient_name} · {report.status === 'validated' ? 'Validado' : 'Borrador'}</p></div>
      {report.status === 'validated' ? <button className="btn btn-primary" onClick={pdf}>Descargar PDF</button> : <button className="btn btn-primary" disabled={incomplete} onClick={validate}>Validar informe</button>}</div>
    {error && <div className="form-error">{error}</div>}{message && <div className="form-success">{message}</div>}
    <div className="report-layout"><nav className="report-index">{sections.map(section => <a key={section.section_number} href={`#seccion-${section.section_number}`} className={!section.content ? 'report-index-empty' : ''}>{section.section_number}. {section.title}</a>)}</nav>
      <main>{sections.map(section => <ReportSectionEditor key={section.section_number} section={section} readOnly={report.status === 'validated'} saving={saving === section.section_number} onSave={save} />)}</main></div>
  </div>
}

function ReportSectionEditor({ section, readOnly, saving, onSave }: { section: ReportSection; readOnly: boolean; saving: boolean; onSave: (section: ReportSection) => void }) {
  const [content, setContent] = useState(section.content)
  useEffect(() => setContent(section.content), [section.content])
  return <section id={`seccion-${section.section_number}`} className={`card report-section${!content ? ' report-section-empty' : ''}`}>
    <div className="report-section-header"><h2>{section.section_number}. {section.title}</h2>{section.edited_by_examiner && <span className="badge badge-blue">Editado</span>}{section.is_ai_generated && <span className="badge badge-purple">Asistido</span>}</div>
    <textarea rows={section.section_number === 9 ? 7 : 5} value={content} readOnly={readOnly} onChange={e => setContent(e.target.value)} />
    {!readOnly && content !== section.content && <button className="btn btn-secondary" disabled={saving} onClick={() => onSave({ ...section, content })}>{saving ? 'Guardando...' : 'Guardar sección'}</button>}
  </section>
}
