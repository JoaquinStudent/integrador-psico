#!/usr/bin/env python3
"""Smoke test de la configuracion contra la base real. Solo lectura.

Verifica que el .env apunta a una base con el esquema v2 aplicado y el catalogo
sembrado. No escribe nada y no imprime secretos.

    cd backend && uv run python scripts/smoke-test.py
"""

import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from sqlalchemy import text  # noqa: E402

from psicograma.adapter.outbound.postgres.engine import engine  # noqa: E402
from psicograma.config.settings import get_settings  # noqa: E402

EXPECTED = {
    "tests": 4,
    "indicator_categories": 4,
    "manual_sections": 18,
    "indicator_catalog": 201,
    "quick_mark_catalog": 6,
    "attitude_catalog": 8,
}

failures: list[str] = []


def ok(label: str, detail: str = "") -> None:
    print(f"  OK    {label}{'  ' + detail if detail else ''}")


def fail(label: str, detail: str) -> None:
    print(f"  FALLO {label}  {detail}")
    failures.append(f"{label}: {detail}")


async def main() -> int:
    s = get_settings()

    # --- 1. Forma del DATABASE_URL, sin exponerlo -----------------------------
    print("\n1. DATABASE_URL")
    url = s.database_url
    if url.startswith("postgresql+asyncpg://"):
        ok("driver asyncpg")
    else:
        # engine.py lo normaliza, asi que no es fallo: solo se informa.
        print(f"  INFO  esquema {url.split('://')[0]}:// — engine.py lo normaliza a +asyncpg")

    if ":6543/" in url:
        ok("puerto 6543", "transaction pooler")
    elif ":5432/" in url:
        ok("puerto 5432", "session pooler — soporta prepared statements, valido para el runtime")
    else:
        fail("puerto", "no se detecto 6543 ni 5432")

    if "[" in url or "]" in url:
        fail("placeholders", "quedaron corchetes en la URL")
    else:
        ok("sin corchetes")

    if "sslmode=" in url:
        fail("sslmode", "asyncpg no acepta sslmode en la URL, hay que quitarlo")

    # --- 2. Conexion ----------------------------------------------------------
    print("\n2. Conexion a Postgres")
    try:
        async with engine.connect() as conn:
            ver = await conn.scalar(text("select version()"))
            ok("conecta", str(ver).split(",")[0])

            # Segunda consulta en otra conexion: prueba el tema de los
            # prepared statements del pooler.
            async with engine.connect() as c2:
                await c2.scalar(text("select 1"))
            ok("segunda conexion sin DuplicatePreparedStatementError")
    except Exception as exc:
        fail("conexion", f"{type(exc).__name__}: {str(exc)[:160]}")
        return 1

    # --- 3. Esquema -----------------------------------------------------------
    print("\n3. Esquema v2")
    async with engine.connect() as conn:
        n = await conn.scalar(
            text("select count(*) from pg_tables where schemaname = 'public'")
        )
        (ok if n == 22 else fail)("22 tablas", f"hay {n}") if n != 22 else ok("22 tablas")

        sin_rls = await conn.scalar(
            text(
                "select count(*) from pg_class c "
                "join pg_namespace n on n.oid = c.relnamespace "
                "where n.nspname = 'public' and c.relkind = 'r' "
                "and not c.relrowsecurity"
            )
        )
        if sin_rls == 0:
            ok("RLS habilitada en todas")
        else:
            fail("RLS", f"{sin_rls} tablas sin RLS")

        funcs = await conn.scalar(
            text(
                "select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace "
                "where n.nspname = 'public' and p.proname in "
                "('handle_new_user','owns_session','touch_updated_at')"
            )
        )
        if funcs == 3:
            ok("3 funciones del esquema")
        else:
            fail("funciones", f"se encontraron {funcs} de 3")

    # --- 4. Catalogo sembrado -------------------------------------------------
    print("\n4. Seed del catalogo")
    async with engine.connect() as conn:
        for table, expected in EXPECTED.items():
            try:
                got = await conn.scalar(text(f"select count(*) from {table}"))  # noqa: S608
            except Exception as exc:
                fail(table, f"{type(exc).__name__}")
                continue
            if got == expected:
                ok(table, f"{got}")
            else:
                fail(table, f"esperado {expected}, hay {got}")

    # --- 5. Integridad del catalogo ------------------------------------------
    print("\n5. Integridad del catalogo")
    async with engine.connect() as conn:
        huerfanos = await conn.scalar(
            text(
                "select count(*) from indicator_catalog i "
                "left join manual_sections s on s.id = i.section_id "
                "where s.id is null"
            )
        )
        if huerfanos == 0:
            ok("ningun indicador sin seccion")
        else:
            fail("indicadores huerfanos", str(huerfanos))

        por_deteccion = (
            await conn.execute(
                text(
                    "select detection_type, count(*) from indicator_catalog "
                    "group by detection_type order by detection_type"
                )
            )
        ).all()
        reparto = {r[0]: r[1] for r in por_deteccion}
        esperado = {"auto": 23, "semi": 25, "manual": 153}
        if reparto == esperado:
            ok("reparto por detection_type", str(reparto))
        else:
            fail("detection_type", f"esperado {esperado}, hay {reparto}")

    # --- 6. Otros valores del .env -------------------------------------------
    print("\n6. Resto de la configuracion")
    ok("SUPABASE_URL", s.supabase_url)
    ok("STORAGE_BUCKET", s.storage_bucket)
    for name, val in (
        ("SUPABASE_JWT_SECRET", s.supabase_jwt_secret),
        ("SUPABASE_SERVICE_KEY", s.supabase_service_key),
        ("OPENAI_API_KEY", s.openai_api_key),
        ("OPENROUTER_API_KEY", s.openrouter_api_key),
    ):
        if val:
            ok(name, "definida")
        else:
            fail(name, "vacia")

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
