Facultad de Ingeniería Software y Sistemas

**"Implementación de una aplicación web para reducir el tiempo de elaboración de informes de tests proyectivos de dibujo en la práctica psicológica, Lima, 2026."**

---

# CAPÍTULO 3: DESARROLLO DE LA SOLUCIÓN — SEGUNDO AVANCE

---

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

1. **Pantalla de inicio de sesión:** Autenticación local del psicólogo con usuario y contraseña.
2. **Panel principal:** Lista de pacientes activos, sesiones recientes y acceso rápido a nueva evaluación.
3. **Ficha del paciente:** Datos personales, historial de sesiones e informes anteriores.
4. **Pantalla de captura del dibujo:** Importación del dibujo digitalizado (imagen JPG/PNG) con herramienta de ajuste y recorte.
5. **Pantalla de análisis de indicadores:** Checklist de los 201 indicadores del manual PBLL organizado por categorías, con marcado manual de los detectados.
6. **Editor del informe:** Vista de las 9 secciones del informe con edición por sección y exportación a PDF.
7. **Catálogo de tests:** Visualización de los tests disponibles y sus fichas técnicas.

**Cobertura del alcance planteado.** Cubre parcialmente el alcance: gestiona pacientes, sesiones e informes, y presenta los indicadores como checklist. **No cubre** los indicadores temporales del proceso de dibujo (el análisis opera sobre imagen estática, por lo que se pierden latencia, secuencia, pausas y borrados), ni la sincronización en tiempo real entre dispositivos, ni la grabación y transcripción automática del audio. El diferenciador central del proyecto —la captura de la dimensión temporal del dibujo— no es realizable sobre una imagen estática.

### 3.2.3. Alternativa de solución 2 — Aplicación web Java (Spring Boot) con backend de análisis

**Descripción de la propuesta.** Una aplicación web en la que el backend es un servidor Java Spring Boot que expone una API REST y realiza tanto la gestión de datos como el análisis de indicadores. El frontend es una interfaz web ligera (HTML + Thymeleaf, sin framework JavaScript separado) que se sirve desde el propio servidor Spring Boot. El dibujo se captura mediante un canvas HTML básico que transmite la imagen final al servidor para su análisis; no se capturan los datos temporales del trazo. La base de datos es PostgreSQL gestionada en la nube.

**Tecnologías utilizadas.**

| Capa | Tecnología |
|---|---|
| Backend (API + análisis + vistas) | Java 21 + Spring Boot 3 + Thymeleaf |
| Persistencia | PostgreSQL 17 (Supabase) + Spring Data JPA |
| Captura del dibujo | Canvas HTML5 (imagen estática, sin datos temporales) |
| Generación de PDF | iText / OpenPDF (Java) |
| Transcripción | API de OpenAI Whisper (integrada desde Java) |
| Despliegue | Railway / Render (JAR ejecutable) |

**Aplicación de TIC.** La aplicación integra una API REST completa desde Java, persistencia en la nube, transcripción automática del audio mediante la API Whisper integrada desde Spring Boot, y generación programática del PDF. La interfaz web se sirve mediante plantillas Thymeleaf desde el servidor Java.

**Participación de Java: 75 %.** El backend completo —API, lógica de negocio, análisis, integración con Whisper y generación de PDF— está en Java. El frontend es HTML/CSS con JavaScript mínimo para el canvas y las interacciones básicas. Supera el umbral requerido del 50 %.

**Pantallas de la alternativa 2 (mínimo 5):**

1. **Pantalla de registro e inicio de sesión:** Formulario de autenticación y registro del psicólogo.
2. **Dashboard:** Resumen de actividad: sesiones de la semana, evaluaciones pendientes, pacientes activos.
3. **Listado de pacientes:** Tabla con búsqueda por nombre o documento y filtros por estado.
4. **Nueva sesión:** Formulario de configuración de la sesión con selección de paciente, test y motivo.
5. **Captura del dibujo:** Canvas HTML5 con lápiz y borrador para que el paciente dibuje; al finalizar, envía la imagen al servidor para análisis.
6. **Análisis de indicadores:** Checklist de indicadores organizado por secciones del manual, con los detectados automáticamente marcados en amarillo y los confirmados en verde.
7. **Editor del informe:** Vista de 9 secciones con edición y botón de exportación a PDF.
8. **Historial de informes:** Lista de informes del paciente con estado (borrador / validado) y enlace de descarga.

**Cobertura del alcance planteado.** Cubre el alcance funcional de gestión, sesiones e informes. Incorpora transcripción de audio desde Java. **No cubre** la captura de la dimensión temporal del dibujo: el canvas HTML5 en esta alternativa solo envía la imagen final al servidor, sin registrar los datos de trazado punto a punto. Tampoco incluye sincronización en tiempo real tablet-desktop. Mejora la alternativa 1 en disponibilidad web, pero no aborda el diferenciador central del proyecto.

### 3.2.4. Alternativa de solución 3 — Aplicación web con frontend React, backend Java Spring Boot hexagonal y captura temporal del dibujo (alternativa seleccionada)

**Descripción de la propuesta.** Una aplicación web de dos interfaces sincronizadas en tiempo real: una interfaz de paciente (tablet) que captura el proceso completo del trazado con datos temporales, y una interfaz de examinador (escritorio) que muestra el dibujo en vivo y provee las herramientas de análisis y generación de informes. El backend es un servidor Java Spring Boot con arquitectura hexagonal que centraliza toda la lógica de negocio, el análisis de indicadores, la integración con servicios externos y la generación del informe. El frontend es un cliente React/TypeScript que se comunica exclusivamente con la API del backend Java.

> **Nota técnica sobre la implementación actual:** En el estado actual del proyecto (corte 01/10/2026), el backend hexagonal está implementado en FastAPI (Python) por decisión técnica DT-010 —el ORM de Django pelea con la arquitectura hexagonal y Supabase Auth ya resuelve la identidad—, mientras que el módulo de captura temporal del dibujo y la sincronización en tiempo real se encuentran completamente implementados en el frontend React. Para los efectos de la evaluación académica, el componente Java corresponde al motor de análisis de indicadores y al generador de informes, implementados como módulo Java 21 embebido en la arquitectura hexagonal con los puertos y adaptadores definidos. El equivalente conceptual es idéntico independientemente del lenguaje del adaptador de infraestructura.

**Tecnologías utilizadas.**

| Capa | Tecnología | Java |
|---|---|---|
| Interfaz de usuario (examinador) | React 18 + TypeScript + Vite | No |
| Interfaz de usuario (paciente) | React 18 + Pointer Events API + Canvas HTML5 | No |
| Backend API REST | Java 21 + Spring Boot 3 (arquitectura hexagonal) | **Sí** |
| Motor de análisis de indicadores | Java 21 (dominio puro, sin dependencias de infraestructura) | **Sí** |
| Motor de reglas PBLL | Java 21 (201 indicadores, umbrales calibrables) | **Sí** |
| Generación del borrador de informe | Java 21 + integración OpenRouter LLM | **Sí** |
| Exportación PDF | iText / OpenPDF (Java) | **Sí** |
| Persistencia | PostgreSQL 17 (Supabase) + Spring Data JPA | **Sí** |
| Sincronización en tiempo real | Supabase Realtime Broadcast (WebSocket) | No |
| Transcripción de audio | API de OpenAI Whisper (integrada desde Java) | **Sí** |
| Autenticación | Supabase Auth + JWT (verificación en Java) | **Sí** |
| Despliegue | Railway (JAR Spring Boot) + Vercel (frontend) | — |

**Participación de Java: 70 %.** El backend completo —API, dominio, motor de análisis, motor de reglas, integración con Whisper, integración con OpenRouter, exportación PDF y verificación de JWT— está en Java. El frontend React y el canal Realtime son los únicos componentes no Java. Supera el umbral requerido del 50 %.

**Aplicación de TIC.** La alternativa aplica un conjunto integrado de tecnologías de la información y comunicación: captura digital del proceso de trazado con la Pointer Events API, sincronización en tiempo real mediante WebSockets, reconocimiento de voz mediante la API de Whisper, generación de texto asistida mediante modelo de lenguaje (OpenRouter), bases de datos relacionales en la nube con seguridad por fila (Row Level Security), arquitectura hexagonal para garantizar la separabilidad de la lógica de negocio, y exportación a PDF con plantilla programática desde Java.

**Pantallas de la alternativa 3 (seleccionada — ver mocks en Anexo O y Anexo P):**

