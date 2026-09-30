"""Sesiones: ciclo de vida, consentimiento, dibujo y observaciones.

Traduce los errores del store a codigos HTTP segun `sdd/api-contracts.md`:
`NotFound` -> 404 y `Conflict` -> 409. Que `NotFound` cubra tanto "no existe"
como "es de otro examinador" es deliberado: distinguirlos le confirmaria la
existencia de un registro a quien prueba ids ajenos.
"""

from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, HTTPException, Query, status

from .....config.container import (
    Drawings,
    DrawingWrites,
    Observations,
    Patients,
    Sessions,
)
from ..schemas import (
    ConsentIn,
    ConsentOut,
    DrawingIn,
    DrawingOut,
    ObservationsIn,
    ObservationsOut,
    PatientOut,
    QuickMarkIn,
    SessionIn,
    SessionOut,
    SessionPage,
    SessionPatch,
    StrokeOut,
    TestOut,
    VerbalizationIn,
    VerbalizationOut,
)

router = APIRouter(prefix="/sessions", tags=["sesiones"])


@router.get("", response_model=SessionPage)
async def listar(
    store: Sessions,
    patients: Patients,
    status_filter: str | None = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
) -> SessionPage:
    rows, total = await store.list_all(status=status_filter, page=page, page_size=page_size)
    return SessionPage(
        items=[await _to_out(store, row, patients) for row in rows],
        total=total,
        page=page,
        page_size=page_size,
    )


async def _to_out(store: Sessions, row, patients: Patients | None = None) -> SessionOut:
    test = await store.test_of(row)
    out = SessionOut(
        id=row.id,
        patient_id=row.patient_id,
        test=TestOut.model_validate(test),
        status=row.status,
        reason=row.reason,
        started_at=row.started_at,
        completed_at=row.completed_at,
        created_at=row.created_at,
    )
    if patients is not None:
        paciente = await patients.get(row.patient_id)
        out.patient = PatientOut.model_validate(paciente)
    return out


@router.post("", response_model=SessionOut, status_code=status.HTTP_201_CREATED)
async def crear(data: SessionIn, store: Sessions) -> SessionOut:
    """Crea sesion, consentimiento y dibujo en una sola transaccion."""
    row = await store.create(data.patient_id, data.test_code, data.reason)
    return await _to_out(store, row)


@router.get("/{session_id}", response_model=SessionOut)
async def leer(session_id: UUID, store: Sessions, patients: Patients) -> SessionOut:
    row = await store.get(session_id)
    return await _to_out(store, row, patients)


@router.patch("/{session_id}", response_model=SessionOut)
async def actualizar(session_id: UUID, data: SessionPatch, store: Sessions) -> SessionOut:
    row = await store.get(session_id)
    if data.reason is not None:
        row.reason = data.reason
    if data.status is not None:
        row = await store.set_status(session_id, data.status)
    return await _to_out(store, row)


@router.post("/{session_id}/finalize", response_model=SessionOut)
async def finalizar(session_id: UUID, store: Sessions) -> SessionOut:
    """Cierra la sesion. Lo pueden llamar los dos dispositivos, y el segundo
    encuentra la sesion ya cerrada: `set_status` es idempotente para el mismo
    estado, asi que no devuelve 409 por una carrera entre tablet y escritorio."""
    row = await store.set_status(session_id, "completed")
    return await _to_out(store, row)


# =============================================================================
# Consentimiento
# =============================================================================


@router.post("/{session_id}/consent", response_model=ConsentOut)
async def consentir(session_id: UUID, data: ConsentIn, store: Sessions) -> ConsentOut:
    row = await store.save_consent(session_id, data.model_dump())
    # El consentimiento firmado habilita el paso siguiente del flujo.
    sesion = await store.get(session_id)
    if sesion.status == "setup":
        await store.set_status(session_id, "consent")
    return ConsentOut.model_validate(row)


@router.get("/{session_id}/consent", response_model=ConsentOut)
async def leer_consentimiento(session_id: UUID, store: Sessions) -> ConsentOut:
    await store.get(session_id)
    return ConsentOut.model_validate(await store.consent_of(session_id))


# =============================================================================
# Dibujo
# =============================================================================


@router.put("/{session_id}/drawing", status_code=status.HTTP_204_NO_CONTENT)
async def guardar_dibujo(
    session_id: UUID, data: DrawingIn, sessions: Sessions, writes: DrawingWrites
) -> None:
    """Bulk de trazos. Se llama una vez al finalizar, no por trazo (DT-006)."""
    await sessions.get(session_id)
    await writes.save(session_id, data.model_dump())


