# Actualización de anexos — Project Charter y Cronograma (Gantt)

> Corte: **30/09/2026.** Nada se marca como avanzado más allá de esa fecha.
> Estructura: **6 sprints + 1 auditoría**, distribuidos en 3 fases.

No reescribí los `.xlsx` directamente. La hoja `Ejemplo` del cronograma tiene **13 reglas de formato
condicional, 2 validaciones de datos y una grilla de días calculada por fórmula** desde la columna
`L`: escribirla con una librería externa tiene alta probabilidad de romper las barras del Gantt. Lo
que sigue es contenido listo para pegar en las celdas que sí son de entrada.

---

## 1. Hallazgos que hay que corregir antes de entregar

| # | Problema | Dónde | Corrección |
|---|---|---|---|
| **1** | La hoja **`Table 1`** contiene el Project Charter **de otro proyecto**: "Task/Issue Management Tool", jefe "David", sponsor SVGroup, fechas de 2021. Es la hoja de ejemplo de la plantilla y se entregaría tal cual | `project-charter.xlsx`, hoja `Table 1` | **Eliminar la hoja** |
| **2** | Sponsor dice **"SVGroup"**, que es el sponsor del ejemplo de la plantilla | Charter, celda del sponsor | Poner **Centro Psicológico Ser Integral E.I.R.L.** |
| **3** | Fecha inicio del Charter = **08/10/2026**, posterior a hoy, y contradice el Gantt (10/08/2026) y sus propios hitos de agosto | Charter | **10/08/2026** |
| **4** | Fecha fin del Charter = 13/12/2026 vs Gantt 11/12/2026 | Charter | **11/12/2026** |
| **5** | Hito 1 del cronograma del Charter: Fecha Prog. 08/10/2026 / Fecha Real 08/11/2026 — un mes de desvío en la primera actividad del proyecto, incoherente con el Gantt | Charter, cronograma | Reemplazar por la tabla de §2 |
| **6** | Apellido del jefe de proyecto: **"Villacicencio"**. En la carátula del Capítulo 1 es **Villavicencio** | Charter | Corregir a **Villavicencio** |
| **7** | Fechas excluidas: `08/10/2026` y `2026-01-11`. La segunda está fuera de la ventana del proyecto | Gantt, hoja `Configuracion` | Revisar o vaciar |

---

## 2. Project Charter — celdas a actualizar

| Campo | Valor nuevo |
|---|---|
| Título | Psicograma |
| Jefe de Proyecto | Joaquin Sebastian Chaparro Villa**v**icencio |
| Fecha inicio | **10/08/2026** |
| Fecha fin | **11/12/2026** |
| Sponsor (Patrocinadora) | **Centro Psicológico Ser Integral E.I.R.L.** |

### Entregables (reemplazar la lista de 4 por esta de 6)

1. Especificación de requerimientos funcionales y no funcionales (SRS, IEEE 830)
2. Módulo de gestión de pacientes y sesiones
3. Módulo de paciente (captura digital del dibujo) y módulo de examinador (registro de sesión)
4. Módulo de procesamiento de medidas objetivas del trazo
5. Módulo de generación del borrador de informe
6. Auditoría del sistema y medición de la reducción del tiempo de elaboración

### Cronograma del Charter (hitos) — reemplazar las 3 filas actuales

