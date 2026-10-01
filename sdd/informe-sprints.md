# Informe de Avance — Psicograma

> Centro Psicologico Ser Integral · **Corte: 01/10/2026**
> Estructura: 6 sprints + 1 auditoria, en 3 fases · Ventana del proyecto: 10/08/2026 – 11/12/2026

---

## Resumen

| Metrica | Valor |
|---|---|
| Tareas completadas | 40 / 47 |
| Avance global | 85.1 % |
| Sprints cerrados | Sprint 1 (4/5) · Sprint 2 (6/6) · Sprint 3 (8/8) · Sprint 4 (5/5) · Sprint 5 (7/7) · Sprint 6 (6/6) |
| Sprint en curso | **Fase 1: F1-05 — Diagramas de diseño (BPM, clases, ER)** (20%) |
| Pendientes | Auditoria del sistema (Fase 3: 0/5) |
| Diferidas | 1 (despliegue productivo continuo) |
| Requerimientos especificados | 41 RF · 30 RNF (IEEE 830) |

---

## FASE 1 — Analisis y diseno · 10/08 – 05/10

| ID | Tarea | Estado | Notas |
|---|---|---|---|
| F1-01 | Planificacion: mision, vision, entorno, estrategias, planes | DONE | Capitulo 1 entregado |
| F1-02 | Reunion inicial y relevamiento del proceso manual | DONE | |
| F1-03 | Requerimientos funcionales y no funcionales (SRS IEEE 830) | DONE | 41 RF + 30 RNF, trazados a los 5 objetivos especificos |
| F1-04 | Arquitectura hexagonal y esquema normalizado a 2FN | DONE | 22 tablas, frontera de dominio verificable, 119 tests |
| F1-05 | Diagramas: BPM, casos de uso, clases, secuencia, modelo de datos | **EN PROCESO** | 20 %. Es la brecha principal para el informe formal APF2 |

---

## FASE 2 — Construccion

### Sprint 1 — Fundacion · 18/08 – 22/08 · 4/5

| ID | Tarea | Estado | Notas |
|---|---|---|---|
| S1-01 | Proyecto React+Vite, design system, router | DONE | Clinical Precision |
| S1-02 | Cliente de base de datos y tipos base | DONE | |
| S1-03 | Registro, login y rutas protegidas | DONE | Trigger con `SET search_path = public` (DT-004) |
| S1-04 | Despliegue inicial | **DIFERIDO** | Build pasa; falta conectar el pipeline de producción |
| S1-05 | Shell de navegacion del examinador | DONE | |

### Sprint 2 — Pacientes, panel de control y sesiones · 25/08 – 01/09 · 6/6

| ID | Tarea | Estado | Notas |
|---|---|---|---|
| S2-01 | Panel de indicadores de gestion | DONE | Sesiones de la semana, pendientes, pacientes activos |
| S2-02 | Listado paginado con busqueda y filtros | DONE | 4 filtros, incluido evaluacion pendiente |
| S2-03 | Registrar y actualizar paciente | DONE | |
| S2-04 | Ficha del paciente con historial e informes | DONE | 3 pestanas |
| S2-05 | Catalogo de tests proyectivos | DONE | PBLL disponible; HTP, DF y DFH bloqueados |
| S2-06 | Asistente de nueva sesion con consentimiento | DONE | 3 pasos |

### Sprint 3 — Lienzo del paciente y sesion en vivo · 04/09 – 11/09 · 8/8

| ID | Tarea | Estado | Notas |
|---|---|---|---|
| S3-01 | Consigna PBLL y pantalla de cierre | DONE | Pantalla completa, sin metricas visibles al paciente |
| S3-02 | Lienzo con lapiz, borrador y deshacer | DONE | 1563 lineas de Ink reducidas a ~90 (DT-007) |
| S3-03 | Serializar trazos con dimension temporal y PNG | DONE | |
| S3-04 | Espejo del dibujo en vivo | DONE | Broadcast, 4 tipos de evento (DT-006) |
| S3-05 | Metricas en vivo | DONE | 7 metricas, refresco cada 2 s |
| S3-06 | Marcas rapidas y observaciones con autoguardado | DONE | 6 marcas predefinidas |
| S3-07 | Grabacion de audio | DONE | Sujeta a autorizacion en el consentimiento |
| S3-08 | Finalizar sesion desde ambos dispositivos | DONE | |

