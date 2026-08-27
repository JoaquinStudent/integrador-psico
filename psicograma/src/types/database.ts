export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          license_number: string | null
          specialty: string | null
          created_at: string
        }
        Insert: {
          id: string
          full_name: string
          license_number?: string | null
          specialty?: string | null
        }
        Update: {
          full_name?: string
          license_number?: string | null
          specialty?: string | null
        }
        Relationships: []
      }
      patients: {
        Row: {
          id: string
          full_name: string
          document_number: string
          birth_date: string
          sex: 'M' | 'F'
          registered_at: string
          created_by: string
          is_active: boolean
        }
        Insert: {
          id?: string
          full_name: string
          document_number: string
          birth_date: string
          sex: 'M' | 'F'
          created_by: string
          is_active?: boolean
        }
        Update: {
          full_name?: string
          document_number?: string
          birth_date?: string
          sex?: 'M' | 'F'
          created_by?: string
          is_active?: boolean
        }
        Relationships: []
      }
      sessions: {
        Row: {
          id: string
          patient_id: string
          test_type: string
          status: 'setup' | 'consent' | 'active' | 'completed' | 'cancelled'
          created_by: string
          started_at: string | null
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          test_type?: string
          created_by: string
          started_at?: string | null
          completed_at?: string | null
        }
        Update: {
          patient_id?: string
          test_type?: string
          status?: 'setup' | 'consent' | 'active' | 'completed' | 'cancelled'
          started_at?: string | null
          completed_at?: string | null
        }
        Relationships: []
      }
      consent_records: {
        Row: {
          id: string
          session_id: string
          audio_authorized: boolean
          digital_authorized: boolean
          confidential_ack: boolean
          signature_url: string | null
          signed_at: string
        }
        Insert: {
          id?: string
          session_id: string
          audio_authorized?: boolean
          digital_authorized?: boolean
          confidential_ack?: boolean
          signature_url?: string | null
        }
        Update: {
          audio_authorized?: boolean
          digital_authorized?: boolean
          confidential_ack?: boolean
          signature_url?: string | null
        }
        Relationships: []
      }
      drawing_data: {
        Row: {
          id: string
          session_id: string
          strokes_json: unknown
          final_image_url: string | null
          orientation: string
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          strokes_json?: unknown
          final_image_url?: string | null
          orientation?: string
        }
        Update: {
          strokes_json?: unknown
          final_image_url?: string | null
          orientation?: string
        }
        Relationships: []
      }
      stroke_metrics: {
        Row: {
          id: string
          session_id: string
          total_time_ms: number | null
          latency_ms: number | null
          stroke_count: number
          pressure_avg: number | null
          pause_count: number
          erase_count: number
          area_pct: number | null
          sequence_start: string | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          total_time_ms?: number | null
          latency_ms?: number | null
          stroke_count?: number
          pressure_avg?: number | null
          pause_count?: number
          erase_count?: number
          area_pct?: number | null
          sequence_start?: string | null
        }
        Update: {
          total_time_ms?: number | null
          latency_ms?: number | null
          stroke_count?: number
          pressure_avg?: number | null
          pause_count?: number
          erase_count?: number
          area_pct?: number | null
          sequence_start?: string | null
        }
        Relationships: []
      }
      audio_recordings: {
        Row: {
          id: string
          session_id: string
          storage_path: string
          duration_seconds: number | null
          transcription_json: unknown | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          storage_path: string
          duration_seconds?: number | null
          transcription_json?: unknown | null
        }
        Update: {
          storage_path?: string
          duration_seconds?: number | null
          transcription_json?: unknown | null
        }
        Relationships: []
      }
      observations: {
        Row: {
          id: string
          session_id: string
          attitude_flags: unknown
          quick_marks: unknown
          verbalizations: unknown
          additional_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          session_id: string
          attitude_flags?: unknown
          quick_marks?: unknown
          verbalizations?: unknown
          additional_notes?: string | null
        }
        Update: {
          attitude_flags?: unknown
          quick_marks?: unknown
          verbalizations?: unknown
          additional_notes?: string | null
        }
        Relationships: []
      }
      indicators: {
        Row: {
          id: string
          session_id: string
          code: string
          category: string
          manual_section: string | null
          title: string
          interpretation: string | null
          source: 'auto' | 'manual'
          status: 'suggestion' | 'validated' | 'rejected'
          confidence: 'high' | 'medium' | 'low'
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          code: string
          category: string
          manual_section?: string | null
          title: string
          interpretation?: string | null
          source?: 'auto' | 'manual'
          status?: 'suggestion' | 'validated' | 'rejected'
          confidence?: 'high' | 'medium' | 'low'
        }
        Update: {
          status?: 'suggestion' | 'validated' | 'rejected'
          confidence?: 'high' | 'medium' | 'low'
          interpretation?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          id: string
          session_id: string
          sections_json: unknown
          status: 'draft' | 'validated'
          validated_at: string | null
          pdf_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          session_id: string
          sections_json?: unknown
          status?: 'draft' | 'validated'
        }
        Update: {
          sections_json?: unknown
          status?: 'draft' | 'validated'
          validated_at?: string | null
          pdf_url?: string | null
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Patient = Database['public']['Tables']['patients']['Row']
export type PatientInsert = Database['public']['Tables']['patients']['Insert']
export type PatientUpdate = Database['public']['Tables']['patients']['Update']
export type Session = Database['public']['Tables']['sessions']['Row']
export type SessionInsert = Database['public']['Tables']['sessions']['Insert']
export type ConsentRecord = Database['public']['Tables']['consent_records']['Row']
export type DrawingData = Database['public']['Tables']['drawing_data']['Row']
export type StrokeMetricsRow = Database['public']['Tables']['stroke_metrics']['Row']
export type Observation = Database['public']['Tables']['observations']['Row']
export type Indicator = Database['public']['Tables']['indicators']['Row']
export type IndicatorInsert = Database['public']['Tables']['indicators']['Insert']
export type Report = Database['public']['Tables']['reports']['Row']
