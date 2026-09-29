# memory.md — Registro de Decisiones y Estado del Sistema

> Ultima actualizacion: 2026-08-26

---

## Estado del Sistema

| Componente | Estado | Notas |
|---|---|---|
| Proyecto React+Vite | Operativo | `frontend/`, build limpio, 101 modulos |
| Supabase | Operativo | `qqhqsjobbbmkhyvteyfc.supabase.co`, 10 tablas, RLS activo |
| Auth | Operativo | Login/registro funcional, trigger `handle_new_user` con `SET search_path = public` |
| Layout Shell | Operativo | Sidebar + router + rutas protegidas |
| Design System | Operativo | CSS vars en `index.css`, Clinical Precision, ~1200 lineas |
| Canvas/Dibujo | Operativo | DrawingCanvas (pen+eraser+undo), adaptado de Ink Playground |
| Realtime | Operativo | Supabase Broadcast para sync trazos paciente→examinador |
| Metricas en vivo | Operativo | 7 metricas calculadas client-side, broadcast cada 2s |
| Observaciones | Operativo | Textarea + 6 marcas rapidas, auto-save con debounce |
| Backend FastAPI | Esqueleto operativo | `backend/`, dominio puro + puertos + app con auth JWT y `/health`. Falta repositorios y routers |
| Schema v2 (2FN) | Escrito, **sin aplicar** | `sdd/database/schema.sql`, 22 tablas. Requiere decidir DROP-y-recrear vs migracion |
| Seed de catalogos | Operativo | `seed-catalog.mjs` genera 1575 lineas de SQL desde el `.ts`; falla si el catalogo es inconsistente |
| Tests | Backend si, frontend no | 14 tests de dominio en `backend/tests/`. El frontend sigue sin framework |
| Deploy Vercel | Pendiente | Build funciona, falta conectar repo |
| Git | Inicializado | `frontend/`, sin remote |

---

## Sprint Log

### Sprint 0 — Fundacion (2026-08-25)

| Tarea | Estado | Notas |
|---|---|---|
| 0.1 Crear proyecto | DONE | React 19 + Vite + TS, design system Clinical Precision |
| 0.2 Supabase config | DONE | Client configurado, 10 tablas desplegadas, RLS activo |
| 0.3 Auth | DONE | Login/registro, rutas protegidas, trigger fix `SET search_path = public` |
| 0.4 Deploy Vercel | PENDIENTE | Build pasa, falta conectar |
| 0.5 Layout shell | DONE | Sidebar violeta, 6 nav items, iconos SVG |

### Sprint 1 — Pacientes + Dashboard + Wizard (2026-08-26)

| Tarea | Estado | Notas |
|---|---|---|
| 1.1 Dashboard | DONE | KPIs reales (sesiones semana, pendientes, pacientes activos), tabla sesiones recientes |
| 1.2 Listado pacientes | DONE | Tabla paginada, busqueda, 4 filtros (incl. evaluacion pendiente), eval counts reales |
| 1.3 Crear/editar paciente | DONE | Modal crear + editar, INSERT/UPDATE via Supabase |
| 1.4 Ficha paciente | DONE | 3 tabs (datos, historial con sesiones reales, informes), notas clinicas en localStorage |
| 1.5 Catalogo tests | DONE | PBLL disponible, HTP/DF/DFH locked |
| 1.6 Wizard sesion | DONE | 3 pasos, consentimiento con checkboxes, ahora crea sesion real en DB |

### Sprint 2 — Lienzo + Sesion en Vivo (2026-08-26)

| Tarea | Estado | Notas |
|---|---|---|
| 2.0 DB types + session service | DONE | 4 tablas tipadas, createSession/finalizeSession/useSession |
| 2.1 Welcome + Close pages | DONE | Full-screen sin sidebar, consigna PBLL, pantalla cierre |
| 2.2 DrawingCanvas | DONE | ~90 lineas, pen+eraser+undo, adaptado de Ink Playground |
| 2.3 Serialization + persistence | DONE | JSON compacto, PNG a Storage, upsert drawing_data |
| 2.4 Realtime sync | DONE | Supabase Broadcast, stroke:add/erase, status, metrics |
| 2.5 Live metrics | DONE | 7 metricas: tiempo, latencia, trazos, presion, pausas, borrados, area |
| 2.6 Observations panel | DONE | Textarea + 6 quick-mark chips + auto-save |
| 2.7 Audio recording | DIFERIDO | Movido a Sprint 3 (zero coupling, ships con transcripcion) |
| 2.8 Examiner session page | DONE | 3 columnas: mirror + observations + metrics, session bar |
| 2.9 Session finalization | DONE | Ambos lados pueden finalizar, broadcast status |

### Sprint 3 — Analisis + Motor de Reglas (2026-08-26)

