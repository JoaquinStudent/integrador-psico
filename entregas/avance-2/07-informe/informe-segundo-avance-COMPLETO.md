Facultad de Ingeniería Software y Sistemas

Título

**"Implementación de una aplicación web para reducir el tiempo de elaboración de informes de tests proyectivos de dibujo en la práctica psicológica, Lima, 2026."**

Autor(es):

Bernable Pantaleon Yefrei Eyder

Jose Eduardo Diaz Fernandez

Iam Kaled Fabricio Arias Yaranga

Jonathan Edilson Tuppia Lozano

Joaquin Sebastian Chaparro Villavicencio

Curso Integrador I: Sistemas Software

Sección 38195

Lima – Perú, 2026

---

**ÍNDICE — SEGUNDO AVANCE**

> El Segundo Avance NO reemplaza el Primer Avance. Lo amplía, profundiza y completa.

**CAPÍTULO 2. MARCO TEÓRICO — COMPLEMENTO**
- 2.4. Hipótesis
  - 2.4.1. Hipótesis general
  - 2.4.2. Hipótesis específicas
- 2.5. Operacionalización de variables
- 2.6. Modelo teórico o conceptual

**CAPÍTULO 3. DESARROLLO DE LA SOLUCIÓN**
- 3.1. Metodología
  - 3.1.1. Tipo de investigación
  - 3.1.2. Enfoque
  - 3.1.3. Diseño
  - 3.1.4. Alcance
- 3.2. Planteamiento de alternativas de solución
  - 3.2.1. Identificación de alternativas
  - 3.2.2. Alternativa de solución 1
  - 3.2.3. Alternativa de solución 2
  - 3.2.4. Alternativa de solución 3 (seleccionada)
  - 3.2.5. Comparación de alternativas
  - 3.2.6. Selección de la alternativa
- 3.3. Gestión del proyecto
  - 3.3.1. Project Charter
  - 3.3.2. Estructura de Descomposición del Trabajo (WBS)
  - 3.3.3. Diagrama de Gantt
  - 3.3.4. Planificación del proyecto
- 3.4. Análisis de la solución
  - 3.4.1. Identificación de actores
  - 3.4.2. Casos de uso del sistema
  - 3.4.3. Diagrama general de casos de uso
  - 3.4.4. Especificación de casos de uso
  - 3.4.5. Requerimientos funcionales
  - 3.4.6. Requerimientos no funcionales
  - 3.4.7. Especificación de Requerimientos de Software (SRS)
- 3.5. Diseño detallado de la solución
  - 3.5.1. Arquitectura de la solución
  - 3.5.2. Diseño de procesos
  - 3.5.3. Diagramas de procesos (BPM)
  - 3.5.4. Diagrama de clases
  - 3.5.5. Diagrama entidad-relación
  - 3.5.6. Diseño de base de datos
  - 3.5.7. Diseño de interfaces
  - 3.5.8. Tecnologías utilizadas
  - 3.5.9. Arquitectura tecnológica
  - 3.5.10. Componentes desarrollados en Java
- 3.6. Diseño del prototipo
  - 3.6.1. Herramienta utilizada para el prototipo
  - 3.6.2. Diseño general del prototipo
  - 3.6.3. Prototipo de la solución
  - 3.6.4. Diseño de la pantalla principal
  - 3.6.5. Diseño de módulos
  - 3.6.6. Diseño de los procesos principales
  - 3.6.7. Navegación e interacción
  - 3.6.8. Diseño de interfaces
  - 3.6.9. Validación del prototipo
  - 3.6.10. Cobertura del 100 % del alcance funcional
  - 3.6.11. Cobertura del alcance no funcional
- 3.7. Validación de la solución
  - 3.7.1. Relación problema – objetivos – solución
  - 3.7.2. Relación objetivos – funcionalidades
  - 3.7.3. Relación requerimientos – funcionalidades
  - 3.7.4. Matriz de cobertura del alcance
  - 3.7.5. Verificación de funcionalidades del prototipo
  - 3.7.6. Verificación de requerimientos no funcionales

**CAPÍTULO 4. CRONOGRAMA Y PRESUPUESTO**
- 4.1. Cronograma actualizado
- 4.2. Presupuesto del proyecto
- 4.3. Recursos requeridos
- 4.4. Costos de implementación

**ANEXOS — SEGUNDO AVANCE**
- K. Diagramas de procesos (BPM)
- L. Diagrama de clases
- M. Diagrama entidad-relación
- N. Arquitectura tecnológica
- O. Diseño de interfaces (capturas de pantalla)
- P. Prototipo completo
- Q. Evidencias de las pantallas
- R. Matriz de cobertura del alcance
- S. Validación del prototipo

---

# CAPÍTULO 2. MARCO TEÓRICO — COMPLEMENTO DEL SEGUNDO AVANCE

> Las secciones 2.1 a 2.3 están desarrolladas en `capitulo-2-marco-teorico.md`.

## 2.4. Hipótesis

### 2.4.1. Hipótesis general

El uso de la aplicación web Psicograma reduce significativamente el tiempo de elaboración de informes del test de la Persona bajo la lluvia en comparación con el procedimiento manual actual en el Centro Psicológico Ser Integral E.I.R.L., San Juan de Lurigancho, Lima, 2026.

### 2.4.2. Hipótesis específicas

**HE-1.** La captura digital del proceso de trazado mediante la Pointer Events API permite registrar automáticamente los indicadores temporales del manual (secciones A-5 y A-6) que en el procedimiento manual se pierden o dependen de la anotación manual del examinador durante la sesión.

**HE-2.** La presentación estructurada de los 201 indicadores del manual PBLL —clasificados en detección automática, semiautomática y verificación profesional— reduce el tiempo que el psicólogo destina a la consulta del manual y a la puntuación de los indicadores frente al procedimiento manual.

**HE-3.** La generación asistida del borrador de informe a partir de los indicadores validados por el examinador reduce el tiempo de redacción del informe definitivo sin sustituir el juicio clínico del profesional.

**HE-4.** La sincronización en tiempo real entre la tablet del paciente y el panel del examinador, combinada con la transcripción automática del audio de la sesión, elimina el doble esfuerzo de registro —anotación durante la sesión y transcripción posterior— que constituye una de las principales fuentes de tiempo elevado en el procedimiento manual.

## 2.5. Operacionalización de variables

### Variable independiente: Aplicación web Psicograma

| Dimensión | Indicador | Medición | Instrumento |
|---|---|---|---|
| Captura temporal del dibujo | Número de indicadores temporales capturados automáticamente (latencia, pausas, borrados, secuencia) | Conteo por sesión | Log de trazos (`strokes`, `stroke_metrics`) |
| Motor de reglas | Número de indicadores propuestos automáticamente vs. total del manual | Proporción | Tabla `session_indicators` |
| Registro estructurado | Número de marcas rápidas, verbalizaciones y observaciones registradas durante la sesión | Conteo por sesión | Tablas `session_quick_marks`, `verbalizations`, `session_observations` |
| Generación del borrador | Número de secciones del informe completadas automáticamente vs. total (9 secciones) | Proporción | Tabla `report_sections` |
| Cobertura de requerimientos | Porcentaje de los 41 RF verificados | Porcentaje | Auditoría AUD-01 |
| Disponibilidad del sistema | Tiempo de respuesta de operaciones de consulta y registro | Segundos | Monitoreo de latencia (RNF-03) |

### Variable dependiente: Tiempo de elaboración de informes de tests proyectivos de dibujo

| Dimensión | Indicador | Medición | Instrumento |
|---|---|---|---|
| Tiempo total por informe | Minutos transcurridos desde el cierre de la sesión hasta la validación final del informe | Minutos por informe | Ficha de registro pre/post (SPEC-AUD-05) |
| Reducción obtenida | Porcentaje de reducción del tiempo medio post-implementación respecto al pre-implementación | Porcentaje | Comparación de medianas; prueba de Wilcoxon |
| Tiempo de puntuación | Minutos dedicados a la aplicación de los criterios del manual por sesión | Minutos | Ficha de observación |
| Tiempo de redacción | Minutos dedicados a la redacción del informe por sesión | Minutos | Ficha de observación |
| Completitud del informe | Número de secciones del informe completadas antes de la validación | Conteo | Registro de `report_sections` |

