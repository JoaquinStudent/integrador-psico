# api-contracts.md — Contrato de la API v2

> Ultima actualizacion: 2026-09-28
> Reemplaza el contrato v1 (3 Edge Functions + acceso directo del cliente a PostgREST).

---

## Cambio de arquitectura respecto de v1

En v1 el navegador tenia la `anon key` y consultaba las 10 tablas directamente via PostgREST; las
Edge Functions solo cubrian transcripcion y analisis. En v2 **el frontend no accede a la base de
datos**: un backend FastAPI es el unico que habla con Postgres.

| Tema | v1 | v2 |
|---|---|---|
| Base | `/functions/v1/{nombre}` | `/api/v1` |
| Acceso a datos del cliente | PostgREST directo, filtrable | Ninguno. Solo los endpoints de este documento |
| Credencial en el navegador | `anon key` con alcance de lectura/escritura | Solo el JWT de sesion |
| Credencial de BD | En el cliente | Solo en el backend |
| Envoltorio de respuesta | `{ data, error }` en todo | El recurso directo. Los errores por status HTTP + `application/problem+json` |
| Casing | snake_case | snake_case (se mantiene, alinea con la BD y `domain.md`) |
| Documentacion | Markdown a mano | OpenAPI generado en `/docs` + este archivo como resumen narrativo |

**Por que se quita `{ data, error }`:** el status HTTP ya transporta esa informacion. Mantener el
envoltorio obliga a cada llamada del cliente a desempaquetar y a ramificar dos veces.

---

## Convenciones generales

- Prefijo: `/api/v1`
- Auth: header `Authorization: Bearer {supabase_access_token}` en todos los endpoints salvo `/health`
- El backend verifica la firma del JWT contra el JWKS del proyecto Supabase y deja `user_id` en el
  contexto de la request. **No se emiten tokens propios.**
- Request y response en JSON con snake_case; uploads en `multipart/form-data`
- Toda escritura que toque mas de una tabla ocurre en una sola transaccion
- Paginacion: `?page=1&page_size=25`; la respuesta trae `{ items, total, page, page_size }`

### Autorizacion

Dos capas, deliberadamente redundantes:

1. Los repositorios filtran por el `user_id` de la request.
2. Cada transaccion propaga la identidad para que RLS siga evaluandose:
   ```sql
   SET LOCAL ROLE authenticated;
   SET LOCAL request.jwt.claims = '{"sub":"<user_id>"}';
   ```
   El rol de conexion es dedicado y **sin `BYPASSRLS`**. Un bug en un `WHERE` no filtra datos de otro
   psicologo.

### Errores

Cuerpo `application/problem+json` (RFC 9457): `{ type, title, status, detail, instance }`.

| Status | Cuando |
|---|---|
| `400` | Peticion mal formada |
| `401` | Sin token, token expirado o firma invalida |
| `403` | El recurso existe pero no pertenece al examinador |
| `404` | No existe |
| `409` | Conflicto de estado (validar un informe ya validado, finalizar una sesion cancelada) |
| `422` | Falla de validacion de Pydantic |
| `502` | Falla del proveedor externo (Whisper, OpenRouter) |

---

## Endpoints

### Perfil

| Metodo y ruta | Proposito |
|---|---|
| `GET /me` | Perfil del examinador autenticado |
| `PATCH /me` | Actualiza `full_name`, `license_number`, `specialty` |

### Catalogos

Solo lectura. Reemplazan las constantes que hoy estan escritas a mano en el frontend.

| Metodo y ruta | Proposito |
|---|---|
| `GET /tests` | Tests disponibles y bloqueados |
| `GET /tests/{code}/indicators` | Los 201 indicadores PBLL con su seccion y categoria. Soporta `?detection=auto\|semi\|manual` y `?section=A-1` |
| `GET /catalogs/quick-marks` | Las 6 marcas rapidas |
| `GET /catalogs/attitudes` | Actitudes observables |

### Dashboard

