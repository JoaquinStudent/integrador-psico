import { api } from './apiClient'
import type { Report, ReportSection } from '../types/api'

export function listReports(status?: string) {
  return api.get<Report[]>(status ? `/reports?status=${encodeURIComponent(status)}` : '/reports')
}

export function getReport(id: string) {
  return api.get<Report>(`/reports/${id}`)
}

export function generateReport(sessionId: string) {
  return api.post<Report>(`/sessions/${sessionId}/report`)
}

export function saveReportSection(reportId: string, section: ReportSection) {
  return api.patch<Report>(`/reports/${reportId}/sections/${section.section_number}`, {
    content: section.content,
  })
}

export function validateReport(reportId: string) {
  return api.post<Report>(`/reports/${reportId}/validate`)
}

export async function downloadReportPdf(reportId: string) {
  const blob = await api.blob(`/reports/${reportId}/pdf`)
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `informe-${reportId}.pdf`
  anchor.click()
  URL.revokeObjectURL(url)
}
