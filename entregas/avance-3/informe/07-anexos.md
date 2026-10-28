# ANEXOS

## Lista de anexos

| N.º | Anexo | Origen | Estado |
|---|---|---|---|
| 1 | Lean Canvas | `entregas/avance-1/01-lean-canvas/lean-canvas.xlsx` | ✅ Vigente (el contenido está transcrito en §3.1.1) |
| 2 | FODA | `entregas/avance-1/02-foda/foda.pdf` | ✅ Vigente |
| 3 | Project Charter | `project-charter.xlsx` | ⚠️ **Corregir** los 7 defectos (ver `anexos-charter-gantt-actualizado.md`) |
| 4 | Cronograma de actividades (Gantt) | `cronograma-gantt.xlsx` | ⚠️ **Actualizar** con el estado al 28/10/2026 |
| 5 | Prototipos y pantallas reales | `entregas/avance-1/05-prototipo/` + capturas del sistema | ⚠️ Tomar capturas de las pantallas reales (tabla en §3.4) |
| 6 | Modelo físico de la base de datos (24 tablas) | `diagramas/arquitectura-y-estados.md`, diagrama F (generado desde `schema.sql`) | ✅ Generado; ⚠️ exportar a imagen para el Word (reemplaza el de 22 tablas del Avance 2) |
| 7 | Diagramas de casos de uso (general + 10 por módulo) | §3.5 (Mermaid) y `diagramas/casos-de-uso.html` (referencia para rehacerlos en la herramienta UML) | ✅ Escritos; rehacer en la herramienta UML o exportar |
| 8 | Diagrama de procesos (BPM), AS-IS y TO-BE | §3.6 (Mermaid) | ✅ Escrito; exportar a PNG |
| 9 | Diagrama de secuencia: sesión en vivo | §3.7 (Mermaid) | ✅ Escrito; exportar a PNG |
| 10 | Diagrama de secuencia: generación del informe | §3.7 (Mermaid) | ✅ Escrito; exportar a PNG |
| 11 | Diagrama de secuencia: agenda y Google Calendar | §3.7 (Mermaid) | ✅ Escrito; exportar a PNG |
| 12 | Diagrama de clases | §3.8 (Mermaid) | ✅ Escrito; exportar a PNG |
| 13 | Modelo de datos conceptual y lógico | §3.9 (Mermaid y tabla) | ✅ Escrito; exportar a PNG |
| 14 | Cobertura de los 41 requerimientos funcionales | Este documento, abajo | ✅ |
| 15 | Evidencia de control de versiones (GitHub) | Capturas del repositorio | ⚠️ Capturar commits, ramas y el PR a `main` |
| 16 | Ficha y protocolo de medición | `entregas/avance-3/medicion/` | ✅ |
| 17 | Documentación técnica del código | `sdd/` (especificaciones y decisiones) y `/docs` de la API (OpenAPI) | ✅ El equivalente a Javadoc en este stack es la documentación OpenAPI que FastAPI genera sola en `/docs` y los `docstring` de los módulos |
| 18 | Diagrama de arquitectura por capas (hexagonal) con correspondencia MVC | `diagramas/arquitectura-y-estados.md`, diagrama A | ✅ **Exigido por la rúbrica** |
| 19 | Diagrama de puertos y adaptadores (capa DAO) y principios SOLID | `diagramas/arquitectura-y-estados.md`, diagrama B | ✅ **Exigido por la rúbrica** |
| 20 | Diagrama de despliegue | `diagramas/arquitectura-y-estados.md`, diagrama C | ✅ Hoy local; el despliegue en la nube sigue planificado |
| 21 | Diagramas de estados (sesión, informe, indicador y cita) | `diagramas/arquitectura-y-estados.md`, diagramas D y E | ✅ |

### Cómo exportar los diagramas Mermaid a imagen

Los diagramas están en los `.md` como bloques `mermaid`. Para el Word: abrir el bloque en https://mermaid.live y descargar PNG o SVG, o usar la herramienta de línea de comandos `mmdc` (`npx @mermaid-js/mermaid-cli -i entrada.md -o salida.png`). No se generaron los PNG aquí porque requiere un navegador sin cabeza.

