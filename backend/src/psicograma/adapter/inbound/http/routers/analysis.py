"""Analisis determinista del dibujo e indicadores sugeridos."""

from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from .....config.container import Drawings, SessionIndicators, Sessions
from .....domain.model import IndicatorStatus
from .....domain.services import evaluate, measure, strokes_bounds
from ..auth import CurrentUser
from ..schemas import (
    AnalysisOut,
    IndicatorStatusIn,
    MetricsOut,
    SessionIndicatorOut,
)

router = APIRouter(prefix="/sessions", tags=["analisis"])


class ManualIndicatorsIn(BaseModel):
    codes: list[str]


@router.post("/{session_id}/analyze", response_model=AnalysisOut)
async def analizar(
    session_id: UUID,
    current_user: CurrentUser,
    sessions: Sessions,
    drawings: Drawings,
    indicators: SessionIndicators,
) -> AnalysisOut:
    session = await sessions.get(session_id)
    if session.status != "completed":
        raise HTTPException(status.HTTP_409_CONFLICT, "la sesion debe estar completada")
    drawing = await drawings.get_drawing(session_id)
    if drawing is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "la sesion no tiene dibujo")

    metrics = measure(drawing, session_duration_ms=_duracion(session))
    await drawings.save_metrics(session_id, metrics)
    suggestions = evaluate(metrics, drawing.canvas, strokes_bounds(drawing))
    await indicators.upsert_suggestions(session_id, suggestions)
    return AnalysisOut(
        metrics=MetricsOut.model_validate(metrics),
        suggestions=[
            {
                "code": item.code,
                "confidence": item.confidence.value,
                "evidence": item.evidence,
            }
            for item in suggestions
        ],
        llm_available=False,
    )


@router.get("/{session_id}/metrics", response_model=MetricsOut)
async def metricas(session_id: UUID, sessions: Sessions, drawings: Drawings) -> MetricsOut:
    session = await sessions.get(session_id)
    stored = await drawings.get_metrics(session_id)
    if stored is not None:
        return MetricsOut.model_validate(stored)
    drawing = await drawings.get_drawing(session_id)
    if drawing is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "la sesion no tiene dibujo")
    return MetricsOut.model_validate(measure(drawing, session_duration_ms=_duracion(session)))


@router.get("/{session_id}/indicators", response_model=list[SessionIndicatorOut])
async def indicadores(
    session_id: UUID, sessions: Sessions, indicators: SessionIndicators
) -> list[SessionIndicatorOut]:
    await sessions.get(session_id)
    rows = await indicators.list_for_session(session_id)
    return [SessionIndicatorOut.model_validate(i) for i in rows]


@router.put(
    "/{session_id}/indicators/{code}", response_model=SessionIndicatorOut
)
async def actualizar_indicador(
    session_id: UUID,
    code: str,
    data: IndicatorStatusIn,
    current_user: CurrentUser,
    sessions: Sessions,
    indicators: SessionIndicators,
) -> SessionIndicatorOut:
    await sessions.get(session_id)
    try:
        row = await indicators.set_status(
            session_id, code, IndicatorStatus(data.status), current_user
        )
    except KeyError:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND, "el indicador no existe en la sesion"
        ) from None
    return SessionIndicatorOut.model_validate(row)


@router.post("/{session_id}/indicators/bulk", response_model=list[SessionIndicatorOut])
async def marcar_manuales(
    session_id: UUID,
    data: ManualIndicatorsIn,
    current_user: CurrentUser,
    sessions: Sessions,
    indicators: SessionIndicators,
) -> list[SessionIndicatorOut]:
    await sessions.get(session_id)
    rows = await indicators.add_manual(session_id, data.codes, current_user)
    return [SessionIndicatorOut.model_validate(row) for row in rows]


def _duracion(session) -> int:
    import datetime as dt

    inicio = session.started_at or session.created_at
    fin = session.completed_at or dt.datetime.now(dt.UTC)
    return max(int((fin - inicio).total_seconds() * 1000), 0)
