#!/usr/bin/env python3
"""Siembra datos de demo sobre una cuenta real, a traves de la API.

Va por HTTP y no por SQL a proposito: asi ejercita las mismas rutas que usa la
aplicacion, con el mismo token y las mismas policies. Si el script funciona, la API
funciona; si insertara por SQL directo no probaria nada.

    uv run uvicorn psicograma.adapter.inbound.http.app:app     # en otra terminal
    uv run python scripts/seed-demo.py --email tu@correo.com --password TU_PASSWORD

Cada corrida agrega 3 pacientes: la API todavia no expone la baja logica de
paciente (SPEC-S6-05), asi que no hay forma de limpiar los anteriores desde aca sin
saltarse la propia API, que es justamente lo que el script prueba.

Lo que **no** deja sembrado, porque el endpoint no existe todavia:
`stroke_metrics` queda vacio. `GET /sessions/{id}/metrics` calcula al vuelo desde
los trazos, pero solo `POST /analyze` las persiste. Los dibujos y sus trazos si
quedan guardados, que es lo que el analisis necesita para medir.
"""

from __future__ import annotations

import argparse
import asyncio
import datetime as dt
import math
import random
import sys
from pathlib import Path

import httpx

sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from psicograma.config.settings import get_settings  # noqa: E402

API = "http://localhost:8000/api/v1"

MARCA_DEMO = "[demo]"
"""Los pacientes sembrados llevan esta marca en el documento para poder
distinguirlos de los reales al usar --reset."""


# --- Pacientes ----------------------------------------------------------------

PACIENTES = [
    # (nombre, sexo, edad_anios, motivo)
    (
        "Martina Quispe Flores",
        "F",
        9,
        "Derivación de la institución educativa por dificultades atencionales y "
        "cambios recientes en la interacción con sus pares.",
    ),
    (
        "Diego Huamán Rojas",
        "M",
        12,
        "Consulta de los padres por retraimiento y descenso del rendimiento escolar "
        "en el último trimestre.",
    ),
    (
        "Camila Vásquez León",
        "F",
        7,
        "Evaluación psicodiagnóstica de ingreso solicitada por el centro.",
    ),
]

OBSERVACIONES = [
    "Se mostró colaboradora desde el inicio. Tomó el lápiz con firmeza y preguntó "
    "si podía usar toda la hoja. Tono de voz bajo al responder consignas.",
    "Demoró en comenzar. Verbalizó «no sé dibujar» antes del primer trazo. "
    "Borraduras frecuentes en la zona del rostro. Contacto visual intermitente.",
    "Ejecución rápida y continua. Preguntó por el paraguas al terminar la figura.",
]

VERBALIZACIONES = [
    ["Está lloviendo mucho, ¿no?", "Le voy a poner un paraguas para que no se moje."],
    ["No sé dibujar.", "¿Está bien así?"],
    ["¿Le puedo poner botas?"],
]


# --- Geometria del dibujo -----------------------------------------------------


