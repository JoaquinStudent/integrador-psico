"""Verificacion del JWT de Supabase.

El backend **no emite tokens**. El login sigue siendo Supabase Auth en el
frontend; aqui solo se verifica la firma y se extrae el `sub`. Reconstruir auth
seria duplicar algo que ya funciona (y que ya paso por el trigger
`handle_new_user`).

Supabase firma de dos maneras segun como este configurado el proyecto:

- **Asimetrica** (ES256 o RS256). Es lo que traen los proyectos nuevos. La clave
  publica se descarga del JWKS del proyecto; el secreto compartido no sirve.
- **HS256** con el secreto compartido, en proyectos mas viejos.

Se soportan las dos: el algoritmo se lee de la cabecera del token y se enruta.
Asi el mismo codigo funciona contra el proyecto de cualquier integrante del
equipo, sin que cada uno tenga que tocar nada.
"""

from __future__ import annotations

from functools import lru_cache
from typing import Annotated
from uuid import UUID

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import PyJWKClient

from ....config.settings import get_settings

_bearer = HTTPBearer(auto_error=False)

ASYMMETRIC = ("ES256", "RS256")


def _unauthorized(detail: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


@lru_cache
def _jwks_client() -> PyJWKClient:
    """Cliente del JWKS del proyecto.

    PyJWKClient cachea las claves internamente, asi que la descarga ocurre una
    vez por proceso. Se construye perezosamente para que importar este modulo no
    haga red — si no, los tests del dominio dejarian de ser offline.
    """
    url = get_settings().supabase_url.rstrip("/")
    return PyJWKClient(f"{url}/auth/v1/.well-known/jwks.json", cache_keys=True)


def _decode(token: str) -> dict:
    try:
        alg = jwt.get_unverified_header(token).get("alg")
    except jwt.InvalidTokenError as exc:
        raise _unauthorized(f"Token malformado: {exc}") from None

    common = {"audience": "authenticated", "options": {"verify_aud": True}}

    if alg in ASYMMETRIC:
        try:
            key = _jwks_client().get_signing_key_from_jwt(token).key
        except Exception as exc:  # red caida, kid desconocido, JWKS vacio
            raise _unauthorized(
                f"No se pudo obtener la clave de firma: {type(exc).__name__}"
            ) from None
        return jwt.decode(token, key, algorithms=list(ASYMMETRIC), **common)

    if alg == "HS256":
        secret = get_settings().supabase_jwt_secret
        if not secret:
            raise _unauthorized("El token es HS256 pero SUPABASE_JWT_SECRET no esta configurado")
        return jwt.decode(token, secret, algorithms=["HS256"], **common)

    raise _unauthorized(f"Algoritmo de firma no soportado: {alg}")


async def current_user_id(
    creds: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)],
) -> UUID:
    if creds is None:
        raise _unauthorized("Falta el header Authorization")

    try:
        claims = _decode(creds.credentials)
    except jwt.ExpiredSignatureError:
        raise _unauthorized("Token expirado") from None
    except jwt.InvalidTokenError as exc:
        raise _unauthorized(f"Token invalido: {exc}") from None

    sub = claims.get("sub")
    if not sub:
        raise _unauthorized("El token no trae `sub`")
    try:
        return UUID(sub)
    except ValueError:
        raise _unauthorized("El `sub` del token no es un UUID") from None


CurrentUser = Annotated[UUID, Depends(current_user_id)]
