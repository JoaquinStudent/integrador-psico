# SPEC-S5-04: Repositorios de Persistencia y Propagacion de Identidad

> Estado: DONE | Sprint: 5 | Epica: Backend | Realiza: RNF-11, RNF-15

---

## Descripcion

Implementar los adaptadores de salida que cumplen los puertos declarados en
`backend/src/psicograma/domain/ports.py`, sobre SQLAlchemy 2.0 async.

La pieza critica no son las consultas: es que **RLS siga vigente detras del backend**. Al retirar el
acceso directo del navegador (SPEC-S5-06), el filtro por examinador queda del lado de la aplicacion.
Si esa fuera la unica capa, un `WHERE` olvidado expondria datos clinicos de otro profesional. Por eso
cada transaccion declara de quien es la request y las policies del esquema se evaluan igual que cuando
PostgREST atendia al cliente.

`session_for()` ya existe en `backend/src/psicograma/adapter/outbound/postgres/engine.py` con la
propagacion de identidad y la configuracion del pooler. Este SPEC construye los repositorios encima.

---

## Criterios de Aceptacion (Given-When-Then)

### Escenario 1: La transaccion declara la identidad
```
GIVEN un examinador autenticado con user_id conocido
WHEN se abre una transaccion con session_for(user_id)
THEN se ejecuta SET LOCAL ROLE authenticated
AND se ejecuta SET LOCAL request.jwt.claims con ese sub
AND auth.uid() dentro de la transaccion devuelve ese user_id
```

### Escenario 2: RLS tapa un filtro olvidado
```
GIVEN dos examinadores A y B, cada uno con un paciente propio
WHEN se ejecuta dentro de session_for(A) un SELECT sobre patients SIN clausula WHERE
THEN se devuelven unicamente los pacientes de A
AND el paciente de B no aparece en el resultado
```

### Escenario 3: El rol de conexion no puede saltarse RLS
```
GIVEN el rol con el que el backend conecta a Postgres
WHEN se consulta su atributo rolbypassrls en pg_roles
THEN el valor es false
```

### Escenario 4: El pooler no rompe en la segunda request
```
GIVEN el backend conectado al transaction pooler en el puerto 6543
WHEN se ejecutan dos requests consecutivas que usan la misma consulta parametrizada
THEN ninguna falla con DuplicatePreparedStatementError
```

### Escenario 5: Lectura del dibujo con trazos ordenados
```
GIVEN una sesion con 5 trazos guardados en orden 0..4
WHEN se invoca DrawingRepository.get_drawing(session_id)
THEN se devuelve un Drawing con 5 Stroke ordenados por stroke_index
AND cada Stroke trae started_at_ms, ended_at_ms y sus puntos
```

### Escenario 6: Lectura del catalogo del manual
```
GIVEN el catalogo sembrado con los 201 indicadores PBLL
WHEN se invoca IndicatorCatalog.get("DIM-01")
THEN se devuelve un CatalogEntry con section_code "A-1", section_name "Dimensiones",
     category_code "A" y detection_type "auto"
```

### Escenario 7: Solo los indicadores validados salen para el informe
```
GIVEN una sesion con 3 indicadores en estado validated y 4 en suggestion
WHEN se invoca SessionIndicatorRepository.list_validated(session_id)
THEN se devuelven exactamente los 3 validated
AND ninguno en suggestion ni en rejected
```

### Escenario 8: Persistir sugerencias es idempotente
```
GIVEN una sesion sin indicadores registrados
WHEN se invoca upsert_suggestions con la misma lista dos veces
THEN la sesion queda con una sola fila por indicator_code
AND un indicador ya validado por el examinador no vuelve a suggestion
```

### Escenario 9: Sesion de otro examinador
```
GIVEN una sesion que pertenece al examinador B
WHEN el examinador A intenta leerla mediante cualquier repositorio
THEN no se devuelve dato alguno
AND la capa HTTP lo traduce a 403
```

---

## Scope

**IN:**
- Modelos declarativos de SQLAlchemy para las tablas que consumen los puertos actuales:
  `sessions`, `drawings`, `strokes`, `stroke_metrics`, `indicator_catalog`, `manual_sections`,
  `indicator_categories`, `session_indicators`
- Implementacion de `DrawingRepository`, `IndicatorCatalog` y `SessionIndicatorRepository`
- Traduccion entre filas y objetos de dominio (los modelos de SQLAlchemy **no** cruzan la frontera:
  los repositorios devuelven dataclasses de `domain/model.py`)
- Inyeccion por `Depends` en `config/` para que los routers reciban puertos, no implementaciones
- Tests de integracion en `backend/tests/adapter/`

**OUT:**
- Repositorios de pacientes, consentimiento y observaciones (SPEC-S5-05 y siguientes)
- Repositorio de informes (Sprint 6)
- Adaptadores de Whisper, LLM, Storage y PDF (SPEC-S5-05 y Sprint 6)
- Cache de lectura del catalogo: se mide antes de optimizar
- Migraciones (SPEC-S5-07)

---

## Dependencias

| Dependencia | Tipo | Estado |
|---|---|---|
| Esquema v2 aplicado en Supabase | DB | **BLOQUEANTE** — `schema.sql` escrito, sin ejecutar |
| Catalogo sembrado | DB | `seed-catalog.sql` generado, sin ejecutar |
| Rol de conexion dedicado sin `BYPASSRLS` | DB | Por crear |
| `domain/ports.py` | Codigo | DONE (SPEC-S5-03) |
| `domain/model.py` | Codigo | DONE (SPEC-S5-03) |
| `postgres/engine.py` con `session_for()` | Codigo | DONE (SPEC-S5-03) |

---

## Archivos a Crear/Modificar

| Archivo | Accion |
|---|---|
| `backend/src/psicograma/adapter/outbound/postgres/models.py` | Crear |
| `backend/src/psicograma/adapter/outbound/postgres/repositories.py` | Crear |
| `backend/src/psicograma/config/container.py` | Crear (wiring puertos -> adaptadores) |
| `backend/tests/adapter/test_repositories.py` | Crear |
| `backend/tests/adapter/conftest.py` | Crear (sesion de prueba, dos examinadores) |

---

## Validacion de Dominio

- Tablas y columnas exactamente como en `sdd/database/schema.sql`
- `session_indicators` tiene PK compuesta `(session_id, indicator_code)`: no se agrega `id` surrogate
- `strokes.points` se lee como JSONB y se convierte a `tuple[Point, ...]`; el dominio nunca ve JSON
- El `CHECK` del esquema impide `status` distinto de `suggestion` sin `validated_by` y `validated_at`:
  el repositorio no debe intentar saltarlo, debe respetarlo
- Los modelos de SQLAlchemy viven solo en `adapter/outbound/postgres/`. Si aparecen importados desde
  `domain/`, `scripts/check-hexagon.sh` falla
