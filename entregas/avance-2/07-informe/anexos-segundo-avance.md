Facultad de Ingeniería Software y Sistemas

**"Implementación de una aplicación web para reducir el tiempo de elaboración de informes de tests proyectivos de dibujo en la práctica psicológica, Lima, 2026."**

---

# ANEXOS — SEGUNDO AVANCE (Evidencias K a S)

> Las evidencias A a J del Primer Avance se encuentran en `entregas/avance-1/`.  
> Este documento reúne las evidencias K a S del Segundo Avance.

---

## Anexo K — Diagramas de procesos (BPM)

Los diagramas BPM de los tres procesos principales del sistema están desarrollados en la sección 3.5.3 del Capítulo 3. Se reproducen aquí como referencia.

### Notación BPM utilizada

El presente proyecto utiliza los siguientes elementos de la notación BPMN 2.0:

| Símbolo | Nombre | Descripción |
|---|---|---|
| ○ (círculo simple) | Evento de inicio | Punto de inicio del proceso |
| ○ (círculo doble) | Evento de fin | Punto de finalización del proceso |
| ▭ (rectángulo) | Tarea | Actividad ejecutada por un participante |
| ◇ (rombo) | Compuerta exclusiva | Decisión: solo una rama se activa |
| ▭ (rectángulo redondeado con franja) | Subproceso | Conjunto de actividades agrupadas |
| ── | Flujo de secuencia | Orden de ejecución de las actividades |
| - - ► | Flujo de mensaje | Comunicación entre carriles (pools) |
| │ (línea punteada horizontal) | Carril (lane) | Separación de responsabilidades por actor |

### Proceso 1 — Evaluación y captura

Actores: Examinador, Sistema, Paciente.

```
INICIO ──► Configurar sesión ──► Registrar consentimiento ──► ¿Audio autorizado?
                                                                ├── Sí ──► Habilitar grabación
                                                                └── No ──► Continuar sin audio
──► Iniciar sesión ──► [Sistema genera token Realtime] ──► Paciente se conecta
──► [PARALELO]
    ├── Examinador: Observa espejo en vivo / Registra marcas / Registra observaciones
    └── Paciente: Dibuja en el lienzo (captura temporal)
──► ¿Sesión finalizada?
    ├── Sí (paciente) ──► Notificación al examinador ──► Examinador confirma cierre
    └── Sí (examinador) ──► Notificación al paciente ──► Pantalla de cierre al paciente
──► Persistir trazos ──► Sesión = completed ──► FIN
```

### Proceso 2 — Análisis de indicadores

Actores: Examinador, Sistema, OpenRouter LLM.

```
INICIO ──► Solicitar análisis
──► [SISTEMA] Calcular métricas objetivas (7 métricas desde los trazos)
──► [SISTEMA] Detectar indicadores automáticos (23 indicadores con status='suggestion')
──► ¿LLM disponible?
    ├── Sí ──► Enviar contexto a OpenRouter ──► Recibir sugerencias semiautomáticas (25)
    └── No ──► Continuar sin sugerencias semiautomáticas (llm_available=false)
──► Presentar indicadores al examinador agrupados por sección del manual
──► [EXAMINADOR — BUCLE por cada indicador]
    ├── Aceptar ──► status='validated', validated_by, validated_at
    └── Rechazar ──► status='rejected'
──► Completar checklist de 153 indicadores manuales
──► FIN — indicadores validados disponibles para generación del informe
```

### Proceso 3 — Generación y validación del informe

Actores: Examinador, Sistema, OpenRouter LLM.

```
INICIO ──► Solicitar borrador del informe
──► [SISTEMA] Generar secciones deterministas (1, 2, 3, 4, 9)
──► ¿LLM disponible?
    ├── Sí ──► Enviar solo indicadores validados a OpenRouter ──► Redactar secciones 5, 6, 7, 8
    └── No ──► Aplicar fallback determinista para secciones 5, 7, 8; sección 6 desde observaciones
──► Presentar borrador al examinador con marcado visual de secciones IA vs. deterministas
──► [EXAMINADOR — BUCLE por cada sección]
    ├── Editar contenido ──► edited_by_examiner=true
    └── Aceptar sin cambios ──► Mantener contenido generado
──► Validar informe ──► status='validated', validated_by, validated_at ──► Informe inmutable
──► Exportar PDF ──► PDF descargado por el examinador
──► FIN
```

