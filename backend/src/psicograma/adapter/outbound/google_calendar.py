"""Google Calendar por REST (httpx, sin SDK) + cifrado del token + `state` de OAuth.

Un sentido: la app escribe eventos, no lee el calendario (SPEC-CAL-01). Permiso
pedido: `calendar.events`, el minimo que permite crear, mover y borrar eventos.

El refresh token es un acceso permanente al calendario del examinador, asi que en la
base va cifrado con Fernet y solo este modulo lo descifra.
"""

from __future__ import annotations

import datetime as dt
import hashlib
from urllib.parse import urlencode
from uuid import UUID

import httpx
import jwt
from cryptography.fernet import Fernet, InvalidToken

from ...config.settings import Settings

SCOPE = "https://www.googleapis.com/auth/calendar.events"
_AUTH = "https://accounts.google.com/o/oauth2/v2/auth"
_TOKEN = "https://oauth2.googleapis.com/token"
_BAJA = "https://oauth2.googleapis.com/revoke"
_EVENTS = "https://www.googleapis.com/calendar/v3/calendars/primary/events"


class GoogleError(Exception):
    """Google rechazo o no respondio. La agenda sigue; solo falla la sincronizacion."""


def _clave(s: Settings) -> bytes:
    """La clave de cifrado es propia y obligatoria: no se deriva de ningun otro secreto.

    Derivarla del secreto JWT de Supabase acoplaba dos cosas distintas (rotar una
    rompia la otra) y, con ese secreto vacio, dejaba tokens cifrados y `state` de OAuth
    con una clave publica y por tanto falsificable.
    """
    if not s.google_token_key:
        raise GoogleError("falta GOOGLE_TOKEN_KEY: Google Calendar no esta habilitado")
    return s.google_token_key.encode()


def _fernet(s: Settings) -> Fernet:
    try:
        return Fernet(_clave(s))
    except ValueError as exc:  # clave con formato invalido
        raise GoogleError("GOOGLE_TOKEN_KEY no es una clave Fernet valida") from exc


def _firma(s: Settings) -> bytes:
    """Clave HMAC del `state`, separada por dominio de la de cifrado (32 bytes)."""
    return hashlib.sha256(b"psicograma/google-state/" + _clave(s)).digest()


def cifrar(s: Settings, token: str) -> str:
    return _fernet(s).encrypt(token.encode()).decode()


def descifrar(s: Settings, cifrado: str) -> str:
    try:
        return _fernet(s).decrypt(cifrado.encode()).decode()
    except InvalidToken as exc:
        raise GoogleError("no se pudo descifrar el token guardado; reconecta Google") from exc


_USO = "google-oauth"


def firmar_state(s: Settings, user_id: UUID, minutos: int = 10) -> str:
    """Ata el callback (sin sesion: lo abre Google) al examinador que lo inicio."""
    exp = dt.datetime.now(dt.UTC) + dt.timedelta(minutes=minutos)
    return jwt.encode(
        {"sub": str(user_id), "uso": _USO, "exp": exp}, _firma(s), algorithm="HS256"
    )


def leer_state(s: Settings, state: str) -> UUID:
    try:
        data = jwt.decode(state, _firma(s), algorithms=["HS256"])
    except jwt.InvalidTokenError as exc:
        raise GoogleError("estado de autorizacion invalido o vencido") from exc
    if data.get("uso") != _USO:  # un JWT de Supabase no sirve como state
        raise GoogleError("estado de autorizacion invalido")
    return UUID(data["sub"])


def verificar_state(s: Settings, state: str, user_id: UUID) -> None:
    """El estado debe haberlo emitido **este mismo usuario**.

    Es lo que ata el final del flujo a la sesion autenticada: un `state` ajeno (filtrado
    o reenviado por un tercero) no sirve para vincular un calendario a otra cuenta.
    """
    if leer_state(s, state) != user_id:
        raise GoogleError("el estado de autorizacion no corresponde a esta sesion")


class GoogleCalendar:
    def __init__(self, settings: Settings, transport: httpx.AsyncBaseTransport | None = None):
        self._s = settings
        self._transport = transport

    @property
    def configurado(self) -> bool:
        """Sin clave de cifrado propia no se habilita: no hay donde guardar el token."""
        if not (self._s.google_client_id and self._s.google_client_secret):
            return False
        try:
            _fernet(self._s)
        except GoogleError:
            return False
        return True

    def url_autorizacion(self, state: str) -> str:
        q = {
            "client_id": self._s.google_client_id,
            "redirect_uri": self._s.google_redirect_uri,
            "response_type": "code",
            "scope": SCOPE,
            "access_type": "offline",
            "prompt": "consent",  # sin esto Google no reenvia el refresh token
            "state": state,
        }
        return f"{_AUTH}?{urlencode(q)}"

    def _client(self) -> httpx.AsyncClient:
        return httpx.AsyncClient(timeout=15, transport=self._transport)

    async def _token(self, c: httpx.AsyncClient, datos: dict) -> dict:
        r = await c.post(
            _TOKEN,
            data={
                "client_id": self._s.google_client_id,
                "client_secret": self._s.google_client_secret,
                **datos,
            },
        )
        if r.status_code != 200:
            raise GoogleError(
                f"Google rechazo la autorizacion ({r.json().get('error', r.status_code)})"
            )
        return r.json()

    async def canjear_codigo(self, code: str) -> str:
        async with self._client() as c:
            datos = await self._token(
                c,
                {
                    "grant_type": "authorization_code",
                    "code": code,
                    "redirect_uri": self._s.google_redirect_uri,
                },
            )
        if not datos.get("refresh_token"):
            raise GoogleError("Google no entrego refresh token; vuelve a conectar")
        return datos["refresh_token"]

    async def _acceso(self, c: httpx.AsyncClient, refresh: str) -> dict:
        datos = await self._token(c, {"grant_type": "refresh_token", "refresh_token": refresh})
        return {"Authorization": f"Bearer {datos['access_token']}"}

    async def crear_evento(self, refresh: str, evento: dict) -> str:
        async with self._client() as c:
            r = await c.post(_EVENTS, headers=await self._acceso(c, refresh), json=evento)
        if r.status_code not in (200, 201):
            raise GoogleError(f"no se pudo crear el evento ({r.status_code})")
        return r.json()["id"]

    async def mover_evento(self, refresh: str, event_id: str, evento: dict) -> None:
        async with self._client() as c:
            r = await c.patch(
                f"{_EVENTS}/{event_id}", headers=await self._acceso(c, refresh), json=evento
            )
        if r.status_code != 200:
            raise GoogleError(f"no se pudo mover el evento ({r.status_code})")

    async def borrar_evento(self, refresh: str, event_id: str) -> None:
        async with self._client() as c:
            r = await c.delete(f"{_EVENTS}/{event_id}", headers=await self._acceso(c, refresh))
        # 404/410: ya lo borraron desde Google. El objetivo (que no exista) se cumple.
        if r.status_code not in (200, 204, 404, 410):
            raise GoogleError(f"no se pudo borrar el evento ({r.status_code})")

    async def desautorizar(self, refresh: str) -> None:
        """Pide a Google que invalide el token. Desconectar no depende de su respuesta."""
        try:
            async with self._client() as c:
                await c.post(_BAJA, data={"token": refresh})
        except httpx.HTTPError:
            pass