def figura_bajo_la_lluvia(
    rng: random.Random, canvas=(1000, 800), *, tamanio: float = 0.28
) -> list[dict]:
    """Genera trazos con la forma del test: una figura humana y lluvia.

    No pretende ser un dibujo real —eso lo hace el paciente en la tablet—, pero si
    tener una geometria plausible: la figura centrada con un tamanio dado, presion
    que varia dentro de cada trazo, y tiempos crecientes con pausas ocasionales.
    Sin eso las metricas objetivas darian valores absurdos y la pantalla de analisis
    mostraria indicadores que no significan nada.
    """
    ancho, alto = canvas
    cx, cy = ancho / 2, alto / 2
    h = alto * tamanio  # altura de la figura

    trazos: list[dict] = []
    t = rng.randint(8_000, 22_000)  # latencia de inicio: el paciente duda primero

    def traza(puntos: list[tuple[float, float]], *, presion: float, dur: int) -> None:
        nonlocal t
        n = max(len(puntos), 2)
        pts = []
        for i, (x, y) in enumerate(puntos):
            # La presion sube al inicio del trazo y baja al final, como un trazo real.
            perfil = math.sin(math.pi * (i + 1) / (n + 1))
            p = max(0.05, min(1.0, presion * (0.7 + 0.5 * perfil) + rng.uniform(-0.04, 0.04)))
            pts.append({
                "x": round(x + rng.uniform(-1.5, 1.5), 1),
                "y": round(y + rng.uniform(-1.5, 1.5), 1),
                "t": round(dur * i / n),
                "p": round(p, 2),
            })
        trazos.append({
            "stroke_index": len(trazos),
            "tool": "pen",
            "started_at_ms": t,
            "ended_at_ms": t + dur,
            "points": pts,
        })
        # Hueco entre trazos; de vez en cuando una pausa larga, que el manual
        # registra como "momento de quietud" (A-5).
        t += dur + (rng.randint(15_000, 28_000) if rng.random() < 0.12 else rng.randint(200, 1400))

    def arco(x0, y0, rx, ry, desde, hasta, n=14):
        return [
            (x0 + rx * math.cos(a), y0 + ry * math.sin(a))
            for a in (desde + (hasta - desde) * i / (n - 1) for i in range(n))
        ]

    def linea(x0, y0, x1, y1, n=8):
        return [(x0 + (x1 - x0) * i / (n - 1), y0 + (y1 - y0) * i / (n - 1)) for i in range(n)]

    cabeza_r = h * 0.13
    y_cabeza = cy - h * 0.38
    y_hombros = y_cabeza + cabeza_r * 1.9
    y_cadera = cy + h * 0.10

    # La secuencia de trazado es un indicador del manual (A-6): se empieza por la
    # cabeza, que es lo mas frecuente.
    traza(arco(cx, y_cabeza, cabeza_r, cabeza_r, 0, 2 * math.pi, 22), presion=0.45, dur=1600)
    traza(linea(cx - 4, y_hombros, cx - 4, y_cadera), presion=0.5, dur=900)       # tronco
    y_brazo = y_hombros + h * 0.06
    traza(linea(cx - h * 0.16, y_brazo, cx, y_hombros + h * 0.02), presion=0.42, dur=700)
    traza(linea(cx, y_hombros + h * 0.02, cx + h * 0.16, y_brazo), presion=0.42, dur=700)
    traza(linea(cx - 4, y_cadera, cx - h * 0.10, y_cadera + h * 0.30), presion=0.48, dur=800)
    traza(linea(cx - 4, y_cadera, cx + h * 0.10, y_cadera + h * 0.30), presion=0.48, dur=800)

    # Rasgos faciales: trazos cortos y de presion baja.
    for dx in (-cabeza_r * 0.35, cabeza_r * 0.35):
        traza(arco(cx + dx, y_cabeza - cabeza_r * 0.15, 3, 3, 0, 2 * math.pi, 8),
              presion=0.3, dur=300)
    traza(arco(cx, y_cabeza + cabeza_r * 0.35, cabeza_r * 0.4, 3, 0.2, math.pi - 0.2, 10),
          presion=0.32, dur=400)

    # Paraguas (B-7): su presencia o ausencia es uno de los indicadores centrales.
    y_par = y_cabeza - cabeza_r * 2.4
    traza(arco(cx, y_par, h * 0.30, h * 0.14, math.pi, 2 * math.pi, 18), presion=0.55, dur=1400)
    traza(linea(cx, y_par, cx, y_hombros + h * 0.02), presion=0.5, dur=600)

    # Lluvia y suelo se escalan con el tamanio de la figura. Dos razones:
    #
    # 1. Es realista: quien dibuja pequeno tiende a dibujar todo pequeno.
    # 2. Si no, `area_pct` no discrimina. La metrica es la caja que contiene
    #    **todos** los trazos, asi que una lluvia que cruza la hoja la lleva al
    #    limite sin importar cuan grande sea la figura. Ver la nota al final.
    extension = 0.12 + tamanio * 0.9   # fraccion de hoja que abarca la escena
    x0, x1 = cx - ancho * extension / 2, cx + ancho * extension / 2
    for _ in range(rng.randint(26, 40)):
        x = rng.uniform(x0, x1)
        y = rng.uniform(y_par - alto * 0.06, y_cadera)
        largo = rng.uniform(12, 30) * (0.5 + tamanio)
        traza(linea(x, y, x - largo * 0.3, y + largo, 4),
              presion=rng.uniform(0.22, 0.38), dur=rng.randint(120, 260))

    traza(linea(x0, y_cadera + h * 0.32, x1, y_cadera + h * 0.32, 12), presion=0.4, dur=1100)

    # Algunos borrados (B-3): el paciente corrige.
    for _ in range(rng.randint(0, 4)):
        x = cx + rng.uniform(-cabeza_r, cabeza_r)
        y = y_cabeza + rng.uniform(-cabeza_r * 0.5, cabeza_r * 0.5)
        trazos.append({
            "stroke_index": len(trazos),
            "tool": "eraser",
            "started_at_ms": t,
            "ended_at_ms": t + 400,
            "points": [
                {"x": round(x, 1), "y": round(y, 1), "t": 0, "p": 0.6},
                {"x": round(x + 14, 1), "y": round(y + 10, 1), "t": 400, "p": 0.6},
            ],
        })
        t += 900

    return trazos


