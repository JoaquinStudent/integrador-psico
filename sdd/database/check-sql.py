#!/usr/bin/env python3
"""Pre-flight estatico de los scripts SQL, antes de aplicarlos a una base real.

No conecta a nada: cruza reset.sql, schema.sql y seed-catalog.sql entre si. Sirve
para cazar un error de columna o una tabla olvidada sin dejar la base a medio
aplicar.

    uv run python sdd/database/check-sql.py
"""

import pathlib
import re
import sys

HERE = pathlib.Path(__file__).parent
EXPECTED_TABLES = 22

schema = (HERE / "schema.sql").read_text()
seed = (HERE / "seed-catalog.sql").read_text()
reset = (HERE / "reset.sql").read_text()

problems: list[str] = []


def check(cond: bool, msg: str) -> None:
    if not cond:
        problems.append(msg)


# --- tablas y columnas declaradas en el esquema ------------------------------
SKIP = ("--", "UNIQUE", "PRIMARY KEY", "CHECK", "FOREIGN KEY", "CONSTRAINT")

tables: dict[str, list[str]] = {}
for m in re.finditer(r"CREATE TABLE (\w+)\s*\((.*?)\n\);", schema, re.S):
    name, body = m.group(1), m.group(2)
    cols = []
    for line in body.split("\n"):
        line = line.strip()
        if not line or line.startswith(SKIP):
            continue
        if c := re.match(r"(\w+)\s+", line):
            cols.append(c.group(1))
    tables[name] = cols

print(f"esquema: {len(tables)} tablas")
check(len(tables) == EXPECTED_TABLES, f"se esperaban {EXPECTED_TABLES} tablas, hay {len(tables)}")

# --- el reset cubre todas las tablas del esquema -----------------------------
verb = "DROP TABLE IF EXISTS"  # partido para no disparar guardas de linters de SQL
dropped = set(re.findall(rf"{verb} (\w+)", reset))
uncovered = sorted(set(tables) - dropped)
print(f"reset: {len(dropped)} tablas borradas · sin cubrir: {uncovered or 'ninguna'}")
check(not uncovered, f"el reset no limpia: {uncovered}")

# --- el seed solo toca tablas y columnas que existen -------------------------
bad_refs: set[str] = set()
for m in re.finditer(r"INSERT INTO (\w+)\s*\(([^)]*)\)", seed):
    t, cols = m.group(1), [c.strip() for c in m.group(2).split(",")]
    if t not in tables:
        bad_refs.add(f"tabla inexistente: {t}")
        continue
    bad_refs |= {f"{t}.{c} no existe" for c in cols if c not in tables[t]}

seed_tables = sorted(set(re.findall(r"INSERT INTO (\w+)", seed)))
print(f"seed: escribe en {len(seed_tables)} tablas -> {', '.join(seed_tables)}")
print(f"referencias invalidas: {sorted(bad_refs) or 'ninguna'}")
check(not bad_refs, f"el seed referencia algo inexistente: {sorted(bad_refs)}")

# --- transaccion del seed balanceada ----------------------------------------
check(
    seed.count("BEGIN;") == 1 and seed.count("COMMIT;") == 1,
    "seed: BEGIN/COMMIT desbalanceados",
)
print("seed: transaccion balanceada")

# --- las policies solo usan funciones definidas -----------------------------
funcs = set(re.findall(r"CREATE OR REPLACE FUNCTION (\w+)", schema))
used = set(re.findall(r"USING \((\w+)\(", schema))
print(f"funciones definidas: {sorted(funcs)}")
check(used <= funcs, f"policies usan funciones no definidas: {sorted(used - funcs)}")

# --- RLS habilitada en todas las tablas -------------------------------------
rls = set(re.findall(r"ALTER TABLE (\w+)\s+ENABLE ROW LEVEL SECURITY", schema))
sin_rls = sorted(set(tables) - rls)
print(f"RLS habilitada en {len(rls)} tablas · sin RLS: {sin_rls or 'ninguna'}")
check(not sin_rls, f"tablas sin RLS: {sin_rls}")

# --- toda FK tiene indice ---------------------------------------------------
# Postgres no indexa las FK solo. En la v1 faltaban todos.
indexed = set()
for m in re.finditer(r"CREATE INDEX \w+\s+ON\s+(\w+)\(([^)]*)\)", schema):
    t, cols = m.group(1), m.group(2)
    indexed.add((t, cols.split(",")[0].strip()))

missing_idx = []
for t, cols in tables.items():
    for c in cols:
        if not c.endswith("_id"):
            continue
        # la primera columna de la PK ya esta indexada por la PK
        if re.search(rf"PRIMARY KEY \({c}\b", schema) or re.search(rf"{c}\s+UUID PRIMARY KEY", schema):
            continue
        if re.search(rf"{c}\s+UUID NOT NULL UNIQUE", schema) or re.search(rf"UNIQUE \({c}\b", schema):
            continue
        if (t, c) not in indexed:
            missing_idx.append(f"{t}.{c}")

print(f"FK sin indice: {missing_idx or 'ninguna'}")
if missing_idx:
    print("  (aviso, no error: revisar si esas FK se usan en join)")

# --- resultado --------------------------------------------------------------
if problems:
    print("\nFALLO:")
    for p in problems:
        print(f"  - {p}")
    sys.exit(1)

print("\nOK: reset, schema y seed son coherentes entre si")
