# memory.md — Registro de Decisiones y Estado del Sistema

> Ultima actualizacion: 2026-09-29

---

## Estado del Sistema

> Corte: 29/09/2026

| Componente | Estado | Notas |
|---|---|---|
| Supabase | Operativo | Proyecto **nuevo** `gfqdxrnvameusgjmeadi`, PostgreSQL 17.6. El proyecto v1 queda intacto como rollback |
| Schema v2 (2FN) | **Aplicado** | 22 tablas, RLS en todas, ninguna FK sin indice |
| Seed de catalogos | **Aplicado** | 201 indicadores, 18 secciones, 4 categorias, 6 marcas, 8 actitudes |
| Storage | Operativo | Bucket privado `session-files`, 50 MB, 4 policies, rutas `sessions/{id}/...` |
| Auth | Operativo | Supabase Auth con **firma ES256**; el backend verifica contra el JWKS |
| Backend FastAPI | **Rutas de sesiones, análisis y audio** | CRUD de pacientes/sesiones, dibujo, observaciones, métricas, indicadores y upload de audio; transcripción requiere proveedor |
| Dominio | Operativo | Medicion objetiva + motor de reglas, Python puro, frontera verificada por `check-hexagon.sh` |
| Repositorios | Operativo | 3 puertos implementados + `store.py` para el CRUD sin dominio |
| Tests backend | **67 en verde** | 14 de dominio (sin red) + 53 de integracion contra la base real. ~5 min de corrida |
| Frontend: canvas, realtime, layout, design system | Operativo | Sin cambios; el canvas y el espejo no pasan por el backend |
| Frontend: capa de datos | **Migrada** | No quedan llamadas `supabase.from`, Storage ni Edge Functions fuera de Auth/Realtime; usa `apiClient` |
| Deploy | Pendiente | Ni frontend ni backend desplegados |
| Git | Operativo | `origin/srs-specs-y-esquema-2fn`. **`main` esta 8 commits atras** |

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

> **Nota sobre la numeracion.** A partir de aqui el proyecto se reorganizo en
> **6 sprints + 1 auditoria** (ver `spec/SPEC-INDEX.md`). Los sprints 0 a 3 de
> arriba corresponden a los sprints 1 a 4 de la numeracion nueva.

### Sprint 5 — Rearquitectura (2026-09-28 / 29)

| Tarea | Estado | Notas |
|---|---|---|
| S5-01 Esquema 2FN | DONE | 22 tablas aplicadas en el proyecto nuevo. RLS en todas, ninguna FK sin indice |
| S5-02 Catalogo en base de datos | DONE | 201 indicadores sembrados. `seed-catalog.mjs` falla si el catalogo es inconsistente; `check-sql.py` cruza reset, schema y seed sin conectarse |
| S5-03 Dominio, puertos y servicios | DONE | Medicion y motor de reglas portados de TS. 14 tests sin red. Corrige E-002 |
| S5-04 Repositorios y propagacion de identidad | **EN PROCESO** | Repositorios de dibujo/indicadores y stores CRUD conectados; faltan pruebas contra el entorno configurado y cerrar el rol sin `BYPASSRLS` |
| S5-05 Endpoints de analisis y audio | **PARCIAL** | Análisis determinista, indicadores y upload de audio expuestos; Whisper/LLM quedan en fallback controlado sin claves |
| S5-06 Retirar el acceso directo a BD | **PARCIAL AVANZADO** | Consumidores migrados a `apiClient`; falta cerrar Realtime privado y completar carga de imágenes/transcripciones |
| S5-07 Migraciones Alembic | **IMPLEMENTADO LOCALMENTE** | Alembic, revisión inicial no destructiva y guardas creadas; falta ejecutar `current/upgrade` contra Supabase con backup |