## 2.6. Modelo teórico o conceptual

El modelo teórico que sustenta el proyecto articula tres capas de transformación sobre el proceso de evaluación psicológica:

**Capa 1 — Captura.** La Pointer Events API registra el proceso completo del trazado del paciente en tiempo real: secuencia de ejecución, latencia de inicio, pausas entre trazos, presión aplicada, borrados y posición de cada punto. Esta capa transforma el dibujo de un artefacto estático en un artefacto dinámico con dimensión temporal, cubriendo los indicadores de las secciones A-3 a A-6 del manual PBLL que en el procedimiento manual se pierden irrecuperablemente al finalizar el dibujo.

**Capa 2 — Análisis estructurado.** El motor de reglas cruza las métricas objetivas de la Capa 1 con los 201 indicadores del manual PBLL. Los indicadores se clasifican en tres tipos según su grado de automatización: automáticos (23), semiautomáticos con asistencia de modelo de lenguaje (25) y de verificación profesional mediante checklist (153). Esta capa aplica el principio de desacoplamiento de Wen et al. (2025): la detección descriptiva es automática; la inferencia interpretativa es exclusiva del examinador. Todo indicador propuesto declara la medición y el umbral que lo originaron, aplicando el principio de trazabilidad de Xie et al. (2024).

**Capa 3 — Generación asistida.** A partir de los indicadores validados explícitamente por el psicólogo, el sistema genera un borrador de informe estructurado en nueve secciones. Cuatro secciones son redactadas con asistencia de modelo de lenguaje (secciones 5, 6, 7 y 8); las cinco restantes son deterministas. La sección de conclusiones clínicas (sección 9) se entrega vacía para su redacción exclusiva por el profesional, en cumplimiento del hallazgo de Lin et al. (2022) sobre la ausencia de asociación confiable entre los indicadores proyectivos y los diagnósticos de salud mental.

El modelo opera bajo el principio rector del proyecto: **Psicograma potencia al psicólogo, no lo reemplaza.** Ninguna sugerencia del sistema puede incorporarse al informe sin la validación explícita del examinador. El resultado final del proceso es siempre un informe redactado y firmado por un profesional colegiado.

```
┌─────────────────────────────────────────────────────────────────┐
│                    MODELO CONCEPTUAL — PSICOGRAMA               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ENTRADA           CAPTURA           ANÁLISIS        SALIDA     │
│                                                                  │
│  Paciente  ──►  Lienzo digital  ──►  Métricas   ──►  Borrador  │
│  (tablet)       Pointer Events       objetivas       9 secciones│
│                 A+tiempo+presión                                 │
│                                                                  │
│  Examinador ──► Observaciones  ──►  Motor de   ──►  Informe    │
│  (desktop)      Marcas rápidas       reglas         validado    │
│                 Audio / Whisper      201 indicadores PDF        │
│                                                                  │
│  ─────────────── Sincronización en tiempo real ──────────────── │
│                  Supabase Realtime Broadcast < 200 ms           │
│                                                                  │
│  ─────────────── Principio rector: el profesional valida ─────  │
│                  Ningún indicador entra al informe sin           │
│                  validación explícita del examinador             │
└─────────────────────────────────────────────────────────────────┘
```

---

# CAPÍTULO 3. DESARROLLO DE LA SOLUCIÓN

## 3.1. Metodología

### 3.1.1. Tipo de investigación

El presente proyecto se enmarca en una investigación de tipo **aplicada**, orientada a generar conocimiento útil para la resolución de un problema concreto en la práctica psicológica. Se parte de un problema identificado en el Centro Psicológico Ser Integral E.I.R.L. —el tiempo elevado de elaboración de informes de tests proyectivos de dibujo y la pérdida de datos temporales del proceso de dibujo— y se construye una solución tecnológica cuya efectividad se medirá de forma empírica mediante un diseño pre/post implementación.

### 3.1.2. Enfoque

El enfoque es **cuantitativo**. La variable dependiente —tiempo de elaboración de informes en minutos— se medirá directamente antes y después de la implementación de Psicograma en el centro mediante una ficha de registro estructurada (SPEC-AUD-05). El análisis comparativo previsto utiliza mediana, rango intercuartílico y prueba de Wilcoxon, dado que el tamaño de muestra esperado no garantiza normalidad y la prueba t no es adecuada en esas condiciones.

### 3.1.3. Diseño

El diseño es **pre-experimental con medición pre y post intervención** (diseño de un solo grupo). Se mide el tiempo de elaboración de informes bajo el procedimiento manual (línea base) y, tras la implementación de Psicograma, se mide el mismo indicador bajo el procedimiento asistido. La ausencia de grupo control se justifica por las limitaciones de tamaño de la organización y por el carácter académico del proyecto. Los resultados obtenidos son referenciales y no constituyen una validación clínica del instrumento.

### 3.1.4. Alcance

El alcance del estudio es **descriptivo-correlacional**: describe el tiempo actual de elaboración de informes en el centro de referencia y estima la correlación entre el uso de Psicograma y la reducción de dicho tiempo. No pretende establecer causalidad generalizable, sino ofrecer evidencia inicial en el entorno acotado del Centro Psicológico Ser Integral E.I.R.L. para el test de la Persona bajo la lluvia.

---

## 3.2. Planteamiento de alternativas de solución

### 3.2.1. Identificación de alternativas

Para resolver el problema identificado —tiempo elevado de elaboración de informes de tests proyectivos de dibujo, pérdida de indicadores temporales del proceso de dibujo y variabilidad entre evaluadores— se identificaron tres familias de solución tecnológica que difieren en su arquitectura, el grado de automatización del análisis y la participación de Java en la pila tecnológica.

Las tres alternativas cubren el alcance funcional declarado en el apartado 1.6.1: gestión de pacientes y sesiones, captura del dibujo, registro de la sesión, análisis de indicadores y generación del borrador de informe. Se diferencian en el nivel de integración entre capas, el mecanismo de análisis del dibujo y las tecnologías utilizadas.

La comparación se realizó sobre cinco ejes: cobertura del alcance funcional, participación de Java (requisito ≥ 50 %), viabilidad técnica en el periodo académico, diferenciación respecto al estado del arte y riesgo de implementación.

### 3.2.2. Alternativa de solución 1 — Aplicación de escritorio Java con análisis local

**Descripción de la propuesta.** Una aplicación de escritorio desarrollada íntegramente en Java (Swing / JavaFX) que gestiona pacientes, sesiones e informes y realiza el análisis de indicadores de forma local sin requerir conexión a internet durante la sesión. El psicólogo digitaliza el dibujo mediante escáner o fotografía; la aplicación procesa la imagen y presenta los indicadores del manual como checklist editable. El informe se genera localmente como documento PDF mediante una plantilla predefinida.

**Tecnologías utilizadas.**

| Capa | Tecnología |
|---|---|
| Interfaz de usuario | Java 21 + JavaFX |
| Persistencia local | SQLite (JDBC) |
| Procesamiento de imagen | Java Image I/O + OpenCV-Java |
| Generación de PDF | Apache PDFBox (Java) |
| Empaquetado | jlink + jpackage |
| Control de versiones | Git |

**Aplicación de TIC.** La aplicación integra reconocimiento básico de características gráficas sobre imagen estática (tamaño de la figura, posición en la hoja, presencia de paraguas) mediante procesamiento de imagen en Java. La gestión de pacientes y el historial de informes se almacenan en una base de datos SQLite local. El PDF se genera mediante plantilla programática.

**Participación de Java: 100 %.** Toda la pila —interfaz, lógica de negocio, persistencia y exportación— está implementada en Java. Supera el umbral mínimo requerido del 50 %.

**Pantallas de la alternativa 1 (mínimo 5):**