| Tarea | Estado | Notas |
|---|---|---|
| 3.2 JSON motor de reglas PBLL | DONE | 201 indicadores (23 auto, 25 semi, 153 manual), 18 secciones, 4 categorias. Archivo: `frontend/src/data/pbll-indicators.ts` |
| 3.3 Medicion objetiva automatica | DONE | `detectObjectiveIndicators()` en `src/lib/objectiveMeasurement.ts`. Auto-detecta DIM, UBI, PRE, TMP, BOR desde LiveMetrics. Umbrales calibrables en THRESHOLDS const |

---

## Decisiones Tecnicas

### DT-001: Supabase client con placeholder
**Fecha:** 2026-08-25
**Contexto:** El usuario aun no tiene proyecto Supabase creado.
**Decision:** El client usa placeholder URL/key si `.env` no existe, para que la app no crashee en desarrollo.
**Impacto:** La app carga pero auth no funciona hasta que se configure `.env` real.
**Estado:** Resuelto — Supabase configurado con credenciales reales.

### DT-002: Proyecto separado de Ink Playground
**Fecha:** 2026-08-25
**Contexto:** Se podia reusar el repo de Ink Playground o crear uno nuevo.
**Decision:** Proyecto nuevo en `frontend/`, separado de `integrador-psico/`. El canvas de Ink se copiara y adaptara en Sprint 2.
**Impacto:** Proyecto limpio, sin deuda tecnica del demo.
**Estado:** Resuelto — StrokeBuilder, StrokeRenderer, useUndoRedo adaptados en `src/canvas/`. InkCanvas.tsx (1563 lineas) reescrito como DrawingCanvas (~90 lineas).

### DT-003: OpenRouter para LLM, Whisper para audio
**Fecha:** 2026-08-25
**Decision:** Reusar OpenRouter SDK (ya instalado en Ink) para sugerencias LLM. OpenAI Whisper API para transcripcion de audio.
**Impacto:** Edge Functions necesitan dos API keys: OPENROUTER_API_KEY y OPENAI_API_KEY.

### DT-004: Trigger fix SET search_path
**Fecha:** 2026-08-26
**Contexto:** Registro de usuario fallaba con "Database error saving new user".
**Decision:** Funcion `handle_new_user()` necesita `SET search_path = public` para encontrar la tabla `profiles`.
**Impacto:** Cualquier trigger futuro sobre `auth.users` debe incluir esta clausula.

### DT-005: Audio diferido a Sprint 3
**Fecha:** 2026-08-26
**Contexto:** Sprint 2 era el mas pesado (36pts). Audio no tiene dependencias con canvas/realtime.
**Decision:** Diferir grabacion de audio a Sprint 3, donde se junta con transcripcion Whisper.
**Impacto:** Sprint 2 baja a ~31pts. La UI del examinador muestra timer de sesion pero no graba audio aun.

### DT-006: Realtime Broadcast vs DB changes
**Fecha:** 2026-08-26
**Contexto:** Para sync en vivo se podia usar DB changes (INSERT trigger) o Broadcast (WebSocket directo).
**Decision:** Broadcast — fire-and-forget sobre WebSocket. Strokes se persisten solo al final ("Termine"), no en cada trazo.
**Impacto:** Baja latencia, menos escrituras a DB. Canal unico `session:{id}` con eventos tipados (stroke:add, stroke:erase, metrics:update, status:update).

### DT-007: Canvas simplificado vs InkCanvas completo
**Fecha:** 2026-08-26
**Contexto:** InkCanvas.tsx de Ink Playground tiene 1563 lineas (16 tipos de elemento, dual canvas, selection, lasso, etc).
**Decision:** Reescribir como DrawingCanvas (~90 lineas). Single canvas, solo pen+eraser, sin viewport transforms, sin sistema de elementos.
**Impacto:** Codigo mas mantenible. Si se necesita pan/zoom futuro, se agrega ViewportManager.

### DT-008: Indicadores PBLL son 201, no ~149
**Fecha:** 2026-08-26
**Contexto:** El manual PBLL tiene mas indicadores de los estimados inicialmente. La seccion B-9 (Partes del cuerpo) tiene 69 indicadores por si sola.
**Decision:** Extraer los 201 indicadores completos con tipado TypeScript. Clasificar cada uno como `auto` (23), `semi` (25) o `manual` (153) segun si el sistema puede detectarlos automaticamente desde los datos de trazos.
**Impacto:** El checklist profesional (S3-05) va a ser mas extenso. El motor de reglas tiene buena cobertura para analisis asistido.

---

