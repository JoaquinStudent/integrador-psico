# SPEC-S5-05: Endpoints de Analisis y Audio

> Estado: DONE | Sprint: 5 | Epica: Backend | Realiza: RF-26, RF-27, RF-28, RF-29, RF-30, RF-31, RF-32, RF-33

---

## Descripcion

Exponer por HTTP la ruta que necesita la demo: del dibujo terminado al analisis verificable, pasando
por la transcripcion del audio.

Es la primera funcionalidad que se sirve desde el backend en vez del navegador, asi que fija los
patrones que van a seguir los demas routers: puertos por `Depends`, DTO de Pydantic en la frontera,
errores como `application/problem+json`.

El principio que no se negocia: **la medicion es determinista y el LLM es opcional**. Las metricas y
los indicadores `auto` salen de umbrales explicitos en el dominio. El LLM solo propone los `semi`, y
todo lo que propone nace como `suggestion`. Si el proveedor de LLM esta caido, el analisis objetivo
debe funcionar igual.

**Nota de alcance:** `SPEC-INDEX.md` titulaba esta historia como "endpoints de analisis, audio e
informe". Los endpoints de informe pertenecen a `SPEC-S6-01` a `SPEC-S6-04`; mantenerlos aqui violaba
la regla R5. Este SPEC cubre analisis y audio.

**Contrato de referencia:** `sdd/api-contracts.md`, grupos Analisis y Audio.

---

## Criterios de Aceptacion (Given-When-Then)

### Escenario 1: Analisis de una sesion completada
```
GIVEN una sesion completada con trazos persistidos
WHEN el examinador hace POST /api/v1/sessions/{id}/analyze
THEN se calculan y guardan las 7 metricas objetivas
AND se devuelven las sugerencias de indicadores automaticos
AND cada sugerencia trae code, confidence y evidence
```

### Escenario 2: Cada sugerencia declara su medicion
```
GIVEN un dibujo que ocupa el 4% de la hoja
WHEN se ejecuta el analisis
THEN se sugiere DIM-01
AND su evidence contiene el area medida, no un texto generico
```

### Escenario 3: Ninguna sugerencia nace validada
```
GIVEN cualquier sesion analizada
WHEN se consulta GET /api/v1/sessions/{id}/indicators
THEN todo indicador de source auto o llm tiene status suggestion
AND ninguno tiene validated_by ni validated_at
```

### Escenario 4: El analisis objetivo no depende del LLM
```
GIVEN el proveedor de LLM devuelve error 500
WHEN el examinador hace POST /api/v1/sessions/{id}/analyze
THEN las metricas y los indicadores automaticos se calculan y persisten
AND la respuesta indica que las sugerencias asistidas no estan disponibles
AND el codigo HTTP no es 502
```

### Escenario 5: Validar un indicador
```
GIVEN un indicador DIM-01 en estado suggestion
WHEN el examinador hace PUT /api/v1/sessions/{id}/indicators/DIM-01 con status validated
THEN el indicador queda validated
AND validated_by es el examinador autenticado
AND validated_at queda sellado
```

### Escenario 6: Rechazar un indicador
```
GIVEN un indicador PRE-04 en estado suggestion
WHEN el examinador lo rechaza
THEN queda en rejected con autor y fecha
AND no aparece en la lista de validados que consume el informe
```

### Escenario 7: Checklist de verificacion profesional en lote
```
GIVEN el catalogo tiene 153 indicadores de detection_type manual
WHEN el examinador hace POST /api/v1/sessions/{id}/indicators/bulk con 6 codigos validados
THEN se registran esos 6 como validated con source manual
AND los 147 restantes no se crean como filas
```

### Escenario 8: Indicador inexistente
```
GIVEN un codigo que no esta en indicator_catalog
WHEN se intenta validarlo
THEN la respuesta es 404
AND el cuerpo es application/problem+json
```

### Escenario 9: Grabacion sin consentimiento de audio
```
GIVEN una sesion cuyo consent_records.audio_authorized es false
WHEN se hace POST /api/v1/sessions/{id}/recordings con un archivo
THEN la respuesta es 403
AND no se almacena el archivo en Storage
AND no se crea fila en audio_recordings
```

