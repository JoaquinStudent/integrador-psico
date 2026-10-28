"""SPEC-CAL-01: adaptador de Google y OAuth, sin red (httpx.MockTransport)."""

import asyncio
import datetime as dt
import uuid

import httpx
import jwt
import pytest
from cryptography.fernet import Fernet

from psicograma.adapter.outbound.google_calendar import (
    GoogleCalendar,
    GoogleError,
    cifrar,
    descifrar,
    firmar_state,
    leer_state,
    verificar_state,
)
from psicograma.config.settings import Settings


def ajustes(**extra) -> Settings:
    base = dict(
        database_url="postgresql+asyncpg://x", supabase_url="https://x.test",
        supabase_jwt_secret="secreto-de-prueba-largo-para-hs256-0123456789",
        google_client_id="id", google_client_secret="sec",
        google_token_key=Fernet.generate_key().decode(),
    )
    return Settings(**{**base, **extra})


S = ajustes()


def cal(handler):
    return GoogleCalendar(S, httpx.MockTransport(handler))


def test_el_token_se_guarda_cifrado_y_vuelve_igual():
    c = cifrar(S, "1//refresh")
    assert "refresh" not in c and descifrar(S, c) == "1//refresh"
    with pytest.raises(GoogleError):
        descifrar(S, "basura")


def test_state_ata_al_usuario_y_caduca():
    uid = uuid.uuid4()
    assert leer_state(S, firmar_state(S, uid)) == uid
    with pytest.raises(GoogleError):
        leer_state(S, firmar_state(S, uid, minutos=-1))
    with pytest.raises(GoogleError):
        leer_state(S, "x.y.z")
    # un JWT valido del mismo secreto pero de otro uso (p. ej. de sesion) no sirve
    otro = jwt.encode(
        {"sub": str(uid), "exp": dt.datetime.now(dt.UTC) + dt.timedelta(minutes=5)},
        S.supabase_jwt_secret, algorithm="HS256",
    )
    with pytest.raises(GoogleError):
        leer_state(S, otro)


def test_url_pide_solo_eventos_y_refresh_token():
    url = cal(lambda r: httpx.Response(200)).url_autorizacion("st")
    assert "calendar.events" in url and "access_type=offline" in url and "state=st" in url
    assert "client_secret" not in url


def test_crear_mover_y_borrar_evento():
    vistos = []

    def h(r: httpx.Request) -> httpx.Response:
        vistos.append((r.method, r.url.path))
        if r.url.path == "/token":
            return httpx.Response(200, json={"access_token": "at"})
        if r.method == "POST":
            return httpx.Response(200, json={"id": "ev1"})
        if r.method == "PATCH":
            return httpx.Response(200, json={})
        return httpx.Response(410)  # ya borrado en Google: no es error

    async def run():
        g = cal(h)
        assert await g.crear_evento("rt", {"summary": "s"}) == "ev1"
        await g.mover_evento("rt", "ev1", {"summary": "s"})
        await g.borrar_evento("rt", "ev1")

    asyncio.run(run())
    assert [m for m, _ in vistos].count("DELETE") == 1


def test_google_caido_es_googleerror():
    def h(r):
        return httpx.Response(401, json={"error": "invalid_grant"})

    with pytest.raises(GoogleError, match="invalid_grant"):
        asyncio.run(cal(h).crear_evento("rt", {}))


def test_canje_sin_refresh_token_falla():
    h = lambda r: httpx.Response(200, json={"access_token": "a"})  # noqa: E731
    with pytest.raises(GoogleError):
        asyncio.run(cal(h).canjear_codigo("code"))


def test_el_state_no_sirve_como_token_de_sesion(monkeypatch):
    """El state viaja por la URL (historial, logs de Google): no debe abrir la API."""
    import psicograma.adapter.inbound.http.auth as auth

    monkeypatch.setattr(auth, "get_settings", lambda: S)
    with pytest.raises(jwt.InvalidTokenError):
        auth._decode(firmar_state(S, uuid.uuid4()))


def test_sin_clave_propia_google_no_se_habilita_ni_firma_ni_cifra():
    """Nada se deriva del secreto JWT: sin GOOGLE_TOKEN_KEY no hay cifrado ni estado."""
    sin = ajustes(google_token_key="")
    assert GoogleCalendar(sin).configurado is False
    with pytest.raises(GoogleError):
        cifrar(sin, "x")
    with pytest.raises(GoogleError):
        firmar_state(sin, uuid.uuid4())
    assert GoogleCalendar(ajustes(google_token_key="no-es-fernet")).configurado is False


def test_el_state_firmado_con_el_secreto_jwt_no_es_valido():
    """Quien conozca el secreto JWT de Supabase no puede forjar el estado de OAuth."""
    forjado = jwt.encode(
        {"sub": str(uuid.uuid4()), "uso": "google-oauth",
         "exp": dt.datetime.now(dt.UTC) + dt.timedelta(minutes=5)},
        S.supabase_jwt_secret, algorithm="HS256",
    )
    with pytest.raises(GoogleError):
        leer_state(S, forjado)


def test_el_state_solo_vale_para_el_usuario_que_lo_pidio():
    """Un state ajeno (filtrado o reenviado) no vincula un calendario a otra cuenta."""
    yo, otro = uuid.uuid4(), uuid.uuid4()
    estado = firmar_state(S, yo)
    verificar_state(S, estado, yo)  # el suyo, ok
    with pytest.raises(GoogleError):
        verificar_state(S, estado, otro)
