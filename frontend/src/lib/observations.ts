import { api } from './apiClient'

export interface QuickMark {
  mark: string
  timestamp: string
  markedAtMs?: number
}

export async function saveObservations(
  sessionId: string,
  quickMarks: QuickMark[],
  additionalNotes: string
) {
  void quickMarks
  await api.put(`/sessions/${sessionId}/observations`, {
    additional_notes: additionalNotes,
    attitudes: [],
  })
}

export async function addQuickMark(sessionId: string, code: string, markedAtMs: number) {
  await api.post(`/sessions/${sessionId}/quick-marks`, {
    mark_code: code,
    marked_at_ms: markedAtMs,
  })
}