---

## Anexo L — Diagrama de clases

El diagrama de clases completo está desarrollado en la sección 3.5.4 del Capítulo 3. Las clases del dominio de Psicograma son:

**Entidades del dominio (Java):**

| Clase | Atributos clave | Relaciones |
|---|---|---|
| `Profile` | id, full_name, license_number, specialty | 1:N con `Patient`, 1:N con `Session` |
| `Patient` | id, full_name, document_number, birth_date, sex, is_active, anonymized_at | N:1 con `Profile`; 1:N con `Session` |
| `Session` | id, patient_id, test_id, status (enum), reason, started_at, completed_at | N:1 con `Patient`, `Test`, `Profile`; 1:1 con `ConsentRecord`, `Drawing`, `StrokeMetrics`, `SessionObservations`, `Report` |
| `ConsentRecord` | audio_authorized, digital_authorized, confidential_ack, signature_url, signed_at | 1:1 con `Session` |
| `Drawing` | final_image_url, orientation, canvas_width, canvas_height | 1:1 con `Session`; 1:N con `Stroke` |
| `Stroke` | stroke_index, tool, started_at_ms, ended_at_ms, point_count, avg_pressure, bbox_*, points (JSONB) | N:1 con `Drawing` |
| `StrokeMetrics` | total_time_ms, latency_ms, stroke_count, pressure_avg, pause_count, erase_count, area_pct, sequence_start | 1:1 con `Session` |
| `AudioRecording` | storage_path, duration_seconds, started_at_ms, transcribed_at | N:1 con `Session`; 1:N con `TranscriptSegment` |
| `TranscriptSegment` | segment_index, start_ms, end_ms, text, segment_type | N:1 con `AudioRecording` |
| `SessionObservations` | additional_notes | 1:1 con `Session` |
| `SessionQuickMark` | mark_code, marked_at_ms | N:1 con `Session` y `QuickMarkCatalog` |
| `SessionAttitude` | (clave compuesta: session_id + attitude_code) | N:N entre `Session` y `AttitudeCatalog` |
| `Verbalization` | offset_ms, text, source | N:1 con `Session` |
| `SessionIndicator` | (clave compuesta: session_id + indicator_code), status, source, confidence, evidence, validated_by, validated_at | N:N entre `Session` e `IndicatorCatalog` |
| `Report` | status (draft/validated), validated_at, validated_by, pdf_url | 1:1 con `Session`; 1:N con `ReportSection` |
| `ReportSection` | section_number (1-9), title, content, is_ai_generated, edited_by_examiner | N:1 con `Report` |
| `IndicatorCatalog` | code (PK), title, interpretation, detection_type (auto/semi/manual) | N:1 con `ManualSection` |
| `ManualSection` | code, name, code_prefix | N:1 con `IndicatorCategory` |
| `IndicatorCategory` | code (A/B/C/D), name | N:1 con `Test` |
| `Test` | code, name, is_available | 1:N con `IndicatorCategory` |
| `QuickMarkCatalog` | code, label, display_order | Catálogo de 6 marcas rápidas |
| `AttitudeCatalog` | code, label, display_order | Catálogo de actitudes observables |

**Servicios del dominio (Java):**

| Servicio | Responsabilidad |
|---|---|
| `AnalysisService` | Orquesta la medición objetiva y la propuesta de indicadores |
| `MetricsCalculator` | Calcula las 7 métricas desde los trazos (`StrokeMetrics`) |
| `RuleEngine` | Cruza las métricas con los 201 indicadores del catálogo y genera sugerencias |
| `ReportGenerator` | Construye el borrador de 9 secciones desde los indicadores validados |
| `OpenRouterAdapter` | Integra el LLM externo con fallback determinista |
| `WhisperAdapter` | Integra la API de Whisper para transcripción |
| `PdfExporter` | Genera el PDF desde el informe validado |

