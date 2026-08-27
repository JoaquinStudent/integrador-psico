# API_CONTRACTS.md — Contratos de API y Edge Functions

> Ultima actualizacion: 2026-08-25

---

## Convenciones Generales

- Todos los endpoints son **Supabase Edge Functions** (`/functions/v1/{nombre}`)
- Auth via header `Authorization: Bearer {access_token}` (Supabase JWT)
- Request/Response body en JSON
- Respuesta estandar: `{ data: T | null, error: string | null }`
- Errores HTTP: 400 (validacion), 401 (no auth), 500 (interno)

---

## Edge Functions Planificadas

### EF-001: `transcribe-audio`
**Sprint:** 3 | **SPEC:** SPEC-S3-01
**Proposito:** Transcribir audio de sesion usando OpenAI Whisper API

```
POST /functions/v1/transcribe-audio

Request:
  { "audio_path": string }     // ruta en Supabase Storage

Response:
  {
    "data": {
      "transcription": [
        { "timestamp": "00:00", "text": string, "type": "speech" | "annotation" }
      ],
      "duration_seconds": number
    },
    "error": null
  }
```

---

### EF-002: `analyze-drawing`
**Sprint:** 3 | **SPEC:** SPEC-S3-04
**Proposito:** Cruzar metricas objetivas con motor de reglas PBLL y generar sugerencias

```
POST /functions/v1/analyze-drawing

Request:
  {
    "session_id": string,
    "metrics": StrokeMetrics,       // del calculo client-side
    "manual_indicators": string[]   // codigos de verificacion profesional marcados
  }

Response:
  {
    "data": {
      "suggestions": [
        {
          "code": string,           // ej: "DIM-01"
          "category": string,       // ej: "Dimensiones"
          "manual_section": string, // ej: "A-1"
          "title": string,
          "interpretation": string,
          "confidence": "high" | "medium" | "low"
        }
      ]
    },
    "error": null
  }
```

---

### EF-003: `generate-report`
**Sprint:** 4 | **SPEC:** SPEC-S4-01
**Proposito:** Generar borrador de informe psicologico de 9 secciones

```
POST /functions/v1/generate-report

Request:
  {
    "session_id": string,
    "validated_indicators": Indicator[],
    "observations": Observation,
    "metrics": StrokeMetrics,
    "transcription": Transcription | null
  }

Response:
  {
    "data": {
      "sections": [
        {
          "number": number,         // 1-9
          "title": string,
          "content": string,
          "source": "auto" | "manual",
          "ai_generated": boolean
        }
      ]
    },
    "error": null
  }
```

---

## Supabase Client-Side Queries (RPC/REST)

| Operacion | Tabla | Metodo | Sprint | Estado |
|---|---|---|---|---|
| Listar pacientes | `patients` | `SELECT` con paginacion + filtros | 1 | DONE |
| Crear paciente | `patients` | `INSERT` | 1 | DONE |
| Leer ficha paciente | `patients` + `sessions` + `reports` | `SELECT` con joins | 1 | DONE |
| Crear sesion | `sessions` + `consent_records` + `drawing_data` + `observations` | `INSERT` secuencial | 2 | DONE |
| Leer sesion + paciente | `sessions` + `patients` | `SELECT` | 2 | DONE |
| Guardar trazos | `drawing_data` | `UPDATE` strokes_json + Storage PNG | 2 | DONE |
| Guardar metricas | `stroke_metrics` | `UPSERT` on conflict session_id | 2 | DONE |
| Finalizar sesion | `sessions` | `UPDATE` status=completed | 2 | DONE |
| Guardar observaciones | `observations` | `UPDATE` quick_marks + notes | 2 | DONE |
| Guardar audio | `audio_recordings` | `INSERT` (metadata) + Storage upload | 3 | BACKLOG |
| CRUD indicadores | `indicators` | `INSERT/UPDATE` | 3 | BACKLOG |
| Guardar informe | `reports` | `UPSERT` | 4 | BACKLOG |
| Dashboard KPIs | Multiple | `SELECT` + aggregates | 1 | DONE |

---

## Supabase Realtime Channels

| Canal | Tipo | Proposito | Sprint | Estado |
|---|---|---|---|---|
| `session:{id}` | Broadcast | Canal unico por sesion activa | 2 | DONE |

**Eventos del canal `session:{id}`:**

| Evento | Payload | Direccion | Descripcion |
|---|---|---|---|
| `stroke:add` | `{ stroke }` (serializado compacto) | Paciente → Examinador | Nuevo trazo completado |
| `stroke:erase` | `{ indexes: number[] }` | Paciente → Examinador | Indices de trazos borrados |
| `metrics:update` | `LiveMetrics` (7 campos) | Paciente → Examinador | Metricas recalculadas cada 2s |
| `status:update` | `{ connected, orientation, patientFinished }` | Bidireccional | Estado de conexion y finalizacion |

**Nota:** Se uso Broadcast en vez de Presence o DB changes. Broadcast es fire-and-forget sobre WebSocket — baja latencia, sin escrituras a DB en cada trazo. Los datos se persisten solo al finalizar (ver DT-006 en MEMORY.md).
