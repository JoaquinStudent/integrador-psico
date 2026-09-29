"""Tests de la API con tokens reales del proyecto.

No se simula la autenticacion: el token lo emite Supabase Auth y lo verifica
`auth.py` contra el JWKS, igual que en produccion. Un mock ahi taparia
precisamente el bug que encontramos —que el proyecto firma con ES256 y el codigo
esperaba HS256—, que es el tipo de fallo que solo aparece contra el sistema real.
"""

from __future__ import annotations

import uuid

import httpx
import pytest
import pytest_asyncio
from fastapi.testclient import TestClient

from psicograma.adapter.inbound.http.app import app
from psicograma.config.settings import get_settings


async def _token(email: str) -> str:
    """Inicia sesion con la contraseña que fijo el fixture y devuelve el access token."""
    s = get_settings()
    async with httpx.AsyncClient(timeout=30) as c:
        r = await c.post(
            f"{s.supabase_url.rstrip('/')}/auth/v1/token?grant_type=password",
            headers={"apikey": s.supabase_service_key},
            json={"email": email, "password": _PASSWORD},
        )
    r.raise_for_status()
    return r.json()["access_token"]


_PASSWORD = "psicograma-test-" + uuid.uuid4().hex[:12]


@pytest_asyncio.fixture(scope="session")
async def cliente_a(perfiles_creados) -> httpx.AsyncClient:
    """Cliente HTTP autenticado como el examinador A."""
    a, _ = perfiles_creados
    await _fijar_password(a)
    token = await _token(a.email)
    return TestClient(app, headers={"Authorization": f"Bearer {token}"})


@pytest_asyncio.fixture(scope="session")
async def cliente_b(perfiles_creados) -> httpx.AsyncClient:
    _, b = perfiles_creados
    await _fijar_password(b)
    token = await _token(b.email)
    return TestClient(app, headers={"Authorization": f"Bearer {token}"})


async def _fijar_password(ex) -> None:
    """El fixture crea la cuenta con una contraseña aleatoria distinta; aca se
    unifica para poder pedir el token."""
    s = get_settings()
    async with httpx.AsyncClient(timeout=30) as c:
        r = await c.put(
            f"{s.supabase_url.rstrip('/')}/auth/v1/admin/users/{ex.id}",
            headers={
                "Authorization": f"Bearer {s.supabase_service_key}",
                "apikey": s.supabase_service_key,
            },
            json={"password": _PASSWORD},
        )
    r.raise_for_status()


# =============================================================================
# Autenticacion
# =============================================================================


def test_sin_token_es_401():
    r = TestClient(app).get("/api/v1/tests")
    assert r.status_code == 401
    assert r.headers["content-type"].startswith("application/problem+json")


def test_token_invalido_es_401():
    r = TestClient(app, headers={"Authorization": "Bearer no-es-un-token"}).get(
        "/api/v1/tests"
    )
    assert r.status_code == 401


def test_token_real_pasa_la_verificacion(cliente_a):
    """Prueba que auth.py verifica contra el JWKS con ES256."""
    assert cliente_a.get("/api/v1/tests").status_code == 200


# =============================================================================
# Catalogos
# =============================================================================


def test_catalogo_de_tests(cliente_a):
    tests = cliente_a.get("/api/v1/tests").json()
    codigos = {t["code"] for t in tests}
    assert codigos == {"PBLL", "HTP", "DF", "DFH"}
    assert next(t for t in tests if t["code"] == "PBLL")["is_available"] is True


def test_catalogo_de_indicadores(cliente_a):
    r = cliente_a.get("/api/v1/tests/PBLL/indicators")
    assert r.status_code == 200
    assert len(r.json()) == 201


def test_checklist_de_verificacion_profesional(cliente_a):
    """Los `manual` son los que exigen juicio del examinador."""
    r = cliente_a.get("/api/v1/tests/PBLL/indicators?detection=manual")
    assert len(r.json()) == 153


