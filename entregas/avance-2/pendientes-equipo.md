# Psicograma — Reporte de pendientes

> **Corte: 29/09/2026** · Documento interno del equipo, no es entregable del curso
> Proyecto Integrador I · Centro Psicológico Ser Integral E.I.R.L.

Estado del proyecto y trabajo pendiente, ordenado por lo que bloquea a lo demás. Las secciones 1 y 2
son lo que hay que resolver antes de que cualquier otra cosa avance.

**Código:** todo lo de las últimas rondas está en la rama `srs-specs-y-esquema-2fn` (3 commits).
Para bajarlo a `main`:

```bash
git checkout main && git merge --ff-only srs-specs-y-esquema-2fn && git push
```

---

## 1. Bloqueantes: nada avanza hasta que esto pase

| # | Qué | Quién | Nota |
|---|---|---|---|
| 1 | **Crear el proyecto en Supabase** y correr `sdd/database/schema.sql` + `sdd/database/seed-catalog.sql` | Joaquin | Verificar primero el límite de 2 proyectos del plan gratuito. Si no da, se hace reset del actual con `sdd/database/reset.sql` |
| 2 | Crear bucket **privado** `session-files` | Joaquin | Un solo bucket: audio y dibujo con prefijo de ruta, no dos buckets |
| 3 | `frontend/.env` con la URL y anon key nuevas | Joaquin | Ya existe uno local; hay que actualizarlo al proyecto nuevo |

Sin el paso 1, todo el Sprint 5 está trabado: repositorios, endpoints e informe.

### Si se crea proyecto nuevo (recomendado)

Cuatro pasos de dashboard y un archivo, sin paso destructivo:

1. Proyecto nuevo, región `sa-east-1` (la más cercana a Lima)
2. SQL Editor → pegar `schema.sql` → correr
3. SQL Editor → pegar `seed-catalog.sql` → correr
4. Storage → bucket privado `session-files`
5. `frontend/.env` + registrarse desde la app (el trigger crea el perfil solo)

La ventaja no es la limpieza, es el **rollback**: el proyecto v1 queda intacto, así que si algo del v2
falla antes de la entrega hay algo que mostrar. Si en cambio se hace reset del actual, hay que correr
además el backfill de `profiles` que está documentado al final de `reset.sql` — sin él las cuentas
existentes pueden loguearse pero no registrar pacientes.

---

## 2. Tres decisiones del equipo, no técnicas

No se resuelven escribiendo código. Las tiene que tomar el grupo.

| # | Decisión | Por qué urge |
|---|---|---|
| 1 | **Preguntar al docente por la cláusula "50% Java"** | Está en los 4 niveles del criterio de alternativas. Bloquea redactar 3.2, que vale **3 puntos**. Es una pregunta de una línea |
| 2 | **¿Las categorías C y D entran o no?** | El Capítulo 1 entregado las **excluye** citando Lin et al. (2022); el motor carga las 4. Un evaluador que lea ambos lo ve |
| 3 | Confirmar el nombre de bucket `session-files` | Hoy hay 3 nombres distintos en el código |

### Sobre la decisión 2

Recomendación: **alinear el motor con el Capítulo 1** y desactivar C y D. Esa limitación, sustentada en
Lin et al., es el mejor argumento del proyecto — dice que los indicadores de los tests proyectivos no
predicen de forma confiable problemas de salud mental, y por eso el sistema no diagnostica. Cambiar el
Capítulo 1 para incluir C y D obligaría a rehacer esa cita.

El seed ya trae el `UPDATE` comentado para desactivarlas si se confirma.

---

## 3. Rúbrica APF2 — dónde están los puntos

**Proyección si se entregara hoy: 11/20.**

| Criterio | Pts | Hoy | Qué falta |
|---|---|---|---|
| Análisis del contexto | 3 | **3** | Renumerar el Cap. 1 y crear la sección "1.1 La empresa" (hoy no existe). Ojo: dice "visión **del proyecto**", la rúbrica pide "de la empresa" |
| Alternativas de solución | 3 | **0** | 3 alternativas + **~10 wireframes nuevos** |
| Diseño de la solución | 6 | **3** | **BPM con leyenda de notación**, diagrama de clases, modelo de datos/ER |
| Diseño del prototipo | 5 | **5** | Protegerlo: faltan mocks de login y export PDF; pasarlos a Figma |
| Sustentación oral | 3 | **0** | 10 min, **los 5 exponen**, un ensayo cronometrado |

Lo que más rinde por esfuerzo: **BPM + clases + ER (+3)** y **las 3 alternativas (+3)**.

### Dos aclaraciones importantes

**Las alternativas necesitan pantallas propias.** La rúbrica pide 3 alternativas *cada una* con ≥5
pantallas. Los 13 mocks que tenemos son de la solución **elegida** (alternativa 3), así que las
alternativas 1 y 2 necesitan ~10 pantallas nuevas. Alcanzan wireframes de baja fidelidad estilo
Balsamiq: son soluciones que estamos descartando.

**Casos de uso (3.5) y secuencia (3.7) no puntúan.** Están en el índice pero no en la lista de 5
artefactos de la rúbrica. Prioridad baja frente a BPM, clases y ER.