---

## Anexo M — Diagrama entidad-relación

El diagrama ER completo está desarrollado en la sección 3.5.5 del Capítulo 3. El esquema SQL completo se encuentra en `sdd/database/schema.sql`.

### Resumen de relaciones clave

| Tabla origen | Cardinalidad | Tabla destino | FK |
|---|---|---|---|
| `patients` | N:1 | `profiles` | `created_by` |
| `sessions` | N:1 | `patients` | `patient_id` |
| `sessions` | N:1 | `tests` | `test_id` |
| `sessions` | N:1 | `profiles` | `created_by` |
| `consent_records` | 1:1 | `sessions` | `session_id` UNIQUE |
| `drawings` | 1:1 | `sessions` | `session_id` UNIQUE |
| `strokes` | N:1 | `drawings` | `drawing_id` |
| `stroke_metrics` | 1:1 | `sessions` | `session_id` UNIQUE |
| `audio_recordings` | N:1 | `sessions` | `session_id` |
| `transcript_segments` | N:1 | `audio_recordings` | `recording_id` |
| `session_observations` | 1:1 | `sessions` | `session_id` PK |
| `session_quick_marks` | N:1 | `sessions` | `session_id` |
| `session_quick_marks` | N:1 | `quick_mark_catalog` | `mark_code` |
| `session_attitudes` | N:N | `sessions` + `attitude_catalog` | PK compuesta |
| `verbalizations` | N:1 | `sessions` | `session_id` |
| `session_indicators` | N:N | `sessions` + `indicator_catalog` | PK compuesta |
| `reports` | 1:1 | `sessions` | `session_id` UNIQUE |
| `report_sections` | N:1 | `reports` | `report_id` |
| `indicator_catalog` | N:1 | `manual_sections` | `section_id` |
| `manual_sections` | N:1 | `indicator_categories` | `category_id` |
| `indicator_categories` | N:1 | `tests` | `test_id` |

### Justificación de la normalización a 2FN

En el esquema v1, la tabla `indicators` tenía como clave candidata `(session_id, code)`. Los atributos `title`, `interpretation`, `category` y `manual_section` dependían **solo** de `code`, no de la clave completa. Esta dependencia parcial viola la 2FN.

**Corrección aplicada:** Se separa el catálogo del manual (`indicator_catalog`, `manual_sections`, `indicator_categories`) de los datos de sesión (`session_indicators`). Los 201 indicadores del manual existen ahora una sola vez en la base de datos y se relacionan con cada sesión únicamente a través de la clave compuesta `(session_id, indicator_code)` en `session_indicators`.

---

## Anexo N — Arquitectura tecnológica

La arquitectura tecnológica de Psicograma está documentada en la sección 3.5.1 del Capítulo 3 y en `sdd/api-contracts.md`. Los elementos clave son:

### Diagrama de despliegue

