import { useState, useEffect } from 'react'
import { supabase, supabaseConfigured } from './supabase'
import type { Session, Patient } from '../types/api'

interface ConsentData {
  audio: boolean
  digital: boolean
  confidential: boolean
}

export async function createSession(
  patientId: string,
  testType: string,
  consent: ConsentData,
  createdBy: string
): Promise<{ sessionId: string | null; error: Error | null }> {
  if (!supabaseConfigured) return { sessionId: null, error: new Error('Supabase no configurado') }

  const { data: session, error: sessionErr } = await supabase
    .from('sessions')
    .insert({
      patient_id: patientId,
      test_type: testType,
      created_by: createdBy,
      started_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (sessionErr || !session) return { sessionId: null, error: sessionErr ?? new Error('No se pudo crear la sesión') }

  await Promise.all([
    supabase.from('consent_records').insert({
      session_id: session.id,
      audio_authorized: consent.audio,
      digital_authorized: consent.digital,
      confidential_ack: consent.confidential,
    }),
    supabase.from('drawing_data').insert({ session_id: session.id }),
    supabase.from('observations').insert({ session_id: session.id }),
  ])

  return { sessionId: session.id, error: null }
}

export function useSession(sessionId: string | undefined) {
  const [session, setSession] = useState<Session | null>(null)
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabaseConfigured || !sessionId) { setLoading(false); return }
    supabase.from('sessions').select('*').eq('id', sessionId).single()
      .then(async ({ data }) => {
        setSession(data)
        if (data?.patient_id) {
          const { data: p } = await supabase.from('patients').select('*').eq('id', data.patient_id).single()
          setPatient(p)
        }
        setLoading(false)
      })
  }, [sessionId])

  return { session, patient, loading }
}

export interface FinalMetrics {
  total_time_ms: number
  latency_ms: number
  stroke_count: number
  pressure_avg: number
  pause_count: number
  erase_count: number
  area_pct: number
  sequence_start?: string
}

export async function finalizeSession(sessionId: string, metrics: FinalMetrics) {
  if (!supabaseConfigured) return

  await Promise.all([
    supabase.from('stroke_metrics').upsert({
      session_id: sessionId,
      ...metrics,
    }, { onConflict: 'session_id' }),
    supabase.from('sessions').update({
      status: 'completed' as const,
      completed_at: new Date().toISOString(),
    }).eq('id', sessionId),
  ])
}