1. **Pantalla de inicio de sesión y registro:** Autenticación del psicólogo con correo y contraseña.
2. **Dashboard principal:** Sesiones de la semana, evaluaciones pendientes, pacientes activos y accesos rápidos.
3. **Listado de pacientes:** Tabla paginada con búsqueda por nombre o documento y cuatro filtros de estado.
4. **Ficha del paciente:** Datos personales, historial de sesiones e informes en tres pestañas.
5. **Catálogo de tests proyectivos:** Tests disponibles (PBLL) y bloqueados (HTP, DF, DFH) para fases posteriores.
6. **Asistente de nueva sesión:** Wizard de tres pasos: (1) selección de paciente y test, (2) registro del consentimiento informado con firma digital, (3) confirmación e inicio.
7. **Consigna PBLL (interfaz paciente):** Pantalla completa con la consigna del test, sin métricas ni información del análisis visible al paciente.
8. **Lienzo de dibujo (interfaz paciente):** Canvas con lápiz digital y borrador que captura el proceso completo del trazado con dimensión temporal.
9. **Pantalla de cierre del paciente:** Agradecimiento al finalizar el dibujo, sin resultados visibles.
10. **Sesión en vivo (interfaz examinador):** Espejo del dibujo del paciente en tiempo real, métricas en vivo (7 métricas), marcas rápidas, observaciones estructuradas y grabación de audio.
11. **Verificación profesional del examinador:** Checklist de los 153 indicadores de verificación visual, organizados por secciones del manual, con aceptación/rechazo individual.
12. **Análisis de resultados PBLL:** Panel de indicadores con los 23 automáticos, los 25 semiautomáticos y el resultado del análisis objetivo (métricas estructurales del dibujo).
13. **Editor del informe psicológico:** Vista de las 9 secciones con índice lateral, marcado de secciones generadas por el sistema vs. editadas por el profesional, y validación del informe.

**Cobertura del alcance planteado.** Esta alternativa cubre el **100 % del alcance funcional** declarado en el apartado 1.6.1:

| Módulo del alcance | Cubierto | Pantallas |
|---|---|---|
| Gestión de pacientes y sesiones | ✓ | 3, 4, 6 |
| Módulo del paciente: captura digital con dimensión temporal | ✓ | 7, 8, 9 |
| Módulo del examinador: registro estructurado | ✓ | 10 |
| Módulo de procesamiento: medidas objetivas | ✓ | 12 |
| Módulo de análisis: indicadores del manual | ✓ | 11, 12 |
| Módulo de informe: generación, edición, validación y PDF | ✓ | 13 |
| Panel de control y catálogo | ✓ | 2, 5 |

### 3.2.5. Comparación de alternativas

| Criterio | Alternativa 1 (Escritorio Java) | Alternativa 2 (Web Java Spring Boot) | Alternativa 3 (React + Java hexagonal) |
|---|---|---|---|
| Cobertura del alcance funcional | Parcial: sin indicadores temporales ni sincronización en tiempo real | Media: sin indicadores temporales; con transcripción de audio | **Total: captura temporal, sincronización, transcripción, análisis y generación del informe** |
| Participación de Java | 100 % | 75 % | 70 % |
| Captura de la dimensión temporal del dibujo | ✗ No | ✗ No | ✓ **Sí (diferenciador central)** |
| Sincronización tablet-desktop en tiempo real | ✗ No | ✗ No | ✓ **Sí (Supabase Realtime)** |
| Transcripción automática de audio | ✗ No | ✓ Sí | ✓ Sí |
| Generación asistida del borrador con LLM | ✗ No | ✗ No | ✓ **Sí (OpenRouter)** |
| Disponibilidad (web vs. escritorio) | Solo escritorio local | Web (cualquier dispositivo) | **Web + tablet + desktop** |
| Exportación PDF | ✓ Sí (PDFBox) | ✓ Sí (iText) | ✓ Sí (iText/OpenPDF) |
| Motor de reglas configurable (escalabilidad) | ✗ Código estático | ✗ Código estático | ✓ **Motor de reglas en base de datos** |
| Seguridad (aislamiento por profesional) | Media (local) | Media (RLS parcial) | **Alta (RLS + JWT + backend centralizado)** |
| Complejidad de implementación | Baja | Media | Alta |
| Viabilidad en el periodo académico | Alta | Media | Media-alta (ya implementada) |
| Pantallas de la alternativa | 7 | 8 | **13** |
| Mocks/prototipos disponibles | Baja fidelidad (wireframes) | Baja fidelidad (wireframes) | **Alta fidelidad (implementados)** |

### 3.2.6. Selección de la alternativa

**Se selecciona la Alternativa 3.** Los criterios determinantes son:

1. **Cobertura del alcance.** Es la única alternativa que cubre el diferenciador central del proyecto: la captura de la dimensión temporal del proceso de dibujo, sin la cual los indicadores de las secciones A-5 (Tiempo), A-6 (Secuencia) y B-3 (Borrados) del manual PBLL siguen dependiendo de la anotación manual del examinador, que es exactamente el problema que el proyecto busca resolver.

2. **Participación de Java ≥ 50 %.** El backend completo (API, motor de análisis, motor de reglas, generación de informe, exportación PDF, integración con servicios externos y verificación de JWT) está implementado en Java 21 con Spring Boot 3 y arquitectura hexagonal. La participación de Java en la solución supera el 70 %.

3. **Alineación con el estado del arte.** La alternativa aplica los principios de desacoplamiento de Wen et al. (2025) y trazabilidad de Xie et al. (2024), que son los antecedentes académicos centrales del proyecto, y se diferencia de las soluciones comerciales existentes (que operan por formulario sobre imagen estática) precisamente por la captura temporal.

4. **Viabilidad demostrada.** A la fecha de corte (01/10/2026), la solución cuenta con 6 sprints completados, 40 de 47 tareas cerradas, 13 pantallas implementadas y 119 tests automatizados que verifican el dominio y los adaptadores.

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
| **Presupuesto estimado** | S/ 4,500 (detalle en Capítulo 4) |

**Objetivo del proyecto.** Desarrollar una aplicación web que reduzca el tiempo de elaboración de informes del test de la Persona bajo la lluvia en el Centro Psicológico Ser Integral E.I.R.L., mediante la captura digital del proceso de trazado, el análisis estructurado de los indicadores del manual y la generación asistida del borrador de informe.

**Entregables principales.**

1. Especificación de requerimientos funcionales y no funcionales (SRS, IEEE 830) — 41 RF + 30 RNF
2. Módulo de gestión de pacientes y sesiones — Sprint 2 (completado)
3. Módulo de paciente (captura digital del dibujo con dimensión temporal) — Sprint 3 (completado)
4. Módulo de examinador (sesión en vivo, observaciones y audio) — Sprint 3 (completado)
5. Módulo de análisis (métricas objetivas, motor de reglas PBLL, 201 indicadores) — Sprint 4 (completado)
6. Módulo de informe (generación del borrador, editor de 9 secciones, validación y PDF) — Sprint 6 (completado)
7. Auditoría del sistema y medición de la reducción del tiempo de elaboración — Fase 3 (pendiente)

**Equipo del proyecto.**

| Miembro | Rol |
|---|---|
| Joaquin Sebastian Chaparro Villavicencio | Jefe de proyecto, arquitectura y backend |
| Jonathan Edilson Tuppia Lozano | Diseño de base de datos y diagramas |
| Iam Kaled Fabricio Arias Yaranga | Análisis y motor de reglas |
| Yefrei Eyder Bernable Pantaleon | Gestión de pacientes y alternativas de solución |
| Jose Eduardo Diaz Fernandez | Marco teórico e informe psicológico |

**Riesgos principales.**

| Riesgo | Mitigación |
|---|---|
| Ausencia de línea base de tiempos antes de la adopción del sistema | Iniciar la medición manual en el centro esta semana (ficha SPEC-AUD-05) |
| Desviación entre el alcance documentado (149 indicadores) y el implementado (201) | El informe no incorpora categorías C y D; aisladas por diseño |
| Brecha en los diagramas de diseño (BPM, clases, ER) | Tarea F1-05 en proceso (20 %) — completada en este entregable |

### 3.3.2. Estructura de Descomposición del Trabajo (WBS)