| Metodo y ruta | Proposito |
|---|---|
| `GET /dashboard/summary` | `{ sessions_this_week, pending_analysis, active_patients, recent_sessions[] }` |

### Pacientes

| Metodo y ruta | Proposito |
|---|---|
| `GET /patients` | Listado paginado. `?q=` busqueda, `?filter=active\|inactive\|pending_evaluation\|all` |
| `POST /patients` | Crea. Unicidad por `(created_by, document_number)` → `409` si repite |
| `GET /patients/{id}` | Ficha |
| `PATCH /patients/{id}` | Actualiza |
| `GET /patients/{id}/sessions` | Historial de sesiones |
| `GET /patients/{id}/reports` | Informes del paciente |

### Sesiones

| Metodo y ruta | Proposito |
|---|---|
| `POST /sessions` | Crea sesion + consentimiento + dibujo **en una transaccion**. En v1 eran 4 INSERT secuenciales desde el cliente, sin atomicidad |
| `GET /sessions/{id}` | Sesion con paciente y test embebidos |
| `PATCH /sessions/{id}` | Cambio de `status` y de `reason`. Transiciones validas: `setup→consent→active→completed`, y `→cancelled` desde cualquiera |
| `POST /sessions/{id}/consent` | Registra el consentimiento y firma |
| `POST /sessions/{id}/finalize` | Cierra: `status=completed`, sella `completed_at` |
| `POST /sessions/{id}/realtime-token` | Token efimero del canal privado `session:{id}`. Solo los dos dispositivos de esa sesion pueden unirse |

### Dibujo

| Metodo y ruta | Proposito |
|---|---|
| `PUT /sessions/{id}/drawing` | Bulk de trazos + dimensiones del lienzo. Se llama una vez al finalizar, no por trazo (ver DT-006) |
| `GET /sessions/{id}/drawing` | Trazos ordenados por `stroke_index`, para el espejo y el analisis |
| `POST /sessions/{id}/drawing/image` | PNG final, `multipart/form-data` → `FileStore` |

### Analisis

| Metodo y ruta | Proposito |
|---|---|
| `POST /sessions/{id}/analyze` | Calcula las metricas objetivas desde los trazos, detecta los indicadores `auto` y pide sugerencias al LLM. Devuelve las sugerencias con su `evidence` (metrica y umbral que la disparo) |
| `GET /sessions/{id}/metrics` | Las 7 metricas: `total_time_ms`, `latency_ms`, `stroke_count`, `pressure_avg`, `pause_count`, `erase_count`, `area_pct`, `sequence_start` |
| `GET /sessions/{id}/indicators` | Sugeridos, validados y rechazados. `?status=` filtra |
| `PUT /sessions/{id}/indicators/{code}` | Valida o rechaza uno. Sella `validated_by` y `validated_at` |
| `POST /sessions/{id}/indicators/bulk` | Checklist profesional: marca en lote los 153 indicadores `manual` |

**La medicion es determinista.** `POST /analyze` separa dos capas: las metricas y los indicadores
`auto` salen de umbrales calibrables en el dominio, sin LLM; el LLM solo propone indicadores `semi`
y siempre como `status='suggestion'`. Ninguna sugerencia entra al informe sin validacion profesional.

### Observaciones

| Metodo y ruta | Proposito |
|---|---|
| `GET`/`PUT /sessions/{id}/observations` | Notas adicionales |
| `POST /sessions/{id}/quick-marks` | Registra una marca con `mark_code` y `marked_at_ms` |
| `PUT /sessions/{id}/attitudes` | Reemplaza el conjunto de actitudes de la sesion |
| `GET`/`POST /sessions/{id}/verbalizations` | Verbalizaciones, de transcripcion o anotadas por el examinador |

### Audio

| Metodo y ruta | Proposito |
|---|---|
| `POST /sessions/{id}/recordings` | Upload `multipart` → Storage + metadata. Requiere `consent_records.audio_authorized`, si no `403` |
| `POST /recordings/{id}/transcribe` | Whisper → filas en `transcript_segments`. Sella `transcribed_at` |
| `GET /recordings/{id}/transcript` | Segmentos ordenados por `segment_index` |