# --- Cliente ------------------------------------------------------------------


class Api:
    def __init__(self, client: httpx.AsyncClient, token: str) -> None:
        self._c = client
        self._h = {"Authorization": f"Bearer {token}"}

    async def _pedir(self, metodo: str, ruta: str, **kw):
        r = await self._c.request(metodo, f"{API}{ruta}", headers=self._h, **kw)
        if r.status_code >= 400:
            detalle = r.json().get("detail", r.text) if r.text.startswith("{") else r.text
            raise SystemExit(f"  FALLO {metodo} {ruta} -> {r.status_code}: {detalle}")
        return r.json() if r.content and r.status_code != 204 else None

    get = lambda self, r: self._pedir("GET", r)                       # noqa: E731
    post = lambda self, r, j=None: self._pedir("POST", r, json=j)     # noqa: E731
    put = lambda self, r, j=None: self._pedir("PUT", r, json=j)       # noqa: E731
    patch = lambda self, r, j=None: self._pedir("PATCH", r, json=j)   # noqa: E731


async def token_de(email: str, password: str) -> str:
    s = get_settings()
    async with httpx.AsyncClient(timeout=30) as c:
        r = await c.post(
            f"{s.supabase_url.rstrip('/')}/auth/v1/token?grant_type=password",
            headers={"apikey": s.supabase_service_key},
            json={"email": email, "password": password},
        )
    if r.status_code >= 400:
        raise SystemExit(f"no se pudo autenticar a {email}: {r.status_code} {r.text[:120]}")
    return r.json()["access_token"]


# --- Siembra ------------------------------------------------------------------