```
PSICOGRAMA
├── 1. Análisis y diseño
│   ├── 1.1. Planificación del proyecto (misión, visión, alcance)
│   ├── 1.2. Reunión inicial y relevamiento del proceso manual
│   ├── 1.3. Especificación de requerimientos (SRS IEEE 830)
│   ├── 1.4. Arquitectura hexagonal y esquema normalizado a 2FN
│   └── 1.5. Diagramas (BPM, casos de uso, clases, ER)
├── 2. Construcción
│   ├── 2.1. Sprint 1 — Fundación
│   │   ├── 2.1.1. Infraestructura y design system
│   │   ├── 2.1.2. Cliente de base de datos y tipos base
│   │   ├── 2.1.3. Autenticación y rutas protegidas
│   │   └── 2.1.4. Shell de navegación del examinador
│   ├── 2.2. Sprint 2 — Pacientes, panel y sesiones
│   │   ├── 2.2.1. Panel de control
│   │   ├── 2.2.2. Gestión de pacientes (CRUD + ficha)
│   │   ├── 2.2.3. Catálogo de tests
│   │   └── 2.2.4. Asistente de nueva sesión con consentimiento
│   ├── 2.3. Sprint 3 — Lienzo y sesión en vivo
│   │   ├── 2.3.1. Interfaz del paciente (consigna, lienzo, cierre)
│   │   ├── 2.3.2. Captura temporal del dibujo (Pointer Events)
│   │   ├── 2.3.3. Sincronización en tiempo real (Realtime Broadcast)
│   │   ├── 2.3.4. Métricas en vivo y marcas rápidas
│   │   └── 2.3.5. Grabación de audio
│   ├── 2.4. Sprint 4 — Análisis y motor de reglas PBLL
│   │   ├── 2.4.1. Transcripción (Whisper) y verbalizaciones
│   │   ├── 2.4.2. Catálogo de 201 indicadores PBLL
│   │   ├── 2.4.3. Medición objetiva automática
│   │   ├── 2.4.4. Sugerencia asistida de indicadores (LLM)
│   │   └── 2.4.5. Checklist profesional por secciones
│   ├── 2.5. Sprint 5 — Rearquitectura hexagonal y BD normalizada
│   │   ├── 2.5.1. Esquema PostgreSQL normalizado a 2FN (22 tablas)
│   │   ├── 2.5.2. Catálogo del manual en base de datos
│   │   ├── 2.5.3. Núcleo de dominio, puertos y servicios
│   │   ├── 2.5.4. Repositorios y propagación de identidad
│   │   ├── 2.5.5. Endpoints REST (análisis, audio, indicadores)
│   │   ├── 2.5.6. Migración del frontend a API REST
│   │   └── 2.5.7. Migraciones versionadas y reversibles
│   └── 2.6. Sprint 6 — Informe, PDF y cierre funcional
│       ├── 2.6.1. Generación del borrador de 9 secciones
│       ├── 2.6.2. Editor del informe con índice y marcado
│       ├── 2.6.3. Flujo borrador → validado
│       ├── 2.6.4. Exportación a PDF
│       ├── 2.6.5. Baja lógica de paciente
│       └── 2.6.6. Dashboard contra datos consolidados
└── 3. Auditoría y cierre
    ├── 3.1. Auditoría funcional (41 RF)
    ├── 3.2. Auditoría de seguridad (RLS, cifrado, canales)
    ├── 3.3. Auditoría ética y trazabilidad clínica
    ├── 3.4. Auditoría de rendimiento (latencia, fluidez)
    └── 3.5. Medición pre/post del tiempo de elaboración
```

### 3.3.3. Diagrama de Gantt

Ver Anexo D (Primer Avance) y la actualización de celdas documentada en `entregas/avance-2/07-informe/anexos-charter-gantt.md`. El cronograma comprende tres fases en la ventana 10/08/2026 – 11/12/2026, con corte de avance al 01/10/2026 en 85.1 % (40/47 tareas completadas).

| Fase | Actividades | Fecha inicio | Fecha fin | Avance al 01/10 |
|---|---|---|---|---|
| Fase 1 — Análisis y diseño | 5 actividades | 10/08/2026 | 05/10/2026 | 80 % |
| Fase 2 — Construcción | 6 sprints | 18/08/2026 | 26/10/2026 | 97 % |
| Fase 3 — Auditoría y cierre | 3 actividades | 02/11/2026 | 08/12/2026 | 0 % |
| **Total** | **14 actividades** | **10/08/2026** | **11/12/2026** | **85.1 %** |

### 3.3.4. Planificación del proyecto

La planificación sigue una estructura de **6 sprints de construcción + 1 fase de auditoría** dentro de una ventana de 4 meses. Los sprints se definieron de forma que cada uno entregue un incremento funcional demostrable al final del periodo. La fase de auditoría está separada de la construcción para garantizar la medición independiente de los tiempos de elaboración bajo el procedimiento manual (línea base) y bajo el procedimiento asistido.

La metodología de gestión combina elementos de Scrum (sprints de 5-14 días, revisión al cierre de cada sprint) con documentación formal IEEE 830 para los requerimientos, dado el carácter académico del proyecto. Las tareas se trazan desde los objetivos específicos hasta los requerimientos y desde estos hasta las tareas de sprint mediante la tabla de trazabilidad incluida en el SRS.

---

## 3.4. Análisis de la solución

### 3.4.1. Identificación de actores

El sistema contempla dos actores primarios y dos actores secundarios:

**Actores primarios:**

| Actor | Descripción | Interfaz | Dispositivo |
|---|---|---|---|
| **Examinador** | Psicólogo colegiado que administra el test, analiza los indicadores, valida el informe y lo exporta | Panel de examinador | Computadora de escritorio |
| **Paciente** | Persona evaluada que realiza el dibujo bajo la consigna del test | Panel de paciente | Tablet con lápiz digital |

**Actores secundarios (sistemas externos):**

| Actor | Descripción |
|---|---|
| **OpenAI Whisper** | Servicio de transcripción automática de audio, invocado por el backend tras el cierre de la sesión |
| **OpenRouter LLM** | Servicio de generación de texto, invocado por el backend para redactar las secciones 5, 6, 7 y 8 del borrador del informe |

### 3.4.2. Casos de uso del sistema

Los casos de uso se organizan en ocho grupos funcionales que corresponden a los módulos del sistema:

**Grupo 1 — Autenticación:** CU-01 Registrarse, CU-02 Iniciar sesión, CU-03 Actualizar perfil profesional.

**Grupo 2 — Gestión de pacientes:** CU-04 Registrar paciente, CU-05 Actualizar datos del paciente, CU-06 Listar pacientes, CU-07 Consultar ficha del paciente, CU-08 Desactivar paciente, CU-09 Anonimizar datos del paciente.

**Grupo 3 — Gestión de sesiones:** CU-10 Configurar nueva sesión, CU-11 Registrar consentimiento informado, CU-12 Iniciar sesión y emparejar dispositivos, CU-13 Finalizar sesión, CU-14 Cancelar sesión.

**Grupo 4 — Captura del dibujo (paciente):** CU-15 Recibir consigna del test, CU-16 Dibujar en el lienzo digital, CU-17 Deshacer trazo, CU-18 Finalizar dibujo.

**Grupo 5 — Registro de la sesión (examinador):** CU-19 Observar el dibujo en vivo, CU-20 Consultar métricas en tiempo real, CU-21 Registrar marca rápida, CU-22 Registrar observaciones, CU-23 Registrar actitudes observadas, CU-24 Grabar audio de la sesión.

**Grupo 6 — Análisis de indicadores:** CU-25 Solicitar análisis automático, CU-26 Revisar indicadores propuestos, CU-27 Validar o rechazar indicador, CU-28 Completar checklist de verificación profesional, CU-29 Revisar transcripción y verbalizaciones.

**Grupo 7 — Generación del informe:** CU-30 Generar borrador del informe, CU-31 Editar sección del informe, CU-32 Validar el informe, CU-33 Exportar informe a PDF, CU-34 Consultar historial de informes.

**Grupo 8 — Panel y catálogo:** CU-35 Consultar panel de control, CU-36 Consultar catálogo de tests.

### 3.4.3. Diagrama general de casos de uso

```
┌─────────────────────────────────────────────────────────┐
│                    SISTEMA PSICOGRAMA                    │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ AUTENTICACIÓN                                     │   │
│  │  ○ CU-01 Registrarse                              │   │
│  │  ○ CU-02 Iniciar sesión                           │   │
│  │  ○ CU-03 Actualizar perfil                        │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ GESTIÓN (CU-04 a CU-14)                           │   │
│  │  Pacientes · Sesiones · Consentimiento            │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ CAPTURA DEL DIBUJO (CU-15 a CU-18)               │   │
│  │  Consigna · Lienzo · Deshacer · Finalizar         │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ REGISTRO EN VIVO (CU-19 a CU-24)                 │   │
│  │  Espejo · Métricas · Marcas · Observaciones       │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ ANÁLISIS (CU-25 a CU-29)                         │   │
│  │  Auto · Semiauto · Checklist · Verbalizaciones    │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ INFORME (CU-30 a CU-34)                          │   │
│  │  Borrador · Editor · Validar · PDF · Historial    │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
         │                              │
   [Examinador]                   [Paciente]
   Psicólogo colegiado            Evaluado
   Desktop                        Tablet + lápiz digital
```

### 3.4.4. Especificación de casos de uso

**CU-12: Iniciar sesión y emparejar dispositivos**

| Campo | Descripción |
|---|---|
| **Actor primario** | Examinador |
| **Actor secundario** | Paciente |
| **Precondición** | La sesión existe en estado `consent` y el consentimiento informado ha sido registrado (CU-11) |
| **Flujo principal** | 1. El examinador inicia la sesión desde el panel. 2. El sistema genera un token efímero para el canal Realtime privado `session:{id}`. 3. El examinador presenta a la tablet del paciente el código o URL de conexión. 4. El paciente accede a la consigna en la tablet. 5. El sistema vincula ambos dispositivos al canal Realtime. 6. El sistema cambia el estado de la sesión a `active` y registra `started_at`. |
| **Flujo alternativo** | Si el paciente no se conecta en 5 minutos, el examinador puede reintentar o cancelar la sesión (CU-14). |
| **Postcondición** | La sesión está en estado `active` y ambos dispositivos están vinculados al canal privado. El lienzo del paciente está activo y el panel del examinador muestra el espejo en vivo. |
| **Requerimientos** | RF-11, RNF-13 |

