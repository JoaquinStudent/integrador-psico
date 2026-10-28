"""Agenda de citas (SPEC-CAL-01).

La cita se guarda siempre; Google es un efecto. Si la sincronizacion falla la
respuesta lo dice (`google_sync = "error"`) y la agenda no se pierde.
"""

from __future__ import annotations

from datetime import datetime
from uuid import UUID

import httpx
from fastapi import APIRouter, status

from .....adapter.outbound.google_calendar import GoogleError, descifrar
from .....config.container import Appointments, Calendar, GoogleConnections
from .....config.settings import get_settings
from .....domain.services.appointments import evento_google, iniciales
from ..schemas import AppointmentIn, AppointmentOut, AppointmentPatch

router = APIRouter(prefix="/appointments", tags=["agenda"])


def _out(fila, sync: str | None = None) -> AppointmentOut:
    cita, paciente, test_code = fila
    return AppointmentOut(
        id=cita.id,
        patient_id=cita.patient_id,
        patient_name=paciente,
        test_code=test_code,
        starts_at=cita.starts_at,
        ends_at=cita.ends_at,
        status=cita.status,
        notes=cita.notes,
        session_id=cita.session_id,
        en_google=cita.google_event_id is not None,
        google_sync=sync,
    )


async def _sincronizar(fila, cal: Calendar, conexiones: GoogleConnections, *, borrar=False) -> str:
    cita, paciente, test_code = fila
    conn = await conexiones.get()
    if conn is None or not cal.configurado:
        return "off"
    s = get_settings()
    try:
        refresh = descifrar(s, conn.refresh_token)
        if borrar:
            if cita.google_event_id:
                await cal.borrar_evento(refresh, cita.google_event_id)
                cita.google_event_id = None
        else:
            evento = evento_google(
                iniciales_paciente=iniciales(paciente),
                test_code=test_code,
                inicio=cita.starts_at,
                fin=cita.ends_at,
                enlace=f"{s.frontend_url.rstrip('/')}/citas",
                zona=s.calendar_timezone,
            )
            if cita.google_event_id:
                await cal.mover_evento(refresh, cita.google_event_id, evento)
            else:
                cita.google_event_id = await cal.crear_evento(refresh, evento)
        return "ok"
    except (GoogleError, httpx.HTTPError):
        return "error"


@router.get("", response_model=list[AppointmentOut])
async def listar(store: Appointments, desde: datetime | None = None, hasta: datetime | None = None):
    return [_out(f) for f in await store.listar(desde, hasta)]


@router.post("", response_model=AppointmentOut, status_code=status.HTTP_201_CREATED)
async def crear(
    data: AppointmentIn, store: Appointments, cal: Calendar, conexiones: GoogleConnections
):
    fila = await store.crear(
        data.patient_id, data.test_code, data.starts_at, data.ends_at, data.notes
    )
    return _out(fila, await _sincronizar(fila, cal, conexiones))


@router.patch("/{appointment_id}", response_model=AppointmentOut)
async def reprogramar(
    appointment_id: UUID,
    data: AppointmentPatch,
    store: Appointments,
    cal: Calendar,
    conexiones: GoogleConnections,
):
    fila = await store.reprogramar(appointment_id, data.model_dump(exclude_unset=True))
    return _out(fila, await _sincronizar(fila, cal, conexiones))


@router.post("/{appointment_id}/cancel", response_model=AppointmentOut)
async def cancelar(
    appointment_id: UUID, store: Appointments, cal: Calendar, conexiones: GoogleConnections
):
    fila = await store.cancelar(appointment_id)
    return _out(fila, await _sincronizar(fila, cal, conexiones, borrar=True))


@router.post("/{appointment_id}/start", response_model=AppointmentOut)
async def iniciar(appointment_id: UUID, store: Appointments):
    return _out(await store.iniciar(appointment_id))