1. Pantalla de inicio de sesión — Autenticación local del psicólogo.
2. Panel principal — Lista de pacientes activos y acceso rápido a nueva evaluación.
3. Ficha del paciente — Datos personales, historial de sesiones e informes.
4. Pantalla de captura del dibujo — Importación de imagen digitalizada con herramienta de ajuste.
5. Pantalla de análisis de indicadores — Checklist de 201 indicadores organizado por categorías.
6. Editor del informe — Vista de las 9 secciones con edición y exportación a PDF.
7. Catálogo de tests — Visualización de tests disponibles y fichas técnicas.

**Cobertura del alcance planteado.** Cubre parcialmente el alcance: gestiona pacientes, sesiones e informes, y presenta los indicadores como checklist. **No cubre** los indicadores temporales del proceso de dibujo (latencia, secuencia, pausas, borrados), ni la sincronización en tiempo real, ni la transcripción automática del audio.

### 3.2.3. Alternativa de solución 2 — Aplicación web Java (Spring Boot) con backend de análisis

**Descripción de la propuesta.** Una aplicación web en la que el backend es un servidor Java Spring Boot que expone una API REST y realiza tanto la gestión de datos como el análisis de indicadores. El frontend es HTML + Thymeleaf servido desde el propio servidor Spring Boot. El dibujo se captura mediante un canvas HTML básico que transmite la imagen final al servidor para su análisis; no se capturan los datos temporales del trazo. La base de datos es PostgreSQL gestionada en la nube.

**Tecnologías utilizadas.**

| Capa | Tecnología |
|---|---|
| Backend (API + análisis + vistas) | Java 21 + Spring Boot 3 + Thymeleaf |
| Persistencia | PostgreSQL 17 (Supabase) + Spring Data JPA |
| Captura del dibujo | Canvas HTML5 (imagen estática) |
| Generación de PDF | iText / OpenPDF (Java) |
| Transcripción | API de OpenAI Whisper (integrada desde Java) |
| Despliegue | Railway (JAR ejecutable) |

**Aplicación de TIC.** API REST completa desde Java, persistencia en la nube, transcripción automática de audio mediante Whisper integrada desde Spring Boot, y generación programática del PDF.

**Participación de Java: 75 %.** El backend completo está en Java. El frontend es HTML/CSS con JavaScript mínimo para el canvas. Supera el umbral requerido del 50 %.

**Pantallas de la alternativa 2 (mínimo 5):**

1. Pantalla de registro e inicio de sesión del psicólogo.
2. Dashboard con resumen de actividad.
3. Listado de pacientes con búsqueda y filtros.
4. Nueva sesión con formulario de configuración.
5. Captura del dibujo mediante Canvas HTML5.
6. Análisis de indicadores con checklist y detección automática básica.
7. Editor del informe con 9 secciones y exportación a PDF.
8. Historial de informes con estado y enlace de descarga.

**Cobertura del alcance planteado.** Cubre gestión, sesiones e informes. Incorpora transcripción de audio desde Java. **No cubre** la captura de la dimensión temporal del dibujo ni la sincronización en tiempo real tablet-desktop.

### 3.2.4. Alternativa de solución 3 — Aplicación web con frontend React, backend Java Spring Boot hexagonal y captura temporal del dibujo (seleccionada)

**Descripción de la propuesta.** Una aplicación web de dos interfaces sincronizadas en tiempo real: interfaz de paciente (tablet) que captura el proceso completo del trazado con datos temporales, e interfaz de examinador (desktop) con espejo en vivo, análisis de indicadores y generación del informe. El backend es Java Spring Boot con arquitectura hexagonal que centraliza toda la lógica de negocio y el análisis. El frontend React se comunica exclusivamente con la API del backend Java.

**Tecnologías utilizadas.**

| Capa | Tecnología | Java |
|---|---|---|
| Interfaz de usuario (examinador) | React 18 + TypeScript + Vite | No |
| Interfaz de usuario (paciente) | React 18 + Pointer Events API + Canvas HTML5 | No |
| Backend API REST | Java 21 + Spring Boot 3 (hexagonal) | **Sí** |
| Motor de análisis de indicadores | Java 21 (dominio puro) | **Sí** |
| Motor de reglas PBLL | Java 21 (201 indicadores, umbrales calibrables) | **Sí** |
| Generación del borrador de informe | Java 21 + OpenRouter LLM | **Sí** |
| Exportación PDF | iText / OpenPDF (Java) | **Sí** |
| Persistencia | PostgreSQL 17 (Supabase) + Spring Data JPA | **Sí** |
| Sincronización en tiempo real | Supabase Realtime Broadcast (WebSocket) | No |
| Transcripción de audio | API OpenAI Whisper (integrada desde Java) | **Sí** |
| Autenticación | Supabase Auth + JWT (verificación en Java) | **Sí** |
| Despliegue | Railway (JAR) + Vercel (frontend) | — |

**Participación de Java: 70 %.** Backend completo en Java. Supera el umbral requerido del 50 %.

**Pantallas de la alternativa 3 (13 pantallas implementadas):**

1. Pantalla de inicio de sesión y registro
2. Dashboard principal
3. Listado de pacientes
4. Ficha del paciente
5. Catálogo de tests proyectivos
6. Asistente de nueva sesión (3 pasos: selección, consentimiento, confirmación)
7. Consigna PBLL (interfaz paciente — pantalla completa)
8. Lienzo de dibujo con captura temporal (interfaz paciente)
9. Pantalla de cierre del paciente
10. Sesión en vivo con espejo en tiempo real y métricas (interfaz examinador)
11. Verificación profesional — checklist de 153 indicadores
12. Análisis de resultados PBLL — métricas objetivas e indicadores automáticos
13. Editor del informe psicológico — 9 secciones, validación y exportación PDF

**Cobertura del alcance planteado: 100 %.** Es la única alternativa que cubre el diferenciador central del proyecto: la captura de la dimensión temporal del proceso de dibujo.

### 3.2.5. Comparación de alternativas

| Criterio | Alternativa 1 | Alternativa 2 | Alternativa 3 |
|---|---|---|---|
| Cobertura del alcance | Parcial | Media | **Total (100 %)** |
| Participación de Java | 100 % | 75 % | **70 %** |
| Captura dimensión temporal | ✗ No | ✗ No | ✓ **Sí** |
| Sincronización tiempo real | ✗ No | ✗ No | ✓ **Sí** |
| Transcripción de audio | ✗ No | ✓ Sí | ✓ Sí |
| Generación asistida con LLM | ✗ No | ✗ No | ✓ **Sí** |
| Disponibilidad | Solo escritorio | Web | **Web + tablet + desktop** |
| Motor de reglas configurable | ✗ No | ✗ No | ✓ **Sí** |
| Seguridad | Media | Media | **Alta (RLS + JWT)** |
| Pantallas implementadas | 7 | 8 | **13** |
| Viabilidad demostrada | Alta (diseño) | Alta (diseño) | **Alta (implementada)** |

### 3.2.6. Selección de la alternativa

**Se selecciona la Alternativa 3.** Criterios determinantes:

1. **Cobertura del alcance:** Es la única alternativa que captura la dimensión temporal del dibujo, sin la cual los indicadores de las secciones A-5, A-6 y B-3 del manual PBLL siguen dependiendo de la anotación manual.
2. **Participación de Java ≥ 50 %:** El backend completo supera el 70 % en Java.
3. **Alineación con el estado del arte:** Aplica los principios de Wen et al. (2025) y Xie et al. (2024).
4. **Viabilidad demostrada:** 6 sprints completados, 40/47 tareas cerradas, 13 pantallas funcionales.

---

## 3.3. Gestión del proyecto

### 3.3.1. Project Charter

| Campo | Valor |
|---|---|
| **Título del proyecto** | Psicograma — Aplicación web para la evaluación psicológica con tests proyectivos de dibujo |
| **Jefe de proyecto** | Joaquin Sebastian Chaparro Villavicencio |
| **Patrocinadora** | Centro Psicológico Ser Integral E.I.R.L. |
| **Fecha de inicio** | 10/08/2026 |
| **Fecha de fin** | 11/12/2026 |
| **Presupuesto estimado** | S/ 3,573.68 |

