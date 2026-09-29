# Informe de Avance — Psicograma

> Centro Psicologico Ser Integral · **Corte: 30/09/2026**
> Estructura: 6 sprints + 1 auditoria, en 3 fases · Ventana del proyecto: 10/08/2026 – 11/12/2026

---

## Resumen

| Metrica | Valor |
|---|---|
| Tareas completadas | 30 / 47 |
| Avance global | 64 % |
| Sprints cerrados | Sprint 1 (4/5) · Sprint 2 · Sprint 3 · Sprint 4 |
| Sprint en curso | **Sprint 5 — Rearquitectura** (3/7) |
| Pendientes | Sprint 6 (informe y PDF) · Auditoria del sistema |
| Diferidas | 1 (despliegue) |
| Requerimientos especificados | 41 RF · 30 RNF (IEEE 830) |

---

## FASE 1 — Analisis y diseno · 10/08 – 05/10

| ID | Tarea | Estado | Notas |
|---|---|---|---|
| F1-01 | Planificacion: mision, vision, entorno, estrategias, planes | DONE | Capitulo 1 entregado |
| F1-02 | Reunion inicial y relevamiento del proceso manual | DONE | |
| F1-03 | Requerimientos funcionales y no funcionales (SRS IEEE 830) | DONE | 41 RF + 30 RNF, trazados a los 5 objetivos especificos |
| F1-04 | Arquitectura hexagonal y esquema normalizado a 2FN | DONE | 22 tablas, frontera de dominio verificable |
| F1-05 | Diagramas: BPM, casos de uso, clases, secuencia, modelo de datos | **EN PROCESO** | 20 %. Es la brecha principal de APF2 |

---

## FASE 2 — Construccion

### Sprint 1 — Fundacion · 18/08 – 22/08 · 4/5

| ID | Tarea | Estado | Notas |
|---|---|---|---|
| S1-01 | Proyecto React+Vite, design system, router | DONE | Clinical Precision |
| S1-02 | Cliente de base de datos y tipos base | DONE | |
| S1-03 | Registro, login y rutas protegidas | DONE | Trigger con `SET search_path = public` (DT-004) |
| S1-04 | Despliegue inicial | **DIFERIDO** | Build pasa; falta conectar el repositorio |
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

### Sprint 5 — Rearquitectura: backend hexagonal y BD normalizada · 25/09 – 06/10 · 3/7

Sprint nuevo. Nace de la exigencia de arquitectura hexagonal y 2FN, y de la decision de que el
navegador deje de tener credenciales de base de datos (DT-009 a DT-012).

| ID | Tarea | Estado | Notas |
|---|---|---|---|
| S5-01 | Esquema normalizado a 2FN | DONE | 22 tablas, RLS, indices en todas las FK. **Sin aplicar aun** |
| S5-02 | Catalogo del manual en base de datos | DONE | Generador verificable; falla si el catalogo es inconsistente |
| S5-03 | Nucleo de dominio, puertos y servicios | DONE | 14 tests sin base de datos ni red; corrige E-002 |
| S5-04 | Repositorios y propagacion de identidad | **EN PROCESO** | Motor configurado; requiere el esquema aplicado |
| S5-05 | Endpoints de analisis, audio e informe | BACKLOG | |
| S5-06 | Retirar el acceso directo a BD del navegador | BACKLOG | 34 llamadas directas restantes |
| S5-07 | Migraciones versionadas y reversibles | BACKLOG | |

### Sprint 6 — Informe, PDF y cierre funcional · 13/10 – 26/10 · 0/6

| ID | Tarea | Estado |
|---|---|---|
| S6-01 | Generar borrador de 9 secciones desde indicadores validados | BACKLOG |
| S6-02 | Editor del informe con indice y marca de edicion profesional | BACKLOG |
| S6-03 | Flujo borrador → validado con registro de responsable | BACKLOG |
| S6-04 | Exportacion a PDF | BACKLOG |
| S6-05 | Baja logica de paciente conservando historial | BACKLOG |
| S6-06 | Panel de control contra datos consolidados | BACKLOG |