def test_indicadores_por_seccion(cliente_a):
    r = cliente_a.get("/api/v1/tests/PBLL/indicators?section=A-1")
    codigos = [i["code"] for i in r.json()]
    assert codigos == ["DIM-01", "DIM-02", "DIM-03", "DIM-04"]


def test_marcas_y_actitudes(cliente_a):
    assert len(cliente_a.get("/api/v1/catalogs/quick-marks").json()) == 6
    assert len(cliente_a.get("/api/v1/catalogs/attitudes").json()) == 8


# =============================================================================
# Pacientes
# =============================================================================


def _paciente() -> dict:
    return {
        "full_name": "Paciente API",
        "document_number": uuid.uuid4().hex[:10],
        "birth_date": "2012-03-15",
        "sex": "F",
    }


def test_crear_y_leer_paciente(cliente_a):
    creado = cliente_a.post("/api/v1/patients", json=_paciente())
    assert creado.status_code == 201
    pid = creado.json()["id"]

    leido = cliente_a.get(f"/api/v1/patients/{pid}").json()
    assert leido["full_name"] == "Paciente API"
    assert leido["age"] is not None, "la edad la calcula el backend, no el cliente"
    assert leido["is_active"] is True


def test_el_cliente_no_puede_fijar_el_dueno(cliente_a, perfiles_creados):
    """`created_by` sale del token. Si viniera del cuerpo, un cliente podria crear
    pacientes a nombre de otro examinador."""
    _, b = perfiles_creados
    r = cliente_a.post("/api/v1/patients", json={**_paciente(), "created_by": str(b.id)})
    assert r.status_code == 201
    # El campo se ignora: el paciente queda del examinador autenticado, que es el
    # unico que puede leerlo.
    assert cliente_a.get(f"/api/v1/patients/{r.json()['id']}").status_code == 200


def test_documento_duplicado_es_409(cliente_a):
    data = _paciente()
    assert cliente_a.post("/api/v1/patients", json=data).status_code == 201
    assert cliente_a.post("/api/v1/patients", json=data).status_code == 409


def test_fecha_de_nacimiento_futura_es_422(cliente_a):
    r = cliente_a.post(
        "/api/v1/patients", json={**_paciente(), "birth_date": "2099-01-01"}
    )
    assert r.status_code == 422


def test_paciente_de_otro_examinador_es_404(cliente_a, cliente_b):
    pid = cliente_a.post("/api/v1/patients", json=_paciente()).json()["id"]
    assert cliente_b.get(f"/api/v1/patients/{pid}").status_code == 404


def test_listado_no_mezcla_examinadores(cliente_a, cliente_b):
    pid = cliente_a.post("/api/v1/patients", json=_paciente()).json()["id"]
    ids_de_b = {p["id"] for p in cliente_b.get("/api/v1/patients").json()["items"]}
    assert pid not in ids_de_b


# =============================================================================
# Sesiones
# =============================================================================


def _sesion(cliente) -> str:
    pid = cliente.post("/api/v1/patients", json=_paciente()).json()["id"]
    r = cliente.post("/api/v1/sessions", json={"patient_id": pid, "test_code": "PBLL"})
    assert r.status_code == 201, r.text
    return r.json()["id"]


def test_crear_sesion_embebe_el_test(cliente_a):
    pid = cliente_a.post("/api/v1/patients", json=_paciente()).json()["id"]
    r = cliente_a.post("/api/v1/sessions", json={"patient_id": pid, "test_code": "PBLL"})
    assert r.status_code == 201
    body = r.json()
    assert body["status"] == "setup"
    # `test_type` (texto) paso a FK; la API devuelve el test resuelto.
    assert body["test"]["code"] == "PBLL"


def test_crear_sesion_arma_consentimiento_y_observaciones(cliente_a):
    """Una transaccion, no cuatro INSERT del cliente."""
    sid = _sesion(cliente_a)
    assert cliente_a.get(f"/api/v1/sessions/{sid}/consent").status_code == 200
    assert cliente_a.get(f"/api/v1/sessions/{sid}/observations").status_code == 200


