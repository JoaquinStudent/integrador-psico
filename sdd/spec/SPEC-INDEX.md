# SPEC-INDEX.md — Indice de Especificaciones

> Ultima actualizacion: 2026-09-28 · **Corte de avance: 30/09/2026**
> Estructura: **6 sprints + 1 auditoria**, en 3 fases. Ver `entregas/avance-2/07-informe/anexos-charter-gantt.md`
> Requerimientos: `entregas/avance-2/07-informe/requerimientos-funcionales-no-funcionales.md`

Cada SPEC declara los `RF-nn` y `RNF-nn` que realiza. Un SPEC sin requerimiento trazado es un SPEC
que nadie pidio.

---

## Resumen al 30/09/2026

| Fase | Sprint | Ventana | SPECs | DONE | Estado |
|---|---|---|---|---|---|
| 1 | Analisis y diseno | 10/08 – 05/10 | 5 | 4 | En proceso (diagramas) |
| 2 | Sprint 1 — Fundacion | 18/08 – 22/08 | 5 | 4 | Cerrado (deploy diferido) |
| 2 | Sprint 2 — Pacientes, panel y sesiones | 25/08 – 01/09 | 6 | 6 | Cerrado |
| 2 | Sprint 3 — Lienzo y sesion en vivo | 04/09 – 11/09 | 8 | 8 | Cerrado |
| 2 | Sprint 4 — Analisis y motor de reglas | 16/09 – 22/09 | 5 | 5 | Cerrado |
| 2 | Sprint 5 — Rearquitectura | 25/09 – 06/10 | 7 | 3 | **En proceso** |
| 2 | Sprint 6 — Informe, PDF y cierre funcional | 13/10 – 26/10 | 6 | 0 | Backlog |
| 3 | Auditoria del sistema | 02/11 – 11/11 | 5 | 0 | Backlog |
| **Total** | | | **47** | **30** | **64 %** |

---

## FASE 1 — Analisis y diseno

| ID | Modulo | Historia | RF / RNF | Estado |
|---|---|---|---|---|
| `SPEC-F1-01` | Planificacion | Mision, vision, entorno, estrategias, planes y alcance | — | DONE |
| `SPEC-F1-02` | Levantamiento | Reunion inicial y relevamiento del proceso manual actual | — | DONE |
| `SPEC-F1-03` | Requerimientos | SRS bajo IEEE 830: 41 RF y 30 RNF | Todos | DONE |
| `SPEC-F1-04` | Arquitectura | Arquitectura hexagonal y esquema normalizado a 2FN | RNF-11, RNF-12, RNF-25, RNF-27 | DONE |
| `SPEC-F1-05` | Diagramas | BPM, casos de uso, clases, secuencia y modelo de datos | Todos | **IN_PROGRESS** |

---

## FASE 2 — Construccion

### Sprint 1 — Fundacion · 18/08 – 22/08

| ID | Modulo | Historia | RF / RNF | Estado |
|---|---|---|---|---|
| `SPEC-S1-01` | Infraestructura | Proyecto React+Vite, design system, router | RNF-21 | DONE |
| `SPEC-S1-02` | Infraestructura | Cliente de base de datos y tipos base | — | DONE |
| `SPEC-S1-03` | Auth | Registro, login y rutas protegidas por perfil | RF-01, RF-02, RF-03 | DONE |
| `SPEC-S1-04` | Infraestructura | Despliegue inicial | RNF-07 | **DIFERIDO** |
| `SPEC-S1-05` | Layout | Shell de navegacion del examinador | RNF-22 | DONE |

### Sprint 2 — Pacientes, panel de control y sesiones · 25/08 – 01/09

| ID | Modulo | Historia | RF / RNF | Estado |
|---|---|---|---|---|
| `SPEC-S2-01` | Panel | Indicadores de gestion y sesiones recientes | RF-40 | DONE |
| `SPEC-S2-02` | Pacientes | Listado paginado con busqueda y filtros | RF-06 | DONE |
| `SPEC-S2-03` | Pacientes | Registrar y actualizar paciente | RF-04, RF-05 | DONE |
| `SPEC-S2-04` | Pacientes | Ficha del paciente con historial e informes | RF-07, RF-39 | DONE |
| `SPEC-S2-05` | Tests | Catalogo de tests proyectivos | RF-41 | DONE |
| `SPEC-S2-06` | Sesiones | Asistente de nueva sesion con consentimiento | RF-09, RF-10, RNF-14 | DONE |

### Sprint 3 — Lienzo del paciente y sesion en vivo · 04/09 – 11/09

