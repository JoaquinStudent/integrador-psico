"""Upload y lectura de transcripciones de audio."""

from __future__ import annotations

import datetime as dt
from pathlib import PurePosixPath
from uuid import UUID

import httpx
from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status

from .....adapter.outbound.storage import StorageNoDisponible, download
from .....adapter.outbound.whisper.transcriber import (
    TranscripcionNoDisponible,
    build_transcriber,
)
from .....config.container import Audio, Sessions
from .....config.settings import get_settings
from ..schemas import RecordingOut, TranscriptSegmentOut

router = APIRouter(tags=["audio"])
UPLOAD_FILE = File()
# Form() y no Query(): viajan en el mismo multipart que el archivo, asi que la subida
# sigue siendo una sola peticion.
DURACION = Form(None)
OFFSET = Form(None)



@router.post("/sessions/{session_id}/recordings", response_model=RecordingOut, status_code=201)
async def upload_recording(
    session_id: UUID,
    sessions: Sessions,
    audio: Audio,
    file: UploadFile = UPLOAD_FILE,
    duration_seconds: int | None = DURACION,
    started_at_ms: int | None = OFFSET,
) -> RecordingOut:
    """Guarda la grabacion.

    `started_at_ms` es en que momento de la sesion empezo a grabar, en el mismo reloj
    que `session_quick_marks.marked_at_ms`. Sin ese dato la transcripcion no se puede
    cruzar con las marcas: la grabacion arranca con el primer trazo, no con la sesion,
    y entre las dos cosas esta la latencia de inicio, que aqui es un indicador medido
    (TMP-01) y puede ser de minutos.
    """
    await sessions.get(session_id)
    consent = await sessions.consent_of(session_id)
    if not consent.audio_authorized:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "la sesion no autoriza grabacion de audio")
    settings = get_settings()
    if not settings.supabase_service_key:
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, "Storage no esta configurado")

    # `.webm` no es una suposicion: el bucket `session-files` tiene
    # `allowed_mime_types` limitado a image/png, audio/webm y application/pdf, asi que
    # es el unico formato de audio que Storage acepta. Y es lo que graba MediaRecorder.
    marca = int(dt.datetime.now(dt.UTC).timestamp() * 1000)
    path = f"sessions/{session_id}/audio_{marca}.webm"
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
    row = await audio.create(session_id, path, duration_seconds, started_at_ms)
    return RecordingOut.model_validate(row)


@router.get("/sessions/{session_id}/recordings", response_model=list[RecordingOut])
async def list_recordings(
    session_id: UUID, sessions: Sessions, audio: Audio
) -> list[RecordingOut]:
    """Grabaciones de la sesion. Es lo que el examinador necesita para pedir la
    transcripcion, porque el endpoint de transcribir identifica por id."""
    await sessions.get(session_id)
    return [RecordingOut.model_validate(r) for r in await audio.list_for_session(session_id)]


@router.post(
    "/recordings/{recording_id}/transcribe", response_model=list[TranscriptSegmentOut]
)
async def transcribe(recording_id: UUID, audio: Audio) -> list[TranscriptSegmentOut]:
    """Baja el audio, lo transcribe y guarda los segmentos.

    Reintentar es seguro: `save_segments` reemplaza los segmentos anteriores, y si algo
    falla antes de eso la grabacion se queda sin `transcribed_at` y se puede volver a
    pedir sin perder nada.

    Los fallos del proveedor salen como 502 **diciendo que paso**. Un 500 generico
    dejaria al examinador sin saber si reintentar o escribir a mano.
    """
    grabacion = await audio.get(recording_id)
    transcriptor = build_transcriber()
    if not transcriptor.disponible:
        raise HTTPException(
            status.HTTP_502_BAD_GATEWAY,
            "El proveedor de transcripcion no esta configurado",
        )

    try:
        datos = await download(grabacion.storage_path)
        # El nombre sale del archivo guardado, no de una extension inventada: es como
        # el proveedor decide con que formato esta tratando.
        nombre = PurePosixPath(grabacion.storage_path).name
        segmentos = await transcriptor.transcribe(datos, nombre)
    except (StorageNoDisponible, TranscripcionNoDisponible) as exc:
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, str(exc)) from exc

    if not segmentos:
        raise HTTPException(
            status.HTTP_502_BAD_GATEWAY,
            "La transcripcion no devolvio texto. Puede que la grabacion este en silencio.",
        )

    filas = await audio.save_segments(recording_id, segmentos)
    return [TranscriptSegmentOut.model_validate(f) for f in filas]


@router.get("/recordings/{recording_id}/transcript", response_model=list[TranscriptSegmentOut])
async def transcript(recording_id: UUID, audio: Audio) -> list[TranscriptSegmentOut]:
    await audio.get(recording_id)
    rows = await audio.transcript(recording_id)
    return [TranscriptSegmentOut.model_validate(row) for row in rows]
