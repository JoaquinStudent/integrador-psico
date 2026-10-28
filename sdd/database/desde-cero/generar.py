#!/usr/bin/env python3
"""Genera los pasos de `desde-cero/` a partir de las fuentes de verdad.

Fuentes (no se editan aqui):
  - ../schema.sql           -> pasos 02 a 06
  - ../seed-catalog.sql     -> carpeta 08-catalogo/

Por que existe: el SQL Editor de Supabase corta el texto cuando se pega un archivo
grande (el catalogo completo pesa 110 KB y llego truncado a mitad de una sentencia).
Partido en pasos de ~17 KB cada uno es seguro de pegar, y cada paso es una transaccion.

Uso:
    python3 sdd/database/desde-cero/generar.py            # regenera los archivos
    python3 sdd/database/desde-cero/generar.py --check    # falla si algo no coincide con las fuentes
"""

from __future__ import annotations

import pathlib
import re
import sys

AQUI = pathlib.Path(__file__).parent
BD = AQUI.parent
MAX_PARTE = 18_000  # bytes por parte del catalogo

# paso -> (archivo, titulo, partes de schema.sql que incluye, por que importa)
PASOS = [
    ("02-extensiones-y-catalogos.sql", "Extensiones y tablas de catalogo", ["1"], True),
    ("03-pacientes-y-sesiones.sql", "Perfiles, pacientes y sesiones", ["2", "3"], False),
    ("04-dibujo-audio-y-observaciones.sql", "Dibujo, audio y observaciones", ["4", "5", "6"], False),
    ("05-indicadores-e-informes.sql", "Indicadores de sesion, informes y disparadores", ["7", "8", "9a"], False),
    ("06-agenda-y-google.sql", "Agenda de citas y conexion con Google", ["9b"], False),
]


def partes_del_esquema() -> tuple[str, dict[str, str]]:
    """(cabecera con la extension, {'1': texto, ..., '9a': updated_at, '9b': agenda})."""
    s = (BD / "schema.sql").read_text()
    marca = re.compile(r"(?m)^-- =+\n-- PARTE (\d+) — (.*)\n-- =+\n")
    ms = list(marca.finditer(s))
    assert len(ms) >= 9, "schema.sql no tiene el formato esperado de PARTE n"
    cabecera = s[: ms[0].start()]
    out: dict[str, str] = {}
    vistas9 = 0
    for i, m in enumerate(ms):
        fin = ms[i + 1].start() if i + 1 < len(ms) else len(s)
        clave = m.group(1)
        if clave == "9":
            clave = "9a" if "AGENDA" not in m.group(2) else "9b"
            vistas9 += 1
        out[clave] = s[m.start():fin]
    assert vistas9 == 2, "se esperaban dos bloques PARTE 9 (updated_at y agenda)"
    return cabecera, out


def envolver(n: str, titulo: str, cuerpo: str, notas: str = "") -> str:
    return (
        f"-- ============================================================================\n"
        f"-- PSICOGRAMA · desde cero · PASO {n}: {titulo}\n"
        f"-- GENERADO por desde-cero/generar.py a partir de schema.sql. No editar a mano.\n"
        f"-- Ejecutar los pasos EN ORDEN. Debe terminar en COMMIT; si el editor corto el texto, copia de nuevo.\n"
        f"{notas}"
        f"-- ============================================================================\n\n"
        f"BEGIN;\n\n{cuerpo.strip()}\n\nCOMMIT;\n"
    )


def generar_esquema() -> dict[str, str]:
    cabecera, partes = partes_del_esquema()
    ext = re.search(r'(?m)^CREATE EXTENSION IF NOT EXISTS "uuid-ossp";\s*$', cabecera)
    assert ext, "no se encontro la extension uuid-ossp en la cabecera de schema.sql"
    salida: dict[str, str] = {}
    for archivo, titulo, claves, con_ext in PASOS:
        cuerpo = ""
        if con_ext:
            cuerpo += ext.group(0) + "\n\n"
        cuerpo += "\n".join(partes[c].strip() + "\n" for c in claves)
        n = archivo[:2]
        salida[archivo] = envolver(n, titulo, cuerpo)
    return salida