**Infraestructura resuelta esta semana:** proyecto Supabase nuevo, bucket privado
`session-files` con sus 4 policies, y los dos scripts de verificacion
(`smoke-test.py`, `check-storage.py`) para que cualquiera del equipo compruebe su
entorno sin depender de nadie.

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

### DT-018: Proyecto Supabase nuevo en vez de reset del actual
**Fecha:** 2026-09-29
**Contexto:** El esquema v2 no es una migracion: `CREATE TABLE` sin `IF NOT EXISTS` sobre una base con las 10 tablas de la v1 revienta a mitad y la deja aplicada por partes.
**Decision:** Crear un proyecto limpio. Se descarta correr `reset.sql` sobre el actual.
**Impacto:** La razon de peso no es la limpieza, es el **rollback**: el proyecto v1 con su app queda intacto, asi que si algo del v2 falla antes de la entrega hay algo que mostrar. Ademas elimina los dos pasos mas riesgosos: el `DROP` destructivo y el backfill de `profiles` —que si se olvida, los usuarios pueden loguearse pero al crear un paciente les revienta una FK con un mensaje que no dice nada de la causa. `reset.sql` se conserva para el caso de tener que reusar un proyecto.

### DT-019: Auth verifica ES256 contra el JWKS, no HS256
**Fecha:** 2026-09-29
**Contexto:** `auth.py` verificaba solo HS256 con el secreto compartido. El proyecto nuevo firma los tokens con **ES256** (clave asimetrica).
**Decision:** Leer el algoritmo de la cabecera del token y enrutar: asimetrico contra el JWKS del proyecto, HS256 contra el secreto. Se soportan los dos.
**Impacto:** Tal como estaba **habria rechazado todo token valido** con un 401 sin explicacion. Soportar ambos permite que el mismo codigo sirva con el proyecto de cualquier integrante, sin que cada uno toque nada. Los tests usan tokens reales a proposito: un mock habria tapado exactamente este bug.

### DT-020: `SET` no acepta parametros; va `set_config()`
**Fecha:** 2026-09-29
**Contexto:** `session_for()` hacia `SET LOCAL request.jwt.claims = :claims` y fallaba con `syntax error at or near "$1"`. `SET` es una sentencia utilitaria, no una consulta.
**Decision:** `select set_config('request.jwt.claims', :claims, true)`, que es funcion y acepta el bind.
**Impacto:** **Toda la propagacion de identidad estaba muerta**, y con ella la segunda capa de autorizacion. Lo encontraron los tests antes de que existiera un solo endpoint. Interpolar el JSON en el SQL era la otra salida y habria sido una via de inyeccion. Tambien quedo probado lo que importa: el examinador B consulta `patients` sin filtrar por dueno y no ve al paciente de A.

### DT-021: Toda columna con default declara `server_default`
**Fecha:** 2026-09-29
**Contexto:** 22 tests de la API fallaban con `NotNullViolation` en `patients.registered_at`. Si la base pone un default y el modelo no lo declara, SQLAlchemy manda NULL explicito.
**Decision:** `FetchedValue()` en las 39 columnas afectadas, que no duplica la expresion del default en Python. Y un test que compara la paridad contra la base.
**Impacto:** Si alguien agrega una columna con default y no la declara en el modelo, el test falla en vez de descubrirse en runtime.

### DT-022: El CRUD sin dominio no atraviesa el hexagono
**Fecha:** 2026-09-29
**Contexto:** Crear un paciente o listar sesiones no tiene reglas de negocio. Definirles un puerto seria un Protocol con una implementacion y ningun consumidor de dominio.
**Decision:** Ese acceso a datos vive en `adapter/outbound/postgres/store.py` y no implementa ningun puerto. Los repositorios de `repositories.py` siguen siendo los que cumplen puertos, porque el dominio si los consume.
**Impacto:** La frontera que importa sigue intacta y `check-hexagon.sh` la verifica. Se evita una capa de traduccion que no decide nada.

