import { useState, useEffect } from 'react'
import { api, mensajeDeError } from './apiClient'
import type { Session, Patient } from '../types/api'

interface ConsentData {
  audio: boolean
  digital: boolean
  confidential: boolean
  signatureDataUrl?: string
}

export async function createSession(
  patientId: string,
  testType: string,
  consent: ConsentData,
  createdBy: string
): Promise<{ sessionId: string | null; error: Error | null }> {
  void createdBy
  try {
    const session = await api.post<Session>('/sessions', {
      patient_id: patientId,
      test_code: testType,
    })
    await api.post(`/sessions/${session.id}/consent`, {
      audio_authorized: consent.audio,
      digital_authorized: consent.digital,
      confidential_ack: consent.confidential,
      signature_url: consent.signatureDataUrl ?? null,
    })
    return { sessionId: session.id, error: null }
  } catch (error) {
    return { sessionId: null, error: new Error(mensajeDeError(error)) }
  }
}

export function useSession(sessionId: string | undefined) {
  const [session, setSession] = useState<Session | null>(null)
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sessionId) { setLoading(false); return }
    api.get<Session>(`/sessions/${sessionId}`)
      .then(async data => {
        setSession(data)
        if (data.patient_id) setPatient(await api.get<Patient>(`/patients/${data.patient_id}`))
      })
      .catch(() => { setSession(null); setPatient(null) })
      .finally(() => setLoading(false))
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
  void metrics
  await api.post(`/sessions/${sessionId}/finalize`)
}
