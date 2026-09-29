# SPEC-S6-06: Panel de Control con Datos Consolidados

> Estado: SPEC_READY | Sprint: 6 | Epica: Panel | Realiza: RF-40

---

## Descripcion

El panel ya existe y ya muestra KPI reales (SPEC-S2-01), pero los calcula con varias consultas desde
el navegador. Al cerrar la frontera de datos (SPEC-S5-06) esas consultas desaparecen: los indicadores
pasan a resolverse en un solo endpoint.

Es mas que una migracion mecanica. Los tres KPI comparten una definicion que hoy vive duplicada en el
cliente —sobre todo "evaluaciones pendientes", que es la misma regla que usa el filtro de pacientes y
que ahora tambien usa la validacion del informe. Cuando la misma definicion esta escrita en tres
lugares, se desincroniza. Aqui queda en uno.

**Mock de referencia:** `mocks/dashboard-principal/screen.png`

---

## Criterios de Aceptacion (Given-When-Then)

### Escenario 1: Un solo endpoint resuelve el panel
```
GIVEN un examinador autenticado
WHEN abre el panel de control
THEN se hace una unica request a GET /api/v1/dashboard/summary
AND la respuesta trae sessions_this_week, pending_analysis, active_patients y recent_sessions
```

### Escenario 2: Sesiones de la semana
```
GIVEN 4 sesiones creadas en la semana en curso y 7 de semanas anteriores
WHEN se consulta el resumen
THEN sessions_this_week es 4
AND la semana se cuenta de lunes a domingo en la zona horaria de Lima
```

### Escenario 3: Evaluaciones pendientes
```
GIVEN 3 sesiones completed sin informe validado y 5 con informe validado
WHEN se consulta el resumen
THEN pending_analysis es 3
AND el valor coincide con el filtro "Con evaluacion pendiente" del listado de pacientes
```

### Escenario 4: Pacientes activos
```
GIVEN 12 pacientes con is_active true y 4 desactivados
WHEN se consulta el resumen
THEN active_patients es 12
```

### Escenario 5: Sesiones recientes
```
GIVEN sesiones de distintas fechas
WHEN se consulta el resumen
THEN recent_sessions trae las ultimas 5 ordenadas de la mas nueva a la mas antigua
AND cada una incluye el nombre del paciente, el test y su estado
```

### Escenario 6: El panel solo ve lo del examinador
```
GIVEN dos examinadores con pacientes y sesiones propias
WHEN cada uno consulta su resumen
THEN los numeros de uno no incluyen nada del otro
```

### Escenario 7: Centro sin datos
```
GIVEN un examinador recien registrado, sin pacientes ni sesiones
WHEN abre el panel
THEN los tres KPI son 0
AND recent_sessions es una lista vacia
AND se muestra un estado vacio que invita a registrar el primer paciente
```

### Escenario 8: La definicion de pendiente es unica
```
GIVEN la regla "sesion completed sin informe validated"
WHEN se revisa el codigo
THEN la definicion esta implementada una sola vez en el backend
AND el panel, el filtro de pacientes y la validacion del informe la consumen de ahi
```

### Escenario 9: Validar un informe actualiza el panel
```
GIVEN pending_analysis vale 3
WHEN el examinador valida uno de esos informes y vuelve al panel
THEN pending_analysis vale 2
```

---

## Scope

**IN:**
- `GET /dashboard/summary` que resuelve los tres KPI y las sesiones recientes
- Una unica implementacion de la regla de evaluacion pendiente, reutilizada por el filtro de pacientes
- Migracion de `DashboardPage` para consumir el endpoint en vez de consultar la base
- Estado vacio cuando no hay datos

**OUT:**
- Nuevos KPI o graficos: se mantiene lo que el mock define
- Rango de fechas configurable
- Proximas citas: no hay modulo de agenda en esta version
- Comparativas entre examinadores o vista de supervision
- Cache del resumen: se mide antes de optimizar

---

## Dependencias

| Dependencia | Tipo | Estado |
|---|---|---|
| SPEC-S5-04 (repositorios) | Feature | BLOQUEANTE |
| SPEC-S5-06 (cliente de API) | Feature | BLOQUEANTE |
| SPEC-S6-03 (validacion de informes) | Feature | El escenario 9 lo necesita |
| SPEC-S6-05 (baja logica) | Feature | El escenario 4 lo necesita |
| `mocks/dashboard-principal/code.html` | Diseno | Existe |

---

## Archivos a Crear/Modificar

| Archivo | Accion |
|---|---|
| `backend/src/psicograma/application/dashboard_summary.py` | Crear |
| `backend/src/psicograma/adapter/inbound/http/routers/dashboard.py` | Crear |
| `backend/src/psicograma/adapter/outbound/postgres/repositories.py` | Modificar (agregados) |
| `frontend/src/pages/DashboardPage.tsx` | Modificar (consumir el endpoint) |
| `frontend/src/lib/dashboard.ts` | Crear |
| `backend/tests/adapter/test_dashboard_api.py` | Crear |

---

## Validacion de Dominio

- "Evaluacion pendiente" es sesion con `status = 'completed'` sin informe con `status = 'validated'`.
  Esa es la definicion y no admite variantes por pantalla
- Los nombres de la respuesta en snake_case, segun `domain.md`
- La semana se calcula en la zona horaria de Lima, no en UTC, porque el examinador razona en su
  calendario local
- Los agregados respetan RLS: el examinador solo cuenta lo propio (RNF-15)
