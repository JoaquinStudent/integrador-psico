/**
 * Tipos de lo que devuelve la API. Reemplaza a `types/database.ts`.
 *
 * La diferencia no es cosmética. `database.ts` tipaba el esquema de Postgres con
 * el genérico `Database` de Supabase, y quedó describiendo el esquema v1 después
 * de migrar a v2: TypeScript compilaba feliz mientras la app fallaba en runtime
 * contra tablas que ya no existían. Tipos que mienten son peores que no tener
 * tipos.
 *
 * Estos describen el contrato HTTP (`sdd/api-contracts.md`), que es lo que el
 * frontend consume de verdad. Si el backend cambia una respuesta, el contrato es
 * el que manda y estos tipos se ajustan a él.
 *
 * Convención: snake_case, igual que la API y que `sdd/domain.md`.
 */

// =============================================================================
// Valores
// =============================================================================

export type SessionStatus = 'setup' | 'consent' | 'active' | 'completed' | 'cancelled'
export type IndicatorStatus = 'suggestion' | 'validated' | 'rejected'
export type IndicatorSource = 'auto' | 'llm' | 'manual'
export type DetectionType = 'auto' | 'semi' | 'manual'
export type Confidence = 'high' | 'medium' | 'low'
export type Orientation = 'horizontal' | 'vertical'
export type ReportStatus = 'draft' | 'validated'
export type Sex = 'M' | 'F'

// =============================================================================
// Perfil y pacientes
// =============================================================================

export interface Profile {
  id: string
  full_name: string
  license_number: string | null
  specialty: string | null
}

export interface Patient {
  id: string
  full_name: string
  document_number: string
  birth_date: string
  sex: Sex
  registered_at: string
  is_active: boolean
  /** Derivados que calcula el backend; el cliente no los recalcula. */
  age?: number
  evaluation_count?: number
  has_pending_evaluation?: boolean
}

export interface PatientInput {
  full_name: string
  document_number: string
  birth_date: string
  sex: Sex
}

export interface Page<T> {
  items: T[]
  total: number
  page: number
  page_size: number
}

// =============================================================================
// Tests y catálogo del manual
// =============================================================================

export interface Test {
  id: string
  code: string
  name: string
  is_available: boolean
}

/** Un indicador del manual, tal como vive en `indicator_catalog`. */
export interface CatalogIndicator {
  code: string
  section_code: string
  section_name: string
  category_code: 'A' | 'B' | 'C' | 'D'
  title: string
  interpretation: string
  detection_type: DetectionType
}

export interface QuickMark {
  code: string
  label: string
  display_order: number
}

export interface Attitude {
  code: string
  label: string
  display_order: number
}

// =============================================================================
// Sesiones
// =============================================================================

export interface Session {
  id: string
  patient_id: string
  /** `sessions.test_type` (texto) pasó a ser FK; la API embebe el test resuelto. */
  test: Test
  status: SessionStatus
  reason: string | null
  started_at: string | null
  completed_at: string | null
  created_at: string
  patient?: Patient
}

export interface SessionInput {
  patient_id: string
  test_code: string
  reason?: string
}

export interface ConsentInput {
  audio_authorized: boolean
  digital_authorized: boolean
  confidential_ack: boolean
  signature_url?: string
}

// =============================================================================
// Dibujo
// =============================================================================

/** Punto serializado, compacto. Lo produce `canvas/serialization.ts`. */
export interface ApiPoint {
  x: number
  y: number
  t: number
  p?: number
}

/**
 * Un trazo tal como lo recibe el backend.
 *
 * `started_at_ms` y `ended_at_ms` son offsets **absolutos** desde el inicio de la
 * sesión. El `t` de cada punto es relativo al trazo, y por eso no alcanza para
 * medir las pausas entre trazos — que era el error E-002.
 */
export interface ApiStroke {
  stroke_index: number
  tool: 'pen' | 'eraser'
  started_at_ms: number
  ended_at_ms: number
  points: ApiPoint[]
}

export interface DrawingInput {
  canvas_width: number
  canvas_height: number
  orientation: Orientation
  strokes: ApiStroke[]
}

export interface Drawing {
  session_id: string
  canvas_width: number
  canvas_height: number
  orientation: Orientation
  /** URL firmada, no pública: el bucket es privado y la firma expira. */
  final_image_url: string | null
  strokes: ApiStroke[]
}

export interface StrokeMetrics {
  total_time_ms: number
  latency_ms: number
  stroke_count: number
  pressure_avg: number
  pause_count: number
  erase_count: number
  area_pct: number
  sequence_start: string | null
}

// =============================================================================
// Observaciones y audio
// =============================================================================

export interface Observations {
  additional_notes: string
  quick_marks: { mark_code: string; marked_at_ms: number }[]
  attitudes: string[]
}

export interface Verbalization {
  id: string
  offset_ms: number | null
  text: string
  source: 'transcription' | 'examiner'
}

export interface Recording {
  id: string
  duration_seconds: number | null
  transcribed_at: string | null
}

export interface TranscriptSegment {
  segment_index: number
  start_ms: number
  end_ms: number
  text: string
  segment_type: 'speech' | 'annotation'
}

// =============================================================================
// Indicadores de la sesión
// =============================================================================

/**
 * Un indicador en el contexto de una sesión.
 *
 * Ya **no tiene `id`**: la clave es `(session_id, indicator_code)`, que es la
 * corrección de 2FN. Para validarlo se usa la ruta con el código, no un id.
 */
export interface SessionIndicator {
  indicator: CatalogIndicator
  status: IndicatorStatus
  source: IndicatorSource
  confidence: Confidence | null
  /** La medición y el umbral que dispararon la sugerencia. */
  evidence: string | null
  validated_at: string | null
}

export interface AnalysisResult {
  metrics: StrokeMetrics
  suggestions: SessionIndicator[]
  /** El análisis objetivo funciona sin LLM; si falló, se avisa y no se inventa. */
  llm_available: boolean
}

// =============================================================================
// Informe
// =============================================================================

export interface ReportSection {
  section_number: number
  title: string
  content: string
  is_ai_generated: boolean
  edited_by_examiner: boolean
}

export interface Report {
  id: string
  session_id: string
  status: ReportStatus
  validated_at: string | null
  sections: ReportSection[]
}

// =============================================================================
// Panel
// =============================================================================

export interface DashboardSummary {
  sessions_this_week: number
  pending_analysis: number
  active_patients: number
  recent_sessions: Session[]
}