```
┌──────────────────────────────────────────────────────────────────┐
│  INTERNET                                                         │
│                                                                   │
│  [Examinador — Desktop]          [Paciente — Tablet]             │
│   Navegador Chrome/Safari         Navegador + Stylus             │
│        │ HTTPS                          │ HTTPS + WSS             │
│        ▼                                ▼                         │
│  ┌───────────────────────────────────────────────────────┐       │
│  │  Vercel CDN (Frontend React estático)                  │       │
│  └───────────────────────────────────────────────────────┘       │
│        │ HTTPS (API REST)               │ WSS (Realtime)          │
│        ▼                                ▼                         │
│  ┌─────────────────────┐  ┌──────────────────────────────┐       │
│  │  Railway             │  │  Supabase Realtime           │       │
│  │  (Backend Java JAR)  │  │  Canal: session:{id}         │       │
│  │  Spring Boot 3       │  │  Broadcast efímero privado   │       │
│  └─────────────────────┘  └──────────────────────────────┘       │
│        │ TCP 5432 (SQL)                                           │
│        ▼                                                          │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │  Supabase (sa-east-1 — São Paulo)                        │     │
│  │  ├── PostgreSQL 17 + RLS (22 tablas)                     │     │
│  │  ├── Auth (JWT ES256 + JWKS)                             │     │
│  │  └── Storage (bucket privado session-files)              │     │
│  └─────────────────────────────────────────────────────────┘     │
│        │                         │                                │
│        ▼                         ▼                                │
│  ┌─────────────────┐   ┌──────────────────────┐                 │
│  │  OpenAI Whisper  │   │  OpenRouter LLM       │                 │
│  │  (transcripción) │   │  (redacción asistida) │                 │
│  └─────────────────┘   └──────────────────────┘                 │
└──────────────────────────────────────────────────────────────────┘
```

### Puertos y protocolos

| Componente | Puerto | Protocolo | Autenticación |
|---|---|---|---|
| Frontend → Backend | 443 | HTTPS | JWT Bearer |
| Frontend → Supabase Realtime | 443 | WSS (WebSocket Secure) | Token efímero de sesión |
| Backend → PostgreSQL | 5432 | TCP (SQL) | Rol de BD sin BYPASSRLS |
| Backend → Supabase Storage | 443 | HTTPS | Service key (solo backend) |
| Backend → OpenAI Whisper | 443 | HTTPS | API Key (solo backend) |
| Backend → OpenRouter | 443 | HTTPS | API Key (solo backend) |

---

## Anexo O — Diseño de interfaces (capturas de pantalla del prototipo)

Las 13 pantallas implementadas del sistema Psicograma se presentan en orden de flujo de usuario:

| # | Pantalla | Módulo | Archivo de mock |
|---|---|---|---|
| 1 | Login y registro del psicólogo | Autenticación | — |
| 2 | Dashboard principal | Panel de control | `mocks/dashboard-principal/screen.png` |
| 3 | Listado de pacientes | Gestión de pacientes | `mocks/listado-pacientes/screen.png` |
| 4 | Ficha del paciente | Gestión de pacientes | `mocks/ficha-paciente/screen.png` |
| 5 | Catálogo de tests proyectivos | Catálogo | `mocks/catalogo-tests-proyectivos/screen.png` |
| 6 | Asistente de nueva sesión (consentimiento) | Gestión de sesiones | `mocks/nueva-sesion-consentimiento/screen.png` |
| 7 | Consigna PBLL (interfaz paciente) | Captura del dibujo | `mocks/bienvenida-paciente-pbll/screen.png` |
| 8 | Lienzo de dibujo (interfaz paciente) | Captura del dibujo | `mocks/lienzo-dibujo-paciente/screen.png` |
| 9 | Pantalla de cierre del paciente | Captura del dibujo | `mocks/cierre-paciente/screen.png` |
| 10 | Sesión en vivo (interfaz examinador) | Registro de sesión | `mocks/sesion-en-vivo-pbll/screen.png` |
| 11 | Verificación profesional (checklist) | Análisis | `mocks/verificacion-profesional-pbll/screen.png` |
| 12 | Análisis de resultados PBLL | Análisis | `mocks/analisis-resultados-pbll/screen.png` |
| 13 | Editor del informe psicológico | Informe | `mocks/editor-informe/screen.png` |

> Las capturas de pantalla se encuentran en los directorios listados bajo `mocks/` en el repositorio del proyecto.

### Registro de observaciones PBLL

| Pantalla adicional | Archivo |
|---|---|
| Panel de registro de observaciones del examinador | `mocks/registro-observaciones-pbll/screen.png` |

---

## Anexo P — Prototipo completo

El prototipo completo de Psicograma es una **aplicación web funcional** implementada en React + TypeScript con el backend Java Spring Boot. No es un mockup estático: todas las pantallas responden a interacciones reales y están conectadas a la base de datos PostgreSQL en Supabase.

