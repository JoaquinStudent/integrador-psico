# Informe de Avance — Psicograma

> Centro Psicologico Ser Integral · 26 agosto 2026

---

## Resumen

| Metrica | Valor |
|---|---|
| Tareas completadas | 23 / 31 |
| Avance global | 74% |
| Diferidas | 1 (deploy Vercel) |
| Sprints cerrados | Sprint 1 (100%), Sprint 2 (100%), Sprint 3 (100%) |
| Proximo sprint | Sprint 4 — Informe + PDF + Pulido |

---

## Sprint 0 — Fundacion (80%)

| ID | Tarea | Estado | Notas |
|---|---|---|---|
| S0-01 | Proyecto React+Vite, design system, router | DONE | React 19 + Vite + TS, Clinical Precision |
| S0-02 | Supabase client + tipos base | DONE | 10 tablas, RLS activo |
| S0-03 | Auth + rutas protegidas | DONE | Trigger fix: SET search_path = public |
| S0-04 | Deploy Vercel | PENDIENTE | Build pasa, falta conectar repo (responsable: usuario) |
| S0-05 | Layout shell | DONE | Sidebar violeta, 6 nav items |

---

## Sprint 1 — Pacientes + Dashboard + Wizard (100%)

| ID | Tarea | Estado | Notas |
|---|---|---|---|
| S1-01 | Dashboard KPIs + sesiones recientes | DONE | Queries reales: sesiones/semana, pendientes, pacientes activos |
| S1-02 | Listado pacientes paginado | DONE | Busqueda, 4 filtros (incl. evaluacion pendiente), eval counts reales |
| S1-03 | Crear/editar paciente | DONE | Modal crear + editar, INSERT/UPDATE via Supabase |
| S1-04 | Ficha del paciente | DONE | 3 tabs, historial con sesiones reales, notas en localStorage |
| S1-05 | Catalogo de tests | DONE | PBLL disponible, HTP/DF/DFH locked |
| S1-06 | Wizard nueva sesion | DONE | 3 pasos, consentimiento, crea sesion real en DB |

---

## Sprint 2 — Lienzo + Sesion en Vivo (88%)

| ID | Tarea | Estado | Notas |
|---|---|---|---|
| S2-01 | Bienvenida PBLL + cierre | DONE | Full-screen sin sidebar |
| S2-02 | Canvas de dibujo | DONE | InkCanvas 1563 lineas → DrawingCanvas ~90 lineas |
| S2-03 | Serializar strokes + PNG | DONE | JSON compacto {x,y,t,p?}, PNG a Storage |
| S2-04 | Sync en vivo (Realtime) | DONE | Supabase Broadcast, 4 tipos de evento |
| S2-05 | Metricas en vivo | DONE | 7 metricas: tiempo, latencia, trazos, presion, pausas, borrados, area |
| S2-06 | Observaciones + marcas rapidas | DONE | 6 chips + textarea auto-save |
| S2-07 | Grabacion audio | DONE | MediaRecorder API → webm/opus → Supabase Storage + audio_recordings |
| S2-08 | Finalizar sesion | DONE | Ambos lados pueden finalizar, broadcast status |

---

## Sprint 3 — Analisis + Motor de Reglas (100%)

| ID | Tarea | Estado |
|---|---|---|
| S3-01 | Observaciones post-sesion + transcripcion Whisper | DONE | PostSessionPage: transcripcion, notas editables, flujo → analisis |
| S3-02 | JSON de 201 indicadores PBLL | DONE | 201 indicadores, 18 secciones, 4 categorias. 23 auto + 25 semi + 153 manual |
| S3-03 | Medicion objetiva automatica | DONE | detectObjectiveIndicators(): DIM, UBI, PRE, TMP, BOR auto-detect con umbrales calibrables |
| S3-04 | Criterios sugeridos por AI (Edge Function) | DONE | analyze-drawing: OpenRouter LLM → sugiere indicadores PBLL con confianza, upsert en indicators |
| S3-05 | Checklist profesional por categorias | DONE | AnalysisPage: 3 tabs, checklist por 18 secciones, accept/reject, progress bar |

---

## Sprint 4 — Informe + PDF + Pulido (0%)

| ID | Tarea | Estado |
|---|---|---|
| S4-01 | Generar borrador 9 secciones (Edge Function) | BACKLOG |
| S4-02 | Editor de informe + indice + validacion | BACKLOG |
| S4-03 | Flujo borrador → validar → finalizar | BACKLOG |
| S4-04 | Exportar a PDF | BACKLOG |
| S4-05 | Dashboard con datos reales | BACKLOG |
| S4-06 | Historial informes en ficha paciente | BACKLOG |
| S4-07 | Testing E2E + correcciones UX | BACKLOG |

---

## Decisiones Tecnicas Clave

| ID | Decision | Impacto |
|---|---|---|
| DT-004 | Trigger fix SET search_path = public | Todo trigger sobre auth.users necesita esta clausula |
| DT-005 | Audio diferido a Sprint 3 | Sprint 2 baja de 36pts a 31pts, audio se une con Whisper |
| DT-006 | Realtime Broadcast (no DB changes) | Baja latencia, strokes se persisten solo al finalizar |
| DT-007 | Canvas simplificado | 1563 → ~90 lineas, solo pen + eraser |

## Errores Conocidos

| ID | Error | Estado |
|---|---|---|
| E-001 | "Database error saving new user" | RESUELTO (DT-004) |
| E-002 | Metricas de pausa usan timeMillis relativo | CONOCIDO (aceptable para MVP) |
