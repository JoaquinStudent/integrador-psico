"""Conexion con Google Calendar por OAuth (SPEC-CAL-01).

El flujo termina en dos pasos para que el `state` quede atado a la **sesion
autenticada**: Google abre `/callback` (sin Bearer, no guarda nada) y la app, ya con la
sesion del usuario, llama a `POST /complete`, que exige que el `state` lo haya emitido
ese mismo usuario.
"""

from __future__ import annotations

import contextlib
import logging
from urllib.parse import urlencode

import httpx
from fastapi import APIRouter, HTTPException, Query, status
from fastapi.responses import RedirectResponse, Response
from pydantic import BaseModel, Field

from .....adapter.outbound.google_calendar import (
    GoogleError,
    cifrar,
    descifrar,
    firmar_state,
    verificar_state,
)
from .....config.container import Calendar, GoogleConnections
from .....config.settings import get_settings
from ..auth import CurrentUser
from ..schemas import GoogleConnectOut, GoogleStatusOut

router = APIRouter(prefix="/integrations/google", tags=["google"])
log = logging.getLogger(__name__)


@router.get("", response_model=GoogleStatusOut)
async def estado(cal: Calendar, conexiones: GoogleConnections):
    conn = await conexiones.get()
    return GoogleStatusOut(
        configured=cal.configurado,
        connected=conn is not None,
        connected_at=conn.connected_at if conn else None,
    )


@router.post("/connect", response_model=GoogleConnectOut)
async def conectar(user_id: CurrentUser, cal: Calendar):
    if not cal.configurado:
        raise HTTPException(
            status.HTTP_409_CONFLICT, "Google Calendar no esta configurado en el servidor"
        )
    return GoogleConnectOut(url=cal.url_autorizacion(firmar_state(get_settings(), user_id)))


@router.get("/callback", include_in_schema=False)
async def callback(
    code: str | None = Query(default=None),
    state: str | None = Query(default=None),
    error: str | None = Query(default=None),
):
    """Lo abre Google, sin sesion: **no guarda nada**. Devuelve el codigo a la app.

    Quien completa la conexion es `POST /complete`, que si lleva la sesion del usuario.
    Asi el `state` queda atado a la sesion autenticada y no a quien abra este enlace.
    """
    base = f"{get_settings().frontend_url.rstrip('/')}/ajustes"
    if error or not code or not state:
        q = {"google": "cancelado"}  # el usuario nego el permiso
    else:
        q = {"google_code": code, "google_state": state}
    return RedirectResponse(f"{base}?{urlencode(q)}", status_code=302)


class CompleteIn(BaseModel):
    code: str = Field(min_length=1, max_length=2048)
    state: str = Field(min_length=1, max_length=4096)


@router.post("/complete", response_model=GoogleStatusOut)
async def completar(
    data: CompleteIn, user_id: CurrentUser, cal: Calendar, conexiones: GoogleConnections
):
    s = get_settings()
    try:
        verificar_state(s, data.state, user_id)
    except GoogleError as exc:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN, "La autorizacion de Google no corresponde a tu sesion"
        ) from exc
    try:
        refresh = await cal.canjear_codigo(data.code)
    except (GoogleError, httpx.HTTPError) as exc:
        log.warning("OAuth de Google fallo: %s", exc)
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, "Google rechazo la autorizacion") from exc
    await conexiones.save(cifrar(s, refresh))
    conn = await conexiones.get()
    return GoogleStatusOut(
        configured=True, connected=True, connected_at=conn.connected_at if conn else None
    )


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
async def desconectar(cal: Calendar, conexiones: GoogleConnections):
    conn = await conexiones.get()
    if conn is not None:
        # Token ilegible: se borra igual, es lo que el usuario pidio.
        with contextlib.suppress(GoogleError):
            await cal.desautorizar(descifrar(get_settings(), conn.refresh_token))
        await conexiones.remove()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
