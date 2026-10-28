"""Reglas puras de la agenda: solape de horarios y contenido del evento de Google.

Sin red ni base de datos. El evento sale de aqui y no del adaptador porque **que datos
del paciente viajan a Google es una regla de privacidad**, no un detalle de transporte
(SPEC-CAL-01): solo iniciales y un enlace, nunca nombre, documento ni motivo.
"""

from __future__ import annotations

import datetime as dt

_PARTICULAS = {"de", "del", "la", "las", "los", "y", "san", "santa"}


def se_cruzan(
    a_ini: dt.datetime, a_fin: dt.datetime, b_ini: dt.datetime, b_fin: dt.datetime
) -> bool:
    """Intervalos semiabiertos: que una cita termine cuando la otra empieza no es cruce."""
    return a_ini < b_fin and b_ini < a_fin


def iniciales(nombre_completo: str) -> str:
    """'Juan Perez de la Cruz' -> 'J.P.C.'. Las particulas no cuentan."""
    letras = [p[0].upper() for p in nombre_completo.split() if p.lower() not in _PARTICULAS]
    return "".join(f"{x}." for x in letras[:4]) or "?"


def evento_google(
    *,
    iniciales_paciente: str,
    test_code: str,
    inicio: dt.datetime,
    fin: dt.datetime,
    enlace: str,
    zona: str,
) -> dict:
    return {
        "summary": f"Sesión {test_code} · {iniciales_paciente}",
        "description": f"Cita de Psicograma.\n{enlace}",
        "start": {"dateTime": inicio.isoformat(), "timeZone": zona},
        "end": {"dateTime": fin.isoformat(), "timeZone": zona},
        # Sin invitados ni videollamada: el evento no debe notificar a nadie.
        "reminders": {"useDefault": True},
    }