def test_test_no_disponible_es_409(cliente_a):
    pid = cliente_a.post("/api/v1/patients", json=_paciente()).json()["id"]
    r = cliente_a.post("/api/v1/sessions", json={"patient_id": pid, "test_code": "HTP"})
    assert r.status_code == 409


def test_paciente_ajeno_no_permite_crear_sesion(cliente_a, cliente_b):
    pid = cliente_a.post("/api/v1/patients", json=_paciente()).json()["id"]
    r = cliente_b.post("/api/v1/sessions", json={"patient_id": pid, "test_code": "PBLL"})
    assert r.status_code == 404


def test_transicion_invalida_es_409(cliente_a):
    """De `setup` no se salta a `completed`."""
    sid = _sesion(cliente_a)
    r = cliente_a.patch(f"/api/v1/sessions/{sid}", json={"status": "completed"})
    assert r.status_code == 409


def test_consentimiento_habilita_el_paso_siguiente(cliente_a):
    sid = _sesion(cliente_a)
    r = cliente_a.post(
        f"/api/v1/sessions/{sid}/consent",
        json={
            "audio_authorized": True,
            "digital_authorized": True,
            "confidential_ack": True,
        },
    )
    assert r.status_code == 200
    assert cliente_a.get(f"/api/v1/sessions/{sid}").json()["status"] == "consent"


def test_sin_reconocimiento_de_confidencialidad_es_422(cliente_a):
    """RNF-14: no es una casilla de formulario, es una restriccion clinica."""
    sid = _sesion(cliente_a)
    r = cliente_a.post(
        f"/api/v1/sessions/{sid}/consent",
        json={
            "audio_authorized": True,
            "digital_authorized": True,
            "confidential_ack": False,
        },
    )
    assert r.status_code == 422


def _activar(cliente, sid: str) -> None:
    cliente.post(
        f"/api/v1/sessions/{sid}/consent",
        json={
            "audio_authorized": True,
            "digital_authorized": True,
            "confidential_ack": True,
        },
    )
    cliente.patch(f"/api/v1/sessions/{sid}", json={"status": "active"})


def test_finalizar_es_idempotente(cliente_a):
    """Los dos dispositivos pueden finalizar; el segundo no debe recibir 409."""
    sid = _sesion(cliente_a)
    _activar(cliente_a, sid)
    assert cliente_a.post(f"/api/v1/sessions/{sid}/finalize").status_code == 200
    assert cliente_a.post(f"/api/v1/sessions/{sid}/finalize").status_code == 200


# =============================================================================
# Dibujo
# =============================================================================


def _dibujo(n_trazos: int = 3) -> dict:
    return {
        "canvas_width": 1000,
        "canvas_height": 800,
        "orientation": "horizontal",
        "strokes": [
            {
                "stroke_index": i,
                "tool": "pen",
                "started_at_ms": 2000 + i * 1000,
                "ended_at_ms": 2500 + i * 1000,
                "points": [
                    {"x": 400 + i * 10, "y": 300 + i * 10, "t": 0, "p": 0.5},
                    {"x": 420 + i * 10, "y": 320 + i * 10, "t": 500, "p": 0.6},
                ],
            }
            for i in range(n_trazos)
        ],
    }


def test_guardar_y_leer_dibujo(cliente_a):
    sid = _sesion(cliente_a)
    _activar(cliente_a, sid)

    assert cliente_a.put(f"/api/v1/sessions/{sid}/drawing", json=_dibujo()).status_code == 204

    leido = cliente_a.get(f"/api/v1/sessions/{sid}/drawing").json()
    assert leido["canvas_width"] == 1000
    assert [s["stroke_index"] for s in leido["strokes"]] == [0, 1, 2]
    assert leido["strokes"][0]["points"][0]["p"] == pytest.approx(0.5)