| Hitos y Actividades | Responsable | Fecha Prog. | Fecha Real |
|---|---|---|---|
| 1. Planificación del proyecto (misión, visión, alcance) | Joaquin Chaparro | 10/08/2026 | 11/08/2026 |
| 2. Reunión inicial con el cliente | Jose Diaz | 15/08/2026 | 17/08/2026 |
| 3. Requerimientos funcionales y no funcionales (SRS) | Yefrei Bernable | 08/09/2026 | 10/09/2026 |
| 4. Diseño de arquitectura y base de datos | Jonathan Tuppia | 18/09/2026 | 25/09/2026 |
| 5. Sprint 1 — Fundación | Joaquin Chaparro | 18/08/2026 | 22/08/2026 |
| 6. Sprint 2 — Pacientes, panel y sesiones | Yefrei Bernable | 25/08/2026 | 01/09/2026 |
| 7. Sprint 3 — Lienzo y sesión en vivo | Jonathan Tuppia | 04/09/2026 | 11/09/2026 |
| 8. Sprint 4 — Análisis y motor de reglas | Iam Arias | 16/09/2026 | 22/09/2026 |
| 9. Sprint 5 — Rearquitectura (backend y BD) | Joaquin Chaparro | 25/09/2026 | *en curso* |
| 10. Sprint 6 — Informe, PDF y cierre funcional | Jose Diaz | 13/10/2026 | — |
| 11. Auditoría del sistema | Iam Arias | 02/11/2026 | — |
| 12. Cierre del proyecto | Joaquin Chaparro | 07/12/2026 | — |

### Riesgos — añadir dos que ya se materializaron

Además de los ya listados:

* **Desviación entre el alcance documentado y el implementado.** El Capítulo 1 declara 149
  indicadores y excluye las categorías C y D; el motor construido carga 201 en 4 categorías. Requiere
  decisión antes de la entrega.
* **Ausencia de línea base de tiempos.** La variable dependiente del proyecto es el tiempo de
  elaboración del informe y aún no se ha medido el procedimiento manual actual, sin lo cual el
  Capítulo 4 no puede presentar resultados.

---

## 3. Cronograma (Gantt) — hoja `Ejemplo`

### Cómo pegarlo

- Columnas de entrada: **`D` ACTIVIDADES · `E` RESPONSABLE · `F` FECHA INI · `G` Nº DÍAS ·
  `I` AVANCE · `J` ESTADO**
- **No escribir en `H` (FECHA FIN): es la fórmula `=(F+G)-1`.** Al copiar una fila hacia abajo, la
  fórmula viaja sola.
- La plantilla tiene 4 bloques de fase con formato condicional propio: filas **19-29**, **31-40**,
  **42-51**, **53-62**. Para añadir filas dentro de un bloque, **copiar una fila existente del mismo
  bloque y pegar** (así se arrastran fórmula, validación y formato); recién entonces sobrescribir los
  valores. Si se insertan filas nuevas en blanco, no se dibuja la barra.
- `E` y `J` tienen validación de lista. Los valores permitidos salen de la hoja `Configuracion`:
  responsables *Iam Arias, Jonathan Tuppia, Yefrei Bernable, Joaquin Chaparro, Jose Diaz*; estados
  *Sin Empezar, En Proceso, Completado, Atrasado*.
- `FECHA ACTUAL` de la cabecera: poner **30/09/2026** para que la línea de hoy coincida con el corte.

### FASE 1 — Análisis y diseño · etiqueta en `D18` · filas 19-23

| Fila | D · Actividad | E · Responsable | F · Fecha ini | G · Días | I · Avance | J · Estado |
|---|---|---|---|---|---|---|
| 19 | Planificación del proyecto (misión, visión, alcance) | Joaquin Chaparro | 10/08/2026 | 2 | 100% | Completado |
| 20 | Reunión inicial con el cliente | Jose Diaz | 15/08/2026 | 3 | 100% | Completado |
| 21 | Requerimientos funcionales y no funcionales (SRS IEEE 830) | Yefrei Bernable | 08/09/2026 | 3 | 100% | Completado |
| 22 | Diseño de arquitectura y base de datos (hexagonal, 2FN) | Jonathan Tuppia | 18/09/2026 | 8 | 100% | Completado |
| 23 | Diagramas de diseño (BPM, casos de uso, clases, ER) | Iam Arias | 28/09/2026 | 8 | 20% | En Proceso |

### FASE 2 — Construcción · etiqueta **`FASE 2` en `D30`** · filas 31-36