### DT-023: Los errores se traducen con manejadores, no con decoradores
**Fecha:** 2026-09-29
**Contexto:** El primer intento envolvia cada handler con un decorador `@translate` para mapear `NotFound`/`Conflict` a HTTP.
**Decision:** Manejadores de excepcion registrados en `app.py`.
**Impacto:** Un decorador rompe la introspeccion de firmas de FastAPI, de la que dependen la inyeccion por `Depends` y la generacion del OpenAPI.

### DT-024: Ninguna restriccion de la base sale como 500
**Fecha:** 2026-09-29
**Contexto:** La API dejaba escapar un `IntegrityError` crudo. El cuerpo de un error de Postgres trae nombres de constraint, de tabla y de columna.
**Decision:** Manejador de `IntegrityError` que responde 409 **sin detalle** y registra la causa del lado del servidor. Ademas, los casos concretos se validan antes —la marca rapida se busca en el catalogo— para dar un mensaje util en vez de depender de la red de seguridad.
**Impacto:** Devolver el mensaje de Postgres le describe el esquema a quien esta probando entradas. La restriccion queda como respaldo, no como primera linea.

### DT-025: `types/database.ts` se elimina; los tipos describen la API
**Fecha:** 2026-09-29
**Contexto:** Ese archivo tipaba el esquema de Postgres con el generico `Database` de Supabase y quedo describiendo la **v1** despues de migrar a v2. TypeScript compilaba feliz mientras la app fallaba en runtime contra tablas que ya no existen.
**Decision:** Borrarlo y poner `types/api.ts`, que describe el contrato HTTP. `supabase.ts` pierde el generico `<Database>`.
**Impacto:** **Tipos que mienten son peores que no tener tipos.** Consecuencia a tener presente: al quitar el generico, las llamadas `supabase.from(...)` que quedan pasaron a estar sin tipar, asi que el compilador ya no las detecta. La medida honesta del avance es `grep -rn "supabase.from" frontend/src/`.

### DT-026: El canal de realtime se queda sin token, y RNF-13 pasa a riesgo
**Fecha:** 2026-09-29
**Contexto:** `POST /sessions/{id}/realtime-token` estaba planificado para cumplir RNF-13 (canales privados). Pero los canales privados de Supabase se autorizan con el JWT del usuario y RLS sobre `realtime.messages`, y **el paciente no tiene cuenta**: usa la tablet sin loguearse.
**Decision:** Sacarlo del alcance de la semana. El canal sigue siendo broadcast con el UUID de la sesion.
**Impacto:** No hay token que emitirle al paciente salvo habilitando login anonimo, y firmar uno propio no sirve porque el proyecto verifica con ES256 y esa clave privada no es nuestra. **RNF-13 pasa de cumplido a riesgo abierto** y asi debe reportarlo `SPEC-AUD-02`. Mitigacion parcial: el canal no transporta datos persistidos y el id de sesion es un UUID.

### DT-027: El rol de conexion todavia tiene BYPASSRLS
**Fecha:** 2026-09-29
**Contexto:** El backend conecta como `postgres`, que es superusuario. El criterio 3 de `SPEC-S5-04` exige un rol sin `BYPASSRLS`.
**Decision:** Dejarlo para despues de la demo. Escribir el SQL del rol dedicado ahora, aplicarlo despues.
**Impacto:** Dentro de `session_for()` RLS **si** aplica, porque `SET LOCAL ROLE authenticated` baja los privilegios y ese rol no tiene bypass — esta probado en `test_el_rol_efectivo_no_puede_saltarse_rls`. El riesgo real es un camino que se olvide de `session_for()`. Se posterga porque un GRANT faltante deja el backend sin poder leer nada, y con la entrega encima ese no es un riesgo que convenga tomar. **Queda como criterio de `SPEC-S5-04` sin cumplir.**