### Informe

| Metodo y ruta | Proposito |
|---|---|
| `POST /sessions/{id}/report` | Genera el borrador de 9 secciones (ver tabla siguiente) |
| `GET /sessions/{id}/report` | Informe con sus secciones |
| `PATCH /reports/{id}/sections/{n}` | Edita el contenido. Marca `edited_by_examiner=true` |
| `POST /reports/{id}/validate` | `draft → validated`. Sella `validated_by` y `validated_at`. `409` si ya estaba validado |
| `GET /reports/{id}/pdf` | Renderiza con WeasyPrint reutilizando el CSS del design system |

#### Las 9 secciones

| # | Seccion | Fuente | LLM |
|---|---|---|---|
| 1 | Datos de identificacion | `patients` + `profiles` | No |
| 2 | Motivo de evaluacion | `sessions.reason` | No |
| 3 | Instrumento aplicado | `tests` | No |
| 4 | Condiciones de administracion | `sessions` + `consent_records` | No |
| 5 | Descripcion del dibujo | `stroke_metrics` redactadas en prosa | Si |
| 6 | Observaciones conductuales | Observaciones + marcas + transcripcion | Si |
| 7 | Indicadores de recursos expresivos (A) | Solo `session_indicators` con `status='validated'` | Si |
| 8 | Indicadores de contenido (B) | Solo `session_indicators` con `status='validated'` | Si |
| 9 | Conclusiones del profesional | **Se entrega vacia** | No |

**Solo 4 de 9 secciones usan LLM.** Las otras 5 son plantillas deterministas.

**Reglas duras del generador**, no negociables:

1. El prompt recibe **unicamente** indicadores con `status='validated'`. Nunca sugerencias
   pendientes, nunca el catalogo completo.
2. Cada parrafo de las secciones 7 y 8 cita la seccion del manual que lo origina.
3. La seccion 9 se entrega vacia. La conclusion diagnostica la escribe el psicologo: es la linea que
   el Capitulo 1 del proyecto declara y defiende ("no emite diagnosticos ni sustituye el juicio
   clinico").
4. Con cero indicadores validados, las secciones 7 y 8 salen vacias. No se rellenan.

### Salud

| Metodo y ruta | Proposito |
|---|---|
| `GET /health` | Sin auth. Estado del proceso y conectividad con Postgres |

---

## Realtime — la excepcion documentada

Supabase Realtime **se mantiene** como transporte directo tablet↔desktop. No es la base de datos: es
pub/sub efimero que no persiste nada. Relevarlo por FastAPI significaria operar un hub WebSocket
propio y escalarlo para mover datos que de todos modos se guardan al final via
`PUT /sessions/{id}/drawing`.

Canal: `session:{id}`, **privado**, autorizado con el token que emite
`POST /sessions/{id}/realtime-token`.

| Evento | Payload | Direccion |
|---|---|---|
| `stroke:add` | `{ stroke }` serializado compacto | Paciente → Examinador |
| `stroke:erase` | `{ indexes: number[] }` | Paciente → Examinador |
| `metrics:update` | Las 7 metricas, recalculadas cada 2 s | Paciente → Examinador |
| `status:update` | `{ connected, orientation, patient_finished }` | Bidireccional |

---

## Orden de implementacion

Los tres primeros grupos son los que la demo necesita:

1. **Analisis** — `POST /sessions/{id}/analyze`, `GET /metrics`, `GET`/`PUT /indicators`
2. **Audio** — `POST /recordings`, `POST /transcribe`, `GET /transcript`
3. **Informe** — `POST`/`GET /report`, `PATCH /sections/{n}`, `GET /pdf`
4. Sesiones y dibujo
5. Pacientes y dashboard
6. Catalogos

Mientras 4-6 no existan, el frontend sigue con Supabase directo para esas rutas. Es deuda explicita:
la frontera no esta cerrada hasta que `grep -r "supabase.from" frontend/src/` no devuelva nada.