async def sembrar(api: Api, rng: random.Random) -> None:
    hoy = dt.date.today()
    corrida = dt.datetime.now().strftime("%m%d%H%M")
    marcas = [m["code"] for m in await api.get("/catalogs/quick-marks")]
    actitudes = [a["code"] for a in await api.get("/catalogs/attitudes")]

    for i, (nombre, sexo, edad, motivo) in enumerate(PACIENTES):
        nacimiento = hoy.replace(year=hoy.year - edad) - dt.timedelta(days=rng.randint(0, 300))
        # El documento lleva un sufijo unico por corrida y **no** sale del `rng`:
        # con la semilla fija se repetiria, y `UNIQUE (created_by, document_number)`
        # no distingue activos de inactivos, asi que desactivar no libera el numero.
        # La semilla sigue rigiendo la geometria, que es lo que interesa reproducir.
        documento = f"{MARCA_DEMO}{corrida}{i}"
        paciente = await api.post("/patients", {
            "full_name": nombre,
            "document_number": documento,
            "birth_date": nacimiento.isoformat(),
            "sex": sexo,
        })
        print(f"\n  {nombre} ({paciente['age']} años)")

        sesion = await api.post("/sessions", {
            "patient_id": paciente["id"],
            "test_code": "PBLL",
            "reason": motivo,
        })
        sid = sesion["id"]

        await api.post(f"/sessions/{sid}/consent", {
            "audio_authorized": i != 1,   # uno sin autorizacion de audio, a proposito
            "digital_authorized": True,
            "confidential_ack": True,
        })
        await api.patch(f"/sessions/{sid}", {"status": "active"})

        # Tamanios distintos para que disparen indicadores DIM distintos.
        tamanio = (0.10, 0.28, 0.62)[i]
        trazos = figura_bajo_la_lluvia(rng, tamanio=tamanio)
        await api.put(f"/sessions/{sid}/drawing", {
            "canvas_width": 1000,
            "canvas_height": 800,
            "orientation": "horizontal",
            "strokes": trazos,
        })

        await api.put(f"/sessions/{sid}/observations", {
            "additional_notes": OBSERVACIONES[i],
            "attitudes": rng.sample(actitudes, rng.randint(1, 3)),
        })
        for codigo in rng.sample(marcas, rng.randint(2, 4)):
            await api.post(f"/sessions/{sid}/quick-marks", {
                "mark_code": codigo,
                "marked_at_ms": rng.randint(20_000, 400_000),
            })

        await api.post(f"/sessions/{sid}/finalize")

        m = await api.get(f"/sessions/{sid}/metrics")
        print(f"    {len(trazos)} trazos · {m['area_pct'] * 100:.1f}% de la hoja · "
              f"latencia {m['latency_ms'] / 1000:.1f}s · {m['pause_count']} pausas · "
              f"{m['erase_count']} borrados · presión {m['pressure_avg']:.2f}")


async def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--email", required=True)
    ap.add_argument("--password", required=True)
    ap.add_argument("--seed", type=int, default=42, help="semilla de la geometria del dibujo")
    args = ap.parse_args()

    rng = random.Random(args.seed)
    token = await token_de(args.email, args.password)

    async with httpx.AsyncClient(timeout=60) as client:
        api = Api(client, token)
        try:
            await api.get("/tests")
        except SystemExit:
            raise SystemExit(
                f"la API no responde en {API}. Levantala con:\n"
                "  uv run uvicorn psicograma.adapter.inbound.http.app:app"
            ) from None

        print(f"sembrando como {args.email}")
        await sembrar(api, rng)

    print(f"\nlisto. Los pacientes de demo llevan {MARCA_DEMO} en el documento.")
    print("Cada corrida agrega 3 pacientes nuevos: la API todavia no expone la baja")
    print("logica de paciente, que es SPEC-S6-05. Hasta entonces se acumulan.")


if __name__ == "__main__":
    asyncio.run(main())


# =============================================================================
# NOTA: limite de `area_pct` para los indicadores de dimension (A-1)
# =============================================================================
#
# `measure_drawing` calcula `area_pct` como la caja que contiene **todos** los
# trazos de lapiz. En el test Persona bajo la lluvia eso incluye la lluvia y la
# linea de suelo, que suelen cruzar la hoja.
#
# Consecuencia: `area_pct` mide la extension de la **escena**, no el tamanio de la
# **figura humana**, que es lo que el manual interpreta en A-1 (DIM-01 a DIM-04).
# Un dibujo con figura pequena y lluvia amplia da un area alta y dispara DIM-02 o
# DIM-03 cuando el manual leeria DIM-01.
#
# Es una limitacion heredada de la version TS, no la introduce este script — aca
# solo se hizo visible. Para resolverla habria que segmentar la figura del fondo,
# que es reconocimiento de formas y esta fuera del alcance declarado en el
# Capitulo 1 ("la deteccion automatica de elementos graficos de micro-detalle
# presenta una precision limitada, motivo por el cual dichos indicadores se
# presentan como verificacion profesional").
#
# Mitigacion actual, coherente con ese alcance: los indicadores DIM se presentan al
# examinador como **sugerencia** con su medicion visible, y el es quien valida. El
# sistema no afirma que el dibujo sea pequeno: dice que midio un area y cual fue.
# =============================================================================
