"""Resumen de trabajo del examinador.

El router no arma consultas: pide el resumen al store, que filtra por examinador.
Antes construia cuatro `select` aqui **sin filtro alguno**, apoyandose solo en RLS
para el aislamiento. Funcionaba, pero dejaba una unica linea de defensa: cualquier
camino que no pasara por `session_for()` habria devuelto los conteos de todos.
"""

from __future__ import annotations

from fastapi import APIRouter

from .....config.container import Sessions
from ..schemas import DashboardSummary, PatientOut, SessionOut, TestOut

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummary)
async def summary(store: Sessions) -> DashboardSummary:
    datos = await store.summary()
    return DashboardSummary(
        sessions_this_week=datos["sessions_this_week"],
        pending_analysis=datos["pending_analysis"],
        active_patients=datos["active_patients"],
        recent_sessions=[
            SessionOut(
                id=sesion.id,
                patient_id=sesion.patient_id,
                test=TestOut.model_validate(test),
                status=sesion.status,
                reason=sesion.reason,
                started_at=sesion.started_at,
                completed_at=sesion.completed_at,
                created_at=sesion.created_at,
                patient=PatientOut.model_validate(paciente),
            )
            for sesion, paciente, test in datos["recent_sessions"]
        ],
    )