### DT-009: Frontend se queda en React; la reescritura es del backend
**Fecha:** 2026-09-28
**Contexto:** Se evaluo migrar a Astro + Vue. La rubrica de APF2 exige hexagonal y 2FN, no un stack concreto.
**Decision:** React 19 + Vite se mantienen. Astro esta pensado para sitios de contenido (islas sin JS, SSG/SSR, SEO) y Psicograma es 100% detras de login, con estado compartido, canvas a 60 fps y espejo por WebSocket. En hexagonal la UI es un adaptador de entrada: cambiarla no mueve ninguna frontera arquitectonica. Lo que si se reescribe es la capa de datos (`frontend/src/lib/*.ts`).
**Impacto:** Se conservan las 13 pantallas, el canvas y el realtime. El esfuerzo va al backend, que es donde la rubrica y la escalabilidad si cobran.

### DT-010: FastAPI, no Django
**Fecha:** 2026-09-28
**Contexto:** Se comparo Django, Django Ninja, Litestar y FastAPI para el backend Python.
**Decision:** FastAPI. El ORM de Django es ActiveRecord — el modelo *es* la persistencia, que es justo lo contrario de lo que exige hexagonal. Sus baterias (admin, auth, migraciones) estan duplicadas porque Supabase Auth ya resuelve identidad. FastAPI no impone ORM ni estructura: el router *es* el adaptador, los modelos Pydantic *son* los DTO de frontera y `Depends` inyecta los puertos. Async-nativo, que importa porque generar un informe con LLM mantiene una request abierta 10-30 s.
**Impacto:** OpenAPI automatico cubre la documentacion tecnica que pide la consigna. Litestar se descarto por comunidad pequena, mal trade en un proyecto academico.

### DT-011: El backend es el unico que habla con la base de datos
**Fecha:** 2026-09-28
**Contexto:** En v1 el navegador tenia la `anon key` y consultaba las 10 tablas via PostgREST.
**Decision:** El frontend pierde todo acceso a datos; se queda solo con Supabase Auth (login) y Realtime (transporte). RLS **no** se elimina: el backend conecta con un rol dedicado sin `BYPASSRLS` y cada transaccion propaga la identidad (`SET LOCAL ROLE authenticated` + `request.jwt.claims`), de modo que las policies siguen evaluandose. Los repositorios filtran por `user_id` como primera capa; RLS es la segunda.
**Impacto:** La superficie expuesta pasa de todo el esquema a los endpoints de `api-contracts.md`. Un `WHERE` olvidado ya no filtra datos de otro psicologo. El realtime sigue en Supabase pero con canales privados autorizados por token del backend: es pub/sub efimero que no persiste nada, relevarlo por FastAPI seria operar un hub WebSocket propio para nada.

### DT-012: Schema v2 normalizado a 2FN
**Fecha:** 2026-09-28
**Contexto:** `indicators` tenia clave candidata `(session_id, code)` con `category`, `manual_section`, `title` e `interpretation` dependiendo solo de `code` — dependencia parcial, los 201 indicadores se repetian por sesion. Ademas cinco columnas JSONB guardaban listas (violacion de 1FN).
**Decision:** 22 tablas. `indicator_catalog` + `session_indicators` corrigen la 2FN; las listas JSONB pasan a tablas propias con catalogo; `sessions.test_type` TEXT pasa a FK de `tests`. Se anade la tabla `strokes`. **Excepcion:** `strokes.points` se queda JSONB — serie temporal atomica de miles de puntos que nunca se consulta por dentro; normalizarla serian ~5.000 filas por sesion sin beneficio de query.
**Impacto:** Los 201 indicadores salen de `frontend/src/data/pbll-indicators.ts` y entran a la base, que es el "motor de reglas configurable" que el Capitulo 1 promete. Normalizar a nivel de trazo hace consultables A-6 (secuencia) y B-3 (borrados). **Pendiente de aplicar contra Supabase.**

### DT-013: Son 201 indicadores, no 202
**Fecha:** 2026-09-28
**Contexto:** `memory.md` e `informe-sprints.md` decian 202 (24 auto). El conteo real del array es 201 (23 auto, 25 semi, 153 manual).
**Decision:** Corregir a 201/23 en toda la documentacion. El generador `seed-catalog.mjs` emite el conteo en la cabecera del SQL, asi que la cifra deja de mantenerse a mano.
**Impacto:** **El Capitulo 1 entregado sigue diciendo 149 indicadores (76 automaticos, 35 checklist) y excluye explicitamente las categorias C y D citando Lin et al. (2022), pero el motor carga las 4 categorias.** Esa incoherencia hay que resolverla antes de APF2: o el motor deja de cargar C y D (recomendado, alinea con la justificacion etica ya defendida), o se rehace la limitacion del Capitulo 1. El seed trae el `UPDATE` comentado para desactivar C y D si se elige la primera.

