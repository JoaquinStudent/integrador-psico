import { useState, useEffect } from 'react'
import { supabase, supabaseConfigured } from './supabase'
import type { Patient, PatientInsert, PatientUpdate } from '../types/database'

export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabaseConfigured) { setLoading(false); return }
    supabase.from('patients').select('*').order('registered_at', { ascending: false })
      .then(({ data }) => { setPatients(data ?? []); setLoading(false) })
  }, [])

  const createPatient = async (p: PatientInsert) => {
    if (!supabaseConfigured) return { data: null, error: new Error('Supabase no configurado') }
    const { data, error } = await supabase.from('patients').insert(p).select().single()
    if (data) setPatients(prev => [data, ...prev])
    return { data, error }
  }

  const updatePatient = async (id: string, updates: PatientUpdate) => {
    if (!supabaseConfigured) return { data: null, error: new Error('Supabase no configurado') }
    const { data, error } = await supabase.from('patients').update(updates).eq('id', id).select().single()
    if (data) setPatients(prev => prev.map(p => p.id === id ? data : p))
    return { data, error }
  }

  return { patients, loading, createPatient, updatePatient }
}

export function usePatient(id: string | undefined) {
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabaseConfigured || !id) { setLoading(false); return }
    supabase.from('patients').select('*').eq('id', id).single()
      .then(({ data }) => { setPatient(data); setLoading(false) })
  }, [id])

  return { patient, loading }
}

export function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

export function getAge(birthDate: string): number {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
}
