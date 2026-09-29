"""Pacientes: alta, edicion, listado y ficha."""

from __future__ import annotations

import datetime as dt
from typing import Literal
from uuid import UUID

from fastapi import APIRouter, Query, status

from .....config.container import Patients, Sessions
from ..schemas import Page, PatientIn, PatientOut, SessionOut, TestOut

router = APIRouter(prefix="/patients", tags=["pacientes"])

Filtro = Literal["all", "active", "inactive", "pending_evaluation"]


def _edad(nacimiento: dt.date) -> int:
    hoy = dt.date.today()
    return hoy.year - nacimiento.year - (
        (hoy.month, hoy.day) < (nacimiento.month, nacimiento.day)
    )


@router.get("", response_model=Page[PatientOut])
async def listar(
    store: Patients,
    q: str | None = Query(None, description="nombre o documento"),
    filter: Filtro = "active",
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
) -> Page[PatientOut]:
    only_active = {"active": True, "inactive": False}.get(filter)
    rows, total = await store.list(
        q=q,
        only_active=only_active,
        pending_only=filter == "pending_evaluation",
        page=page,
        page_size=page_size,
    )

    # Una sola consulta para los derivados de toda la pagina, en vez de una por
    # paciente: el N+1 aparece cuando el listado crece, no en las pruebas.
    conteos = await store.counts_for([r.id for r in rows])

    items = []
    for r in rows:
        out = PatientOut.model_validate(r)
        out.age = _edad(r.birth_date)
        total_eval, pendiente = conteos.get(r.id, (0, False))
        out.evaluation_count = total_eval
        out.has_pending_evaluation = pendiente
        items.append(out)

    return Page(items=items, total=total, page=page, page_size=page_size)


@router.post("", response_model=PatientOut, status_code=status.HTTP_201_CREATED)
async def crear(data: PatientIn, store: Patients) -> PatientOut:
    """`created_by` lo pone el backend desde el token, no el cliente.

    Si viniera del cuerpo, un cliente podria crear pacientes a nombre de otro
    examinador.
    """
    row = await store.create(data.model_dump())
    out = PatientOut.model_validate(row)
    out.age = _edad(row.birth_date)
    return out


@router.get("/{patient_id}", response_model=PatientOut)
async def leer(patient_id: UUID, store: Patients) -> PatientOut:
    row = await store.get(patient_id)
    out = PatientOut.model_validate(row)
    out.age = _edad(row.birth_date)
    total_eval, pendiente = (await store.counts_for([row.id])).get(row.id, (0, False))
    out.evaluation_count = total_eval
    out.has_pending_evaluation = pendiente
    return out


@router.patch("/{patient_id}", response_model=PatientOut)
async def actualizar(patient_id: UUID, data: PatientIn, store: Patients) -> PatientOut:
    row = await store.update(patient_id, data.model_dump(exclude_unset=True))
    out = PatientOut.model_validate(row)
    out.age = _edad(row.birth_date)
    return out


@router.get("/{patient_id}/sessions", response_model=list[SessionOut])
async def sesiones(
    patient_id: UUID, patients: Patients, sessions: Sessions
) -> list[SessionOut]:
    await patients.get(patient_id)  # valida pertenencia via RLS
    rows = await sessions.list_for_patient(patient_id)
    return [
        SessionOut(
            id=r.id,
            patient_id=r.patient_id,
            test=TestOut.model_validate(await sessions.test_of(r)),
            status=r.status,
            reason=r.reason,
            started_at=r.started_at,
            completed_at=r.completed_at,
            created_at=r.created_at,
        )
        for r in rows
    ]
