"""Bajada de archivos de Supabase Storage.

Solo `download()`. La **subida** sigue en línea en `routers/audio.py`, donde ya
funciona: unificarla aquí es lo correcto a futuro, pero tocar el camino que guarda
las grabaciones a días de la entrega es riesgo sin ganancia. Queda anotado.

El bucket es privado, así que se baja con la service key desde el backend. El
navegador nunca ve esa clave ni la ruta firmada: pide la transcripción por id y el
backend hace el resto (RNF-12).
"""

from __future__ import annotations

import httpx

from ...config.settings import get_settings

TIMEOUT = httpx.Timeout(60.0, connect=10.0)


class StorageNoDisponible(Exception):
    """Storage no está configurado o no devolvió el archivo."""


async def download(path: str) -> bytes:
    """Baja un objeto del bucket de la sesión. `path` es `storage_path` tal cual."""
    s = get_settings()
    if not s.supabase_service_key:
        raise StorageNoDisponible("Storage no esta configurado")

    url = f"{s.supabase_url.rstrip('/')}/storage/v1/object/{s.storage_bucket}/{path}"
    headers = {
        "Authorization": f"Bearer {s.supabase_service_key}",
        "apikey": s.supabase_service_key,
    }
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            r = await client.get(url, headers=headers)
    except httpx.HTTPError as exc:
        raise StorageNoDisponible(f"fallo de red: {type(exc).__name__}") from exc

    if r.status_code >= 400:
        # El status basta para diagnosticar; el cuerpo puede traer detalles de la
        # cuenta y la ruta no se registra porque identifica una sesion clinica.
        raise StorageNoDisponible(f"Storage respondio {r.status_code}")
    return r.content