### DT-028: La migracion 001 y por que existe el directorio
**Fecha:** 2026-09-30
**Contexto:** `patients.anonymized_at` y el CHECK ampliado de `sex` se agregaron a `schema.sql` y a `models.py` pero no a la base. SQLAlchemy selecciona todas las columnas mapeadas, asi que **toda** consulta que tocara `patients` fallaba y la aplicacion quedo inutilizable: 23 tests en rojo por una columna.
**Decision:** Se crea `sdd/database/migrations/`, numerado. Mientras Alembic (`SPEC-S5-07`) siga fuera de alcance, todo cambio de esquema se escribe ahi.
**Impacto:** Es el riesgo R-06 materializado. Quien clone el repo aplica `schema.sql` y despues las migraciones en orden. Lo que salvo el diagnostico fue `test_toda_columna_modelada_existe`, que compara los modelos contra la base viva; sin ese test el sintoma habria sido una app rota sin causa evidente.

### DT-029: Filtro de aplicacion en los endpoints agregados, no solo RLS
**Fecha:** 2026-09-30
**Contexto:** Un review de seguridad marco dos endpoints sin filtro por examinador: `GET /sessions` (`list_all` hacia `select(Session)` sin `WHERE created_by`) y `GET /dashboard/summary` (cuatro consultas sin filtrar, y `recent_sessions` embebia nombre y documento del paciente).
**Verificado:** **No hubo filtracion.** Con dos cuentas reales, RLS tapaba y el examinador B no veia nada de A.
**Decision:** Agregar el filtro explicito igual, y mover el resumen del panel del router al store.
**Impacto:** La proteccion dependia por completo de que `session_for()` hiciera `SET LOCAL ROLE authenticated`, y el rol de conexion todavia tiene BYPASSRLS (R-08). Era **una sola linea de defensa**: un camino que use `engine.connect()` directo, o un cambio a service_role por comodidad, y esos endpoints devuelven historias clinicas ajenas con nombre y documento. El diseno dice que los repositorios filtran como primera capa y RLS es la segunda; aqui faltaba la primera.

Dos notas que conviene no perder:

- **Los endpoints que devuelven colecciones o conteos son los que se escapan**, porque no reciben un id que validar y la respuesta "se ve bien" cuando quien prueba solo tiene datos propios.
- **Un conteo que suma filas ajenas ya filtra informacion** aunque no muestre nombres: revela cuantos pacientes y sesiones atiende el otro profesional.

Lo que evita la repeticion: dos tests que corren con una conexion **que salta RLS**, asi que lo unico que puede protegerlos es el `WHERE` de la aplicacion. Los tests de la API pasaban con filtro y sin el. Se verifico que tienen dientes quitando los filtros: fallan con `assert 6 == 0`. Uno comprueba ademas que el rol siga teniendo bypassrls y avisa si deja de tenerlo, porque en ese momento dejaria de probar lo que dice probar.

---

### DT-030: El adaptador de OpenRouter, y por que la seccion 5 tiene respaldo
**Fecha:** 2026-09-29
**Contexto:** Las secciones 5, 7 y 8 del informe salian vacias (`0 car`). `compose_report` emitia los tres `DraftRequest` correctamente, pero nadie los resolvia: no existia adaptador de LLM.
**Decision:** `adapter/outbound/llm/` con `prompts.py` (el limite clinico) y `drafter.py` (httpx directo contra OpenRouter, sin SDK). `draft_all` las pide **en paralelo** y aisla fallos: una seccion que falla no tumba las otras dos ni el informe.
**Impacto:** El router pone `llm_available` y `pending_sections` en la respuesta de generacion, y el frontend avisa cuales quedaron en blanco. Ademas se agrego `DraftRequest.fallback`: la **5 sale con las mediciones listadas** si el modelo no contesta, porque son datos objetivos y no interpretacion. La 7 y la 8 **no llevan respaldo a proposito** — sin redaccion no hay nada honesto que poner en una seccion interpretativa, y un parrafo de relleno en un informe firmado es peor que un blanco.
**Verificado:** live contra OpenRouter (las tres secciones con prosa en espanol, citando las secciones del manual) y contra la base real con el redactor sustituido. 109 tests en verde.