### Escenario 10: Transcripcion de la grabacion
```
GIVEN una grabacion almacenada y pendiente de transcribir
WHEN se hace POST /api/v1/recordings/{id}/transcribe
THEN se crean las filas de transcript_segments con start_ms, end_ms y text
AND transcribed_at queda sellado
AND GET /api/v1/recordings/{id}/transcript los devuelve ordenados por segment_index
```

### Escenario 11: Falla del proveedor de transcripcion
```
GIVEN el proveedor de transcripcion devuelve error
WHEN se solicita la transcripcion
THEN la respuesta es 502
AND transcribed_at sigue nulo, de modo que el reintento es posible
```

### Escenario 12: Sesion de otro examinador
```
GIVEN una sesion del examinador B
WHEN el examinador A intenta analizarla o subirle audio
THEN la respuesta es 403
```

### Escenario 13: Sin token
```
GIVEN una request sin header Authorization
WHEN se llama cualquier endpoint de este SPEC
THEN la respuesta es 401 con WWW-Authenticate: Bearer
```

---

## Scope

**IN:**
- `POST /sessions/{id}/analyze`
- `GET /sessions/{id}/metrics`
- `GET /sessions/{id}/indicators`
- `PUT /sessions/{id}/indicators/{code}`
- `POST /sessions/{id}/indicators/bulk`
- `POST /sessions/{id}/recordings` (multipart)
- `POST /recordings/{id}/transcribe`
- `GET /recordings/{id}/transcript`
- Adaptadores de salida: `Transcriber`, `LlmDrafter`, `FileStore`
- DTO de Pydantic de entrada y salida, en snake_case

**OUT:**
- Endpoints de informe y PDF (SPEC-S6-01 a SPEC-S6-04)
- Endpoints de pacientes, sesiones, dibujo, catalogos y panel (Sprint 5 posterior / Sprint 6)
- Reintento automatico de la transcripcion: el examinador reintenta a mano
- Transcripcion en streaming o por fragmentos
- Diarizacion de hablantes

---

## Dependencias

| Dependencia | Tipo | Estado |
|---|---|---|
| SPEC-S5-04 (repositorios) | Feature | **BLOQUEANTE** |
| Esquema v2 aplicado y catalogo sembrado | DB | Pendiente |
| `domain/services/measure_drawing.py` | Codigo | DONE (SPEC-S5-03) |
| `domain/services/evaluate_indicators.py` | Codigo | DONE (SPEC-S5-03) |
| `http/auth.py` con verificacion de JWT | Codigo | DONE (SPEC-S5-03) |
| `OPENAI_API_KEY` y `OPENROUTER_API_KEY` | Config | Por definir en `.env` |
| Bucket de Storage | Infra | Existe |

---

## Archivos a Crear/Modificar

| Archivo | Accion |
|---|---|
| `backend/src/psicograma/adapter/inbound/http/routers/analysis.py` | Crear |
| `backend/src/psicograma/adapter/inbound/http/routers/audio.py` | Crear |
| `backend/src/psicograma/adapter/inbound/http/schemas.py` | Crear (DTO de Pydantic) |
| `backend/src/psicograma/application/analyze_session.py` | Crear (caso de uso) |
| `backend/src/psicograma/application/transcribe_recording.py` | Crear |
| `backend/src/psicograma/adapter/outbound/whisper/transcriber.py` | Crear |
| `backend/src/psicograma/adapter/outbound/llm/drafter.py` | Crear |
| `backend/src/psicograma/adapter/outbound/storage/file_store.py` | Crear |
| `backend/src/psicograma/adapter/inbound/http/app.py` | Modificar (registrar routers) |
| `backend/tests/adapter/test_analysis_api.py` | Crear |
| `backend/tests/adapter/test_audio_api.py` | Crear |
| `sdd/api-contracts.md` | Modificar si algun contrato cambia al implementarlo |

---

## Validacion de Dominio

- Rutas y codigos de error segun `sdd/api-contracts.md`; cuerpo de error `application/problem+json`
- Request y response en snake_case, alineado con `domain.md`
- `source` de un indicador: `auto` cuando lo detecto el umbral, `llm` cuando lo propuso el modelo,
  `manual` cuando lo marco el examinador en el checklist
- Las 7 metricas conservan los nombres de `stroke_metrics` en `schema.sql`
- Los DTO de Pydantic viven en `adapter/inbound/http/`. El dominio no los conoce: el caso de uso
  recibe y devuelve dataclasses de `domain/model.py`