def test_guardar_el_dibujo_reemplaza_en_vez_de_acumular(cliente_a):
    sid = _sesion(cliente_a)
    _activar(cliente_a, sid)
    cliente_a.put(f"/api/v1/sessions/{sid}/drawing", json=_dibujo(5))
    cliente_a.put(f"/api/v1/sessions/{sid}/drawing", json=_dibujo(2))

    leido = cliente_a.get(f"/api/v1/sessions/{sid}/drawing").json()
    assert len(leido["strokes"]) == 2


def test_trazo_con_tiempos_incoherentes_es_422(cliente_a):
    sid = _sesion(cliente_a)
    _activar(cliente_a, sid)
    malo = _dibujo(1)
    malo["strokes"][0]["ended_at_ms"] = 0  # anterior al inicio
    assert cliente_a.put(f"/api/v1/sessions/{sid}/drawing", json=malo).status_code == 422


def test_dibujo_de_otro_examinador_es_404(cliente_a, cliente_b):
    sid = _sesion(cliente_a)
    _activar(cliente_a, sid)
    cliente_a.put(f"/api/v1/sessions/{sid}/drawing", json=_dibujo())
    assert cliente_b.get(f"/api/v1/sessions/{sid}/drawing").status_code == 404


def test_metricas_se_calculan_al_vuelo_si_no_hay_analisis(cliente_a):
    """El examinador ve metricas sin haber corrido el analisis todavia."""
    sid = _sesion(cliente_a)
    _activar(cliente_a, sid)
    cliente_a.put(f"/api/v1/sessions/{sid}/drawing", json=_dibujo(3))
    cliente_a.post(f"/api/v1/sessions/{sid}/finalize")

    m = cliente_a.get(f"/api/v1/sessions/{sid}/metrics").json()
    assert m["stroke_count"] == 3
    assert m["erase_count"] == 0
    assert m["pressure_avg"] > 0


# =============================================================================
# Observaciones
# =============================================================================


def test_guardar_observaciones_y_actitudes(cliente_a):
    sid = _sesion(cliente_a)
    r = cliente_a.put(
        f"/api/v1/sessions/{sid}/observations",
        json={"additional_notes": "Colaborador, pregunto por el paraguas",
               "attitudes": ["colaborador", "ansioso"]},
    )
    assert r.status_code == 200
    body = r.json()
    assert body["additional_notes"].startswith("Colaborador")
    assert set(body["attitudes"]) == {"colaborador", "ansioso"}


def test_las_actitudes_se_reemplazan_no_se_acumulan(cliente_a):
    sid = _sesion(cliente_a)
    cliente_a.put(
        f"/api/v1/sessions/{sid}/observations",
        json={"additional_notes": "", "attitudes": ["colaborador", "ansioso"]},
    )
    r = cliente_a.put(
        f"/api/v1/sessions/{sid}/observations",
        json={"additional_notes": "", "attitudes": ["meticuloso"]},
    )
    assert r.json()["attitudes"] == ["meticuloso"]


def test_marca_rapida_guarda_su_offset(cliente_a):
    sid = _sesion(cliente_a)
    _activar(cliente_a, sid)
    assert cliente_a.post(
        f"/api/v1/sessions/{sid}/quick-marks",
        json={"mark_code": "pausa_prolongada", "marked_at_ms": 45_000},
    ).status_code == 204

    marcas = cliente_a.get(f"/api/v1/sessions/{sid}/observations").json()["quick_marks"]
    assert marcas == [{"mark_code": "pausa_prolongada", "marked_at_ms": 45_000}]


def test_marca_inexistente_en_el_catalogo_es_409(cliente_a):
    """El catalogo impide inventar marcas desde el cliente, y el mensaje dice cual
    es el problema en vez de filtrar el nombre de la constraint."""
    sid = _sesion(cliente_a)
    r = cliente_a.post(
        f"/api/v1/sessions/{sid}/quick-marks",
        json={"mark_code": "no-existe", "marked_at_ms": 1000},
    )
    assert r.status_code == 409
    assert "no-existe" in r.json()["detail"]
    assert "fkey" not in r.text, "no se filtran nombres de constraint al cliente"