| Fila | D · Actividad | E · Responsable | F · Fecha ini | G · Días | I · Avance | J · Estado |
|---|---|---|---|---|---|---|
| 31 | Sprint 1 — Fundación: infraestructura, autenticación y layout | Joaquin Chaparro | 18/08/2026 | 5 | 100% | Completado |
| 32 | Sprint 2 — Pacientes, panel de control y sesiones | Yefrei Bernable | 25/08/2026 | 8 | 100% | Completado |
| 33 | Sprint 3 — Lienzo del paciente y sesión en vivo | Jonathan Tuppia | 04/09/2026 | 8 | 100% | Completado |
| 34 | Sprint 4 — Análisis y motor de reglas PBLL | Iam Arias | 16/09/2026 | 7 | 100% | Completado |
| 35 | Sprint 5 — Rearquitectura: backend hexagonal y BD normalizada | Joaquin Chaparro | 25/09/2026 | 12 | 40% | En Proceso |
| 36 | Sprint 6 — Informe psicológico, exportación PDF y cierre funcional | Jose Diaz | 13/10/2026 | 14 | 0% | Sin Empezar |

### FASE 3 — Auditoría y cierre · etiqueta **`FASE 3` en `D41`** · filas 42-44

| Fila | D · Actividad | E · Responsable | F · Fecha ini | G · Días | I · Avance | J · Estado |
|---|---|---|---|---|---|---|
| 42 | Auditoría del sistema (QA, seguridad, medición pre/post) | Iam Arias | 02/11/2026 | 10 | 0% | Sin Empezar |
| 43 | Despliegue y capacitación de usuarios | Jose Diaz | 20/11/2026 | 5 | 0% | Sin Empezar |
| 44 | Cierre del proyecto | Joaquin Chaparro | 07/12/2026 | 2 | 0% | Sin Empezar |

### Fechas fin que debe calcular la fórmula

Si alguna no coincide, la fila se pegó mal:

| Actividad | Fin | | Actividad | Fin |
|---|---|---|---|---|
| Planificación | 11/08/2026 | | Sprint 1 | 22/08/2026 |
| Reunión cliente | 17/08/2026 | | Sprint 2 | 01/09/2026 |
| Requerimientos | 10/09/2026 | | Sprint 3 | 11/09/2026 |
| Arquitectura y BD | 25/09/2026 | | Sprint 4 | 22/09/2026 |
| Diagramas | 05/10/2026 | | Sprint 5 | 06/10/2026 |
| Auditoría | 11/11/2026 | | Sprint 6 | 26/10/2026 |
| Despliegue | 24/11/2026 | | Cierre | 08/12/2026 |

### Avance esperado en la hoja `Resultados`

La hoja se calcula sola; sirve para verificar que se pegó bien.

| Estado | Actividades |
|---|---|
| Completado | 8 |
| En Proceso | 2 (0.20 + 0.40 = 0.60) |
| Sin Empezar | 4 |
| Atrasado | 0 |
| **Total actividades** | **14** |
| **Total de avance al 30/09/2026** | **61.4 %** (8.60 / 14) |

---

## 4. Por qué estas fechas

La ventana del Gantt (10/08/2026 – 11/12/2026) se conserva: es la única de las tres que aparecían en
los anexos que resulta coherente con los hitos de agosto y con que hoy sea 28/09. Los sprints se
distribuyen dentro de ella de forma secuencial, y **el corte cae dentro del Sprint 5**, que es
exactamente el estado real: los cuatro primeros sprints están cerrados, la rearquitectura está a
mitad —esquema normalizado y núcleo del backend hechos, repositorios y endpoints pendientes— y el
informe con su exportación todavía no empieza.

Las fechas de las columnas `F`/`G` son las **planificadas**. El registro de ejecución real, con sus
decisiones técnicas y desvíos, vive en `sdd/memory.md`; el Gantt es el artefacto de planificación y
las columnas `I`/`J` son las que reportan el avance.
