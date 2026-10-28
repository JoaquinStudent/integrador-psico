# Actualización de los Anexos 3 y 4 — Project Charter y Cronograma (Gantt)

> Corte: **28/10/2026** (el Avance 2 estaba a 30/09/2026). Estructura: 6 sprints + extensión + auditoría, en 3 fases.
> No se editaron los `.xlsx` directamente: la hoja `Ejemplo` del cronograma tiene 13 reglas de formato condicional, 2 validaciones de datos y una grilla de días calculada por fórmula; escribirla con una librería externa puede romper las barras del Gantt. Este documento es contenido listo para pegar en las celdas de entrada.

## 1. Los siete defectos de los anexos del Avance 2 (siguen vigentes hasta corregirlos)

| # | Problema | Dónde | Corrección |
|---|---|---|---|
| 1 | La hoja **`Table 1`** contiene el Charter **de otro proyecto** («Task/Issue Management Tool», jefe «David», sponsor SVGroup, 2021): es la hoja de ejemplo de la plantilla | `project-charter.xlsx`, hoja `Table 1` | **Eliminar la hoja** |
| 2 | Sponsor «SVGroup» (el del ejemplo) | Charter | **Centro Psicológico Ser Integral E.I.R.L.** |
| 3 | Fecha de inicio 08/10/2026: contradice el Gantt y sus propios hitos | Charter | **10/08/2026** |
| 4 | Fecha de fin 13/12/2026 frente al Gantt 11/12/2026 | Charter | **11/12/2026** |
| 5 | Hito 1: fecha programada 08/10/2026 / real 08/11/2026 (un mes de desvío en la primera actividad) | Charter, cronograma | Reemplazar por la tabla de §2 |
| 6 | Apellido «Villacicencio» | Charter | **Villavicencio** (como en la carátula) |
| 7 | Fechas excluidas `08/10/2026` y `2026-01-11` (la segunda, fuera de la ventana del proyecto) | Gantt, hoja `Configuracion` | Revisar o vaciar |

## 2. Project Charter — celdas a actualizar

| Campo | Valor |
|---|---|
| Título | Psicograma |
| Jefe de proyecto | Joaquin Sebastian Chaparro Villavicencio |
| Fecha de inicio / fin | **10/08/2026** / **11/12/2026** |
| Sponsor | **Centro Psicológico Ser Integral E.I.R.L.** |

**Entregables (6):** (1) SRS IEEE 830; (2) módulo de gestión de pacientes, citas y sesiones; (3) módulo del paciente y módulo del examinador; (4) módulo de procesamiento de medidas objetivas; (5) módulo de generación del borrador de informe; (6) auditoría del sistema y medición de la reducción del tiempo.

**Hitos y actividades**

| Hito | Responsable | Fecha prog. | Fecha real |
|---|---|---|---|
| 1. Planificación (misión, visión, alcance) | Joaquin Chaparro | 10/08/2026 | 11/08/2026 |
| 2. Reunión inicial con el cliente | Jose Diaz | 15/08/2026 | 17/08/2026 |
| 3. Requerimientos (SRS) | Yefrei Bernable | 08/09/2026 | 10/09/2026 |
| 4. Arquitectura y base de datos | Jonathan Tuppia | 18/09/2026 | 25/09/2026 |
| 5. Sprint 1 — Fundación | Joaquin Chaparro | 18/08/2026 | 22/08/2026 |
| 6. Sprint 2 — Pacientes, panel y sesiones | Yefrei Bernable | 25/08/2026 | 01/09/2026 |
| 7. Sprint 3 — Lienzo y sesión en vivo | Jonathan Tuppia | 04/09/2026 | 11/09/2026 |
| 8. Sprint 4 — Análisis y motor de reglas | Iam Arias | 16/09/2026 | 22/09/2026 |
| 9. Sprint 5 — Rearquitectura | Joaquin Chaparro | 25/09/2026 | *en cierre* |
| 10. Sprint 6 — Informe, PDF y cierre funcional | Jose Diaz | 13/10/2026 | *implementado* |
| 11. Extensión — Agenda y Google Calendar | Joaquin Chaparro | 28/10/2026 | *en curso* |
| 12. Auditoría del sistema | Iam Arias | 02/11/2026 | — |
| 13. Cierre del proyecto | Joaquin Chaparro | 07/12/2026 | — |