**Entregables principales:**
1. SRS IEEE 830 — 41 RF + 30 RNF (completado)
2. Módulo de gestión de pacientes y sesiones (completado — Sprint 2)
3. Módulo de paciente: captura digital del dibujo (completado — Sprint 3)
4. Módulo de examinador: sesión en vivo y audio (completado — Sprint 3)
5. Módulo de análisis: métricas y motor de reglas PBLL (completado — Sprint 4)
6. Módulo de informe: borrador, editor, validación y PDF (completado — Sprint 6)
7. Auditoría del sistema y medición del tiempo de elaboración (pendiente — Fase 3)

**Equipo:**

| Miembro | Rol |
|---|---|
| Joaquin Sebastian Chaparro Villavicencio | Jefe de proyecto, arquitectura y backend |
| Jonathan Edilson Tuppia Lozano | Base de datos y diagramas |
| Iam Kaled Fabricio Arias Yaranga | Análisis y motor de reglas |
| Yefrei Eyder Bernable Pantaleon | Gestión de pacientes y alternativas |
| Jose Eduardo Diaz Fernandez | Marco teórico e informe |

### 3.3.2. Estructura de Descomposición del Trabajo (WBS)

```
PSICOGRAMA
├── 1. ANÁLISIS Y DISEÑO
│   ├── 1.1. Planificación (misión, visión, alcance) ── COMPLETADO
│   ├── 1.2. Reunión inicial y relevamiento ── COMPLETADO
│   ├── 1.3. SRS IEEE 830 (41 RF + 30 RNF) ── COMPLETADO
│   ├── 1.4. Arquitectura hexagonal y BD 2FN ── COMPLETADO
│   └── 1.5. Diagramas BPM, clases, ER, casos de uso ── EN PROCESO
├── 2. CONSTRUCCIÓN
│   ├── 2.1. Sprint 1 — Fundación ── COMPLETADO
│   │   ├── Infraestructura, design system, router
│   │   ├── Cliente BD y tipos base
│   │   ├── Autenticación y rutas protegidas
│   │   └── Shell de navegación del examinador
│   ├── 2.2. Sprint 2 — Pacientes, panel y sesiones ── COMPLETADO
│   │   ├── Panel de control (dashboard)
│   │   ├── Gestión de pacientes (CRUD + ficha)
│   │   ├── Catálogo de tests
│   │   └── Asistente de nueva sesión con consentimiento
│   ├── 2.3. Sprint 3 — Lienzo y sesión en vivo ── COMPLETADO
│   │   ├── Interfaz del paciente (consigna, lienzo, cierre)
│   │   ├── Captura temporal del dibujo (Pointer Events)
│   │   ├── Sincronización en tiempo real (Realtime Broadcast)
│   │   ├── Métricas en vivo y marcas rápidas
│   │   └── Grabación de audio
│   ├── 2.4. Sprint 4 — Análisis y motor de reglas ── COMPLETADO
│   │   ├── Transcripción (Whisper) y verbalizaciones
│   │   ├── Catálogo de 201 indicadores PBLL en BD
│   │   ├── Medición objetiva automática (23 indicadores)
│   │   ├── Sugerencia asistida con LLM (25 indicadores)
│   │   └── Checklist profesional (153 indicadores)
│   ├── 2.5. Sprint 5 — Rearquitectura hexagonal ── COMPLETADO
│   │   ├── Esquema PostgreSQL 2FN (22 tablas)
│   │   ├── Catálogo del manual en base de datos
│   │   ├── Núcleo de dominio, puertos y servicios
│   │   ├── Repositorios + propagación de identidad
│   │   ├── Endpoints REST (análisis, audio, indicadores)
│   │   ├── Migración frontend a API REST
│   │   └── Migraciones versionadas y reversibles
│   └── 2.6. Sprint 6 — Informe, PDF y cierre ── COMPLETADO
│       ├── Generación del borrador de 9 secciones
│       ├── Editor del informe con índice y marcado
│       ├── Flujo borrador → validado
│       ├── Exportación a PDF
│       ├── Baja lógica de paciente
│       └── Dashboard contra datos consolidados
└── 3. AUDITORÍA Y CIERRE
    ├── 3.1. Auditoría funcional (41 RF) ── PENDIENTE
    ├── 3.2. Auditoría de seguridad ── PENDIENTE
    ├── 3.3. Auditoría ética y trazabilidad ── PENDIENTE
    ├── 3.4. Auditoría de rendimiento ── PENDIENTE
    └── 3.5. Medición pre/post del tiempo ── PENDIENTE
```

### 3.3.3. Diagrama de Gantt

| Fase | Actividad | Responsable | Inicio | Fin | Avance |
|---|---|---|---|---|---|
| Fase 1 | Planificación | Joaquin Chaparro | 10/08 | 11/08 | 100 % |
| Fase 1 | Reunión inicial | Jose Diaz | 15/08 | 17/08 | 100 % |
| Fase 1 | SRS IEEE 830 | Yefrei Bernable | 08/09 | 10/09 | 100 % |
| Fase 1 | Arquitectura y BD | Jonathan Tuppia | 18/09 | 25/09 | 100 % |
| Fase 1 | Diagramas | Iam Arias | 28/09 | 05/10 | 80 % |
| Fase 2 | Sprint 1 | Joaquin Chaparro | 18/08 | 22/08 | 100 % |
| Fase 2 | Sprint 2 | Yefrei Bernable | 25/08 | 01/09 | 100 % |
| Fase 2 | Sprint 3 | Jonathan Tuppia | 04/09 | 11/09 | 100 % |
| Fase 2 | Sprint 4 | Iam Arias | 16/09 | 22/09 | 100 % |
| Fase 2 | Sprint 5 | Joaquin Chaparro | 25/09 | 30/09 | 100 % |
| Fase 2 | Sprint 6 | Jose Diaz | 28/09 | 01/10 | 100 % |
| Fase 3 | Auditoría | Iam Arias | 02/11 | 11/11 | 0 % |
| Fase 3 | Despliegue | Jose Diaz | 20/11 | 24/11 | 0 % |
| Fase 3 | Cierre | Joaquin Chaparro | 07/12 | 08/12 | 0 % |

**Avance global al 01/10/2026: 85.1 % (40/47 tareas completadas)**

### 3.3.4. Planificación del proyecto

La planificación sigue una estructura de **6 sprints + 1 fase de auditoría** en 3 fases dentro de una ventana de 4 meses. La metodología combina Scrum (sprints de 5-14 días con revisión al cierre) con documentación IEEE 830. Las tareas se trazan desde los objetivos específicos hasta los requerimientos y desde estos hasta las tareas de sprint.

---

## 3.4. Análisis de la solución

### 3.4.1. Identificación de actores

**Actores primarios:**

| Actor | Descripción | Interfaz | Dispositivo |
|---|---|---|---|
| **Examinador** | Psicólogo colegiado que administra el test, analiza indicadores y valida el informe | Panel del examinador | Desktop |
| **Paciente** | Persona evaluada que realiza el dibujo bajo la consigna del test | Panel del paciente | Tablet con lápiz digital |

**Actores secundarios (sistemas externos):**

| Actor | Descripción |
|---|---|
| **OpenAI Whisper** | Transcripción automática de audio, invocado por el backend |
| **OpenRouter LLM** | Generación asistida del borrador del informe, invocado por el backend |

### 3.4.2. Casos de uso del sistema

Los 36 casos de uso se organizan en 8 grupos: Autenticación (CU-01 a CU-03), Gestión de pacientes (CU-04 a CU-09), Gestión de sesiones (CU-10 a CU-14), Captura del dibujo — paciente (CU-15 a CU-18), Registro de la sesión — examinador (CU-19 a CU-24), Análisis de indicadores (CU-25 a CU-29), Generación del informe (CU-30 a CU-34), Panel y catálogo (CU-35 a CU-36).

### 3.4.3. Diagrama general de casos de uso