---

### DT-031: La sesion en vivo, y por que la tablet no teclea un UUID
**Fecha:** 2026-09-30
**Contexto:** Tras firmar el consentimiento, `NewSessionPage` navegaba a `/sesion/:id/paciente/bienvenida`: el **examinador** terminaba viendo el lienzo del paciente en su propio laptop y nadie quedaba en el monitoreo. El cronometro contaba desde `session.started_at`, que se lee una sola vez al montar; como el examinador abre el monitoreo antes de que el paciente toque "Comenzar", ese valor era `null`, el efecto salia por el return y el reloj se quedaba en `00:00` toda la sesion. La grabacion solo arrancaba con un click.
**Decision:** El examinador va al monitoreo y de ahi sale el enlace para la tablet. La tablet se loguea con la cuenta del examinador —es el dispositivo del consultorio— en vez de un token publico: un token pide tabla nueva, endpoints sin autenticar y revisar RLS a una semana de entregar. El reloj arranca con el `started_at` que reemite la tablet. La grabacion arranca con el primer trazo, **solo si el consentimiento autorizo el audio**, y el boton sigue siendo del examinador.
**Impacto:** Se agrego `/sesion/activa`, una ruta que resuelve cual es la sesion lista (`consent` primero, `active` despues, para la tablet que vuelve a mitad de la toma). Existe porque nadie teclea un UUID en una tablet: se guarda **una** direccion en favoritos. El guion del manual PBLL vive en `lib/protocoloPbll.ts` como datos con cita a la seccion, no en JSX, para que se revise contra el manual.
**Verificado:** 13 comprobaciones por HTTP contra la base real (ciclo completo, consentimiento, las dos rutas del listado, `started_at` idempotente, preflight CORS desde la IP LAN y cerrado a origenes no declarados). El espejo, el reloj corriendo y la grabacion **no** se probaron en navegador: la extension de Chrome no estaba conectada.

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
| L-008 | 5 | Supabase entrega el DSN como `postgresql://`, y SQLAlchemy lo resuelve a psycopg y falla con `ModuleNotFoundError`. `engine.py` lo normaliza a `+asyncpg`: pedirle a cada integrante que lo recuerde es una pieza de conocimiento que se pierde |
| L-009 | 5 | El puerto 5432 (session pooler) sirve para el runtime y ademas soporta prepared statements. El 6543 (transaction pooler) no, y de ahi el `statement_cache_size: 0`. Alembic va al 5432 |
| L-010 | 5 | Un objeto `mapped_column` no se puede reusar entre tablas en SQLAlchemy. Los objetos de **tipo** si. De ahi que `pk()` sea una fabrica y `TS` una constante |
| L-011 | 5 | **BSD sed (macOS) no soporta `\b`.** Un renombrado con `\b` no falla: no hace nada, y pasa desapercibido |
| L-012 | 5 | `tsc -b` cachea en `*.tsbuildinfo`: una segunda corrida puede no reportar nada y parecer exito. Para verificar de verdad, `tsc --noEmit -p tsconfig.app.json` |
| L-013 | 5 | Los codigos ANSI rompen `grep -c "error TS"`, porque la cadena no es contigua. Hay que limpiar el color antes de contar |
| L-014 | 5 | `pytest-asyncio` con fixtures de scope `session` y loop por funcion **cuelga** asyncpg, que ata sus conexiones al loop que las creo. Se resuelve con `asyncio_default_fixture_loop_scope = "session"` |
| L-015 | 5 | Borrar datos en el teardown de un fixture por test bloquea contra la transaccion del examinador dueno, que todavia tiene lock sobre la fila. La limpieza va al cierre de la sesion de tests. Sintoma engañoso: los tests que **no** ven la fila (por RLS) pasan, y solo cuelga el que si la lee |
| L-016 | 5 | Postgres cancela por `statement_timeout` en vez de esperar para siempre: un deadlock se ve como lentitud, no como cuelgue. La corrida tardaba 11m35s y bajo a 1m22s al corregirlo |
| L-017 | 6 | **Una variable exportada en `~/.zshrc` le gana al `.env`**: pydantic-settings da prioridad al entorno real. Una `OPENROUTER_API_KEY` vieja exportada en el perfil hacia que el adaptador recibiera 401 mientras `curl` con la clave del `.env` daba 200. Sintoma: la clave "esta bien" y el proveedor la rechaza. Se descarta con `env -u OPENROUTER_API_KEY` |
| L-018 | 6 | **El `broadcast` de Supabase no reenvia lo pasado.** Un examinador que recarga el monitoreo a mitad de la toma se pierde el `connected: true` y ve "Sin conexion" con el paciente dibujando delante. Se resuelve reemitiendo el estado completo en el tick de 2 s que ya existia, no con Presence |
| L-019 | 6 | **`localhost` no es una direccion, es "yo".** Un `VITE_API_URL` fijo en `http://localhost:8000` deja a la tablet sin API, porque para ella localhost es la tablet. `apiClient` ahora lo deduce de `window.location.hostname`: asi no hay ninguna IP escrita en un archivo, y la IP de esta maquina cambio de `.125` a `.234` entre planificar y ejecutar |
| L-020 | 6 | **Un fallo de CORS se ve como "la app no hace nada", no como un error de red.** Si el 5173 esta ocupado Vite arranca en 5174 sin mas aviso que una linea en consola, ese origen no esta en `CORS_ORIGINS` y el navegador bloquea **todas** las llamadas: la interfaz carga y ningun boton funciona. Se listan 5173-5175 en el `.env`. Y `CORS_ORIGINS` se lee una sola vez al arrancar: tocar el `.env` no basta, ni con `--reload`, que solo vigila los `.py` |