| ID | Modulo | Historia | RF / RNF | Estado |
|---|---|---|---|---|
| `SPEC-S3-01` | Paciente UI | Consigna PBLL y pantalla de cierre | RF-19, RNF-23 | DONE |
| `SPEC-S3-02` | Canvas | Lienzo con lapiz, borrador y deshacer | RF-14, RF-15, RNF-02 | DONE |
| `SPEC-S3-03` | Captura | Serializar trazos con dimension temporal y PNG final | RF-16, RF-17, RF-18 | DONE |
| `SPEC-S3-04` | Realtime | Espejo del dibujo paciente → examinador | RF-20, RF-25, RNF-01 | DONE |
| `SPEC-S3-05` | Metricas | Metricas en vivo en el panel del examinador | RF-21, RNF-04 | DONE |
| `SPEC-S3-06` | Observaciones | Marcas rapidas y observaciones con autoguardado | RF-22, RF-23 | DONE |
| `SPEC-S3-07` | Audio | Grabacion de audio sujeta a consentimiento | RF-26, RNF-14 | DONE |
| `SPEC-S3-08` | Sesion | Finalizar sesion desde ambos dispositivos | RF-12, RF-13 | DONE |

### Sprint 4 — Analisis y motor de reglas PBLL · 16/09 – 22/09

| ID | Modulo | Historia | RF / RNF | Estado |
|---|---|---|---|---|
| `SPEC-S4-01` | Post-sesion | Transcripcion del audio y verbalizaciones | RF-27, RF-28 | DONE |
| `SPEC-S4-02` | Motor Reglas | Catalogo de 201 indicadores PBLL | RF-34, RNF-05 | DONE |
| `SPEC-S4-03` | Analisis | Medicion objetiva automatica del trazo | RF-29, RF-30, RNF-26 | DONE |
| `SPEC-S4-04` | IA | Sugerencia asistida de indicadores | RF-31, RNF-18, RNF-19 | DONE |
| `SPEC-S4-05` | Verificacion | Checklist profesional por secciones del manual | RF-32, RF-33, RNF-20 | DONE |

### Sprint 5 — Rearquitectura: backend hexagonal y BD normalizada · 25/09 – 06/10

Sprint nuevo, no existia en la planificacion original. Nace de la exigencia de arquitectura hexagonal
y normalizacion a 2FN, y de la decision de que el navegador deje de tener credenciales de base de
datos (DT-009 a DT-012 en `memory.md`).

| ID | Modulo | Historia | RF / RNF | Estado |
|---|---|---|---|---|
| `SPEC-S5-01` | Base de datos | Esquema normalizado a 2FN, 22 tablas con RLS e indices | RNF-11, RNF-15, RNF-27 | DONE |
| `SPEC-S5-02` | Base de datos | Catalogo del manual en base de datos, generado y verificado | RF-34, RNF-05 | DONE |
| `SPEC-S5-03` | Backend | Nucleo de dominio, puertos y servicios de medicion y reglas | RF-29, RF-30, RNF-25, RNF-26 | DONE |
| `SPEC-S5-04` | Backend | Repositorios de persistencia y propagacion de identidad | RNF-11, RNF-15 | **SPEC_READY** |
| `SPEC-S5-05` | Backend | Endpoints de analisis y audio | RF-26 a RF-33 | **SPEC_READY** |
| `SPEC-S5-06` | Frontend | Retirar el acceso directo a la base de datos del navegador | RNF-12, RNF-13 | **SPEC_READY** |
| `SPEC-S5-07` | Base de datos | Migraciones versionadas y reversibles | RNF-27 | **SPEC_READY** |

`SPEC-S5-05` se titulaba "endpoints de analisis, audio e informe". Los endpoints de informe pertenecen
a `SPEC-S6-01` a `SPEC-S6-04`; mantenerlos en ambos sitios violaba la regla R5. Corregido al redactar.

### Sprint 6 — Informe psicologico, PDF y cierre funcional · 13/10 – 26/10

| ID | Modulo | Historia | RF / RNF | Estado |
|---|---|---|---|---|
| `SPEC-S6-01` | Informe | Generar borrador de 9 secciones desde indicadores validados | RF-35, RNF-17, RNF-18, RNF-19 | **SPEC_READY** |
| `SPEC-S6-02` | Editor | Editor del informe con indice y marca de edicion profesional | RF-36 | **SPEC_READY** |
| `SPEC-S6-03` | Validacion | Flujo borrador → validado con registro de responsable | RF-37, RNF-20 | **SPEC_READY** |
| `SPEC-S6-04` | Export | Exportacion del informe validado a PDF | RF-38 | **SPEC_READY** |
| `SPEC-S6-05` | Pacientes | Baja logica de paciente y supresion de datos | RF-08, RNF-16 | **SPEC_READY** |
| `SPEC-S6-06` | Panel | Panel de control con datos consolidados | RF-40 | **SPEC_READY** |

