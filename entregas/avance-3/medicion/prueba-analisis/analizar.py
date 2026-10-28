"""Analisis de la medicion pre/post (protocolo-medicion.md). Solo libreria estandar.

Uso: python3 analizar.py [archivo.csv]     (por defecto, el CSV simulado de esta carpeta)

Tiempo neto = (validacion - cierre) - interrupciones, en minutos. Se emparejan la
k-esima medicion manual y la k-esima con sistema DE CADA PSICOLOGO (el protocolo pide
"los mismos psicologos" pero no define el emparejamiento: esta es la regla adoptada).
Contraste: Wilcoxon de rangos con signo, bilateral, **exacto** por enumeracion de signos
(n <= 20): con n tan pequeno la aproximacion normal no es confiable.
"""

import csv
import itertools
import statistics
import sys
from collections import defaultdict
from datetime import datetime

DEFECTO = "SIMULADO-datos-prueba.csv"


def minutos(fila: dict) -> float:
    t = lambda h: datetime.strptime(h, "%H:%M")  # noqa: E731
    bruto = (t(fila["validacion"]) - t(fila["cierre"])).total_seconds() / 60
    neto = bruto - float(fila["interrupciones_min"] or 0)
    if neto <= 0:
        raise ValueError(f"tiempo neto no positivo en {fila['paciente']}")
    return neto


def rangos(abs_dif: list[float]) -> list[float]:
    """Rangos con promedio en empates."""
    orden = sorted(range(len(abs_dif)), key=abs_dif.__getitem__)
    r = [0.0] * len(abs_dif)
    i = 0
    while i < len(orden):
        j = i
        while j + 1 < len(orden) and abs_dif[orden[j + 1]] == abs_dif[orden[i]]:
            j += 1
        for k in range(i, j + 1):
            r[orden[k]] = (i + j) / 2 + 1
        i = j + 1
    return r


def wilcoxon_exacto(difs: list[float]) -> tuple[float, int, float]:
    """(W, n, p bilateral). Las diferencias nulas se descartan, como es convencional."""
    difs = [d for d in difs if d != 0]
    n = len(difs)
    if n == 0:
        return 0.0, 0, 1.0
    if n > 20:
        raise ValueError("n > 20: usar la aproximacion normal (scipy.stats.wilcoxon)")
    r = rangos([abs(d) for d in difs])
    w_obs = min(sum(x for x, d in zip(r, difs) if d > 0), sum(x for x, d in zip(r, difs) if d < 0))
    extremos = 0
    for signos in itertools.product((0, 1), repeat=n):
        w_pos = sum(x for x, s in zip(r, signos) if s)
        if min(w_pos, sum(r) - w_pos) <= w_obs + 1e-9:
            extremos += 1
    return w_obs, n, extremos / 2**n


def analizar(ruta: str) -> None:
    with open(ruta, newline="", encoding="utf-8") as f:
        filas = list(csv.DictReader(f))
    por = {c: defaultdict(list) for c in ("manual", "sistema")}
    for fila in filas:
        por[fila["condicion"]][fila["psicologo"]].append(minutos(fila))

    man = [m for p in por["manual"].values() for m in p]
    sis = [m for p in por["sistema"].values() for m in p]
    pares = [
        (a, b)
        for psi in por["manual"]
        for a, b in zip(por["manual"][psi], por["sistema"].get(psi, []))
    ]
    difs = [a - b for a, b in pares]
    w, n, p = wilcoxon_exacto(difs)
    mm, ms = statistics.median(man), statistics.median(sis)

    print(f"Archivo: {ruta}\n")
    print(f"{'Condicion':<10}{'n':>3}{'Mediana':>9}{'Min':>7}{'Max':>7}")
    for nombre, x in (("manual", man), ("sistema", sis)):
        print(f"{nombre:<10}{len(x):>3}{statistics.median(x):>9.1f}{min(x):>7.0f}{max(x):>7.0f}")
    print(f"\nPares (mismo psicologo, k-esimo con k-esimo): {len(pares)}")
    print(f"Reduccion de la mediana: {mm - ms:.1f} min ({(mm - ms) / mm * 100:.0f} %)")
    print(f"Wilcoxon exacto bilateral: W = {w:g}, n = {n}, p = {p:.4f}")
    print("\nEfecto de aprendizaje (informes previos -> tiempo con sistema):")
    for fila in filas:
        if fila["condicion"] == "sistema":
            print(f"  {fila['psicologo']} previos={fila['informes_previos_con_sistema']:>2}  {minutos(fila):.0f} min")


def _autoprueba() -> None:
    # Diez diferencias todas positivas: solo 2 de 2**10 patrones de signos son tan extremos.
    w, n, p = wilcoxon_exacto([float(i) for i in range(1, 11)])
    assert (w, n) == (0, 10) and abs(p - 2 / 1024) < 1e-12, (w, n, p)
    # Simetrico: p = 1.
    assert wilcoxon_exacto([1.0, -1.0])[2] == 1.0
    # Los empates reciben el rango promedio.
    assert rangos([1, 1, 2]) == [1.5, 1.5, 3]


if __name__ == "__main__":
    _autoprueba()
    analizar(sys.argv[1] if len(sys.argv) > 1 else DEFECTO)
