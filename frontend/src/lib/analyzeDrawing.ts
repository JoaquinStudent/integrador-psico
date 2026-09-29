import { supabase } from './supabase'

export interface AnalysisSuggestion {
  code: string
  category: string
  manual_section: string
  title: string
  interpretation: string
  confidence: 'high' | 'medium' | 'low'
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
  const { data, error } = await supabase.functions.invoke('analyze-drawing', {
    body: {
      session_id: input.sessionId,
      metrics: input.metrics,
      manual_indicators: input.manualIndicators ?? [],
    },
  })
  if (error || data?.error) return null
  return data?.data ?? null
}
