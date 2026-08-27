import { supabase, supabaseConfigured } from './supabase'

export interface QuickMark {
  mark: string
  timestamp: string
}

export async function saveObservations(
  sessionId: string,
  quickMarks: QuickMark[],
  additionalNotes: string
) {
  if (!supabaseConfigured) return
  await supabase.from('observations').update({
    quick_marks: quickMarks,
    additional_notes: additionalNotes,
  }).eq('session_id', sessionId)
}