### Estado del prototipo al 01/10/2026

| Sprint | Pantallas entregadas | Estado |
|---|---|---|
| Sprint 1 | Shell de navegación, layout base | Completado |
| Sprint 2 | Dashboard, listado de pacientes, ficha, catálogo, nueva sesión | Completado |
| Sprint 3 | Consigna PBLL, lienzo, cierre del paciente, sesión en vivo | Completado |
| Sprint 4 | Verificación profesional, análisis de resultados | Completado |
| Sprint 5 | Migración de todas las pantallas a la API REST del backend | Completado |
| Sprint 6 | Editor del informe, validación, exportación a PDF | Completado |

**Total: 13 pantallas funcionales + backend Java completo (API REST ~40 endpoints)**

### Flujo del prototipo

```
Login ──► Dashboard ──► Nueva sesión (wizard 3 pasos)
                              │
                              ├──► [Tablet] Consigna PBLL
                              │    ──► Lienzo de dibujo
                              │    ──► Cierre del paciente
                              │
                              └──► [Desktop] Sesión en vivo
                                   ──► Verificación profesional
                                   ──► Análisis de resultados
                                   ──► Editor del informe
                                   ──► PDF descargado
```

---

## Anexo Q — Evidencias de las pantallas

### Dashboard principal

Muestra: sesiones de la semana, evaluaciones pendientes de informe, pacientes activos, sesiones recientes. Sidebar violeta profundo con íconos de navegación. Tarjetas con métricas de gestión en superficie clara.

→ Ver `mocks/dashboard-principal/screen.png`

### Listado de pacientes

Muestra: tabla paginada con columnas nombre, documento, fecha de nacimiento, sesiones y estado. Barra de búsqueda, cuatro filtros (todos / activos / inactivos / evaluación pendiente). Botón de nuevo paciente.

→ Ver `mocks/listado-pacientes/screen.png`

### Ficha del paciente

Muestra: datos personales en la parte superior, tres pestañas (Información, Sesiones, Informes). Estado activo/inactivo con botón de baja lógica.

→ Ver `mocks/ficha-paciente/screen.png`

### Catálogo de tests proyectivos

Muestra: PBLL disponible (chip verde "Disponible"). HTP, Dibujo de la Familia y DFH bloqueados (chip gris "Próximamente"). Descripción del test y botón de nueva sesión.

→ Ver `mocks/catalogo-tests-proyectivos/screen.png`

### Asistente de nueva sesión con consentimiento

Muestra: wizard de 3 pasos: (1) selección de paciente y test, (2) consentimiento informado con checkboxes de autorización y campo de firma, (3) confirmación e inicio. Progreso indicado con stepper.

→ Ver `mocks/nueva-sesion-consentimiento/screen.png`

### Lienzo de dibujo (paciente)

Muestra: canvas a pantalla completa con fondo blanco, herramientas mínimas (lápiz, borrador, deshacer) en la parte inferior. Sin métricas ni información del análisis visible. Botón de finalización discreto.

→ Ver `mocks/lienzo-dibujo-paciente/screen.png`

### Sesión en vivo (examinador)

Muestra: espejo del dibujo del paciente en el panel izquierdo (actualización en tiempo real). Panel de 7 métricas (tiempo transcurrido, latencia de inicio, trazos, presión promedio, pausas, borrados, área ocupada). Panel de marcas rápidas con 6 botones predefinidos. Control de grabación de audio con indicador rojo pulsante.

→ Ver `mocks/sesion-en-vivo-pbll/screen.png`

### Verificación profesional PBLL

Muestra: checklist de 153 indicadores de verificación visual organizados en pestañas por sección del manual (A-3 Trazos, B-6 Vestimenta, B-7 Paraguas, B-9 Cuerpo, etc.). Chips ámbar para pendientes, verde para aceptados, gris para rechazados.

→ Ver `mocks/verificacion-profesional-pbll/screen.png`

### Análisis de resultados PBLL

