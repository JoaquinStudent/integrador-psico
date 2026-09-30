"""Upload y lectura de transcripciones de audio."""

from __future__ import annotations

import datetime as dt
from uuid import UUID

import httpx
from fastapi import APIRouter, File, HTTPException, UploadFile, status

from .....config.container import Audio, Sessions
from .....config.settings import get_settings
from ..schemas import RecordingOut, TranscriptSegmentOut

router = APIRouter(tags=["audio"])
UPLOAD_FILE = File()


@router.post("/sessions/{session_id}/recordings", response_model=RecordingOut, status_code=201)
async def upload_recording(
    session_id: UUID,
    sessions: Sessions,
    audio: Audio,
    file: UploadFile = UPLOAD_FILE,
) -> RecordingOut:
    await sessions.get(session_id)
    consent = await sessions.consent_of(session_id)
    if not consent.audio_authorized:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "la sesion no autoriza grabacion de audio")
    settings = get_settings()
    if not settings.supabase_service_key:
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, "Storage no esta configurado")

    path = f"sessions/{session_id}/audio_{int(dt.datetime.now(dt.UTC).timestamp() * 1000)}.webm"
    body = await file.read()
    url = f"{settings.supabase_url.rstrip('/')}/storage/v1/object/{settings.storage_bucket}/{path}"
    headers = {
        "Authorization": f"Bearer {settings.supabase_service_key}",
        "apikey": settings.supabase_service_key,
        "Content-Type": file.content_type or "audio/webm",
    }
    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(url, headers=headers, content=body)
    if response.status_code >= 300:
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, "No se pudo guardar el audio")
    row = await audio.create(session_id, path, None)
    return RecordingOut.model_validate(row)


@router.post("/recordings/{recording_id}/transcribe")
async def transcribe(recording_id: UUID, audio: Audio):
    # El adaptador de Whisper se incorpora cuando OPENAI_API_KEY está configurada.
    # No se marca transcribed_at: el usuario puede reintentar sin perder estado.
    await audio.get(recording_id)
    raise HTTPException(
        status.HTTP_502_BAD_GATEWAY,
        "El proveedor de transcripcion no esta configurado",
    )


@router.get("/recordings/{recording_id}/transcript", response_model=list[TranscriptSegmentOut])
async def transcript(recording_id: UUID, audio: Audio) -> list[TranscriptSegmentOut]:
    await audio.get(recording_id)
    rows = await audio.transcript(recording_id)
    return [TranscriptSegmentOut.model_validate(row) for row in rows]