```
┌─────────────────────────────────────────────────────────┐
│                    SISTEMA PSICOGRAMA                    │
│  ┌────────────────┐  ┌────────────────┐  ┌───────────┐ │
│  │ AUTENTICACIÓN  │  │    GESTIÓN     │  │ CATÁLOGO  │ │
│  │ CU-01 a CU-03  │  │ CU-04 a CU-14  │  │  CU-36    │ │
│  └────────────────┘  └────────────────┘  └───────────┘ │
│  ┌──────────────────────────────────────────────────┐   │
│  │ CAPTURA DEL DIBUJO (CU-15 a CU-18) — Paciente    │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │ REGISTRO EN VIVO (CU-19 a CU-24) — Examinador    │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │ ANÁLISIS (CU-25 a CU-29) — Examinador + LLM      │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │ INFORME (CU-30 a CU-34) — Examinador + LLM       │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
      [Examinador]                    [Paciente]
      Psicólogo colegiado             Evaluado
      Desktop                         Tablet + lápiz digital
```

### 3.4.4. Especificación de casos de uso

**CU-12: Iniciar sesión y emparejar dispositivos**

| Campo | Descripción |
|---|---|
| Actor primario | Examinador |
| Actor secundario | Paciente |
| Precondición | Sesión en estado `consent` con consentimiento registrado |
| Flujo principal | 1. Examinador inicia la sesión. 2. Sistema genera token efímero canal Realtime `session:{id}`. 3. Paciente accede a la consigna en la tablet. 4. Sistema vincula ambos dispositivos. 5. Estado de sesión → `active`, registra `started_at`. |
| Flujo alternativo | Si el paciente no se conecta en 5 min, el examinador puede reintentar o cancelar. |
| Postcondición | Sesión en estado `active`, ambos dispositivos vinculados al canal privado. |
| Requerimientos | RF-11, RNF-13 |

**CU-25: Solicitar análisis automático**

| Campo | Descripción |
|---|---|
| Actor primario | Examinador |
| Actor secundario | OpenRouter LLM |
| Precondición | Sesión en estado `completed`, trazos persistidos |
| Flujo principal | 1. Examinador solicita análisis. 2. Backend calcula 7 métricas objetivas. 3. Motor de reglas cruza métricas con 23 indicadores automáticos. 4. LLM propone 25 indicadores semiautomáticos. 5. Sistema presenta indicadores con medición y umbral que los originaron. |
| Flujo alternativo | Si LLM no disponible: se conservan métricas y automáticos; `llm_available=false`. |
| Postcondición | Indicadores en `session_indicators` con `status='suggestion'` pendientes de validación. |
| Requerimientos | RF-29, RF-30, RF-31, RNF-17, RNF-18, RNF-19 |

### 3.4.5. Requerimientos funcionales

Ver documento completo: `requerimientos-funcionales-no-funcionales.md`  
**Total: 41 RF (RF-01 a RF-41)** en 9 grupos: Autenticación, Gestión de pacientes, Sesiones, Captura del dibujo, Sincronización, Audio, Análisis, Informe, Panel y catálogo.

### 3.4.6. Requerimientos no funcionales

Ver documento completo: `requerimientos-funcionales-no-funcionales.md`  
**Total: 30 RNF (RNF-01 a RNF-30)** en 9 grupos: Rendimiento, Escalabilidad, Disponibilidad, Seguridad, Confidencialidad, Ética y trazabilidad, Usabilidad, Mantenibilidad, Compatibilidad.

### 3.4.7. Especificación de Requerimientos de Software (SRS)

La SRS sigue el estándar IEEE Std 830-1998 y comprende 41 RF + 30 RNF con tabla de trazabilidad a los 5 objetivos específicos y tabla de cobertura del alcance por módulo. Se incorporaron dos grupos adicionales (Confidencialidad y Ética) porque el sistema maneja datos clínicos de personas —en parte menores de edad— y porque la delimitación frente a la inferencia diagnóstica es una condición sustentada en Lin et al. (2022).

---

## 3.5. Diseño detallado de la solución

### 3.5.1. Arquitectura de la solución

Psicograma adopta una **arquitectura hexagonal** (Ports and Adapters) en el backend, que aísla la lógica de negocio del dominio de cualquier detalle tecnológico.

```
┌──────────────────────────────────────────────────────────────┐
│                    ARQUITECTURA PSICOGRAMA                    │
│                                                               │
│  FRONTEND (React + TypeScript + Vite)                        │
│  ┌─────────────────────┐  ┌─────────────────────────────┐   │
│  │ Interfaz Examinador  │  │  Interfaz Paciente           │   │
│  │ (Desktop)            │  │  (Tablet + lápiz digital)    │   │
│  └─────────────────────┘  └─────────────────────────────┘   │
│       │ HTTPS (API REST)               │ WSS (Realtime)       │
│       ▼                                ▼                      │
│  BACKEND (Java 21 + Spring Boot 3 — Arquitectura Hexagonal)  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  ADAPTADORES DE ENTRADA                                 │  │
│  │  ─ Controladores REST · Verificador JWT (JWKS)          │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │  DOMINIO JAVA PURO (sin dependencias de infraestructura)│  │
│  │  ─ Motor de análisis PBLL · Motor de reglas (201 ind.) │  │
│  │  ─ Calculador de métricas · Generador del borrador     │  │
│  │  ─ Entidades: Sesión, Paciente, Indicador, Informe      │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │  ADAPTADORES DE SALIDA                                  │  │
│  │  ─ Repositorios PostgreSQL · Adaptador Whisper          │  │
│  │  ─ Adaptador OpenRouter LLM · Exportador PDF (iText)    │  │
│  └────────────────────────────────────────────────────────┘  │
│       │ SQL + RLS                      │ WebSocket Broadcast  │
│       ▼                                ▼                      │
│  PostgreSQL 17 (Supabase)          Supabase Realtime          │
│  22 tablas + RLS activa             Canal privado session:{id}│
│                                                               │
│  SERVICIOS EXTERNOS                                          │
│  OpenAI Whisper · OpenRouter LLM                             │
└──────────────────────────────────────────────────────────────┘
```

**Decisiones clave:**
- El frontend no accede directamente a la BD (DT-011).
- El dominio Java es puro: no importa Spring, JPA ni infraestructura.
- RLS en las 22 tablas como segunda capa de seguridad.
- Canal Realtime es la excepción documentada (pub/sub efímero sin persistencia).

### 3.5.2. Diseño de procesos

Tres procesos clínicos diferenciados:
- **Proceso 1 — Evaluación y captura:** Examinador + Paciente (simultáneo y sincronizado).
- **Proceso 2 — Análisis de indicadores:** Solo el examinador, post-sesión.
- **Proceso 3 — Generación y validación del informe:** Solo el examinador.

### 3.5.3. Diagramas de procesos (BPM)

Ver Anexo K para los diagramas completos con notación BPMN 2.0.

**Proceso 1 — Resumen:**
`Configurar sesión → Consentimiento → Iniciar (token Realtime) → [PARALELO: Examinador observa / Paciente dibuja] → Finalizar → Persistir trazos`

**Proceso 2 — Resumen:**
`Solicitar análisis → Calcular métricas → Detectar automáticos → [LLM] Proponer semiautomáticos → Examinador acepta/rechaza → Completar checklist 153`

**Proceso 3 — Resumen:**
`Solicitar borrador → Generar secciones deterministas 1,2,3,4,9 → [LLM] Redactar 5,6,7,8 → Examinador edita → Validar → Exportar PDF`

### 3.5.4. Diagrama de clases

Ver Anexo L para el diagrama completo. Las clases principales del dominio Java son:

**Entidades:** `Profile`, `Patient`, `Session`, `ConsentRecord`, `Drawing`, `Stroke`, `StrokeMetrics`, `AudioRecording`, `TranscriptSegment`, `SessionObservations`, `SessionQuickMark`, `SessionAttitude`, `Verbalization`, `SessionIndicator`, `Report`, `ReportSection`

**Catálogos:** `Test`, `IndicatorCategory`, `ManualSection`, `IndicatorCatalog`, `QuickMarkCatalog`, `AttitudeCatalog`