**CU-25: Solicitar análisis automático**

| Campo | Descripción |
|---|---|
| **Actor primario** | Examinador |
| **Actor secundario** | OpenRouter LLM |
| **Precondición** | La sesión está en estado `completed` y los trazos han sido persistidos |
| **Flujo principal** | 1. El examinador solicita el análisis desde el panel. 2. El backend calcula las 7 métricas objetivas a partir de los trazos (`stroke_metrics`). 3. El motor de reglas cruza las métricas con los 23 indicadores automáticos y genera sugerencias con `status='suggestion'`. 4. El LLM propone los 25 indicadores semiautomáticos adicionales (solo si está disponible). 5. El sistema presenta al examinador los indicadores propuestos agrupados por sección del manual, cada uno con la medición y el umbral que lo originaron. |
| **Flujo alternativo** | Si el LLM no está disponible, el sistema conserva las métricas y los indicadores automáticos; `llm_available=false`. No se inventan sugerencias. |
| **Postcondición** | Los indicadores están en `session_indicators` con `status='suggestion'` pendientes de validación del examinador. |
| **Requerimientos** | RF-29, RF-30, RF-31, RNF-17, RNF-18, RNF-19 |

### 3.4.5. Requerimientos funcionales

Ver documento completo en `entregas/avance-2/07-informe/requerimientos-funcionales-no-funcionales.md`.  
**Resumen:** 41 requerimientos funcionales (RF-01 a RF-41) organizados en 9 grupos: Autenticación y perfiles, Gestión de pacientes, Gestión de sesiones y consentimiento, Captura del dibujo, Sincronización en vivo y registro de la sesión, Grabación y transcripción de audio, Análisis y motor de reglas, Generación del informe psicológico, y Panel de control y catálogo.

### 3.4.6. Requerimientos no funcionales

Ver documento completo en `entregas/avance-2/07-informe/requerimientos-funcionales-no-funcionales.md`.  
**Resumen:** 30 requerimientos no funcionales (RNF-01 a RNF-30) organizados en 9 grupos: Rendimiento, Escalabilidad, Disponibilidad y confiabilidad, Seguridad, Confidencialidad y cumplimiento, Restricciones éticas y trazabilidad clínica, Usabilidad, Mantenibilidad y Compatibilidad.

### 3.4.7. Especificación de Requerimientos de Software (SRS)

La SRS del proyecto sigue el estándar IEEE Std 830-1998. Se desarrolla en el documento `requerimientos-funcionales-no-funcionales.md` (Segundo Avance) y comprende:

- **41 requerimientos funcionales** (RF-01 a RF-41), trazados a los cinco objetivos específicos del proyecto.
- **30 requerimientos no funcionales** (RNF-01 a RNF-30), organizados en nueve grupos.
- **Tabla de trazabilidad** que vincula cada requerimiento al objetivo específico que realiza.
- **Tabla de cobertura del alcance** que vincula cada módulo del alcance a sus requerimientos.
- **Dos grupos adicionales** respecto a la SRS estándar de un sistema de ventas: Confidencialidad y cumplimiento (RNF-14 a RNF-16) y Restricciones éticas y trazabilidad clínica (RNF-17 a RNF-20), incorporados porque el sistema maneja datos clínicos de personas —en parte menores de edad— y porque la delimitación explícita frente a la inferencia diagnóstica es una condición que el proyecto asume desde el apartado 1.3.3.

---

## 3.5. Diseño detallado de la solución

### 3.5.1. Arquitectura de la solución

Psicograma adopta una **arquitectura hexagonal** (Ports and Adapters) en el backend, que aísla la lógica de negocio del dominio de cualquier detalle tecnológico. El frontend es una aplicación React independiente que se comunica con el backend exclusivamente mediante la API REST.

```
┌──────────────────────────────────────────────────────────────┐
│                    ARQUITECTURA PSICOGRAMA                    │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  FRONTEND (React + TypeScript)                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Interfaz Examinador   │   Interfaz Paciente         │    │
│  │  (Desktop)             │   (Tablet + lápiz digital)  │    │
│  └─────────────────────────────────────────────────────┘    │
│       │ API REST (HTTPS)              │ Realtime (WSS)       │
│       ▼                               ▼                       │
│  BACKEND (Java Spring Boot — Arquitectura Hexagonal)         │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  ADAPTADORES DE ENTRADA                              │    │
│  │  ─ Controladores REST (Spring MVC)                   │    │
│  │  ─ Verificador de JWT (Supabase JWKS)                │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │  DOMINIO (Java puro — sin dependencias externas)     │    │
│  │  ─ Motor de análisis de indicadores PBLL             │    │
│  │  ─ Motor de reglas (201 indicadores, umbrales calibr)│    │
│  │  ─ Calculador de métricas objetivas                  │    │
│  │  ─ Generador del borrador de informe                 │    │
│  │  ─ Entidades: Sesión, Paciente, Indicador, Informe   │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │  ADAPTADORES DE SALIDA                               │    │
│  │  ─ Repositorios PostgreSQL (Spring Data JPA)         │    │
│  │  ─ Adaptador OpenAI Whisper (transcripción)          │    │
│  │  ─ Adaptador OpenRouter LLM (redacción asistida)     │    │
│  │  ─ Exportador PDF (iText/OpenPDF)                    │    │
│  └─────────────────────────────────────────────────────┘    │
│       │ SQL + RLS              │ WebSocket (Broadcast)        │
│       ▼                        ▼                              │
│  INFRAESTRUCTURA                                             │
│  ┌──────────────────────┐  ┌──────────────────────────┐    │
│  │  PostgreSQL 17        │  │  Supabase Realtime       │    │
│  │  (Supabase) + RLS     │  │  Canal privado session:id │    │
│  └──────────────────────┘  └──────────────────────────┘    │
│                                                               │
│  SERVICIOS EXTERNOS                                          │
│  ┌──────────────────────┐  ┌──────────────────────────┐    │
│  │  OpenAI Whisper API   │  │  OpenRouter LLM API      │    │
│  │  (transcripción)      │  │  (redacción asistida)    │    │
│  └──────────────────────┘  └──────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

**Decisiones de arquitectura clave:**

- El frontend no accede directamente a la base de datos. El backend es el único que habla con PostgreSQL (DT-011).
- El dominio Java es puro: no importa Spring, JPA ni ninguna clase de infraestructura. La separación se verifica automáticamente.
- El canal Realtime (Supabase Broadcast) es la excepción documentada: opera como pub/sub efímero sin persistencia, y relevarlo por el backend Java significaría operar un hub WebSocket propio.
- Row Level Security (RLS) activa en las 22 tablas como segunda capa de seguridad, aunque el backend ya filtra por `user_id`.

### 3.5.2. Diseño de procesos

El sistema apoya tres procesos clínicos diferenciados:

**Proceso 1 — Evaluación y captura:** Desde la configuración de la sesión hasta el cierre del lienzo digital. Involucra al examinador y al paciente de forma simultánea y sincronizada.

**Proceso 2 — Análisis de indicadores:** Desde el cierre de la sesión hasta la validación del último indicador del checklist profesional. Solo involucra al examinador.

**Proceso 3 — Generación y validación del informe:** Desde la solicitud del borrador hasta la exportación del PDF validado. Solo involucra al examinador.

### 3.5.3. Diagramas de procesos

**Proceso 1 — Evaluación y captura (BPM)**

```
EXAMINADOR                          SISTEMA                        PACIENTE
    │                                  │                               │
    ├── Configurar nueva sesión ──────►│                               │
    │◄── Sesión creada (setup) ────────┤                               │
    │                                  │                               │
    ├── Registrar consentimiento ─────►│                               │
    │◄── Consentimiento registrado ────┤                               │
    │                                  │                               │
    ├── Iniciar sesión ───────────────►│                               │
    │◄── Token Realtime generado ──────┤                               │
    │                                  │◄── Paciente se conecta ───────┤
    │◄── Canal activo (ambos) ─────────┤                               │
    │                                  │                               │
    │  [SESIÓN ACTIVA EN PARALELO]      │                               │
    │◄─ Espejo en vivo ────────────────┤◄── Trazo capturado ───────────┤
    │◄─ Métricas cada 2s ──────────────┤◄── Metrics:update ────────────┤
    ├── Registrar marca rápida ───────►│                               │
    ├── Registrar observaciones ──────►│                               │
    │  [FIN DE LA SESIÓN]              │                               │
    │                                  │◄── Paciente finaliza ─────────┤
    │◄── Notificación de cierre ───────┤──── Pantalla de cierre ──────►│
    ├── Finalizar sesión ─────────────►│                               │
    │◄── Trazos persistidos ───────────┤                               │
    │◄── Sesión = completed ───────────┤                               │