`SPEC-S6-05` destapo un hueco del esquema: no hay donde registrar que un paciente fue anonimizado.
Requiere anadir `patients.anonymized_at` en una revision de Alembic.

---

## FASE 3 — Auditoria del sistema · 02/11 – 11/11

No es un sprint de construccion: es la verificacion de que lo construido cumple lo especificado. Cada
SPEC audita requerimientos, no los implementa.

| ID | Ambito | Historia | Verifica | Estado |
|---|---|---|---|---|
| `SPEC-AUD-01` | Funcional | Recorrido end-to-end de los 41 RF con evidencia por requerimiento | RF-01 a RF-41, RNF-24 | **SPEC_READY** |
| `SPEC-AUD-02` | Seguridad | Aislamiento entre examinadores, verificado atacandolo | RNF-10 a RNF-13, RNF-15 | **SPEC_READY** |
| `SPEC-AUD-03` | Etica y trazabilidad | Ninguna sugerencia sin validar llega al informe; seccion 9 vacia; todo indicador cita el manual | RNF-14, RNF-17 a RNF-20 | **SPEC_READY** |
| `SPEC-AUD-04` | Rendimiento y compatibilidad | Latencia del espejo, fluidez del lienzo, tiempos de respuesta, dispositivos | RNF-01 a RNF-04, RNF-09, RNF-28 a RNF-30 | **SPEC_READY** |
| `SPEC-AUD-05` | Investigacion | Medicion pre/post del tiempo de elaboracion del informe | RF-37, objetivo especifico 5 | **SPEC_READY** |

`SPEC-AUD-05` es el unico que produce el dato del Capitulo 4. Sin el, el proyecto no puede sostener su
hipotesis de trabajo, porque la variable dependiente es el tiempo de elaboracion del informe y todavia
no existe linea base del procedimiento manual.

**Y de ahi sale el riesgo que este SPEC destapo:** la medicion **pre** solo se puede tomar mientras el
centro siga elaborando informes a mano. Esta agendada para el 02/11, pero si a esa fecha los psicologos
ya adoptaron el sistema, la linea base es irrecuperable. **La recoleccion arranca ya, en paralelo al
desarrollo.** En noviembre queda solo la medicion post y el contraste.

`SPEC-AUD-03` depende de una decision pendiente del equipo: si las categorias C y D siguen en el motor,
su escenario 10 no se puede cerrar (riesgo R-01).

---

## Deuda de especificacion

La regla **R1** exige un `SPEC-{ID}.md` aprobado antes de escribir logica de aplicacion.

**Estado: 16 de 47 archivos.** Los **15 que guian trabajo pendiente estan escritos** —lo que falta del
Sprint 5, todo el Sprint 6 y la auditoria— mas `SPEC-S2-02.md`, heredado del listado de pacientes.

Los 30 SPECs en DONE se documentaron a posteriori en `memory.md` y en `informe-sprints.md`, no como
especificacion previa. Escribir ahora 30 archivos Given-When-Then de funcionalidad ya entregada no
mejora ni el codigo ni la nota, asi que quedan como deuda declarada y no como trabajo planificado.

Este indice es el registro de trazabilidad requerimiento → historia → estado, que es lo que la consigna
pide como documentacion tecnica para desarrolladores.

### Trazabilidad verificada

Los **41 RF y los 30 RNF** del SRS estan citados en al menos un SPEC, y ningun SPEC cita un
identificador que no exista en el SRS. Se comprueba de forma automatica cruzando
`entregas/avance-2/07-informe/requerimientos-funcionales-no-funcionales.md` con los archivos de este
directorio; un requerimiento huerfano o un ID inventado hacen fallar el chequeo.

---

## Estados Validos

| Estado | Significado |
|---|---|
| `BACKLOG` | Spec no escrito aun, en cola |
| `SPEC_READY` | Spec escrito y aprobado, listo para desarrollo |
| `IN_PROGRESS` | Tests escritos y/o codigo en desarrollo |
| `REVIEW` | Codigo listo, en revision |
| `DONE` | Tests VERDE + check de dominio + memory.md actualizado |
| `DIFERIDO` | Pospuesto a un sprint posterior por decision registrada |
| `BLOCKED` | Depende de algo externo |
