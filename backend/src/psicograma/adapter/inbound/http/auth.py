"""Verificacion del JWT de Supabase.

El backend **no emite tokens**. El login sigue siendo Supabase Auth en el
frontend; aqui solo se verifica la firma y se extrae el `sub`. Reconstruir auth
seria duplicar algo que ya funciona (y que ya paso por el trigger
`handle_new_user`).
"""

from __future__ import annotations

from typing import Annotated
from uuid import UUID

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from ....config.settings import get_settings

_bearer = HTTPBearer(auto_error=False)


def _unauthorized(detail: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


async def current_user_id(
    creds: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)],
) -> UUID:
    if creds is None:
        raise _unauthorized("Falta el header Authorization")

    settings = get_settings()
    try:
        claims = jwt.decode(
            creds.credentials,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            audience="authenticated",
        )
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