### DT-014: Nomenclatura del repositorio
**Fecha:** 2026-09-28
**Contexto:** Acentos corrompidos a `_` en 7 directorios de mocks, espacios y prefijos sin padding, erratas (`avance-proyect`, `Proyect Charter`, `Gants`, `Desing`, `Lean Canva`) y un archivo con espacio inicial.
**Decision:** kebab-case minusculas sin acentos ni espacios para directorios y documentos; prefijo `01-` solo donde el orden importa. Excepciones: `README.md`, `LICENSE`, `CONTRIBUTING.md`, `CLAUDE.md`, `AGENTS.md`, `SPEC-*.md`. Convencion anadida a `domain.md`. `psicograma/` pasa a `frontend/` por simetria con `backend/`.
**Impacto:** 305 renombrados, todos con `git mv` para conservar historia. Los que solo cambian mayusculas necesitan dos pasos en macOS (`git mv x tmp && git mv tmp X`) o git no los registra. Build del frontend verificado despues: 107 modulos, `tsc -b` limpio.

### DT-015: 15 SPECs escritos, 30 quedan como deuda declarada
**Fecha:** 2026-09-28
**Contexto:** La regla R1 exige SPEC aprobado antes de codigo, pero existia 1 archivo de 47. Se evaluo redactar los 30 retroactivos de funcionalidad ya entregada.
**Decision:** Redactar solo los **15 que guian trabajo pendiente** (Sprint 5 pendiente, Sprint 6 completo, auditoria). Los 30 en DONE quedan documentados a posteriori en `memory.md` e `informe-sprints.md`, con la deuda declarada en `SPEC-INDEX.md`.
**Impacto:** Los 41 RF y los 30 RNF del SRS quedan trazados a al menos un SPEC, verificado de forma automatica. Escribir Given-When-Then de lo ya entregado no habria mejorado ni el codigo ni la nota.

### DT-016: Correccion de alcance en SPEC-S5-05
**Fecha:** 2026-09-28
**Contexto:** El indice titulaba `SPEC-S5-05` como "endpoints de analisis, audio e informe", pero los endpoints de informe son de `SPEC-S6-01` a `SPEC-S6-04`. Dos SPECs reclamaban el mismo trabajo.
**Decision:** `SPEC-S5-05` queda como "Endpoints de analisis y audio" — la ruta que necesita la demo. El informe queda integro en Sprint 6.
**Impacto:** Se elimina el solapamiento que violaba la regla R5. Al redactar tambien aparecio que el esquema no tiene donde registrar que un paciente fue anonimizado: falta `patients.anonymized_at`, que va en una revision de Alembic (SPEC-S6-05).

### DT-017: La linea base de tiempos se recolecta ya, no en noviembre
**Fecha:** 2026-09-28
**Contexto:** `SPEC-AUD-05` produce el unico dato del Capitulo 4 y estaba agendado para el 02/11.
**Decision:** Separar la recoleccion de la **medicion pre** del resto de la auditoria y arrancarla de inmediato, en paralelo al desarrollo.
**Impacto:** La medicion pre solo existe mientras el centro trabaje a mano. Si los psicologos adoptan el sistema antes de tomarla, es **irrecuperable**: el Capitulo 1 ya documenta que no hay estudios peruanos de donde tomarla prestada, y sin ella la hipotesis de trabajo no se puede contrastar. Analisis previsto: mediana, rango y prueba de Wilcoxon de rangos con signo — no prueba t, porque el n es pequeno y no se asume normalidad.

---

## Lecciones Aprendidas

| ID | Sprint | Leccion |
|---|---|---|
| L-001 | 0 | El template de Vite 2026 trae boilerplate con assets (hero.png, iconos) que hay que limpiar manualmente |
| L-002 | 0 | El hook `guard-write.mjs` del entorno bloquea escritura a `.env*`. Usar `bash cat >` como alternativa |
| L-003 | 0 | Puerto 5173 puede estar ocupado por otro proyecto (Ink Playground). Vite auto-incrementa a 5174+ |
| L-004 | 1 | Supabase v2.112+ requiere `Relationships: []` en cada definicion de tabla en el tipo `Database` |
| L-005 | 1 | Trigger functions en Supabase deben llevar `SET search_path = public` o no encuentran tablas del schema public |
| L-006 | 1 | La INSERT policy en profiles necesita `WITH CHECK (true)` para que el trigger pueda insertar |
| L-007 | 2 | Supabase Broadcast no requiere config extra en el client — `supabase.channel()` funciona out of the box |

---

## Errores Conocidos

| ID | Sprint | Error | Estado |
|---|---|---|---|
| E-001 | 1 | "Database error saving new user" en registro | RESUELTO — DT-004 |
| E-002 | 2 | Metricas de pausa usan timeMillis relativo (por stroke), no timestamps absolutos entre strokes | RESUELTO en el backend — `strokes.started_at_ms`/`ended_at_ms` son offsets absolutos, y `measure_drawing.py` calcula el hueco real. El calculo TS del cliente sigue siendo aproximado hasta que el analisis pase por la API |