**Servicios:** `AnalysisService`, `MetricsCalculator`, `RuleEngine`, `ReportGenerator`, `OpenRouterAdapter`, `WhisperAdapter`, `PdfExporter`

### 3.5.5. Diagrama entidad-relación

Ver Anexo M para el diagrama completo. El esquema consta de **22 tablas** normalizadas a 2FN, distribuidas en 9 grupos (catálogos, identidad y pacientes, sesiones, dibujo y trazos, audio y transcripción, observaciones, indicadores de sesión, informe).

**Corrección de 2FN:** En v1, los 201 indicadores del manual se repetían en `indicators` por cada sesión (dependencia parcial). En v2, el catálogo vive una sola vez en `indicator_catalog` y se relaciona con cada sesión mediante la clave compuesta `(session_id, indicator_code)` en `session_indicators`.

### 3.5.6. Diseño de base de datos

| Decisión | Implementación |
|---|---|
| Aislamiento por profesional | RLS activa en las 22 tablas |
| Propagación de identidad | `SET LOCAL ROLE authenticated` + `SET LOCAL request.jwt.claims` en cada transacción |
| Datos temporales atómicos | `strokes.points` JSONB (excepción documentada: serie temporal atómica) |
| Índices en FK | Índices explícitos en todas las FK que se recorren en consultas habituales |
| Timestamps automáticos | Trigger `touch_updated_at()` en `session_observations`, `reports` y `report_sections` |
| Migraciones versionadas | Migraciones `001` y `002` aplicadas y registradas |

### 3.5.7. Diseño de interfaces

Design system **Clinical Precision** — principios visuales:

| Elemento | Valor |
|---|---|
| Color primario | Violeta profundo #2E2365 |
| Acción primaria | #453A7D |
| Sugerencia IA (pendiente) | Ámbar #C97A1F |
| Validado por el profesional | Verde #2E7D5B |
| Grabación activa | Rojo #C0523F |
| Tipografía | Inter — Semibold para títulos, Regular para cuerpo |
| Grid | 12 columnas, 1280 px, margen 40 px |
| Radio de esquinas | 8 px (todos los elementos primarios) |

### 3.5.8. Tecnologías utilizadas

| Capa | Tecnología | Versión |
|---|---|---|
| Frontend | React + TypeScript + Vite | 18.x / 5.x / 5.x |
| Backend | Java 21 + Spring Boot 3 | 21 LTS / 3.x |
| Persistencia | PostgreSQL 17 (Supabase) | 17.6 |
| IA — Transcripción | OpenAI Whisper API | — |
| IA — Redacción | OpenRouter LLM API | — |
| Auth | Supabase Auth + JWT ES256 | — |
| Realtime | Supabase Realtime Broadcast | — |
| PDF | iText / OpenPDF (Java) | — |
| Despliegue | Railway (backend) + Vercel (frontend) | — |

### 3.5.9. Arquitectura tecnológica

Ver Anexo N para el diagrama de despliegue completo. Las cuatro capas son:
1. **Presentación:** React en cliente del examinador y tablet del paciente (HTTPS + WSS).
2. **Lógica de negocio:** Java 21 + Spring Boot 3 hexagonal en Railway.
3. **Datos:** PostgreSQL 17 en Supabase con RLS en 22 tablas y 2 migraciones aplicadas.
4. **Servicios externos:** Whisper y OpenRouter como adaptadores de salida del hexágono.

### 3.5.10. Componentes desarrollados en Java

| Componente | Clases principales | Descripción |
|---|---|---|
| Motor de análisis | `AnalysisService`, `IndicatorEngine` | Orquesta la medición y la propuesta de indicadores |
| Motor de reglas PBLL | `RuleEngine`, `IndicatorRule`, `Threshold` | 201 indicadores con umbrales calibrables |
| Calculador de métricas | `MetricsCalculator`, `StrokeAnalyzer` | 7 métricas desde los trazos capturados |
| Generador del borrador | `ReportGenerator`, `SectionBuilder`, `OpenRouterAdapter` | 9 secciones; 4 con LLM, 5 deterministas |
| Exportador PDF | `PdfExporter`, `ReportTemplate` | PDF desde informe validado con plantilla Clinical Precision |
| Verificador de JWT | `JwtVerifier`, `SupabaseJwksProvider` | Validación de tokens Supabase ES256 |
| Repositorios PostgreSQL | `PatientRepository`, `SessionRepository`, etc. | Puertos de salida con propagación de identidad |
| Controladores REST | `PatientController`, `SessionController`, etc. | ~40 endpoints de la API v2 |

---

## 3.6. Diseño del prototipo

### 3.6.1. Herramienta utilizada para el prototipo

Aplicación web funcional en React + TypeScript con backend Java Spring Boot. Supera el nivel de fidelidad de una herramienta de mockup: todas las pantallas responden a interacciones reales conectadas a PostgreSQL.

### 3.6.2. Diseño general del prototipo

Dos interfaces diferenciadas:
- **Examinador (desktop):** Sidebar fija violeta · área de trabajo central · cabecera con identidad del profesional.
- **Paciente (tablet):** Pantalla completa sin distracciones · sin sidebar · solo consigna, lienzo y cierre.

### 3.6.3. Prototipo de la solución

Flujo completo end-to-end implementado: registro del psicólogo → configuración de sesión → dibujo del paciente → análisis de indicadores → generación del borrador → edición → validación → descarga del PDF.

### 3.6.4. Diseño de la pantalla principal

**Dashboard:** Cuatro tarjetas métricas en la parte superior (sesiones de la semana, evaluaciones pendientes, pacientes activos, sesiones recientes). Lista de sesiones recientes con acceso rápido. Fondo surface `#fcf8ff`. Sidebar violeta profundo siempre visible.

### 3.6.5. Diseño de módulos

| Módulo | Pantallas | Rutas |
|---|---|---|
| Autenticación | Login, registro | `/` (pública) |
| Panel de control | Dashboard | `/` (examinador) |
| Pacientes | Listado, ficha, registro | `/pacientes`, `/pacientes/:id` |
| Sesiones | Nueva sesión, sesión en vivo | `/sesiones/nueva`, `/sesiones/:id/en-vivo` |
| Paciente (tablet) | Consigna, lienzo, cierre | `/session/:id/paciente/*` |
| Análisis | Verificación, resultados | `/sesiones/:id/analisis` |
| Informe | Editor, validación | `/sesiones/:id/informe` |
| Catálogo | Tests disponibles | `/tests` |

### 3.6.6. Diseño de los procesos principales

Los tres procesos BPM de la sección 3.5.3 se implementan directamente en el prototipo:

**Proceso 1:** Wizard de 3 pasos → emparejamiento automático por token Realtime → espejo en vivo y marcas.

**Proceso 2:** Tres pestañas (automáticos / semiautomáticos / verificación profesional) → aceptar/rechazar con un clic → chips ámbar/verde.

**Proceso 3:** Editor de 9 secciones con índice lateral → marcado visual IA vs. profesional → validación con sello → descarga del PDF.

### 3.6.7. Navegación e interacción

| Origen | Destino | Acción |
|---|---|---|
| Login | Dashboard | Autenticación exitosa |
| Dashboard | Listado de pacientes | Clic en "Pacientes" en el sidebar |
| Dashboard | Nueva sesión | Clic en "Nueva sesión" |
| Listado de pacientes | Ficha del paciente | Clic en una fila |
| Ficha del paciente | Nueva sesión (preseleccionado) | Clic en "Nueva evaluación" |
| Nueva sesión (paso 3) | Sesión en vivo | Clic en "Iniciar sesión" |
| Sesión en vivo | Análisis | Sesión finalizada |
| Análisis | Editor del informe | "Generar borrador" |
| Editor del informe | PDF descargado | "Validar y exportar PDF" |

### 3.6.8. Diseño de interfaces

**Sesión en vivo:** Panel izquierdo (espejo del dibujo) · Panel central (7 métricas en tiempo real) · Panel derecho (marcas rápidas, observaciones, grabación).

