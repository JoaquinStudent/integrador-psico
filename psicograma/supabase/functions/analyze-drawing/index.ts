// Supabase Edge Function: analyze-drawing
// Cruza métricas objetivas + indicadores manuales + motor de reglas PBLL
// Usa OpenRouter LLM para sugerir indicadores con confianza
//
// Deploy: supabase functions deploy analyze-drawing --project-ref qqhqsjobbbmkhyvteyfc
// Secrets: supabase secrets set OPENROUTER_API_KEY=sk-or-...

import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { corsHeaders } from "../_shared/cors.ts"

interface Metrics {
  total_time_ms: number | null
  latency_ms: number | null
  stroke_count: number
  pressure_avg: number | null
  pause_count: number
  erase_count: number
  area_pct: number | null
  sequence_start: string | null
}

interface Suggestion {
  code: string
  category: string
  manual_section: string
  title: string
  interpretation: string
  confidence: "high" | "medium" | "low"
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) return jsonError("No authorization header", 401)

    const { session_id, metrics, manual_indicators } = await req.json() as {
      session_id: string
      metrics: Metrics
      manual_indicators: string[]
    }

    if (!session_id || !metrics) {
      return jsonError("session_id and metrics required", 400)
    }

    const openrouterKey = Deno.env.get("OPENROUTER_API_KEY")
    if (!openrouterKey) return jsonError("OPENROUTER_API_KEY not configured", 500)

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    )

    // Obtener observaciones de la sesión
    const { data: obs } = await supabase
      .from("observations")
      .select("quick_marks, additional_notes")
      .eq("session_id", session_id)
      .single()

    // Obtener transcripción si existe
    const { data: audio } = await supabase
      .from("audio_recordings")
      .select("transcription_json")
      .eq("session_id", session_id)
      .limit(1)
      .single()

    const prompt = buildPrompt(metrics, manual_indicators, obs, audio?.transcription_json)

    // Llamar a OpenRouter
    const llmRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openrouterKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://psicograma.app",
        "X-Title": "Psicograma",
      },
      body: JSON.stringify({
        model: "anthropic/claude-sonnet-4-20250514",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 4000,
      }),
    })

    if (!llmRes.ok) {
      const errText = await llmRes.text()
      return jsonError(`OpenRouter error: ${errText}`, 502)
    }

    const llmData = await llmRes.json()
    const content = llmData.choices?.[0]?.message?.content ?? ""

    // Parsear JSON del LLM
    const suggestions = parseSuggestions(content)

    // Guardar en tabla indicators
    if (suggestions.length > 0) {
      const rows = suggestions.map((s) => ({
        session_id,
        code: s.code,
        category: s.category,
        manual_section: s.manual_section,
        title: s.title,
        interpretation: s.interpretation,
        source: "auto" as const,
        status: "suggestion" as const,
        confidence: s.confidence,
      }))

      const { error: insertErr } = await supabase
        .from("indicators")
        .upsert(rows, { onConflict: "session_id,code" })

      if (insertErr) {
        return jsonError(`Error guardando indicadores: ${insertErr.message}`, 500)
      }
    }

    return new Response(
      JSON.stringify({ data: { suggestions }, error: null }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (err) {
    return jsonError(`Error interno: ${(err as Error).message}`, 500)
  }
})

const SYSTEM_PROMPT = `Eres un asistente de psicología clínica especializado en el test proyectivo Persona Bajo la Lluvia (PBLL). Tu tarea es analizar las métricas objetivas de un dibujo y sugerir indicadores del manual PBLL que podrían aplicar.

REGLAS:
- Solo sugiere indicadores con códigos válidos del manual PBLL (DIM-*, UBI-*, TRZ-*, PRE-*, TMP-*, SEC-*, MOV-*, SOM-*, ORI-*, POS-*, BOR-*, DET-*, VES-*, PAR-*, CUE-*, IDX-*, EXP-*, DEF-*)
- Asigna confianza: "high" solo para indicadores respaldados por datos numéricos claros, "medium" para inferencias razonables, "low" para posibilidades
- No inventes códigos ni interpretaciones que no estén en el manual
- Responde SOLO con un JSON array, sin texto adicional

Formato de respuesta (JSON array):
[{"code":"DIM-01","category":"Dimensiones","manual_section":"A-1","title":"Dibujo pequeño","interpretation":"...","confidence":"high"}]`

function buildPrompt(
  metrics: Metrics,
  manualIndicators: string[],
  obs: { quick_marks: unknown; additional_notes: string | null } | null,
  transcription: unknown
): string {
  const parts: string[] = []

  parts.push("## Métricas objetivas del dibujo")
  parts.push(`- Tiempo total: ${metrics.total_time_ms ? Math.round(metrics.total_time_ms / 1000) + "s" : "N/A"}`)
  parts.push(`- Latencia (hasta primer trazo): ${metrics.latency_ms ? Math.round(metrics.latency_ms / 1000) + "s" : "N/A"}`)
  parts.push(`- Cantidad de trazos: ${metrics.stroke_count}`)
  parts.push(`- Presión promedio: ${metrics.pressure_avg?.toFixed(2) ?? "N/A"} (escala 0-1)`)
  parts.push(`- Pausas (>3s): ${metrics.pause_count}`)
  parts.push(`- Borrados: ${metrics.erase_count}`)
  parts.push(`- Área ocupada: ${metrics.area_pct ? (metrics.area_pct * 100).toFixed(1) + "%" : "N/A"}`)
  parts.push(`- Secuencia de inicio: ${metrics.sequence_start ?? "No registrada"}`)

  if (manualIndicators.length > 0) {
    parts.push("\n## Indicadores marcados manualmente por el examinador")
    parts.push(manualIndicators.join(", "))
  }

  if (obs) {
    const marks = Array.isArray(obs.quick_marks) ? obs.quick_marks : []
    if (marks.length > 0) {
      parts.push("\n## Marcas rápidas del examinador")
      parts.push(marks.map((m: { mark: string; timestamp: string }) => `[${m.timestamp}] ${m.mark}`).join("\n"))
    }
    if (obs.additional_notes) {
      parts.push("\n## Notas del examinador")
      parts.push(obs.additional_notes)
    }
  }

  if (transcription && Array.isArray(transcription) && transcription.length > 0) {
    parts.push("\n## Transcripción de audio de la sesión")
    parts.push(transcription.map((t: { timestamp: string; text: string }) => `[${t.timestamp}] ${t.text}`).join("\n"))
  }

  parts.push("\nAnaliza estos datos y sugiere los indicadores PBLL que aplican. Responde SOLO con JSON array.")

  return parts.join("\n")
}

function parseSuggestions(content: string): Suggestion[] {
  try {
    // Extraer JSON del contenido (puede venir con markdown code blocks)
    const match = content.match(/\[[\s\S]*\]/)
    if (!match) return []
    return JSON.parse(match[0])
  } catch {
    return []
  }
}

function jsonError(message: string, status: number) {
  return new Response(
    JSON.stringify({ data: null, error: message }),
    { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  )
}