---

## Anexo 14. Cobertura de los 41 requerimientos funcionales

Estados: **✅ Verificado** = implementado y comprobado por prueba automática o por revisión en navegador el 28/10/2026 · **🟡 Sin verificar** = implementado, sin prueba directa ni revisión · **🔶 Parcial** = cubierto solo en parte (la razón se indica).

| RF | Requerimiento | Componente (pantalla / API) | Verificación | Estado |
|---|---|---|---|---|
| RF-01 | Registro e inicio de sesión | `LoginPage`, Supabase Auth | Revisión en navegador | ✅ |
| RF-02 | Perfil profesional | `SettingsPage`, `GET/PATCH /profile` | Pruebas de perfil | ✅ |
| RF-03 | Control de acceso por perfil | JWT + RLS para el examinador; pantallas del paciente en `/sesion/:id/paciente/*` | Pruebas de aislamiento | 🔶 No existe un perfil de «paciente» propio: la tablet usa la sesión iniciada del examinador (riesgo R-07) |
| RF-04 | Registrar paciente | `PatientsPage`, `POST /patients` | Pruebas (duplicado 409, fecha futura 422) | ✅ |
| RF-05 | Actualizar paciente | `PatientsPage` (Editar), `PATCH /patients/{id}` | — | 🟡 |
| RF-06 | Listar pacientes | `PatientsPage`, `GET /patients` | Prueba de listado + navegador | ✅ |
| RF-07 | Ficha del paciente | `PatientDetailPage` | Revisión en navegador | ✅ |
| RF-08 | Desactivar paciente (baja lógica) | `PatientDetailPage`, `PATCH /patients/{id}/status` | — | 🟡 |
| RF-09 | Configurar nueva sesión | `NewSessionPage`, `POST /sessions` | Pruebas de creación | 🔶 El asistente no captura el **motivo de evaluación** (la API lo admite) |
| RF-10 | Registrar consentimiento | `NewSessionPage` (paso 3), `POST /sessions/{id}/consent` | Pruebas de consentimiento | ✅ |
| RF-11 | Emparejar dispositivos | `TabletEntryPage`, enlace de la sesión | — (sin tablet física) | 🟡 |
| RF-12 | Finalizar sesión | `ExaminerSessionPage`, `POST /sessions/{id}/finalize` | Prueba de idempotencia | ✅ |
| RF-13 | Cancelar sesión | `ExaminerSessionPage`, `PATCH /sessions/{id}` | Pruebas de cancelación | ✅ |
| RF-14 | Lienzo digital | `PatientDrawingPage`, `DrawingCanvas` | Trazo de prueba en navegador | ✅ |
| RF-15 | Deshacer | `PatientDrawingPage` | Navegador (botón se activa tras trazar) | ✅ |
| RF-16 | Captura de la dimensión temporal | `canvas/timing.ts`, `StrokeBuilder` | 11 pruebas del frontend + validación 422 de tiempos incoherentes | ✅ (los dibujos anteriores a la corrección conservan ceros) |
| RF-17 | Orientación de la hoja | `canvas/orientation.ts`, `drawings.orientation` | Pruebas del frontend | ✅ |
| RF-18 | Persistencia del dibujo | `PUT/GET /sessions/{id}/drawing` | Pruebas + dibujo visible en el análisis | ✅ |
| RF-19 | Consigna y cierre | `PatientWelcomePage`, `PatientClosePage` | Consigna vista en navegador | 🟡 (la pantalla de cierre no se revisó) |
| RF-20 | Espejo del dibujo en vivo | `CanvasMirror`, Realtime | — (sin dos dispositivos) | 🟡 |
| RF-21 | Métricas en vivo | `LiveMetrics`, `canvas/metricsCalculator.ts` | — | 🟡 |
| RF-22 | Marcas rápidas | `ProtocolPanel`, `POST /sessions/{id}/quick-marks` | Pruebas | ✅ |
| RF-23 | Observaciones estructuradas | `ObservationsPanel`, `PUT /sessions/{id}/observations` | Pruebas | ✅ |
| RF-24 | Actitudes observadas | `PUT /sessions/{id}/observations` | Pruebas | ✅ |
| RF-25 | Estado de conexión | `ExaminerSessionPage` (estado de la tablet) | — | 🟡 |
| RF-26 | Grabar audio | `AudioRecorder`, `POST /sessions/{id}/recordings` | Grabación real del equipo + pruebas | ✅ |
| RF-27 | Transcribir | `useRecording`, Whisper | Prueba con audio real + navegador (transcripción visible) | ✅ |
| RF-28 | Extraer verbalizaciones | `/sessions/{id}/verbalizations` | Pruebas | ✅ |
| RF-29 | Medición objetiva | `measure_drawing`, `AnalysisPage` | Pruebas de dominio + navegador | ✅ |
| RF-30 | Detección automática | `evaluate_indicators` | Pruebas de dominio | ✅ |
| RF-31 | Sugerencia asistida | `evaluate_indicators` | — | 🔶 Las sugerencias salen de reglas deterministas; **la propuesta con modelo de lenguaje para los semiautomáticos no está implementada** |
| RF-32 | Verificación profesional (checklist) | `AnalysisPage` (pestaña), `GET /tests/{code}/indicators` | Pruebas + navegador | ✅ |
| RF-33 | Validar o descartar indicadores | `PUT /sessions/{id}/indicators/{code}` | Prueba «reanalizar no pisa lo validado» | ✅ |
| RF-34 | Motor de reglas configurable | Catálogo en la tabla `indicator_catalog` | Pruebas del catálogo | 🔶 El catálogo es dato; **las reglas de detección de los 23 automáticos están en código** |
| RF-35 | Generar borrador del informe | `compose_report`, `POST /sessions/{id}/report` | Prueba: deja las nueve secciones | ✅ |
| RF-36 | Editar el informe | `ReportsPage`, `PATCH /reports/{id}/sections/{n}` | — | 🟡 |
| RF-37 | Validar el informe | `POST /reports/{id}/validate` | Prueba: no se valida con la sugerencia sin revisar | ✅ |
| RF-38 | Exportar a PDF | `GET /reports/{id}/pdf`, WeasyPrint | Prueba: el PDF contiene las secciones | ✅ (requiere pango en el servidor) |
| RF-39 | Historial de informes | `PatientDetailPage` (pestaña), `GET /patients/{id}/reports` | — | 🟡 |
| RF-40 | Panel de indicadores | `DashboardPage`, `GET /dashboard/summary` | Pruebas de aislamiento + navegador | ✅ |
| RF-41 | Catálogo de tests | `TestCatalogPage`, `GET /tests` | Prueba + navegador | ✅ |