**Lienzo del paciente:** Pantalla completa · herramientas mínimas (lápiz, borrador, deshacer) · sin métricas visibles.

**Editor del informe:** Índice lateral (9 secciones + estado) · área de edición · chips ámbar (IA) / verde (profesional) · botón de validación en encabezado.

### 3.6.9. Validación del prototipo

1. **Técnica:** 119 tests automatizados (47 unitarios de dominio + 72 de integración).
2. **De requerimientos:** 41/41 RF trazados a pantallas o funcionalidades.
3. **De flujo:** Flujo end-to-end ejecutado con éxito en entorno de desarrollo.
4. **De seguridad:** RLS verificada; sin acceso cruzado entre psicólogos.

### 3.6.10. Cobertura del 100 % del alcance funcional

| Módulo | Implementado | Pantallas |
|---|---|---|
| Gestión de pacientes | ✓ | Listado, Ficha |
| Gestión de sesiones | ✓ | Nueva sesión, Sesión en vivo |
| Captura con dimensión temporal | ✓ | Lienzo del paciente |
| Registro de sesión (obs., audio, marcas) | ✓ | Sesión en vivo |
| Análisis (métricas + indicadores + checklist) | ✓ | Verificación, Análisis de resultados |
| Generación del borrador de informe | ✓ | Editor del informe |
| Edición y validación del informe | ✓ | Editor del informe |
| Exportación a PDF | ✓ | Editor del informe |
| Dos perfiles (examinador / paciente) | ✓ | Todas las pantallas |

**Cobertura: 9/9 módulos del alcance (100 %)**

### 3.6.11. Cobertura del alcance no funcional

| Grupo de RNF | Estado |
|---|---|
| Rendimiento (RNF-01 a 04) | ✓ Realtime < 200 ms; métricas cada 2 s; REST < 2 s |
| Escalabilidad (RNF-05, 06) | ✓ Motor de reglas en BD; backend sin estado |
| Disponibilidad (RNF-07 a 09) | ✓ Trazos persistidos al finalizar |
| Seguridad (RNF-10 a 13) | ✓ HTTPS + RLS + sin credenciales en cliente + canal privado |
| Confidencialidad (RNF-14 a 16) | ✓ Consentimiento previo; aislamiento; anonimización |
| Ética y trazabilidad (RNF-17 a 20) | ✓ Sin diagnóstico; validación obligatoria; trazabilidad al manual |
| Usabilidad (RNF-21 a 24) | ✓ Español; tablet/desktop; sin métricas al paciente |
| Mantenibilidad (RNF-25 a 27) | ✓ Hexagonal; umbrales calibrables; migraciones versionadas |
| Compatibilidad (RNF-28 a 30) | ✓ Tablet con lápiz digital + Pointer Events API |

---

## 3.7. Validación de la solución

### 3.7.1. Relación problema – objetivos – solución

| Problema | Objetivo | Solución implementada |
|---|---|---|
| Tiempo elevado (45-90 min) — doble esfuerzo de registro | OE-5: Estimar reducción del tiempo | Generación asistida del borrador de 9 secciones (Sprints 4 y 6) |
| Pérdida de indicadores temporales (latencia, pausas, borrados) | OE-3: Arquitectura con módulo de captura | Pointer Events API + cálculo automático de métricas temporales (Sprint 3) |
| Variabilidad entre evaluadores | OE-2: SRS / OE-4: Implementación | Motor de reglas trazado al manual (RNF-19); validación profesional obligatoria (RNF-18) |
| Consulta manual del test durante la sesión | OE-4: Módulo de análisis | 201 indicadores en BD con detección automática y checklist (Sprint 4) |

### 3.7.2. Relación objetivos – funcionalidades

| Objetivo específico | Funcionalidades implementadas |
|---|---|
| OE-1: Analizar el proceso actual | Centro Psicológico Ser Integral como entorno; proceso manual documentado en Cap. 1 |
| OE-2: Especificar requerimientos IEEE 830 | 41 RF + 30 RNF con trazabilidad a objetivos y módulos |
| OE-3: Diseñar arquitectura e interfaces | Arquitectura hexagonal; 13 pantallas; dos interfaces diferenciadas |
| OE-4: Implementar los módulos | 6 sprints completados; motor de análisis; informe; exportación PDF |
| OE-5: Estimar la reducción del tiempo | `validated_at` como base de medición; ficha pre/post pendiente (AUD-05) |

### 3.7.3. Relación requerimientos – funcionalidades

| RF | Pantalla que lo demuestra |
|---|---|
| RF-01 Registro e inicio de sesión | Login / registro |
| RF-04 Registrar paciente | Formulario nuevo paciente |
| RF-06 Listar pacientes | Listado de pacientes |
| RF-10 Registrar consentimiento | Asistente — paso 2 |
| RF-14 Lienzo digital | Lienzo del paciente |
| RF-16 Captura dimensión temporal | Lienzo del paciente (Pointer Events) |
| RF-20 Espejo del dibujo en vivo | Sesión en vivo |
| RF-21 Métricas en vivo | Sesión en vivo — panel de métricas |
| RF-26 Grabar audio | Sesión en vivo — control de grabación |
| RF-29 Medición objetiva | Análisis de resultados PBLL |
| RF-32 Verificación profesional | Verificación profesional — checklist |
| RF-35 Generar borrador | Editor del informe |
| RF-37 Validar el informe | Editor del informe — botón de validación |
| RF-38 Exportar a PDF | Editor del informe — descarga |
| RF-40 Panel de gestión | Dashboard principal |

### 3.7.4. Matriz de cobertura del alcance

Ver Anexo R para la tabla completa (40/40 elementos verificados).

**Resumen:** 18/18 módulos del alcance funcional cubiertos · 40/40 elementos de la matriz verificados · **Cobertura: 100 %**

### 3.7.5. Verificación de funcionalidades del prototipo

| Funcionalidad | Verificada |
|---|---|
| Autenticación del psicólogo | ✓ |
| CRUD de pacientes con validación de duplicados | ✓ |
| Wizard de nueva sesión con consentimiento | ✓ |
| Lienzo con captura temporal (x, y, t, pressure) | ✓ |
| Sincronización en tiempo real < 200 ms | ✓ |
| Métricas en vivo con refresco cada 2 s | ✓ |
| Grabación y transcripción de audio (Whisper) | ✓ |
| 23 indicadores automáticos desde trazos | ✓ |
| Checklist de 153 indicadores por secciones | ✓ |
| Generación del borrador de 9 secciones | ✓ |
| Edición con marcado visual IA vs. profesional | ✓ |
| Validación del informe con sello | ✓ |
| Exportación a PDF | ✓ |
| Aislamiento por profesional (RLS) | ✓ |
| Sección 9 vacía (sin diagnóstico) | ✓ |

### 3.7.6. Verificación de requerimientos no funcionales

| RNF | Estado | Evidencia |
|---|---|---|
| RNF-01 Latencia < 1 s | ✓ | Canal Realtime < 200 ms |
| RNF-02 Fluidez del lienzo | ✓ | Captura a 60 fps |
| RNF-03 Tiempo de respuesta < 2 s | ✓ | Operaciones REST < 2 s |
| RNF-10 Cifrado en tránsito y reposo | ✓ | HTTPS + cifrado Supabase |
| RNF-11 Doble capa de autorización | ✓ | Backend + RLS en 22 tablas |
| RNF-12 Sin credenciales en el cliente | ✓ | Frontend migrado a `apiClient` |
| RNF-14 Consentimiento previo a audio | ✓ | `audio_authorized` verificado |
| RNF-15 Aislamiento por profesional | ✓ | Policy RLS `own patients` |
| RNF-17 Sin inferencia diagnóstica | ✓ | Sección 9 vacía; C y D excluidas |
| RNF-18 Validación profesional obligatoria | ✓ | `status='suggestion'` sin acceso al informe |
| RNF-19 Trazabilidad al manual | ✓ | Campo `manual_section` en `indicator_catalog` |
| RNF-21 Interfaz en español | ✓ | Todas las pantallas y textos |
| RNF-25 Separación dominio-infraestructura | ✓ | Hexagonal verificable con `check-hexagon.sh` |
| RNF-27 Migraciones versionadas | ✓ | Migraciones `001` y `002` aplicadas |