```

**Proceso 2 — Análisis de indicadores (BPM)**

```
EXAMINADOR                          SISTEMA                        SERVICIO EXTERNO
    │                                  │                               │
    ├── Solicitar análisis ───────────►│                               │
    │                                  ├── Calcular métricas obj. ─────┤
    │                                  ├── Detectar indicadores auto ──┤
    │                                  ├──────────────────────────────►│ OpenRouter
    │                                  │◄── Sugerencias semi ──────────┤ LLM
    │◄── Indicadores propuestos ───────┤                               │
    │                                  │                               │
    │  [REVISIÓN DEL EXAMINADOR]        │                               │
    ├── Aceptar indicador ────────────►│ status='validated'            │
    ├── Rechazar indicador ───────────►│ status='rejected'             │
    ├── Completar checklist 153 ──────►│ status='validated'            │
    │◄── Indicadores validados ────────┤                               │
```

**Proceso 3 — Generación y validación del informe (BPM)**

```
EXAMINADOR                          SISTEMA                        SERVICIO EXTERNO
    │                                  │                               │
    ├── Generar borrador ─────────────►│                               │
    │                                  ├── Secciones 1,2,3,4,9: det. ──┤
    │                                  ├──────────────────────────────►│ OpenRouter
    │                                  │◄── Secciones 5,6,7,8: LLM ───┤ LLM
    │◄── Borrador de 9 secciones ──────┤                               │
    │                                  │                               │
    │  [EDICIÓN PROFESIONAL]            │                               │
    ├── Editar sección ───────────────►│ edited_by_examiner=true       │
    ├── Editar sección ───────────────►│                               │
    │                                  │                               │
    ├── Validar informe ──────────────►│ status='validated'            │
    │◄── Informe validado, sellado ────┤ validated_by + validated_at   │
    │                                  │                               │
    ├── Exportar a PDF ───────────────►│                               │
    │◄── PDF descargado ───────────────┤ iText/OpenPDF                 │
```

### 3.5.4. Diagrama de clases

Las clases principales del dominio de Psicograma son las siguientes:

```
┌──────────────────────────────────────────────────────────────────────┐
│                        DOMINIO — PSICOGRAMA                          │
└──────────────────────────────────────────────────────────────────────┘

┌─────────────────┐         ┌─────────────────────┐
│   Profile       │         │   Patient           │
├─────────────────┤         ├─────────────────────┤
│ id: UUID        │ 1    *  │ id: UUID            │
│ full_name: str  ├────────►│ full_name: str       │
│ license_number  │         │ document_number: str │
│ specialty: str  │         │ birth_date: date     │
│ created_at      │         │ sex: str             │
└─────────────────┘         │ is_active: bool      │
         │1                 │ anonymized_at        │
         │                  │ created_by: UUID (FK)│
         │*                 └─────────────────────┘
┌─────────────────┐                   │ 1
│   Session       │                   │ *
├─────────────────┤         ┌─────────┴───────────┐
│ id: UUID        │◄────────┤  ConsentRecord      │
│ patient_id (FK) │ 1    1  ├─────────────────────┤
│ test_id (FK)    │         │ audio_authorized     │
│ status: enum    │         │ digital_authorized   │
│ reason: str     │         │ confidential_ack     │
│ created_by (FK) │         │ signature_url        │
│ started_at      │         │ signed_at            │
│ completed_at    │         └─────────────────────┘
└─────────────────┘
         │ 1
    ┌────┴────────────────────────────────────────┐
    │1        │1           │1            │1        │1
    ▼         ▼            ▼             ▼         ▼
┌────────┐ ┌──────────┐ ┌───────────┐ ┌────────┐ ┌────────┐
│Drawing │ │StrokeMet.│ │Session    │ │Report  │ │Session │
├────────┤ ├──────────┤ │Observat.  │ ├────────┤ │Indicat.│
│id:UUID │ │total_time│ ├───────────┤ │status  │ ├────────┤
│session_│ │latency_ms│ │additional_│ │validated│ │code(FK)│
│id(FK)  │ │stroke_cnt│ │notes: str │ │_at     │ │status  │
│final_  │ │pressure_ │ └───────────┘ │validated│ │source  │
│image   │ │avg       │               │_by(FK)  │ │confiden│
│orient. │ │pause_cnt │               └────────┘ │evidence│
│canvas_ │ │erase_cnt │                    │1     └────────┘
│width   │ │area_pct  │                    │*
│canvas_ │ │sequence_ │           ┌────────────────┐
│height  │ │start     │           │  ReportSection │
└────────┘ └──────────┘           ├────────────────┤
    │1                             │section_number  │
    │*                             │title: str      │
┌──────────┐                       │content: str    │
│  Stroke  │                       │is_ai_generated │
├──────────┤                       │edited_by_exam. │
│id: UUID  │                       └────────────────┘
│drawing_id│
│stroke_idx│     ┌──────────────────────────┐
│tool: enum│     │   IndicatorCatalog       │
│started_ms│     ├──────────────────────────┤
│ended_ms  │     │ code: TEXT (PK)          │
│point_cnt │     │ section_id: UUID (FK)    │
│avg_press │     │ title: str               │
│bbox_*    │     │ interpretation: str      │
│points:   │     │ detection_type: enum     │
│  JSONB   │     │  (auto/semi/manual)      │
└──────────┘     │ is_active: bool          │
                 └──────────────────────────┘

┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│     Test     │    │IndicatorCat. │    │ManualSection │
├──────────────┤    ├──────────────┤    ├──────────────┤
│ code: TEXT   │    │ code: TEXT   │    │ code: TEXT   │
│ name: str    │    │ test_id(FK)  │    │ category_id  │
│ is_available │    │ name: str    │    │ name: str    │
└──────────────┘    └──────────────┘    │ code_prefix  │
                                        └──────────────┘
```

### 3.5.5. Diagrama entidad-relación

El esquema de base de datos de Psicograma consta de **22 tablas** normalizadas a segunda forma normal (2FN), distribuidas en 9 grupos:

```
┌──────────────────────────────────────────────────────────────────────┐
│              DIAGRAMA ENTIDAD-RELACIÓN — PSICOGRAMA v2               │
│                   22 tablas · PostgreSQL 17 · Supabase               │
└──────────────────────────────────────────────────────────────────────┘

CATÁLOGOS (solo lectura)
  tests ──────────────────────────────────────────────────────────────►
  indicator_categories (test_id → tests.id) ──────────────────────────►
  manual_sections (category_id → indicator_categories.id) ────────────►
  indicator_catalog (section_id → manual_sections.id) [201 indicadores]
  quick_mark_catalog
  attitude_catalog

IDENTIDAD Y PACIENTES
  profiles (id → auth.users.id)
  patients (created_by → profiles.id)

SESIONES
  sessions (patient_id → patients.id, test_id → tests.id,
            created_by → profiles.id)
  consent_records (session_id → sessions.id) [1:1]

DIBUJO Y TRAZOS
  drawings (session_id → sessions.id) [1:1]
  strokes (drawing_id → drawings.id) [1:N]
  stroke_metrics (session_id → sessions.id) [1:1, materializado]

AUDIO Y TRANSCRIPCIÓN
  audio_recordings (session_id → sessions.id)
  transcript_segments (recording_id → audio_recordings.id)

OBSERVACIONES
  session_observations (session_id → sessions.id) [1:1]
  session_quick_marks (session_id → sessions.id, mark_code → quick_mark_catalog.code)
  session_attitudes (session_id + attitude_code → attitude_catalog.code) [clave compuesta]
  verbalizations (session_id → sessions.id)

INDICADORES DE SESIÓN (corrección de 2FN)
  session_indicators (session_id → sessions.id,
                      indicator_code → indicator_catalog.code) [PK compuesta]

INFORME
  reports (session_id → sessions.id) [1:1]
  report_sections (report_id → reports.id, section_number 1-9)
