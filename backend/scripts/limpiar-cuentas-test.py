#!/usr/bin/env python3
"""Borra las cuentas de prueba y sus datos. Deja intactas las cuentas reales.

Las cuentas de prueba usan el dominio `@psicograma.test` — `.test` es un TLD
reservado (RFC 2606) que no se puede registrar, asi que el filtro nunca puede
coincidir con una cuenta real.

Los pacientes van primero: `patients.created_by` referencia `profiles` sin
ON DELETE CASCADE, y eso es deliberado en el esquema — no se destruyen registros
clinicos por borrar un usuario.

    cd backend && uv run python scripts/limpiar-cuentas-test.py
"""

import asyncio
import sys
import urllib.request
from pathlib import Path

import asyncpg

sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from psicograma.config.settings import get_settings  # noqa: E402

DOMINIO = "@psicograma.test"


async def main() -> None:
    s = get_settings()
    key = s.supabase_service_key
    if not key:
        raise SystemExit("falta SUPABASE_SERVICE_KEY")
    hdrs = {"Authorization": f"Bearer {key}", "apikey": key}

    conn = await asyncpg.connect(
        s.database_url.replace("postgresql+asyncpg://", "postgresql://"),
        statement_cache_size=0,
    )
    try:
        cuentas = await conn.fetch(
            "select id, email from auth.users where email like $1", f"%{DOMINIO}"
        )
        if not cuentas:
            print("no hay cuentas de prueba")
        else:
            ids = [str(r["id"]) for r in cuentas]
            borrados = await conn.fetchval(
                "select count(*) from patients where created_by::text = any($1)", ids
            )
            await conn.execute(
                "delete from patients where created_by::text = any($1)", ids
            )
            print(f"pacientes borrados: {borrados} (con sesiones y trazos en cascada)")
            for r in cuentas:
                url = f"{s.supabase_url.rstrip('/')}/auth/v1/admin/users/{r['id']}"
                urllib.request.urlopen(
                    urllib.request.Request(url, headers=hdrs, method="DELETE"), timeout=20
                )
                print(f"  cuenta borrada: {r['email']}")

        print("\nestado:")
        for etiqueta, consulta in (
            ("cuentas", "select count(*) from auth.users"),
            ("pacientes", "select count(*) from patients"),
            ("sesiones", "select count(*) from sessions"),
        ):
            print(f"  {etiqueta:<11} {await conn.fetchval(consulta)}")
    finally:
        await conn.close()


if __name__ == "__main__":
    asyncio.run(main())