---

## 4. Riesgos abiertos

| ID | Riesgo | Estado |
|---|---|---|
| **R-05** | **La línea base de tiempos es irrecuperable si el centro adopta el sistema antes de medirla** | Nadie lo está mirando |
| R-01 | El Cap. 1 dice 149 indicadores y excluye C/D; el motor carga 201 en 4 categorías | Decisión 2 |
| R-03 | BPM, clases y ER son la brecha principal de la rúbrica | Al 20 % |
| R-02 | Sin línea base, el Capítulo 4 no tiene resultados | Depende de R-05 |
| R-04 | Esquema escrito sin aplicar | Bloqueante 1 |
| R-06 | Falta `patients.anonymized_at`; sin él no se verifica el RNF-16 | Migración en SPEC-S6-05 |

### R-05 merece un párrafo aparte

La variable dependiente de toda la investigación es el **tiempo de elaboración del informe**. La
medición **pre** solo existe mientras los psicólogos sigan trabajando a mano. Estaba agendada para el
02/11 — si a esa fecha ya adoptaron Psicograma, **la línea base se perdió y no hay de dónde
recuperarla**: el Capítulo 1 documenta que no existen estudios peruanos de referencia.

Sin ese dato no hay Capítulo 4 y el objetivo específico 5 queda sin cumplir.

**Acción concreta:** armar la ficha de registro —una página: fecha, psicólogo, paciente codificado,
hora de inicio, hora de fin, interrupciones— y empezar a cronometrar **esta semana**. El protocolo
completo está en `sdd/spec/SPEC-AUD-05.md`, con el análisis previsto (mediana, rango y prueba de
Wilcoxon; no prueba t, porque el n es pequeño).

---

## 5. Trabajo técnico, en orden de dependencia

| Orden | SPEC | Qué | Bloqueado por |
|---|---|---|---|
| 1 | `SPEC-S5-04` | Repositorios + propagación de identidad | Proyecto Supabase |
| 2 | `SPEC-S5-05` | Endpoints de análisis y audio | S5-04 |
| 3 | `SPEC-S5-07` | Migraciones Alembic | Esquema aplicado |
| 4 | `SPEC-S6-01` | Borrador de informe de 9 secciones | S5-05 |
| 5 | `SPEC-S6-02` · `S6-03` · `S6-04` | Editor, validación, PDF | S6-01 |
| 6 | `SPEC-S5-06` | Retirar el acceso directo a BD del navegador | Endpoints de pacientes y sesiones |

Los 15 SPECs pendientes están escritos con criterios Given-When-Then en `sdd/spec/`, así que quien
agarre una tarea ya tiene los casos de prueba definidos.

### Dos avisos técnicos que ahorran una tarde

- **Pooler de Supabase:** el puerto 6543 no soporta prepared statements. Ya está resuelto en
  `backend/.../postgres/engine.py`. **Alembic va contra el 5432**, no el 6543.
- **RLS sigue viva detrás del backend:** cada transacción propaga la identidad del usuario, así que
  las policies se evalúan igual. El rol de conexión no debe tener `BYPASSRLS`.

---

## 6. Reparto sugerido

| Persona | Foco |
|---|---|
| **Joaquin** | Supabase + pregunta al docente + `SPEC-S5-04` / `S5-05` |
| **Jonathan** | Diagrama de clases + modelo de datos / ER |
| **Iam** | BPM con leyenda de notación y ejemplos |
| **Yefrei** | Las 3 alternativas + los ~10 wireframes |
| **Jose** | Capítulo 2 (marco teórico) + renumeración del Capítulo 1 |
| **Todos** | Ensayo cronometrado de la sustentación |

---

## 7. Lo que sí está listo

| Entregable | Estado |
|---|---|
| SRS (IEEE 830) | 41 RF + 30 RNF, trazabilidad verificada 71/71 |
| Esquema 2FN | 22 tablas, RLS en todas, ninguna FK sin índice |
| Seed del manual | 201 indicadores generados desde la fuente, con validación que falla si hay inconsistencia |
| Backend hexagonal | Dominio puro, 14 tests sin BD ni red, frontera verificable con `check-hexagon.sh` |
| Contrato API v2 | ~40 endpoints en `sdd/api-contracts.md` |
| Los 15 SPECs pendientes | Sprint 5, Sprint 6 y auditoría |
| Charter y Gantt | Contenido listo para pegar, corte al 30/09, 6 sprints + 1 auditoría |

### Lo grave que apareció al revisar los anexos

La hoja **`Table 1`** de `project-charter.xlsx` contiene el **Project Charter de otro proyecto**:
"Task/Issue Management Tool", jefe "David", sponsor SVGroup, fechas de 2021. Es la hoja de ejemplo de
la plantilla y se entregaría tal cual.

**Eliminar esa hoja antes de entregar.** Los otros seis hallazgos (sponsor heredado del ejemplo, tres
fechas incoherentes entre Charter y Gantt, un apellido mal escrito y una fecha excluida fuera de la
ventana del proyecto) están detallados en `entregas/avance-2/07-informe/anexos-charter-gantt.md`.
