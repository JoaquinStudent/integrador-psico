import { api } from './apiClient'

export interface AnalysisSuggestion {
  code: string
  confidence: 'high' | 'medium' | 'low' | null
  evidence: string | null
}

export interface AnalysisInput {
  sessionId: string
  metrics: {
    total_time_ms: number | null
    latency_ms: number | null
    stroke_count: number
    pressure_avg: number | null
    pause_count: number
    erase_count: number
    area_pct: number | null
    sequence_start: string | null
  }
  manualIndicators?: string[]
}

export async function analyzeDrawing(
  input: AnalysisInput
): Promise<{ suggestions: AnalysisSuggestion[] } | null> {
  void input.metrics
  void input.manualIndicators
  try {
    return await api.post(`/sessions/${input.sessionId}/analyze`)
  } catch {
    return null
  }
}
