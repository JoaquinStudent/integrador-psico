// Supabase Edge Function: transcribe-audio
// Descarga audio de Storage, lo envía a OpenAI Whisper, guarda transcripción en DB
//
// Deploy: supabase functions deploy transcribe-audio --project-ref qqhqsjobbbmkhyvteyfc
// Secrets: supabase secrets set OPENAI_API_KEY=sk-...

import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { corsHeaders } from "../_shared/cors.ts"

interface TranscriptionSegment {
  timestamp: string
  text: string
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      return jsonError("No authorization header", 401)
    }

    const { audio_path, session_id } = await req.json()
    if (!audio_path || !session_id) {
      return jsonError("audio_path and session_id required", 400)
    }

    const openaiKey = Deno.env.get("OPENAI_API_KEY")
    if (!openaiKey) {
      return jsonError("OPENAI_API_KEY not configured", 500)
    }

    // Supabase client con el token del usuario
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    )

    // 1. Descargar audio de Storage
    const { data: audioData, error: dlError } = await supabase.storage
      .from("session-files")
      .download(audio_path)

    if (dlError || !audioData) {
      return jsonError(`Error descargando audio: ${dlError?.message}`, 400)
    }

    // 2. Enviar a Whisper API
    const formData = new FormData()
    formData.append("file", audioData, "audio.webm")
    formData.append("model", "whisper-1")
    formData.append("language", "es")
    formData.append("response_format", "verbose_json")
    formData.append("timestamp_granularities[]", "segment")

    const whisperRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${openaiKey}` },
      body: formData,
    })

    if (!whisperRes.ok) {
      const errText = await whisperRes.text()
      return jsonError(`Whisper API error: ${errText}`, 502)
    }

    const whisperData = await whisperRes.json()

    // 3. Formatear transcripción
    const transcription: TranscriptionSegment[] = (whisperData.segments ?? []).map(
      (seg: { start: number; text: string }) => ({
        timestamp: formatTimestamp(seg.start),
        text: seg.text.trim(),
      })
    )

    const durationSeconds = Math.round(whisperData.duration ?? 0)

    // 4. Guardar en DB
    const { error: updateError } = await supabase
      .from("audio_recordings")
      .update({
        transcription_json: transcription,
        duration_seconds: durationSeconds,
      })
      .eq("session_id", session_id)
      .eq("storage_path", audio_path)

    if (updateError) {
      return jsonError(`Error guardando transcripción: ${updateError.message}`, 500)
    }

    return new Response(
      JSON.stringify({
        data: { transcription, duration_seconds: durationSeconds },
        error: null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (err) {
    return jsonError(`Error interno: ${(err as Error).message}`, 500)
  }
})

function jsonError(message: string, status: number) {
  return new Response(
    JSON.stringify({ data: null, error: message }),
    { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  )
}

function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}