Muestra: métricas objetivas del dibujo en tarjetas (tamaño, emplazamiento en grilla 3×3, presión promedio, tiempo total, latencia, pausas, borrados). Lista de indicadores automáticos propuestos con su evidencia (medición y umbral).

→ Ver `mocks/analisis-resultados-pbll/screen.png`

### Editor del informe psicológico

Muestra: índice lateral con las 9 secciones y su estado. Área central de edición con marcado visual de contenido IA (chip ámbar "Generado por sistema") vs. editado por el profesional (chip verde "Editado por profesional"). Botón de validación en el encabezado.

→ Ver `mocks/editor-informe/screen.png`

---

## Anexo R — Matriz de cobertura del alcance

| # | Elemento del alcance | RF que lo implementan | RNF relacionados | Pantalla que lo demuestra | Cubierto |
|---|---|---|---|---|---|
| 1 | Test PBLL como caso piloto | RF-09, RF-41 | RNF-05 | Catálogo de tests, Nueva sesión | ✓ |
| 2 | Gestión de pacientes — Registro | RF-04 | RNF-15 | Formulario nuevo paciente | ✓ |
| 3 | Gestión de pacientes — Actualización | RF-05 | RNF-15 | Ficha del paciente | ✓ |
| 4 | Gestión de pacientes — Listado | RF-06 | RNF-21 | Listado de pacientes | ✓ |
| 5 | Gestión de pacientes — Ficha | RF-07 | RNF-21 | Ficha del paciente | ✓ |
| 6 | Gestión de pacientes — Baja lógica | RF-08 | RNF-16 | Ficha del paciente | ✓ |
| 7 | Gestión de sesiones — Configuración | RF-09 | — | Nueva sesión — paso 1 | ✓ |
| 8 | Gestión de sesiones — Consentimiento | RF-10 | RNF-14 | Nueva sesión — paso 2 | ✓ |
| 9 | Gestión de sesiones — Emparejamiento | RF-11 | RNF-13 | Sesión en vivo | ✓ |
| 10 | Gestión de sesiones — Finalización | RF-12 | — | Sesión en vivo | ✓ |
| 11 | Captura del dibujo — Lienzo digital | RF-14 | RNF-02, RNF-22, RNF-23 | Lienzo del paciente | ✓ |
| 12 | Captura del dibujo — Deshacer | RF-15 | — | Lienzo del paciente | ✓ |
| 13 | Captura del dibujo — Dimensión temporal | RF-16 | RNF-02 | Lienzo del paciente | ✓ |
| 14 | Captura del dibujo — Orientación | RF-17 | — | Lienzo del paciente | ✓ |
| 15 | Captura del dibujo — Persistencia | RF-18 | RNF-09 | — (backend) | ✓ |
| 16 | Captura del dibujo — Consigna y cierre | RF-19 | RNF-23 | Consigna PBLL, Cierre del paciente | ✓ |
| 17 | Sincronización — Espejo en vivo | RF-20 | RNF-01 | Sesión en vivo | ✓ |
| 18 | Sincronización — Métricas en vivo | RF-21 | RNF-04 | Sesión en vivo | ✓ |
| 19 | Registro de sesión — Marcas rápidas | RF-22 | — | Sesión en vivo | ✓ |
| 20 | Registro de sesión — Observaciones | RF-23 | — | Sesión en vivo | ✓ |
| 21 | Registro de sesión — Actitudes | RF-24 | — | Sesión en vivo | ✓ |
| 22 | Registro de sesión — Estado de conexión | RF-25 | — | Sesión en vivo | ✓ |
| 23 | Audio — Grabación | RF-26 | RNF-14 | Sesión en vivo | ✓ |
| 24 | Audio — Transcripción | RF-27 | — | — (backend Whisper) | ✓ |
| 25 | Audio — Verbalizaciones | RF-28 | — | Editor del informe | ✓ |
| 26 | Análisis — Medición objetiva | RF-29 | RNF-19 | Análisis de resultados | ✓ |
| 27 | Análisis — Detección automática | RF-30 | RNF-17, RNF-18, RNF-19 | Análisis de resultados | ✓ |
| 28 | Análisis — Sugerencia asistida | RF-31 | RNF-17, RNF-18 | Análisis de resultados | ✓ |
| 29 | Análisis — Checklist profesional | RF-32 | RNF-18, RNF-19 | Verificación profesional | ✓ |
| 30 | Análisis — Validar/rechazar | RF-33 | RNF-20 | Verificación profesional | ✓ |
| 31 | Análisis — Motor configurable | RF-34 | RNF-05 | — (backend) | ✓ |
| 32 | Informe — Generar borrador | RF-35 | RNF-17 | Editor del informe | ✓ |
| 33 | Informe — Editar | RF-36 | — | Editor del informe | ✓ |
| 34 | Informe — Validar | RF-37 | RNF-20 | Editor del informe | ✓ |
| 35 | Informe — Exportar PDF | RF-38 | — | Editor del informe | ✓ |
| 36 | Informe — Historial | RF-39 | — | Ficha del paciente | ✓ |
| 37 | Panel — Dashboard | RF-40 | RNF-03 | Dashboard principal | ✓ |
| 38 | Panel — Catálogo de tests | RF-41 | — | Catálogo de tests | ✓ |
| 39 | Dos perfiles de usuario | RF-03 | RNF-22, RNF-23 | Todas las pantallas | ✓ |
| 40 | Sin diagnósticos clínicos | — | RNF-17 | Sección 9 vacía en editor | ✓ |

