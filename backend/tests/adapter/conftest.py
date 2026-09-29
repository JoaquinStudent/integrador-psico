"""Fixtures de integracion contra la base real.

Crea dos examinadores efimeros por la Admin API de Supabase y los borra al
terminar. Hacen falta dos porque el criterio que mas importa de SPEC-S5-04 es que
RLS tape la informacion de un examinador frente al otro, y eso no se puede
verificar con una sola cuenta.

El borrado en cascada del esquema se encarga del resto: al eliminar la cuenta cae
su perfil, y con el sus pacientes, sesiones, dibujos, trazos e indicadores.
"""

from __future__ import annotations

import uuid
from collections.abc import AsyncIterator
from dataclasses import dataclass

import httpx
import pytest
import pytest_asyncio
from sqlalchemy import text

from psicograma.adapter.outbound.postgres.engine import engine, session_for
from psicograma.config.settings import get_settings


@dataclass(frozen=True, slots=True)
class Examiner:
    id: uuid.UUID
    email: str


def _admin() -> tuple[str, dict[str, str]]:
    s = get_settings()
    key = s.supabase_service_key
    if not key:
        pytest.skip("SUPABASE_SERVICE_KEY no configurada")
    return (
        f"{s.supabase_url.rstrip('/')}/auth/v1/admin/users",
        {"Authorization": f"Bearer {key}", "apikey": key},
    )


async def _create_examiner(client: httpx.AsyncClient, nombre: str) -> Examiner:
    url, headers = _admin()
    email = f"test-{nombre}-{uuid.uuid4().hex[:8]}@psicograma.test"
    r = await client.post(
        url,
        headers=headers,
        json={
            "email": email,
            "password": uuid.uuid4().hex,
            "email_confirm": True,
            "user_metadata": {"full_name": f"Examinador de prueba {nombre}"},
        },
    )
    r.raise_for_status()
    return Examiner(id=uuid.UUID(r.json()["id"]), email=email)


async def _delete_examiner(client: httpx.AsyncClient, ex: Examiner) -> None:
    url, headers = _admin()
    await client.delete(f"{url}/{ex.id}", headers=headers)


@pytest_asyncio.fixture(scope="session")
async def examiners() -> AsyncIterator[tuple[Examiner, Examiner]]:
    """Dos examinadores efimeros. Se borran siempre, incluso si un test falla.

    La limpieza de los datos va aqui y no en el fixture de datos, por dos razones:

    - `patients.created_by` referencia `profiles(id)` sin ON DELETE CASCADE, asi
      que borrar la cuenta falla si le quedan pacientes. Primero los pacientes.
    - Borrar dentro del teardown de un fixture por test provoca un deadlock: la
      transaccion del examinador dueno todavia esta abierta y tiene lock sobre la
      fila que se intenta borrar. Al hacerlo al final de la sesion, todas esas
      transacciones ya cerraron.
    """
    async with httpx.AsyncClient(timeout=30) as client:
        a = await _create_examiner(client, "a")
        b = await _create_examiner(client, "b")
        try:
            yield a, b
        finally:
            async with engine.begin() as conn:
                await conn.execute(
                    text("delete from patients where created_by = any(:ids)"),
                    {"ids": [a.id, b.id]},
                )
            await _delete_examiner(client, a)
            await _delete_examiner(client, b)


@pytest_asyncio.fixture(scope="session")
async def perfiles_creados(examiners: tuple[Examiner, Examiner]) -> tuple[Examiner, Examiner]:
    """Confirma que el trigger handle_new_user creo el perfil de cada cuenta.

    Si esto falla, el trigger perdio su `SET search_path = public` (DT-004) y el
    registro de usuarios esta roto para toda la aplicacion.
    """
    a, b = examiners
    async with engine.connect() as conn:
        for ex in (a, b):
            n = await conn.scalar(
                text("select count(*) from profiles where id = :i"), {"i": ex.id}
            )
            assert n == 1, f"el trigger no creo el perfil de {ex.email}"
    return a, b


@pytest_asyncio.fixture
async def sesion_con_dibujo(perfiles_creados: tuple[Examiner, Examiner]):
    """Una sesion del examinador A con paciente, dibujo y 3 trazos.

    Se siembra con la conexion directa (rol postgres) a proposito: el objetivo es
    preparar el escenario, no ejercitar RLS. Los tests que verifican RLS abren su
    propia transaccion con session_for.
    """
    a, _ = perfiles_creados
    patient_id, session_id, drawing_id = uuid.uuid4(), uuid.uuid4(), uuid.uuid4()

    async with engine.begin() as conn:
        test_id = await conn.scalar(text("select id from tests where code = 'PBLL'"))

        await conn.execute(
            text(
                "insert into patients (id, full_name, document_number, birth_date, sex, "
                "created_by) "
                "values (:id, 'Paciente Prueba', :doc, '2010-05-01', 'F', :by)"
            ),
            {"id": patient_id, "doc": uuid.uuid4().hex[:10], "by": a.id},
        )
        await conn.execute(
            text(
                "insert into sessions (id, patient_id, test_id, status, created_by, completed_at) "
                "values (:id, :p, :t, 'completed', :by, now())"
            ),
            {"id": session_id, "p": patient_id, "t": test_id, "by": a.id},
        )
        await conn.execute(
            text(
                "insert into drawings (id, session_id, orientation, canvas_width, canvas_height) "
                "values (:id, :s, 'horizontal', 1000, 800)"
            ),
            {"id": drawing_id, "s": session_id},
        )
        # Tres trazos: dos de lapiz y uno de borrador, con un hueco largo entre el
        # segundo y el tercero para que la medicion detecte una pausa.
        for idx, (tool, x0, y0, ini, fin) in enumerate(
            [("pen", 400.0, 300.0, 2000, 3000),
             ("pen", 420.0, 320.0, 3200, 4000),
             ("eraser", 500.0, 400.0, 20000, 20500)]
        ):
            await conn.execute(
                text(
                    "insert into strokes (drawing_id, stroke_index, tool, started_at_ms, "
                    "ended_at_ms, point_count, avg_pressure, bbox_x, bbox_y, bbox_width, "
                    "bbox_height, points) values (:d, :i, :tool, :ini, :fin, 2, 0.5, :x, :y, "
                    "20, 20, :pts)"
                ),
                {
                    "d": drawing_id, "i": idx, "tool": tool, "ini": ini, "fin": fin,
                    "x": x0, "y": y0,
                    "pts": f'[{{"x":{x0},"y":{y0},"t":{ini},"p":0.5}},'
                           f'{{"x":{x0 + 20},"y":{y0 + 20},"t":{fin},"p":0.5}}]',
                },
            )

    # Sin teardown a proposito: borrar aqui bloquea contra la transaccion del
    # examinador dueno, que todavia esta abierta. La limpieza es al cerrar la
    # sesion de tests, en el fixture `examiners`. Cada test recibe su propio
    # paciente y su propia sesion, asi que no hay contaminacion entre tests.
    yield {"examiner": a, "patient_id": patient_id, "session_id": session_id}


@pytest_asyncio.fixture
async def db_a(perfiles_creados):
    """Transaccion con la identidad del examinador A, tal como la abre la API."""
    a, _ = perfiles_creados
    async with session_for(a.id) as s:
        yield s


@pytest_asyncio.fixture
async def db_b(perfiles_creados):
    """Transaccion con la identidad del examinador B."""
    _, b = perfiles_creados
    async with session_for(b.id) as s:
        yield s