@router.get("/{session_id}/drawing", response_model=DrawingOut)
async def leer_dibujo(session_id: UUID, sessions: Sessions, drawings: Drawings) -> DrawingOut:
    await sessions.get(session_id)
    dibujo = await drawings.get_drawing(session_id)
    if dibujo is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "la sesion no tiene dibujo")

    return DrawingOut(
        session_id=session_id,
        canvas_width=dibujo.canvas.width,
        canvas_height=dibujo.canvas.height,
        orientation=dibujo.orientation,
        # TODO(SPEC-S5-05): firmar con FileStore.signed_url(). Hoy no hay imagen
        # subida por la API todavia, asi que no se expone una URL muerta.
        final_image_url=None,
        strokes=[
            StrokeOut(
                stroke_index=s.stroke_index,
                tool=s.tool.value,
                started_at_ms=s.started_at_ms,
                ended_at_ms=s.ended_at_ms,
                points=[
                    {"x": p.x, "y": p.y, "t": p.t, "p": p.pressure} for p in s.points
                ],
            )
            for s in dibujo.strokes
        ],
    )


# =============================================================================
# Observaciones
# =============================================================================


@router.get("/{session_id}/observations", response_model=ObservationsOut)
async def leer_observaciones(
    session_id: UUID, sessions: Sessions, obs: Observations
) -> ObservationsOut:
    await sessions.get(session_id)
    return ObservationsOut.model_validate(await obs.get(session_id))


@router.put("/{session_id}/observations", response_model=ObservationsOut)
async def guardar_observaciones(
    session_id: UUID, data: ObservationsIn, sessions: Sessions, obs: Observations
) -> ObservationsOut:
    await sessions.get(session_id)
    await obs.save(session_id, data.additional_notes, data.attitudes)
    return ObservationsOut.model_validate(await obs.get(session_id))


@router.post("/{session_id}/quick-marks", status_code=status.HTTP_204_NO_CONTENT)
async def marcar(
    session_id: UUID, data: QuickMarkIn, sessions: Sessions, obs: Observations
) -> None:
    """Marca rapida durante la sesion en vivo. Se registra con su offset para que
    despues se pueda alinear con el trazo que la motivo."""
    await sessions.get(session_id)
    await obs.add_quick_mark(session_id, data.mark_code, data.marked_at_ms)


# =============================================================================
# Verbalizaciones
# =============================================================================
#
# Una verbalizacion es una frase del paciente que entra al informe (seccion 6,
# "Verbalizaciones del paciente"). Se llenaba desde ningun lado: la tabla existia y
# `compose_report` ya la leia, pero nadie escribia en ella.
#
# Nada llega aqui solo. Whisper no separa hablantes, asi que es el examinador quien
# elige que segmento fue del paciente, y elegirlo es atribuirlo. Volcar la
# transcripcion completa firmaria como dicho por el paciente lo que dijo el
# profesional.


@router.get("/{session_id}/verbalizations", response_model=list[VerbalizationOut])
async def leer_verbalizaciones(
    session_id: UUID, sessions: Sessions, obs: Observations
) -> list[VerbalizationOut]:
    await sessions.get(session_id)
    return [
        VerbalizationOut.model_validate(v)
        for v in await obs.list_verbalizations(session_id)
    ]


@router.post(
    "/{session_id}/verbalizations",
    response_model=VerbalizationOut,
    status_code=status.HTTP_201_CREATED,
)
async def agregar_verbalizacion(
    session_id: UUID, data: VerbalizationIn, sessions: Sessions, obs: Observations
) -> VerbalizationOut:
    """Promueve una frase a verbalizacion del paciente.

    Idempotente para la misma frase en el mismo momento: el boton se puede pulsar dos
    veces y la seccion 6 no debe mostrar el dato repetido como si fuera nuevo.
    """
    await sessions.get(session_id)
    row = await obs.add_verbalization(session_id, data.text, data.offset_ms, data.source)
    return VerbalizationOut.model_validate(row)


@router.delete(
    "/{session_id}/verbalizations/{verbalization_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def quitar_verbalizacion(
    session_id: UUID, verbalization_id: UUID, sessions: Sessions, obs: Observations
) -> None:
    await sessions.get(session_id)
    await obs.delete_verbalization(session_id, verbalization_id)