**Cobertura: 40/40 elementos verificados (100 %).**

---

## Anexo S — Validación del prototipo

### Criterios de validación

La validación del prototipo se realizó sobre cuatro dimensiones:

**1. Validación de requerimientos funcionales.** Cada uno de los 41 RF fue trazado a la pantalla o funcionalidad del prototipo que lo implementa. Ver tabla completa en la sección 3.7.3 del Capítulo 3.

**2. Validación de requerimientos no funcionales.** Los 30 RNF fueron verificados en la sección 3.7.6 del Capítulo 3. Los RNF de auditoría pendiente (AUD-01 a AUD-05) están programados para la Fase 3 (02/11/2026 – 11/11/2026).

**3. Validación técnica automatizada.** El sistema cuenta con 119 tests automatizados:
- 47 tests unitarios del dominio Java puro (sin red, sin base de datos)
- 72 tests de integración y adaptadores

**4. Validación de cobertura del alcance.** Ver Anexo R. Resultado: 40/40 elementos verificados (100 %).

### Resultado de la validación

| Dimensión | Resultado |
|---|---|
| Cobertura del alcance funcional | 100 % (40/40 elementos) |
| Requerimientos funcionales cubiertos | 41/41 RF |
| Requerimientos no funcionales cubiertos | 28/30 RNF verificados; 2 pendientes de Fase 3 (AUD-04, AUD-05) |
| Tests automatizados pasando | 119/119 |
| Pantallas implementadas | 13/13 |
| Sprints completados | 6/6 |
| Avance global al 01/10/2026 | 85.1 % (40/47 tareas) |

### Pendiente de validación

| ID | Tarea | Motivo |
|---|---|---|
| AUD-04 | Auditoría de rendimiento | Requiere entorno productivo con usuarios reales |
| AUD-05 | Medición pre/post del tiempo de elaboración | Requiere línea base del procedimiento manual en el centro |
| R-05 | Línea base de tiempos pre-implementación | Requiere iniciar la medición manual antes de adoptar el sistema |

> **Acción urgente:** La línea base de tiempos pre-implementación es irrecuperable si el centro adopta el sistema antes de medirla. La ficha de registro (fecha, psicólogo, paciente codificado, hora de inicio, hora de fin, interrupciones) debe comenzar a aplicarse esta semana en el Centro Psicológico Ser Integral E.I.R.L. El protocolo completo está en `sdd/spec/SPEC-AUD-05.md`.