---

## FASE 3 — Auditoria del sistema · 02/11 – 11/11 · 0/5

Verificacion de que lo construido cumple lo especificado. No construye funcionalidad.

| ID | Ambito | Verifica | Estado |
|---|---|---|---|
| AUD-01 | Funcional | Los 41 RF, con evidencia por requerimiento | BACKLOG |
| AUD-02 | Seguridad | RLS efectiva, sin credenciales en el cliente, canales privados, cifrado | BACKLOG |
| AUD-03 | Etica y trazabilidad | Ninguna sugerencia sin validar llega al informe; seccion 9 vacia | BACKLOG |
| AUD-04 | Rendimiento | Latencia del espejo, fluidez del lienzo, tiempos de respuesta | BACKLOG |
| AUD-05 | Investigacion | **Medicion pre/post del tiempo de elaboracion del informe** | BACKLOG |

AUD-05 es el unico que produce el dato del Capitulo 4. Sin el no hay resultados que sostengan la
hipotesis: la variable dependiente es el tiempo de elaboracion y todavia no existe linea base del
procedimiento manual.

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
| DT-012 | Esquema v2 normalizado a 2FN | El catalogo del manual sale del codigo y entra a la base |
| DT-013 | Son 201 indicadores, no 202 | El Capitulo 1 aun declara 149 y excluye C y D: **incoherencia abierta** |
| DT-014 | Nomenclatura del repositorio | 305 renombrados con historia conservada |

---

## Riesgos Abiertos

| ID | Riesgo | Estado |
|---|---|---|
| R-01 | El Capitulo 1 declara 149 indicadores y excluye C y D; el motor carga 201 en 4 categorias | **ABIERTO** — decidir antes de APF2 |
| R-02 | Sin linea base de tiempos, el Capitulo 4 no puede presentar resultados | **ABIERTO** — depende de AUD-05 |
| R-03 | Los diagramas BPM, de clases y de entidad-relacion son la brecha principal de la rubrica | **ABIERTO** — F1-05 al 20 % |
| R-04 | El esquema v2 esta escrito pero no aplicado; bloquea S5-04 en adelante | **ABIERTO** — requiere decision sobre migracion de datos |
| R-05 | **La linea base de tiempos es irrecuperable si el centro adopta el sistema antes de medirla.** Sin ella no hay Capitulo 4 | **ABIERTO** — la recoleccion arranca ya, no en noviembre (DT-017) |
| R-06 | Falta `patients.anonymized_at` en el esquema: sin ese campo, la supresion a solicitud (RNF-16) no se puede verificar | **ABIERTO** — revision de Alembic en SPEC-S6-05 |
| R-07 | **RNF-13 no se cumple**: el canal de realtime no es privado. El paciente no tiene cuenta, asi que no hay token que emitirle sin habilitar login anonimo | **ABIERTO** — DT-026. El canal no transporta datos persistidos, pero hay que reportarlo asi en `SPEC-AUD-02` |
| R-08 | El rol de conexion del backend tiene `BYPASSRLS`. Dentro de `session_for()` RLS si aplica y esta probado; el riesgo es un camino que se olvide de usarlo | **ABIERTO** — DT-027. Criterio 3 de `SPEC-S5-04` sin cumplir; se aplica el rol dedicado despues de la demo |
| R-09 | La app esta rota: 22 llamadas a tablas de la v1 en 8 archivos del frontend, y el build **no** lo detecta | **ABIERTO** — E-003. Es el trabajo inmediato |

---

## Errores Conocidos

| ID | Error | Estado |
|---|---|---|
| E-001 | Error al guardar el usuario en el registro | RESUELTO (DT-004) |
| E-002 | Metricas de pausa con tiempos relativos por trazo | RESUELTO en el backend; el calculo del cliente sigue aproximado hasta que el analisis pase por la API |