def generar_catalogo() -> dict[str, str]:
    src = (BD / "seed-catalog.sql").read_text()
    cuerpo = src.split("BEGIN;\n", 1)[1].rsplit("COMMIT;", 1)[0]
    sentencias: list[str] = []
    actual: list[str] = []
    for linea in cuerpo.splitlines(True):
        actual.append(linea)
        if linea.rstrip().endswith(";") and not linea.lstrip().startswith("--"):
            sentencias.append("".join(actual))
            actual = []
    resto = "".join(actual).strip()
    assert all(l.startswith("--") or not l.strip() for l in resto.splitlines()), "texto suelto al final"
    partes: list[str] = []
    acc = ""
    for st in sentencias:
        if acc and len(acc) + len(st) > MAX_PARTE:
            partes.append(acc)
            acc = ""
        acc += st
    partes.append(acc)
    n = len(partes)
    return {
        f"08-catalogo/parte-{i}-de-{n}.sql": (
            f"-- PSICOGRAMA · desde cero · PASO 08: catalogo del manual · PARTE {i} DE {n}\n"
            f"-- GENERADO por desde-cero/generar.py a partir de seed-catalog.sql. No editar a mano.\n"
            f"-- Ejecutar las partes EN ORDEN (1 a {n}). Cada una es una transaccion y se puede repetir.\n"
            f"-- Debe terminar en COMMIT; si el editor corto el texto, copia de nuevo.\n\n"
            f"BEGIN;\n\n{p.strip()}\n\nCOMMIT;\n"
        )
        for i, p in enumerate(partes, 1)
    }


def normalizar(t: str) -> str:
    t = re.sub(r"(?m)^\s*--.*$", "", t)
    t = re.sub(r"\bBEGIN;|\bCOMMIT;", "", t)
    return re.sub(r"\s+", " ", t).strip()


def main() -> int:
    esquema = generar_esquema()
    catalogo = generar_catalogo()
    todo = {**esquema, **catalogo}

    # Verificacion: lo generado reconstruye las fuentes, sentencia por sentencia y en orden.
    _, partes = partes_del_esquema()
    original = normalizar("\n".join(partes[k] for k in ["1", "2", "3", "4", "5", "6", "7", "8", "9a", "9b"]))
    rec = normalizar("\n".join(esquema[a] for a, *_ in PASOS)).replace(
        normalizar('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'), "", 1
    )
    ok_esquema = normalizar(rec) == original
    src = (BD / "seed-catalog.sql").read_text().split("BEGIN;\n", 1)[1].rsplit("COMMIT;", 1)[0]
    ok_catalogo = normalizar("\n".join(catalogo[k] for k in sorted(catalogo, key=lambda x: int(re.search(r"parte-(\d+)", x).group(1))))) == normalizar(src)
    print(f"esquema reconstruye schema.sql : {ok_esquema}")
    print(f"catalogo reconstruye el seed   : {ok_catalogo}  ({len(catalogo)} partes)")
    if not (ok_esquema and ok_catalogo):
        return 1

    if "--check" in sys.argv:
        viejos = [k for k, v in todo.items() if not (AQUI / k).exists() or (AQUI / k).read_text() != v]
        if viejos:
            print("DESACTUALIZADOS (corre generar.py):", viejos)
            return 1
        print("los archivos coinciden con las fuentes")
        return 0

    (AQUI / "08-catalogo").mkdir(exist_ok=True)
    for f in (AQUI / "08-catalogo").glob("parte-*.sql"):
        f.unlink()
    for k, v in todo.items():
        (AQUI / k).write_text(v)
    for k, v in sorted(todo.items()):
        print(f"  {k:48} {len(v) // 1024:>2} KB")
    return 0


if __name__ == "__main__":
    sys.exit(main())