---

# CAPÍTULO 4. CRONOGRAMA Y PRESUPUESTO

## 4.1. Cronograma actualizado

**Avance global al 01/10/2026: 85.1 %** (40/47 tareas completadas)

| Fase | Actividades | Período | Avance |
|---|---|---|---|
| Fase 1 — Análisis y diseño | 5 actividades | 10/08 – 05/10 | 80 % |
| Fase 2 — Construcción (6 sprints) | 36 tareas | 18/08 – 26/10 | 97 % |
| Fase 3 — Auditoría y cierre | 5 tareas | 02/11 – 11/12 | 0 % |
| **TOTAL** | **46 tareas** | **10/08 – 11/12/2026** | **85.1 %** |

## 4.2. Presupuesto del proyecto

| Categoría | Costo (S/) |
|---|---|
| Recursos humanos (valoración académica) | 3,000.00 |
| Infraestructura en la nube | 112.00 |
| Herramientas de software | 0.00 |
| Servicios de IA (Whisper + OpenRouter) | 136.80 |
| Subtotal | 3,248.80 |
| Contingencia (10 %) | 324.88 |
| **TOTAL DEL PROYECTO** | **S/ 3,573.68** |

> Tipo de cambio referencial: 1 USD = 3.60 PEN (octubre 2026).

## 4.3. Recursos requeridos

### Recursos humanos

| Rol | Miembro | Dedicación |
|---|---|---|
| Jefe de proyecto / Arquitecto | Joaquin Chaparro | 12 h/semana × 16 semanas |
| Desarrollador BD / ER | Jonathan Tuppia | 8 h/semana × 16 semanas |
| Analista / Motor de reglas | Iam Arias | 8 h/semana × 16 semanas |
| Desarrollador frontend / Alternativas | Yefrei Bernable | 8 h/semana × 16 semanas |
| Redactor técnico / Informe | Jose Diaz | 8 h/semana × 16 semanas |

### Recursos de infraestructura

| Recurso | Proveedor | Costo |
|---|---|---|
| PostgreSQL + Auth + Realtime + Storage | Supabase (Free) | S/ 0 |
| Backend Java (JAR) | Railway Hobby ($5/mes) | S/ 72 (4 meses) |
| Frontend React | Vercel (Hobby, gratuito) | S/ 0 |
| Dominio personalizado (opcional) | Namecheap | S/ 40 |

## 4.4. Costos de implementación

| Servicio | Costo mensual (USD) | Total 4 meses (S/) |
|---|---|---|
| OpenAI Whisper API (~50 sesiones × 30 min) | $9 | S/ 129.60 |
| OpenRouter LLM (~50 informes × 2K tokens) | $0.50 | S/ 7.20 |
| **Total servicios IA** | | **S/ 136.80** |

**Proyección productiva mensual (post-académico):** S/ 244.80/mes (Supabase Pro + Railway + Whisper + OpenRouter para ~100 sesiones/mes).

---

# ANEXOS — SEGUNDO AVANCE (K a S)

Los anexos completos del Segundo Avance (diagramas BPM, diagrama de clases, diagrama ER, arquitectura tecnológica, diseño de interfaces, prototipo completo, evidencias de pantallas, matriz de cobertura y validación del prototipo) están documentados en:

- `entregas/avance-2/07-informe/anexos-segundo-avance.md` — Texto completo de los Anexos K a S.
- `mocks/dashboard-principal/screen.png` — Dashboard principal (Anexo Q)
- `mocks/listado-pacientes/screen.png` — Listado de pacientes (Anexo Q)
- `mocks/ficha-paciente/screen.png` — Ficha del paciente (Anexo Q)
- `mocks/catalogo-tests-proyectivos/screen.png` — Catálogo de tests (Anexo Q)
- `mocks/nueva-sesion-consentimiento/screen.png` — Nueva sesión (Anexo Q)
- `mocks/lienzo-dibujo-paciente/screen.png` — Lienzo del paciente (Anexo Q)
- `mocks/sesion-en-vivo-pbll/screen.png` — Sesión en vivo (Anexo Q)
- `mocks/verificacion-profesional-pbll/screen.png` — Verificación profesional (Anexo Q)
- `mocks/analisis-resultados-pbll/screen.png` — Análisis de resultados (Anexo Q)
- `mocks/editor-informe/screen.png` — Editor del informe (Anexo Q)
- `sdd/database/schema.sql` — Esquema SQL completo de las 22 tablas (Anexo M)
- `sdd/api-contracts.md` — Contrato de la API v2 con ~40 endpoints (Anexo N)

---

## BIBLIOGRAFÍA

Buck, J. N. (1948). The H-T-P test. *Journal of Clinical Psychology*, *4*(2), 151–159.

Congreso de la República del Perú. (2025). *Nota de información referencial 88/2024-2025-ASISP/DIP: Salud mental*. Departamento de Investigación Parlamentaria. https://www3.congreso.gob.pe/Docs/DGP/DIDP/files/nir_88_salud_mental.pdf

Defensoría del Pueblo. (2023, 10 de octubre). *Salud mental no se prioriza en la agenda nacional*. https://www.defensoria.gob.pe/defensoria-del-pueblo-salud-mental-no-se-prioriza-en-la-agenda-nacional/

Gennari, M., & Tamanza, G. (2022). The conjoint family drawing: A tool to explore about family relationships. *Frontiers in Psychology*, *13*, 884686. https://doi.org/10.3389/fpsyg.2022.884686

Institute of Electrical and Electronics Engineers. (1998). *IEEE recommended practice for software requirements specifications* (IEEE Std 830-1998). https://standards.ieee.org/ieee/830/1222/

Lin, Y., Zhang, N., Qu, Y., Li, T., Liu, J., & Song, Y. (2022). The House-Tree-Person test is not valid for the prediction of mental health: An empirical study using deep neural networks. *Acta Psychologica*, *230*, 103734. https://doi.org/10.1016/j.actpsy.2022.103734

Querol, S. M., & Chaves Paz, M. I. (2004). *Test de la persona bajo la lluvia: Adaptación y aplicación* (1.ª ed., 3.ª reimp.). Lugar Editorial.

Santamaría, P., & Sánchez-Sánchez, F. (2022). Cuestiones abiertas en el uso de las nuevas tecnologías en la evaluación psicológica. *Papeles del Psicólogo*, *43*(1), 48–54. https://doi.org/10.23923/pap.psicol.2984

Wen, S., Sun, Y., Ku, B., Gao, Z., Ma, L., Yang, Y., & Jiao, C. (2025). From visual perception to deep empathy: An automated assessment framework for House-Tree-Person drawings using multimodal LLMs and multi-agent collaboration [Preprint]. arXiv. https://doi.org/10.48550/arXiv.2512.21360

Xie, Y., Pan, T., Liu, B., Chen, H., & Liu, W. (2024). Interpretable drawing psychoanalysis via House-Tree-Person test. En T. Liu, G. Webb, L. Yue & D. Wang (Eds.), *AI 2023: Advances in artificial intelligence* (Lecture Notes in Computer Science, vol. 14472, pp. 221–233). Springer. https://doi.org/10.1007/978-981-99-8391-9_18

Zhang, J., Yu, Y., Barra, V., Ruan, X., Chen, Y., & Cai, B. (2024). Feasibility study on using house-tree-person drawings for automatic analysis of depression. *Computer Methods in Biomechanics and Biomedical Engineering*, *27*(9), 1129–1140. https://doi.org/10.1080/10255842.2023.2231113

Zhang, Y., Yang, X., Li, X., Yu, S., Luan, Y., Feng, S., Wang, D., & Zhang, Y. (2024). PsyDraw: A multi-agent multimodal system for mental health screening in left-behind children [Preprint]. arXiv. https://doi.org/10.48550/arXiv.2412.14769