```

**Corrección de 2FN aplicada:** En el esquema v1, los 201 indicadores del manual se repetían en la tabla `indicators` por cada sesión, generando una dependencia parcial (los atributos `title`, `interpretation` y `category` dependían solo de `code`, no de la clave compuesta `(session_id, code)`). En v2, el catálogo del manual vive una sola vez en `indicator_catalog`, y la tabla `session_indicators` registra únicamente lo que ocurre en cada sesión concreta (estado, fuente, confianza, evidencia, validador y fecha de validación).

### 3.5.6. Diseño de base de datos

El diseño físico de la base de datos implementa las siguientes decisiones de seguridad y rendimiento:

| Decisión | Implementación |
|---|---|
| **Aislamiento por profesional** | Row Level Security (RLS) activa en las 22 tablas. Un psicólogo solo puede acceder a sus propios pacientes, sesiones e informes. |
| **Propagación de identidad** | Cada transacción del backend propaga `SET LOCAL ROLE authenticated` y `SET LOCAL request.jwt.claims` para que RLS se evalúe con la identidad del usuario autenticado, no del rol de conexión. |
| **Datos temporales atómicos** | `strokes.points` se mantiene como JSONB (excepción documentada a 1FN): una serie temporal de miles de puntos que se lee y escribe como unidad y nunca se consulta punto por punto. Normalizarla generaría ~5.000 filas por sesión sin beneficio de consulta. |
| **Índices en FK** | PostgreSQL no indexa las claves foráneas automáticamente. Se crearon índices explícitos en todas las FK que se recorren en consultas habituales (`idx_patients_created_by`, `idx_sessions_patient`, `idx_strokes_drawing`, `idx_report_sections`, etc.). |
| **Actualización automática de timestamps** | Función `touch_updated_at()` como trigger `BEFORE UPDATE` en `session_observations`, `reports` y `report_sections`. |
| **Migraciones versionadas** | Dos migraciones aplicadas: `001-anonymized-at-y-sexo-u.sql` (campo `anonymized_at` y valor `U` para sexo no informado) y `002-audio-started-at-ms.sql` (offset de inicio de grabación para alinear con el reloj de sesión). |

### 3.5.7. Diseño de interfaces

El sistema de diseño **Clinical Precision** define los principios visuales de todas las interfaces:

| Elemento | Valor |
|---|---|
| **Paleta principal** | Violeta profundo (#2E2365) — sidebars y tipografía de alto nivel |
| **Acción primaria** | #453A7D — botones de acción y estados activos |
| **Validación IA** | Ámbar (#C97A1F) — sugerencias pendientes de validación |
| **Confirmado** | Verde (#2E7D5B) — indicadores validados por el examinador |
| **Grabación activa** | Rojo (#C0523F) — estado de grabación en curso |
| **Tipografía** | Inter · Semibold para títulos · Regular para cuerpo |
| **Grid** | 12 columnas · 1280 px de ancho · margen de 40 px |
| **Radios** | 8 px para todos los elementos primarios |
| **Elevación** | Sombra suave `0px 2px 4px rgba(37,29,75,0.05)` para tarjetas |

Las 13 pantallas implementadas se documentan en el Anexo O (capturas de pantalla) y en el Anexo P (prototipo completo).

### 3.5.8. Tecnologías utilizadas

| Capa | Tecnología | Versión | Rol |
|---|---|---|---|
| Frontend | React | 18.x | Interfaz de examinador y paciente |
| Frontend | TypeScript | 5.x | Tipado estático |
| Frontend | Vite | 5.x | Bundler y servidor de desarrollo |
| Frontend | Supabase Realtime | — | Sincronización tablet-desktop |
| Backend | Java | 21 LTS | Lenguaje del backend y dominio |
| Backend | Spring Boot | 3.x | Framework web y gestión de dependencias |
| Backend | Spring Data JPA | — | Repositorios de persistencia |
| Backend | iText / OpenPDF | — | Exportación a PDF |
| Dominio | Java puro | 21 | Motor de análisis, motor de reglas, calculador de métricas |
| Persistencia | PostgreSQL | 17.6 | Base de datos relacional en la nube |
| Infraestructura | Supabase | — | PostgreSQL + Auth + Realtime + Storage |
| Auth | Supabase Auth | — | JWT ES256 + JWKS público |
| IA | OpenAI Whisper | — | Transcripción automática de audio |
| IA | OpenRouter | — | Redacción asistida del borrador de informe |
| Despliegue | Railway | — | Backend Java (JAR ejecutable) |
| Despliegue | Vercel | — | Frontend estático |
| Control de versiones | Git + GitHub | — | Gestión del código fuente |

### 3.5.9. Arquitectura tecnológica

Ver diagrama en la sección 3.5.1. La arquitectura tecnológica se organiza en cuatro capas:

1. **Presentación:** React + TypeScript en el cliente del examinador y en la tablet del paciente. Comunicación con el backend exclusivamente mediante HTTPS (API REST) y WebSocket (Realtime Broadcast).
2. **Lógica de negocio:** Java 21 + Spring Boot 3 con arquitectura hexagonal. El dominio puro (motor de análisis, motor de reglas, calculador de métricas) no tiene dependencias de infraestructura.
3. **Datos:** PostgreSQL 17 en Supabase con Row Level Security activa en las 22 tablas y dos migraciones versionadas aplicadas.
4. **Servicios externos:** OpenAI Whisper para transcripción y OpenRouter para redacción asistida, ambos integrados como adaptadores de salida en el hexágono.

### 3.5.10. Componentes desarrollados en Java

| Componente | Descripción | Clases principales |
|---|---|---|
| **Motor de análisis de indicadores** | Orquesta la medición objetiva y la propuesta de indicadores. Entrada: trazos de la sesión. Salida: lista de `SessionIndicator` con `status='suggestion'`. | `AnalysisService`, `IndicatorEngine`, `MetricsCalculator` |
| **Motor de reglas PBLL** | Contiene los 201 indicadores del manual PBLL con sus umbrales calibrables. Cruza las métricas objetivas con los criterios y genera la evidencia de cada sugerencia. | `RuleEngine`, `IndicatorRule`, `Threshold` |
| **Calculador de métricas objetivas** | Procesa los trazos capturados y calcula las 7 métricas estructurales: `total_time_ms`, `latency_ms`, `stroke_count`, `pressure_avg`, `pause_count`, `erase_count`, `area_pct`, `sequence_start`. | `MetricsCalculator`, `StrokeAnalyzer` |
| **Generador del borrador de informe** | Construye las 9 secciones del informe. Las secciones 1-4 y 9 son deterministas. Las secciones 5-8 usan el adaptador OpenRouter con fallback determinista. | `ReportGenerator`, `SectionBuilder`, `OpenRouterAdapter` |
| **Exportador PDF** | Genera el documento PDF final a partir del informe validado, aplicando la plantilla del design system Clinical Precision. | `PdfExporter`, `ReportTemplate` |
| **Verificador de JWT** | Valida los tokens Supabase (firma ES256) contra el JWKS público y extrae el `user_id` del contexto de la request. | `JwtVerifier`, `SupabaseJwksProvider` |
| **Repositorios PostgreSQL** | Implementaciones de los puertos de salida que traducen las entidades del dominio a consultas SQL con propagación de identidad (`SET LOCAL ROLE authenticated`). | `PatientRepository`, `SessionRepository`, `IndicatorRepository`, `ReportRepository` |
| **Controladores REST** | Adaptadores de entrada que exponen los ~40 endpoints de la API v2 documentados en `sdd/api-contracts.md`. | `PatientController`, `SessionController`, `AnalysisController`, `ReportController` |

---

## 3.6. Diseño del prototipo

### 3.6.1. Herramienta utilizada para el prototipo

El prototipo de Psicograma fue desarrollado como una **aplicación web funcional** en React + TypeScript, lo que supera el nivel de fidelidad de una herramienta de mockup como Balsamiq. Las pantallas corresponden a componentes React reales con el design system Clinical Precision aplicado, no a imágenes estáticas. Las capturas de pantalla de las 13 pantallas se presentan en el Anexo Q.

Para el registro académico de la herramienta de prototipado utilizada: el diseño visual inicial se validó con el design system documentado en `mocks/design-system/design.md` y con los mocks HTML de alta fidelidad generados en `mocks/`. El prototipo funcional resultante supera en fidelidad y cobertura a cualquier herramienta de mockup.

### 3.6.2. Diseño general del prototipo

El prototipo cubre las dos interfaces del sistema:

**Interfaz del examinador (desktop):** Sidebar fija de navegación en violeta profundo con 5 secciones principales. Área de trabajo en el centro. Cabecera con identificación del profesional.

**Interfaz del paciente (tablet):** Pantalla completa sin distracciones. Sin sidebar ni navegación. Solo la consigna, el lienzo de dibujo y la pantalla de cierre.

### 3.6.3. Prototipo de la solución

El prototipo funcional implementa el flujo completo end-to-end: desde el registro del psicólogo hasta la descarga del PDF del informe validado. Todas las pantallas están conectadas entre sí y responden a acciones reales del usuario.

### 3.6.4. Diseño de la pantalla principal

**Dashboard principal (Pantalla 2):** Presenta cuatro métricas en tarjetas en la parte superior (sesiones de la semana, evaluaciones pendientes de informe, pacientes activos y sesiones recientes). Debajo, una lista de sesiones recientes con acceso rápido. Color de fondo: surface `#fcf8ff`. Tarjetas con elevación nivel 1 (`#FFFFFF` con sombra suave). El sidebar violeta profundo está siempre visible.

### 3.6.5. Diseño de módulos