### Sprint 4 — Analisis y motor de reglas PBLL · 16/09 – 22/09 · 5/5

| ID | Tarea | Estado | Notas |
|---|---|---|---|
| S4-01 | Transcripcion del audio y verbalizaciones | DONE | |
| S4-02 | Catalogo de 201 indicadores PBLL | DONE | 18 secciones, 4 categorias, 23 auto + 25 semi + 153 manual (DT-013) |
| S4-03 | Medicion objetiva automatica | DONE | Umbrales calibrables |
| S4-04 | Sugerencia asistida de indicadores | DONE | Siempre como sugerencia, nunca validada |
| S4-05 | Checklist profesional por secciones | DONE | 3 pestanas, aceptar/rechazar |

### Sprint 5 — Rearquitectura: backend hexagonal y BD normalizada · 25/09 – 30/09 · 7/7

Sprint completado. Asegura arquitectura hexagonal, normalización a 2FN y desacopla el cliente de credenciales directas de BD (DT-009 a DT-012, DT-028 a DT-032).

| ID | Tarea | Estado | Notas |
|---|---|---|---|
| S5-01 | Esquema normalizado a 2FN | DONE | 22 tablas aplicadas en Supabase con RLS e índices completos |
| S5-02 | Catalogo del manual en base de datos | DONE | 201 indicadores sembrados y verificados con `check-sql.py` |
| S5-03 | Nucleo de dominio, puertos y servicios | DONE | Dominio puro hexagonal con medicion objetiva y motor de reglas |
| S5-04 | Repositorios y propagacion de identidad | DONE | Repositorios Postgres y `session_for` con `SET LOCAL ROLE authenticated` |
| S5-05 | Endpoints de analisis, audio e indicadores | DONE | Rutas REST FastAPI, upload de audio y transcriptor Whisper alineado |
| S5-06 | Retirar el acceso directo a BD del navegador | DONE | Frontend migrado a `apiClient` (116 módulos compilando limpios) |
| S5-07 | Migraciones versionadas y reversibles | DONE | Migraciones `001` y `002` creadas y aplicadas exitosamente |

### Sprint 6 — Informe, PDF y cierre funcional · 28/09 – 01/10 · 6/6

| ID | Tarea | Estado | Notas |
|---|---|---|---|
| S6-01 | Generar borrador de 9 secciones desde indicadores validados | DONE | Motor determinista + redactor OpenRouter en secciones 5, 7 y 8 con fallback seguro |
| S6-02 | Editor del informe con indice y marca de edicion profesional | DONE | Navegacion lateral, guardado de modificaciones y registro de cambios |
| S6-03 | Flujo borrador → validado con registro de responsable | DONE | Validacion profesional con fecha y firma |
| S6-04 | Exportacion a PDF | DONE | Generacion y descarga de informe estructurado |
| S6-05 | Baja logica de paciente conservando historial | DONE | Anonimizacion con `patients.anonymized_at` (RNF-16) |
| S6-06 | Panel de control contra datos consolidados | DONE | Dashboard conectado a endpoints del backend |

---

## FASE 3 — Auditoria del sistema · 02/11 – 11/11 · 0/5

Verificacion de que lo construido cumple lo especificado.

| ID | Ambito | Verifica | Estado |
|---|---|---|---|
| AUD-01 | Funcional | Los 41 RF, con evidencia por requerimiento | BACKLOG |
| AUD-02 | Seguridad | RLS efectiva, sin credenciales en el cliente, canales broadcast, cifrado | BACKLOG |
| AUD-03 | Etica y trazabilidad | Ninguna sugerencia sin validar llega al informe; seccion 9 vacia | BACKLOG |
| AUD-04 | Rendimiento | Latencia del espejo, fluidez del lienzo, tiempos de respuesta | BACKLOG |
| AUD-05 | Investigacion | **Medicion pre/post del tiempo de elaboracion del informe** | BACKLOG (recoleccion pre iniciada) |