---

## Errores Conocidos

| ID | Sprint | Error | Estado |
|---|---|---|---|
| E-001 | 1 | "Database error saving new user" en registro | RESUELTO — DT-004 |
| E-002 | 2 | Metricas de pausa usan timeMillis relativo (por stroke), no timestamps absolutos entre strokes | RESUELTO en el backend — `strokes.started_at_ms`/`ended_at_ms` son offsets absolutos, y `measure_drawing.py` calcula el hueco real. El calculo TS del cliente sigue siendo aproximado hasta que el analisis pase por la API |
| E-003 | 5 | **Al aplicar el esquema v2 la app quedo rota.** El frontend consultaba `observations`, `indicators`, `drawing_data` y `sessions.test_type` | RESUELTO en código — consumidores migrados a `apiClient`; falta validación end-to-end contra Supabase |
| E-004 | 5 | `drawingData.ts` usa `getPublicUrl()` sobre un bucket privado: `final_image_url` queda como link muerto y la imagen no carga en la pantalla de analisis | ABIERTO — se resuelve guardando la **ruta** y firmandola al leer con `FileStore.signed_url()`, que ya esta declarado como puerto. Corresponde a `SPEC-S5-05` |

---

## Riesgos Abiertos

Ver `informe-sprints.md` para el detalle y el estado. Los que bloquean:

| ID | Riesgo |
|---|---|
| R-01 | El Capitulo 1 declara 149 indicadores y excluye las categorias C y D; el motor carga 201 en 4 categorias. **Decision pendiente del equipo** |
| R-05 | La linea base de tiempos es irrecuperable si el centro adopta el sistema antes de medirla. Sin ella no hay Capitulo 4 |
| R-07 | RNF-13 (canales privados de realtime) no se cumple, ver DT-026 |
| R-08 | El rol de conexion tiene `BYPASSRLS`, ver DT-027 |