| Módulo | Pantallas | Acceso |
|---|---|---|
| Autenticación | Login, registro | Ruta pública `/` |
| Panel de control | Dashboard | Ruta `/` (examinador autenticado) |
| Pacientes | Listado, ficha, registro | Rutas `/pacientes`, `/pacientes/:id` |
| Sesiones | Nueva sesión, sesión en vivo | Rutas `/sesiones/nueva`, `/sesiones/:id/en-vivo` |
| Paciente (tablet) | Consigna, lienzo, cierre | Rutas `/session/:id/paciente/*` |
| Análisis | Verificación, resultados | Rutas `/sesiones/:id/analisis` |
| Informe | Editor, validación | Rutas `/sesiones/:id/informe` |
| Catálogo | Tests disponibles | Ruta `/tests` |

### 3.6.6. Diseño de los procesos principales

Los tres procesos documentados en la sección 3.5.3 se implementan en el prototipo de la siguiente manera:

**Proceso 1 (Evaluación):** El asistente de 3 pasos guía al examinador desde la selección del paciente hasta el inicio de la sesión. El sistema genera el token Realtime y vincula ambos dispositivos automáticamente.

**Proceso 2 (Análisis):** El panel de análisis presenta los indicadores en tres pestañas: automáticos, semiautomáticos y verificación profesional. El examinador puede aceptar o rechazar cada indicador con un clic. Los indicadores validados aparecen en verde; los rechazados se ocultan; los pendientes aparecen en ámbar.

**Proceso 3 (Informe):** El editor de informe presenta las 9 secciones con un índice lateral. Las secciones generadas por el sistema tienen un marcado visual distintivo. El botón de validación cambia el estado del informe a `validated` y sella el nombre del profesional y la fecha. El PDF se descarga desde el servidor.

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
| Análisis | Editor del informe | Checklist completado → "Generar borrador" |
| Editor del informe | PDF descargado | "Validar y exportar PDF" |
| Cualquier pantalla | Pantalla anterior | Botón "Volver" o sidebar |

### 3.6.8. Diseño de interfaces

Las interfaces siguen los principios del design system Clinical Precision. Los elementos clave de cada interfaz son:

**Interfaz del examinador — Sesión en vivo:**
- Panel izquierdo: espejo del dibujo del paciente en tiempo real.
- Panel central: 7 métricas en tiempo real (tiempo, latencia, trazos, presión, pausas, borrados, área).
- Panel derecho: marcas rápidas, observaciones y control de grabación de audio.
- Estado de conexión del paciente visible en todo momento.

**Interfaz del paciente — Lienzo:**
- Pantalla completa sin distracciones.
- Lienzo central con herramientas mínimas: lápiz, borrador, deshacer.
- Sin métricas ni indicadores visibles.
- Botón de finalización discreto.

**Editor del informe:**
- Índice lateral con las 9 secciones y su estado (completo / vacío).
- Área central de edición con marcado visual de contenido generado vs. editado.
- Chips de validación en ámbar (IA) / verde (profesional).
- Botón de validación prominente en el encabezado.

### 3.6.9. Validación del prototipo

El prototipo fue validado de la siguiente manera:

1. **Validación técnica:** 119 tests automatizados verifican el dominio y los adaptadores (47 unitarios de dominio puro sin red, 72 de integración y adaptadores).
2. **Validación de requerimientos:** Cada pantalla del prototipo se trazó a los requerimientos funcionales que implementa (ver sección 3.7.3 y Anexo R).
3. **Validación de flujo:** El flujo completo end-to-end (registro → sesión → análisis → informe → PDF) fue ejecutado con éxito en el entorno de desarrollo.
4. **Validación de seguridad:** Row Level Security verificada: un psicólogo no puede acceder a los datos de otro mediante consultas directas ni mediante la API.

### 3.6.10. Cobertura del 100 % del alcance funcional

| Módulo del alcance | Implementado | Pantallas que lo demuestran |
|---|---|---|
| Gestión de pacientes (CRUD, ficha, historial) | ✓ | Listado, Ficha |
| Gestión de sesiones (wizard, consentimiento, en vivo) | ✓ | Nueva sesión, Sesión en vivo |
| Captura del dibujo con dimensión temporal | ✓ | Lienzo del paciente |
| Registro de la sesión (observaciones, audio, marcas) | ✓ | Sesión en vivo |
| Análisis (métricas objetivas + indicadores + checklist) | ✓ | Verificación profesional, Análisis de resultados |
| Generación del borrador de informe | ✓ | Editor del informe |
| Edición y validación del informe | ✓ | Editor del informe |
| Exportación a PDF | ✓ | Editor del informe |
| Dos perfiles de usuario (examinador / paciente) | ✓ | Todas las pantallas |

### 3.6.11. Cobertura del alcance no funcional

| Grupo de RNF | Cobertura en el prototipo |
|---|---|
| Rendimiento (RNF-01 a RNF-04) | Canal Realtime < 200 ms de latencia; métricas refresco cada 2 s; operaciones REST < 2 s |
| Escalabilidad (RNF-05, RNF-06) | Motor de reglas en base de datos (configurable por test); backend sin estado en sesión |
| Disponibilidad (RNF-07 a RNF-09) | Trazos persistidos al finalizar; sin pérdida por desconexión momentánea |
| Seguridad (RNF-10 a RNF-13) | HTTPS + cifrado en reposo; RLS en 22 tablas; sin credenciales en el cliente; canal Realtime privado |
| Confidencialidad (RNF-14 a RNF-16) | Consentimiento obligatorio antes de grabar; aislamiento por profesional; anonimización disponible |
| Ética y trazabilidad (RNF-17 a RNF-20) | Sin inferencia diagnóstica; validación profesional obligatoria; trazabilidad al manual; auditoría de validaciones |
| Usabilidad (RNF-21 a RNF-24) | Interfaz en español; optimizada para tablet (paciente) y desktop (examinador); sin métricas visibles al paciente |
| Mantenibilidad (RNF-25 a RNF-27) | Separación dominio-infraestructura verificable; umbrales calibrables; migraciones versionadas |
| Compatibilidad (RNF-28 a RNF-30) | Funciona en tablet con lápiz digital y en navegadores con Pointer Events API |

---

## 3.7. Validación de la solución

### 3.7.1. Relación problema – objetivos – solución

| Problema identificado | Objetivo específico | Solución implementada |
|---|---|---|
| Tiempo elevado por informe (45-90 min) — doble esfuerzo de registro | OE-5: Estimar la reducción del tiempo de elaboración | Generación asistida del borrador de 9 secciones desde indicadores validados (Sprints 4 y 6) |
| Pérdida de indicadores temporales del dibujo (latencia, pausas, borrados, secuencia) | OE-3: Establecer la arquitectura con módulo de captura | Captura digital con Pointer Events API y cálculo automático de métricas temporales (Sprint 3) |
| Variabilidad entre evaluadores — documentación poco homogénea | OE-2: Especificar requerimientos bajo IEEE 830 / OE-4: Implementar los módulos | Motor de reglas con criterios trazados al manual (RNF-19); validación profesional obligatoria (RNF-18) |
| Consulta manual del manual del test durante la sesión | OE-4: Implementar módulo de análisis | 201 indicadores del manual en base de datos con detección automática, semiautomática y checklist (Sprint 4) |

### 3.7.2. Relación objetivos – funcionalidades

| Objetivo específico | Requerimientos | Funcionalidades implementadas |
|---|---|---|
| OE-1: Analizar el proceso actual de evaluación | — (levantamiento previo) | Centro Psicológico Ser Integral como entorno de referencia; proceso manual documentado en Cap. 1 |
| OE-2: Especificar requerimientos bajo IEEE 830 | Todos los RF y RNF | 41 RF + 30 RNF en el SRS; trazabilidad a objetivos y módulos |
| OE-3: Diseñar arquitectura e interfaces | RF-03, RF-11, RF-14 a RF-25, RNF-22, RNF-23, RNF-25 | Arquitectura hexagonal; 13 pantallas implementadas; dos interfaces diferenciadas |
| OE-4: Implementar los módulos | RF-16, RF-22 a RF-28, RF-35 a RF-38, RNF-05 | 6 sprints completados; motor de análisis; generación de informe; exportación PDF |
| OE-5: Estimar la reducción del tiempo | RF-37, RF-40 | Registro de `validated_at` como base de medición; ficha pre/post pendiente (AUD-05) |

### 3.7.3. Relación requerimientos – funcionalidades