**Resumen:** ✅ 28 · 🟡 9 · 🔶 4 · sin componente 0 → **37 de 41 implementados (90 %)**.

**Ampliación sin RF propio:** agenda de citas y Google Calendar (SPEC-CAL-01): `AppointmentsPage`, `/appointments`, `/integrations/google`; código y pruebas listos, migración `0003` pendiente de aplicar.

---

## Anexo 15. Evidencia de control de versiones (qué capturar)

1. Lista de commits de la rama de trabajo en GitHub (36 al corte).
2. Lista de ramas (`main`, `srs-specs-y-esquema-2fn`, `test`, ramas por integrante).
3. El *pull request* de `test` a `main` abierto o fusionado.
4. La pestaña *Contributors* del repositorio. ⚠️ Hoy muestra pocos autores; conviene que cada integrante commitee su parte.
5. *Tags* de sprint (`sprint-1` … `sprint-6`) y `README.md` en la raíz. ⚠️ **Aún no existen.**

---

## Anexo 16. Medición del tiempo de elaboración

Los tres archivos están en `entregas/avance-3/medicion/`:

- `protocolo-medicion.md`: definición operacional, muestra, procedimiento y análisis.
- `ficha-registro.md`: ficha de una página, con 11 campos y solo códigos.
- `mediciones.md`: tablas vacías para las mediciones.
- `prueba-analisis/`: script de análisis y **datos simulados** (no son resultados).