---

## Decisiones Tecnicas Clave

| ID | Decision | Impacto |
|---|---|---|
| DT-004 | Trigger con `SET search_path = public` | Todo trigger sobre `auth.users` lo necesita |
| DT-006 | Broadcast en vez de cambios en base de datos | Baja latencia; los trazos se persisten al finalizar |
| DT-007 | Lienzo simplificado | 1563 → ~90 lineas, solo lapiz y borrador |
| DT-009 | El frontend se queda en React; se reescribe el backend | Se conservan 13 pantallas, lienzo y realtime |
| DT-010 | FastAPI en vez de Django | El ORM de Django pelea con hexagonal; Supabase Auth ya resuelve identidad |
| DT-011 | El backend es el unico que accede a la base de datos | El navegador pierde credenciales; RLS se conserva como segunda capa |
| DT-012 | Esquema v2 normalizado a 2FN | El catalogo del manual sale del codigo y entra a la base (22 tablas) |
| DT-013 | Son 201 indicadores, no 202 | Se aísla C y D en el informe para mantener rigor ético |
| DT-014 | Nomenclatura del repositorio | 305 renombrados con historia conservada |
| DT-019 | Auth verifica ES256 asimétrico | Backend valida tokens contra JWKS público de Supabase |
| DT-028 | Migraciones numeradas en BD | Control estricto de esquema sin depender de ORMs invasivos |
| DT-030 | Adaptador OpenRouter con fallback determinista | Secciones 5, 7 y 8 redactadas con IA; sección 5 no queda vacía si falla red |
| DT-032 | Alineación temporal de Whisper y marcas | Mapeo exacto entre el reloj de sesión y el offset de grabación |

---

## Riesgos Abiertos

| ID | Riesgo | Estado |
|---|---|---|
| R-01 | El Capitulo 1 declara 149 indicadores y excluye C y D; el motor carga 201 en 4 categorias | **EN CONTROL** — el informe no incorpora C y D (aisladas por diseño de dominio) |
| R-02 | Sin linea base de tiempos, el Capitulo 4 no puede presentar resultados | **ABIERTO** — depende de AUD-05 (iniciar medición manual en centro) |
| R-03 | Los diagramas BPM, de clases y de entidad-relacion son la brecha principal de la rubrica | **ABIERTO** — F1-05 al 20 % |
| R-04 | El esquema v2 esta escrito pero no aplicado | **RESUELTO** — Aplicado en Supabase (`gfqdxrnvameusgjmeadi`) |
| R-05 | **La linea base de tiempos es irrecuperable si el centro adopta el sistema antes de medirla.** | **ABIERTO** — requiere aplicar la ficha pre-test antes de liberar la app |
| R-06 | Falta `patients.anonymized_at` en el esquema | **RESUELTO** — Migración 001 aplicada y verificada en tests |
| R-07 | RNF-13: canal realtime sin token por paciente | **DOCUMENTADO** — Reportado en SPEC-AUD-02; mitigado por UUID efímero |
| R-08 | Rol de conexion backend con BYPASSRLS | **MITIGADO** — Se evalúa RLS vía `set_config` y `SET LOCAL ROLE authenticated` |
| R-09 | Llamadas directas del frontend a Supabase | **RESUELTO** — Frontend migrado por completo a `apiClient` |

---

## Errores Conocidos

| ID | Error | Estado |
|---|---|---|
| E-001 | Error al guardar el usuario en el registro | RESUELTO (DT-004) |
| E-002 | Metricas de pausa con tiempos relativos por trazo | RESUELTO en backend mediante offsets absolutos de trazos |
| E-003 | Llamadas a tablas v1 rompían la app tras migrar esquema | RESUELTO — frontend migrado a la API REST |
| E-004 | Bucket privado con URL pública en drawingData | RESUELTO — rutas relativas firmadas mediante backend |
| E-005 | Sesiones cerradas abrían la pantalla en vivo y relanzaban grabación | RESUELTO — guard de estado en `EN_VIVO` |
| E-006 | Desborde visual en stepper de 3 pasos en asistente | RESUELTO — layout flex y etiquetas ajustadas |