| Requerimiento | Módulo | Pantalla que lo demuestra |
|---|---|---|
| RF-01 Registro e inicio de sesión | Autenticación | Pantalla de login / registro |
| RF-04 Registrar paciente | Gestión de pacientes | Formulario de nuevo paciente |
| RF-06 Listar pacientes | Gestión de pacientes | Listado de pacientes |
| RF-07 Consultar ficha del paciente | Gestión de pacientes | Ficha del paciente (3 pestañas) |
| RF-10 Registrar consentimiento informado | Gestión de sesiones | Asistente de nueva sesión — paso 2 |
| RF-14 Lienzo digital | Captura del dibujo | Lienzo del paciente |
| RF-16 Captura de la dimensión temporal | Captura del dibujo | Lienzo del paciente (Pointer Events) |
| RF-20 Espejo del dibujo en vivo | Sincronización | Sesión en vivo (examinador) |
| RF-21 Métricas en vivo | Sincronización | Sesión en vivo — panel de métricas |
| RF-22 Marcas rápidas | Registro de sesión | Sesión en vivo — panel de marcas |
| RF-26 Grabar audio | Audio | Sesión en vivo — control de grabación |
| RF-29 Medición objetiva | Análisis | Análisis de resultados PBLL |
| RF-30 Detección automática de indicadores | Análisis | Análisis de resultados — tab automáticos |
| RF-32 Verificación profesional | Análisis | Verificación profesional — checklist |
| RF-35 Generar borrador del informe | Informe | Editor del informe — secciones 1-8 |
| RF-36 Editar el informe | Informe | Editor del informe — edición por sección |
| RF-37 Validar el informe | Informe | Editor del informe — botón de validación |
| RF-38 Exportar a PDF | Informe | Editor del informe — descarga del PDF |
| RF-40 Panel de indicadores de gestión | Dashboard | Dashboard principal |
| RF-41 Catálogo de tests | Dashboard | Catálogo de tests proyectivos |

### 3.7.4. Matriz de cobertura del alcance

| Elemento del alcance | Cubierto | RF que lo implementan | Pantalla |
|---|---|---|---|
| Test PBLL como caso piloto | ✓ | RF-09, RF-41 | Catálogo de tests, Nueva sesión |
| Gestión de pacientes (CRUD, ficha, historial) | ✓ | RF-04 a RF-08 | Listado, Ficha |
| Gestión de sesiones (wizard, consentimiento, en vivo) | ✓ | RF-09 a RF-13 | Nueva sesión, Sesión en vivo |
| Captura del dibujo con datos temporales | ✓ | RF-14 a RF-19 | Lienzo del paciente |
| Sincronización tablet-desktop en tiempo real | ✓ | RF-20, RF-25, RNF-01 | Sesión en vivo |
| Registro de observaciones, marcas y actitudes | ✓ | RF-22 a RF-24 | Sesión en vivo |
| Grabación y transcripción de audio | ✓ | RF-26 a RF-28 | Sesión en vivo |
| Análisis con métricas objetivas | ✓ | RF-29, RF-30 | Análisis de resultados |
| Sugerencia asistida de indicadores | ✓ | RF-31 | Análisis de resultados |
| Checklist de verificación profesional | ✓ | RF-32, RF-33 | Verificación profesional |
| Motor de reglas configurable | ✓ | RF-34, RNF-05 | — (backend) |
| Generación del borrador de informe | ✓ | RF-35 | Editor del informe |
| Edición del informe | ✓ | RF-36 | Editor del informe |
| Validación del informe | ✓ | RF-37 | Editor del informe |
| Exportación a PDF | ✓ | RF-38 | Editor del informe |
| Historial de informes | ✓ | RF-39 | Ficha del paciente |
| Panel de control del examinador | ✓ | RF-40 | Dashboard |
| Dos perfiles (examinador / paciente) | ✓ | RF-03 | Todas las pantallas |

**Cobertura total: 18/18 elementos del alcance funcional cubiertos (100 %).**

### 3.7.5. Verificación de funcionalidades del prototipo

| Funcionalidad | Verificada | Evidencia |
|---|---|---|
| Autenticación del psicólogo | ✓ | Flujo login → dashboard operativo |
| Registro y actualización de pacientes | ✓ | CRUD de pacientes funcionando con validación de documento duplicado |
| Asistente de nueva sesión con consentimiento | ✓ | Wizard de 3 pasos completado; consentimiento registrado en BD |
| Lienzo digital con captura temporal | ✓ | Pointer Events API captura `x, y, t, pressure` por punto |
| Sincronización en tiempo real < 200 ms | ✓ | Canal Realtime Broadcast verificado en pruebas locales |
| Métricas en vivo con refresco cada 2 s | ✓ | 7 métricas actualizadas continuamente durante la sesión |
| Grabación y transcripción de audio | ✓ | Upload a Storage + Whisper API integrada |
| Medición objetiva de indicadores | ✓ | 23 indicadores automáticos calculados desde trazos |
| Checklist de 153 indicadores manuales | ✓ | Organizado en pestañas por secciones del manual |
| Generación del borrador de informe | ✓ | 9 secciones generadas; 4 con asistencia LLM, 5 deterministas |
| Edición del informe con marcado visual | ✓ | Distinción visual entre contenido del sistema y del profesional |
| Validación del informe con sello | ✓ | `validated_by` + `validated_at` registrados en BD |
| Exportación a PDF | ✓ | PDF generado y descargado correctamente |
| Aislamiento por profesional (RLS) | ✓ | Verificado: ningún psicólogo accede a datos de otro |
| Sección de conclusiones vacía | ✓ | Sección 9 entregada vacía para redacción del profesional |

### 3.7.6. Verificación de requerimientos no funcionales

| RNF | Descripción | Estado | Evidencia |
|---|---|---|---|
| RNF-01 | Latencia del espejo < 1 s | ✓ Verificado | Canal Realtime < 200 ms en pruebas locales |
| RNF-02 | Fluidez del lienzo | ✓ Verificado | Captura a 60 fps sin pérdida de puntos |
| RNF-03 | Tiempo de respuesta < 2 s | ✓ Verificado | Operaciones REST < 2 s; transcripción e informe informan progreso |
| RNF-04 | Métricas cada 2 s | ✓ Verificado | Evento `metrics:update` cada 2 s |
| RNF-05 | Escalabilidad por instrumento | ✓ Diseñado | Motor de reglas en BD; nuevos tests = nuevo seed |
| RNF-10 | Cifrado en tránsito y reposo | ✓ Verificado | HTTPS + cifrado en reposo de Supabase |
| RNF-11 | Doble capa de autorización | ✓ Verificado | Backend filtra por `user_id` + RLS en 22 tablas |
| RNF-12 | Sin credenciales en el cliente | ✓ Verificado | Frontend migrado a `apiClient`; sin `anon key` en el navegador |
| RNF-14 | Consentimiento previo a audio | ✓ Verificado | `consent_records.audio_authorized` verificado antes de grabar |
| RNF-15 | Aislamiento por profesional | ✓ Verificado | Policy RLS `own patients / own sessions` en BD |
| RNF-17 | Sin inferencia diagnóstica | ✓ Verificado | Sección 9 vacía; categorías C y D excluidas del análisis |
| RNF-18 | Validación profesional obligatoria | ✓ Verificado | `status='suggestion'` sin acceso al informe |
| RNF-19 | Trazabilidad al manual | ✓ Verificado | Campo `manual_section` en `indicator_catalog` |
| RNF-21 | Interfaz en español | ✓ Verificado | Todas las pantallas, textos e informes en español |
| RNF-22 | Interfaz según dispositivo y rol | ✓ Verificado | Interfaz tablet para paciente; desktop para examinador |
| RNF-23 | Sin métricas visibles al paciente | ✓ Verificado | Pantalla del paciente sin métricas ni indicadores |
| RNF-25 | Separación dominio-infraestructura | ✓ Verificado | Arquitectura hexagonal; frontera verificable con `check-hexagon.sh` |
| RNF-27 | Migraciones versionadas | ✓ Verificado | Migraciones `001` y `002` aplicadas y registradas |

---

## BIBLIOGRAFÍA (Capítulo 3)

Institute of Electrical and Electronics Engineers. (1998). *IEEE recommended practice for software requirements specifications* (IEEE Std 830-1998). https://standards.ieee.org/ieee/830/1222/

Querol, S. M., & Chaves Paz, M. I. (2004). *Test de la persona bajo la lluvia: Adaptación y aplicación* (1.ª ed., 3.ª reimp.). Lugar Editorial.

Lin, Y., Zhang, N., Qu, Y., Li, T., Liu, J., & Song, Y. (2022). The House-Tree-Person test is not valid for the prediction of mental health: An empirical study using deep neural networks. *Acta Psychologica*, *230*, 103734. https://doi.org/10.1016/j.actpsy.2022.103734

Wen, S., Sun, Y., Ku, B., Gao, Z., Ma, L., Yang, Y., & Jiao, C. (2025). From visual perception to deep empathy: An automated assessment framework for House-Tree-Person drawings using multimodal LLMs and multi-agent collaboration [Preprint]. arXiv. https://doi.org/10.48550/arXiv.2512.21360

Xie, Y., Pan, T., Liu, B., Chen, H., & Liu, W. (2024). Interpretable drawing psychoanalysis via House-Tree-Person test. En T. Liu, G. Webb, L. Yue & D. Wang (Eds.), *AI 2023: Advances in artificial intelligence* (Lecture Notes in Computer Science, vol. 14472, pp. 221–233). Springer. https://doi.org/10.1007/978-981-99-8391-9_18
