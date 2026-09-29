#!/usr/bin/env python3
"""Verifica las policies del bucket session-files. Solo lectura.

Cada consulta va en su propia conexion: si una falla, en Postgres la transaccion
queda abortada y todo lo que siga se ignora, lo que enmascara el error real.

    cd backend && uv run python scripts/check-storage.py
"""

import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from sqlalchemy import text  # noqa: E402

from psicograma.adapter.outbound.postgres.engine import engine  # noqa: E402

MALFORMED = [
    ("prefijo_malo", "drawings/abc.png"),
    ("uuid_malo", "sessions/no-es-uuid/drawing.png"),
    ("sin_segmento", "sessions"),
    ("vacio", ""),
]

failures: list[str] = []


async def scalar(sql: str, params: dict | None = None):
    """Consulta en conexion propia. Devuelve (valor, error)."""
    try:
        async with engine.connect() as conn:
            return await conn.scalar(text(sql), params or {}), None
    except Exception as exc:
        return None, f"{type(exc).__name__}: {str(exc).splitlines()[0][:120]}"


async def main() -> int:
    # --- 1. El helper existe -------------------------------------------------
    print("1. Funcion owns_storage_session")
    exists, err = await scalar(
        "select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace "
        "where n.nspname = 'public' and p.proname = 'owns_storage_session'"
    )
    if err:
        print(f"   FALLO consultando pg_proc  {err}")
        failures.append("no se pudo consultar pg_proc")
    elif exists:
        print("   OK    existe")
    else:
        print("   FALLO no existe — storage-policies.sql no se aplico")
        failures.append("owns_storage_session no existe")

    # --- 2. Policies ---------------------------------------------------------
    print("\n2. Policies en storage.objects")
    try:
        async with engine.connect() as conn:
            rows = (
                await conn.execute(
                    text(
                        "select policyname, cmd from pg_policies "
                        "where schemaname = 'storage' and tablename = 'objects' "
                        "and policyname like 'session-files%' order by cmd"
                    )
                )
            ).all()
        for name, cmd in rows:
            print(f"   OK    {cmd:<7} {name}")
        if len(rows) != 4:
            print(f"   FALLO se esperaban 4, hay {len(rows)}")
            failures.append(f"{len(rows)} de 4 policies")
    except Exception as exc:
        print(f"   FALLO {type(exc).__name__}")
        failures.append("no se pudieron listar las policies")

    # --- 3. El helper deniega rutas malformadas sin romper -------------------
    if exists:
        print("\n3. Rutas malformadas: deben dar false, no excepcion")
        for label, path in MALFORMED:
            val, err = await scalar("select public.owns_storage_session(:n)", {"n": path})
            if err:
                print(f"   FALLO {label:<13} lanzo  {err}")
                failures.append(f"{label} lanzo excepcion")
            elif val is False:
                print(f"   OK    {label:<13} false")
            else:
                print(f"   FALLO {label:<13} devolvio {val!r}")
                failures.append(f"{label} devolvio {val!r}")

    # --- 4. RLS en storage.objects ------------------------------------------
    print("\n4. RLS en storage.objects")
    rls, err = await scalar(
        "select relrowsecurity from pg_class c join pg_namespace n on n.oid = c.relnamespace "
        "where n.nspname = 'storage' and c.relname = 'objects'"
    )
    if err:
        print(f"   FALLO {err}")
        failures.append("no se pudo leer relrowsecurity")
    elif rls:
        print("   OK    habilitada")
    else:
        print("   FALLO deshabilitada")
        failures.append("RLS deshabilitada en storage.objects")

    # --- 5. Bucket -----------------------------------------------------------
    print("\n5. Bucket session-files")
    try:
        async with engine.connect() as conn:
            row = (
                await conn.execute(
                    text(
                        "select public, file_size_limit, allowed_mime_types "
                        "from storage.buckets where id = 'session-files'"
                    )
                )
            ).first()
        if row is None:
            print("   FALLO no existe")
            failures.append("bucket session-files no existe")
        else:
            pub, limit, mimes = row
            print(f"   {'FALLO' if pub else 'OK   '} publico = {pub}")
            if pub:
                failures.append("el bucket es publico")
            print(f"   OK    limite = {limit} bytes")
            print(f"   OK    mime types = {mimes}")
    except Exception as exc:
        print(f"   FALLO {type(exc).__name__}")
        failures.append("no se pudo leer storage.buckets")

    await engine.dispose()

    print()
    if failures:
        print(f"RESULTADO: {len(failures)} fallo(s)")
        for f in failures:
            print(f"  - {f}")
        return 1
    print("RESULTADO: todo OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