**Riesgos a listar** (además de los del Avance 2): ausencia de línea base de tiempos (R-05, **sigue abierto**); rol de base de datos con `BYPASSRLS` (R-08); canal de tiempo real no privado (R-07); y la desviación entre el alcance documentado y el implementado (R-01), **ya cerrada** al desactivar las categorías C y D (DT-033).

## 3. Cronograma (Gantt) — hoja `Ejemplo`

- Columnas de entrada: **D** actividades · **E** responsable · **F** fecha de inicio · **G** nº de días · **I** avance · **J** estado. **No escribir en H** (fecha fin, fórmula `=(F+G)-1`).
- Poner **FECHA ACTUAL = 28/10/2026**.
- Para añadir filas, copiar una fila existente del mismo bloque y pegar (así viajan la fórmula, la validación y el formato).

**Regla de avance usada** (para que no sea arbitraria): 100 % = implementado y con pruebas; 0,5 por cada tarea parcial; el avance de la auditoría es 1 de 5 tareas.

| Fase | Actividad | Responsable | Inicio | Días | Avance | Estado |
|---|---|---|---|---|---|---|
| 1 | Planificación (misión, visión, alcance) | Joaquin Chaparro | 10/08/2026 | 2 | 100 % | Completado |
| 1 | Reunión inicial con el cliente | Jose Diaz | 15/08/2026 | 3 | 100 % | Completado |
| 1 | Requerimientos (SRS IEEE 830) | Yefrei Bernable | 08/09/2026 | 3 | 100 % | Completado |
| 1 | Arquitectura y base de datos | Jonathan Tuppia | 18/09/2026 | 8 | 100 % | Completado |
| 1 | Diagramas de diseño (BPM, casos de uso, clases, ER) | Iam Arias | 28/09/2026 | 8 | 100 % | Completado |
| 2 | Sprint 1 — Fundación | Joaquin Chaparro | 18/08/2026 | 5 | 100 % | Completado |
| 2 | Sprint 2 — Pacientes, panel y sesiones | Yefrei Bernable | 25/08/2026 | 8 | 100 % | Completado |
| 2 | Sprint 3 — Lienzo y sesión en vivo | Jonathan Tuppia | 04/09/2026 | 8 | 100 % | Completado |
| 2 | Sprint 4 — Análisis y motor de reglas | Iam Arias | 16/09/2026 | 7 | 100 % | Completado |
| 2 | Sprint 5 — Rearquitectura | Joaquin Chaparro | 25/09/2026 | 12 | 71 % | En Proceso |
| 2 | Sprint 6 — Informe, PDF y cierre funcional | Jose Diaz | 13/10/2026 | 14 | 100 % | Completado |
| 2 | Extensión — Agenda y Google Calendar | Joaquin Chaparro | 28/10/2026 | 2 | 70 % | En Proceso |
| 3 | Auditoría del sistema (QA, seguridad, medición) | Iam Arias | 02/11/2026 | 10 | 20 % | En Proceso |
| 3 | Despliegue y capacitación de usuarios | Jose Diaz | 20/11/2026 | 5 | 0 % | Sin Empezar |
| 3 | Cierre del proyecto | Joaquin Chaparro | 07/12/2026 | 2 | 0 % | Sin Empezar |

**Hoja `Resultados` esperada:** Completado 10 · En Proceso 3 (0,71 + 0,70 + 0,20) · Sin Empezar 2 · Atrasado 0 · **Total 15 actividades** · **avance 77,4 %** (11,61 / 15).

> **Dos porcentajes distintos, a propósito:** el 77,4 % es por *actividades del Gantt* (15); el 79 % de §3.10.2 es por las *47 tareas del plan* (completas o implementadas). Miden unidades diferentes y no deben compararse entre sí.
>
> Sprint 5 al 71 % = (3 completas + 0,5 × 4 parciales) / 7 tareas. Sprint 6 figura «Completado» por contar con pruebas automáticas; su recorrido completo en navegador sigue pendiente (§4.1.1).
