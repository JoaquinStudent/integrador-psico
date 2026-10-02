Facultad de Ingeniería Software y Sistemas

**"Implementación de una aplicación web para reducir el tiempo de elaboración de informes de tests proyectivos de dibujo en la práctica psicológica, Lima, 2026."**

Autor (es):

Bernable Pantaleon Yefrei Eyder

Jose Eduardo Diaz Fernandez

Iam Kaled Fabricio Arias Yaranga

Jonathan Edilson Tuppia Lozano

Joaquin Sebastian Chaparro Villavicencio

Curso Integrador I: Sistemas Software

Sección 38195

Lima - Perú, 2026

---

# CAPÍTULO 1. PLANTEAMIENTO DEL PROBLEMA

## 1.1. Análisis del contexto de la empresa

### 1.1.1. Descripción de la empresa

El proyecto se desarrolla en el **Centro Psicológico Ser Integral E.I.R.L.**, ubicado en el distrito de San Juan de Lurigancho, Lima, Perú. Este centro presta servicios de atención psicológica clínica a la comunidad local. Entre los instrumentos de evaluación que sus profesionales aplican de forma habitual se encuentran los tests proyectivos de dibujo, en particular el test de la Persona bajo la lluvia (PBLL), instrumento que constituye el caso piloto del presente proyecto.

El centro atiende pacientes de distintos grupos etarios, incluyendo niños y adolescentes derivados de instituciones educativas del distrito. La evaluación psicológica mediante tests proyectivos de dibujo forma parte del proceso diagnóstico rutinario, lo que genera una demanda sostenida de elaboración de informes clínicos.

### 1.1.2. Misión de la empresa

Reducir el tiempo que los psicólogos destinan a las tareas mecánicas de la evaluación de tests proyectivos de dibujo, mediante la captura digital del proceso de trazado y la aplicación consistente de los criterios del manual, potenciando el trabajo del profesional sin reemplazar su criterio clínico.

### 1.1.3. Visión de la empresa

Ser reconocida al año 2030 como la herramienta de referencia para la aplicación e interpretación de tests proyectivos de dibujo en el ámbito psicológico hispanohablante, incorporando de forma progresiva los principales instrumentos gráficos utilizados en la práctica profesional.

### 1.1.4. Análisis del entorno

El proyecto se inserta en un contexto caracterizado por tres condiciones que definen el entorno del negocio:

**Demanda creciente de salud mental.** La Defensoría del Pueblo (2023) advierte que aproximadamente el ochenta por ciento de las personas que requieren atención en salud mental en el Perú no accede a un tratamiento adecuado. Durante el año 2024 se registraron 1 863 674 casos de trastornos de salud mental y problemas psicosociales atendidos en establecimientos del sector público (Congreso de la República del Perú, 2025). Esta brecha configura una presión directa sobre el tiempo profesional disponible.

**Disponibilidad limitada de profesionales.** De acuerdo con el Compendio Estadístico del Instituto Nacional de Estadística e Informática (2023), en el año 2020 se registraron 3 372 psicólogos colegiados en ejercicio a nivel nacional. En el ámbito educativo, 1 201 profesionales de psicología prestan servicio en instituciones educativas públicas mediante el programa SERUMS (Ministerio de Salud, 2025a). Cada hora que el psicólogo destina a tareas administrativas o mecánicas es tiempo que no dedica a la atención de pacientes.

**Bajo nivel de digitalización.** Santamaría y Sánchez-Sánchez (2022) documentan que en 2021 el 90% de las aplicaciones del SENA y el 85% de las del PAI se realizaron en formato de lápiz y papel, pese a la disponibilidad de alternativas informatizadas. En el mercado hispanohablante existen soluciones comerciales orientadas a la generación de informes psicológicos, como Psiconube (s.f.), pero operan mediante formularios que el profesional completa previamente, sin analizar el dibujo. En el ámbito académico, los desarrollos disponibles se concentran en el test Casa-Árbol-Persona y provienen mayoritariamente de instituciones asiáticas, con enfoque diagnóstico y sobre imágenes estáticas.

### 1.1.5. Estrategias de la empresa

Se han definido cuatro líneas estratégicas para el desarrollo de la solución:

**Primera — especialización en profundidad antes que en extensión.** Se implementa un único instrumento, el test de la Persona bajo la lluvia, hasta lograr un funcionamiento completo, antes de incorporar cualquier otro. Este enfoque reduce el riesgo técnico y garantiza una cobertura íntegra de los indicadores del manual piloto.

**Segunda — diferenciación mediante la captura del proceso de elaboración del dibujo.** Psicograma atiende aquellos indicadores del manual que el soporte de papel no permite registrar: tiempo de ejecución, latencia de inicio, momentos de quietud, secuencia de dibujado y borrados realizados. Ninguna solución comercial ni académica identificada captura esta dimensión temporal.

**Tercera — motor de reglas configurable.** El diseño bajo una arquitectura de motor de reglas permite incorporar nuevos instrumentos mediante la carga de sus criterios en la base de datos, sin necesidad de reprogramar la lógica de análisis. Esta arquitectura garantiza la escalabilidad hacia el test Casa-Árbol-Persona, Dibujo de la Familia y DFH en fases posteriores.

**Cuarta — delimitación explícita del alcance a funciones de apoyo profesional.** Se excluye de forma permanente toda inferencia de carácter diagnóstico, decisión sustentada en los hallazgos de Lin et al. (2022), quienes concluyen que los indicadores de los tests proyectivos de dibujo no presentan una asociación confiable con problemas de salud mental. El sistema potencia al psicólogo, no lo reemplaza.

### 1.1.6. Planes de la empresa

El desarrollo se organiza en cuatro fases sucesivas:

| Fase | Contenido | Período |
|---|---|---|
| **Fase 1** — Planificación y análisis | Misión, visión, entorno, estrategias, planes. Levantamiento de requerimientos funcionales y no funcionales (SRS IEEE 830). Diseño de diagramas BPM, clases y modelo de datos. | 10/08/2026 – 05/10/2026 |
| **Fase 2** — Construcción | Sprint 1 (fundación), Sprint 2 (pacientes, panel y sesiones), Sprint 3 (lienzo y sesión en vivo), Sprint 4 (análisis y motor de reglas PBLL), Sprint 5 (rearquitectura: backend hexagonal y BD normalizada), Sprint 6 (informe, PDF y cierre funcional). | 18/08/2026 – 01/10/2026 |
| **Fase 3** — Auditoría del sistema | Verificación funcional (41 RF), auditoría de seguridad (RLS, cifrado), auditoría ética (trazabilidad al manual), auditoría de rendimiento (latencia, fluidez) y medición pre/post del tiempo de elaboración de informes. | 02/11/2026 – 11/11/2026 |
| **Fase 4** — Cierre | Medición comparativa definitiva, informe final con resultados y entrega académica. | 11/12/2026 |

La incorporación de instrumentos adicionales (HTP, Dibujo de la Familia, DFH), así como la calibración empírica de los indicadores que requieren umbrales numéricos, se proyecta para fases posteriores al periodo académico.

---

## 1.2. Modelo de negocio

### 1.2.1. Business Model Canvas

| Bloque | Contenido |
|---|---|
| **Socios clave** | Colegio de Psicólogos del Perú · Universidades con facultad de Psicología · Psicólogos clínicos colaboradores para aportar casos reales de uso · Proveedores de nube e IA (hosting, API de reconocimiento de escritura, transcripción STT, modelo de lenguaje LLM) |
| **Actividades clave** | 1. Desarrollo y mantenimiento de las dos interfaces (paciente – examinador) · 2. Modelado de las reglas de cada test y plantillas de informe · 3. Afinamiento del reconocimiento de trazos y detección de elementos · 4. Seguridad y privacidad de datos de salud · 5. Captación, soporte y capacitación de psicólogos |
| **Propuesta de valor** | El copiloto del psicólogo para tests de dibujo: reduce el tiempo del informe y estandariza los criterios. Único que analiza el proceso del trazo (tamaño, presión, orden, tiempo), no solo la foto. Analiza el dibujo real; la competencia solo rellena formularios. Lo potencia, no lo reemplaza. |
| **Relación con el cliente** | 1. Autoservicio con onboarding y prueba gratuita · 2. Soporte y capacitación en línea · 3. Comunidad de psicólogos usuarios + feedback continuo |
| **Segmentos de clientes** | 1. Psicólogos clínicos independientes · 2. Centros y clínicas de psicología · 3. Early adopters: psicólogos jóvenes, con tablet y alta carga de informes · 4. Nichos siguientes: RR.HH / Psicolaboral y Colegios |
| **Recursos clave** | 1. Core técnico (canvas digital ya construido) · 2. Equipo de desarrollo · 3. Dataset de dibujos etiquetados · 4. Manuales de los tests + asesoría clínica de psicólogos · 5. Infraestructura en la nube |
| **Canales** | 1. Plataforma web/app (SaaS) — online · 2. Colegio de Psicólogos, congresos y redes profesionales · 3. Universidades (facultades de psicología) · 4. Demo gratuita + contacto directo |
| **Estructura de costes** | 1. Infraestructura cloud + APIs para reconocimiento, transcripción y LLM · 2. Desarrollo y mantenimiento del software de seguridad y cumplimiento de datos de salud · 3. Marketing y captación de usuarios |
| **Fuentes de ingreso** | 1. Suscripción SaaS mensual / anual por psicólogo · 2. Planes por clínica (multiusuario) · 3. Paquetes de tests / informes premium · 4. Métodos de pago: tarjeta y transferencia · 5. Modelo freemium (prueba gratuita → pago) |

### 1.2.2. Análisis del Business Model Canvas

**Socios clave.** El Colegio de Psicólogos del Perú y las universidades con facultad de psicología constituyen los socios estratégicos porque son los canales de validación profesional y de captación de usuarios tempranos. Los psicólogos clínicos colaboradores aportan casos reales de uso que permiten calibrar los indicadores del sistema. Los proveedores de nube e IA (Supabase para base de datos y autenticación, OpenAI Whisper para transcripción, OpenRouter para generación asistida del informe) proveen la infraestructura tecnológica crítica del producto.

**Actividades clave.** El desarrollo y mantenimiento de las dos interfaces sincronizadas en tiempo real (tablet del paciente y panel del examinador) es la actividad central del producto. El modelado de las reglas de cada test —actualmente 201 indicadores del manual PBLL almacenados en la tabla `indicator_catalog`— es lo que diferencia al sistema de un simple formulario. La seguridad y privacidad de datos de salud es obligatoria dado que el sistema maneja información clínica de personas, en parte menores de edad.

**Propuesta de valor.** Psicograma es el único sistema que captura la dimensión temporal del dibujo: orden de trazado, latencia de inicio, pausas, borrados, presión y velocidad, datos que en el procedimiento manual dependen exclusivamente de la observación del examinador y que el dibujo terminado no conserva. Esta diferenciación es imposible de replicar con un escáner o una fotografía del dibujo.

**Relación con el cliente.** El modelo de autoservicio con onboarding y prueba gratuita reduce la barrera de adopción para psicólogos independientes. La comunidad de usuarios permite recopilar retroalimentación continua para mejorar los umbrales del motor de reglas y ampliar la cobertura de indicadores.

**Segmentos de clientes.** El segmento primario son los psicólogos clínicos independientes que aplican el test PBLL con alta frecuencia y sufren la mayor presión de tiempo en la elaboración de informes. Los centros y clínicas de psicología son el segmento de mayor volumen porque concentran varios profesionales que comparten el mismo contexto operativo. Los psicólogos jóvenes con tablet son el early adopter natural porque combinan familiaridad tecnológica con alta carga de informes.

**Recursos clave.** El core técnico del canvas digital —construido sobre la Pointer Events API del navegador con captura de presión a 60 fotogramas por segundo— es el recurso tecnológico más difícil de replicar. Los manuales de los tests y la asesoría clínica de los psicólogos garantizan que las reglas del sistema tengan respaldo en la práctica profesional validada.

**Canales.** La plataforma web como canal principal elimina la necesidad de instalación y permite el acceso desde cualquier dispositivo con navegador. La presencia en el Colegio de Psicólogos y en congresos profesionales es el canal de validación que otorga credibilidad al sistema ante la comunidad científica.

**Estructura de costes.** El coste dominante es la infraestructura cloud, que incluye la base de datos PostgreSQL en Supabase, el almacenamiento privado de archivos de sesión y las llamadas a las APIs de Whisper y OpenRouter por cada informe generado. El desarrollo del software de seguridad y cumplimiento de datos de salud es un coste fijo que protege la confidencialidad clínica de los pacientes.

**Fuentes de ingreso.** El modelo freemium permite que los psicólogos prueben el sistema sin compromiso económico inicial. La suscripción SaaS mensual o anual por psicólogo es la fuente de ingreso recurrente principal. Los planes por clínica con multiusuario atienden a centros con varios profesionales y generan ingresos de mayor valor promedio por cliente.

---

## 1.3. Identificación y descripción del problema

### 1.3.1. Situación problemática

En la práctica cotidiana del Centro Psicológico Ser Integral E.I.R.L., la aplicación e interpretación de los tests proyectivos de dibujo —en particular el test de la Persona bajo la lluvia— se realiza de forma completamente manual. El psicólogo debe medir individualmente el tamaño de la figura, la presión del trazo, la ubicación en la hoja y las características de las líneas, consultando el manual del instrumento durante la sesión. De manera simultánea registra a mano, en papel, las verbalizaciones y las observaciones conductuales producidas durante la sesión y, finalmente, transcribe y ordena toda esa información para redactar el informe definitivo.

Zhang et al. (2024) documentan que la interpretación de estos instrumentos exige el análisis de más de cien características distintas por protocolo. Wen et al. (2025) señalan que los tests proyectivos de dibujo enfrentan de manera persistente criterios de puntuación heterogéneos, una fuerte dependencia de la experiencia subjetiva del examinador y la ausencia de un sistema de codificación cuantitativa unificado.

El tiempo estimado de elaboración del informe en el procedimiento actual oscila entre 45 y 90 minutos por sesión. Este tiempo consume una proporción significativa de la jornada del profesional en un contexto donde la brecha entre demanda y oferta de atención en salud mental alcanza al 80% de la población que requiere atención (Defensoría del Pueblo, 2023).

### 1.3.2. Identificación de causas

El tiempo elevado de elaboración de informes tiene tres causas directas identificadas en el relevamiento del proceso:

**Causa 1 — Doble esfuerzo de registro.** El psicólogo anota observaciones durante la sesión y posteriormente reescribe esa misma información en el informe. Este doble procesamiento de la información no agrega valor clínico y genera una carga de trabajo mecánica que retrasa la entrega de resultados.

**Causa 2 — Pérdida irrecuperable de indicadores temporales.** Querol y Chaves Paz (2004) establecen como criterios interpretativos el tiempo de ejecución, la dificultad para iniciar el dibujo, los momentos de quietud durante la ejecución, la secuencia en que se dibujaron los elementos y los borrados o repasos de líneas realizados. Sin embargo, un dibujo terminado conserva únicamente el resultado final. Esta información se pierde de forma irrecuperable salvo que el examinador la haya anotado manualmente durante la aplicación, lo que depende de su atención y memoria en ese momento.

**Causa 3 — Variabilidad entre evaluadores.** Dado que la medición y la interpretación dependen del criterio y la experiencia de cada evaluador, los resultados presentan variaciones entre profesionales. Esta situación dificulta la estandarización de los informes y complica su revisión y auditoría posterior, generando una documentación clínica poco homogénea.

### 1.3.3. Identificación de consecuencias

Las tres causas descritas producen tres consecuencias que afectan directamente al Centro Psicológico Ser Integral E.I.R.L. y a sus pacientes:

**Consecuencia 1 — Demoras en la entrega de resultados.** El tiempo elevado por informe retrasa la comunicación de los resultados al paciente o a la institución que lo derivó, lo que puede demorar el inicio de intervenciones terapéuticas o educativas pertinentes. En el caso de niños y adolescentes derivados de instituciones educativas, esta demora puede comprometer la oportunidad de la intervención.

**Consecuencia 2 — Sobrecarga en la labor del psicólogo.** El tiempo destinado a tareas mecánicas —medir, registrar, transcribir— es tiempo que el profesional no puede dedicar a la atención directa de pacientes ni al análisis clínico profundo. En un contexto donde la brecha de cobertura en salud mental alcanza al 80% de quienes requieren atención (Defensoría del Pueblo, 2023), esta sobrecarga tiene un impacto directo en la capacidad de respuesta del sistema.

**Consecuencia 3 — Documentación clínica poco homogénea.** La variabilidad entre evaluadores produce informes con distintos niveles de detalle y distintos criterios de aplicación del manual, dificultando la comparabilidad de los resultados entre sesiones y entre profesionales. Esta heterogeneidad complica la supervisión clínica y la investigación dentro del centro.

---

## 1.4. Justificación de la investigación

### 1.4.1. Justificación teórica

La aplicación estandariza los criterios establecidos en el manual del test de la Persona bajo la lluvia (Querol y Chaves Paz, 2004), generando registros trazables y auditables que facilitan la revisión y la homogeneidad de la documentación clínica. La pertinencia de este enfoque se sustenta en la evidencia de que los sistemas de codificación estructurada permiten alcanzar niveles elevados de concordancia entre evaluadores en técnicas gráficas: Gennari y Tamanza (2022) reportaron una concordancia de K = .998 en un sistema de codificación de 19 indicadores para el Dibujo Familiar Conjunto aplicado sobre 117 protocolos.

La solución propuesta se apoya además en los principios de desacoplamiento entre reconocimiento de características e inferencia psicológica establecidos por Wen et al. (2025), y en el principio de trazabilidad de Xie et al. (2024), que exige que todo indicador presentado por el sistema declare el criterio y la sección del manual que lo origina.

La delimitación explícita del alcance frente a la inferencia diagnóstica se sustenta en Lin et al. (2022), quienes concluyen que los indicadores de los tests proyectivos de dibujo no presentan una asociación confiable con problemas de salud mental. Esta limitación no es una decisión de diseño sino una restricción ética incorporada como requerimiento no funcional de cumplimiento del sistema.

### 1.4.2. Justificación metodológica

La especificación de requerimientos del sistema se realiza bajo el estándar IEEE Std 830-1998, que establece las prácticas recomendadas para la elaboración de especificaciones de requerimientos de software. La SRS del proyecto contempla 41 requerimientos funcionales y 30 no funcionales, cada uno trazado a los cinco objetivos específicos del proyecto y a los módulos del sistema.

La medición del efecto de la intervención seguirá un diseño comparativo pre/post implementación. La línea base se establecerá mediante registro directo en el Centro Psicológico Ser Integral E.I.R.L., dado que no se identificaron estudios empíricos peruanos que midan objetivamente el tiempo dedicado a la elaboración de informes de evaluación psicológica. El análisis estadístico previsto utiliza mediana, rango y prueba de Wilcoxon, considerando la magnitud esperada de la muestra.

El diseño del sistema bajo la arquitectura hexagonal garantiza la separabilidad entre la lógica de análisis del test y la tecnología subyacente, principio que permite verificar automáticamente la frontera arquitectónica mediante el script `check-hexagon.sh` y que sustenta la replicabilidad del motor de reglas para otros instrumentos.

### 1.4.3. Justificación práctica

El proyecto responde a una necesidad concreta de la práctica psicológica: la elaboración de informes de tests proyectivos de dibujo consume un tiempo considerable debido al registro manual de los rasgos del dibujo, a la toma de notas en papel durante la sesión y a la posterior transcripción de esa información. Al automatizar las tareas mecánicas del proceso, la aplicación permite que el profesional destine su tiempo al análisis clínico y a la atención del paciente. Esta orientación coincide con los hallazgos de Zhang et al. (2024), quienes plantean que los sistemas de apoyo basados en modelos multimodales permiten aliviar la carga de trabajo del clínico manteniendo los estándares profesionales de la disciplina.

La reducción del tiempo requerido por informe permite al profesional incrementar su capacidad de atención sin ampliar proporcionalmente sus horas de trabajo, optimizando el uso de los recursos disponibles en el centro. Al agilizar el proceso de evaluación, el proyecto contribuye a que un mayor número de pacientes —entre ellos niños y adolescentes derivados de instituciones educativas— acceda oportunamente a sus resultados, favoreciendo intervenciones más tempranas en un contexto donde la brecha de cobertura alcanza al 80% de la población que requiere atención en salud mental (Defensoría del Pueblo, 2023).

---

## 1.5. Objetivos

### 1.5.1. Objetivo general

Desarrollar una aplicación web para reducir el tiempo de elaboración de informes de tests proyectivos de dibujo en la práctica psicológica del Centro Psicológico Ser Integral E.I.R.L., San Juan de Lurigancho, Lima, 2026.

### 1.5.2. Objetivos específicos

1. Analizar el proceso actual de evaluación y elaboración de informes de tests proyectivos de dibujo en el Centro Psicológico Ser Integral E.I.R.L., identificando las actividades manuales que generan mayor consumo de tiempo.
2. Especificar los requerimientos funcionales y no funcionales de la aplicación web bajo el estándar de especificación de requisitos de software (IEEE Std 830-1998).
3. Establecer la arquitectura y las interfaces del sistema, considerando el módulo del paciente para la captura digital del dibujo y el módulo del examinador para el registro de la sesión.
4. Organizar los módulos de captura de trazos, registro de observaciones, transcripción de la sesión y generación del borrador del informe según el formato del test aplicado.
5. Estimar la reducción del tiempo de elaboración de informes obtenida mediante el uso de la aplicación web, comparándola con el tiempo empleado en el procedimiento manual.

---

## 1.6. Alcance de la solución

### 1.6.1. Alcance funcional

El sistema contempla cinco módulos funcionales que cubren el flujo completo de la evaluación:

| Módulo | Funciones incluidas |
|---|---|
| **Gestión de pacientes y sesiones** | Registro, actualización, listado y baja lógica de pacientes; configuración de sesiones mediante asistente de 3 pasos; registro del consentimiento informado; emparejamiento de dispositivos; finalización y cancelación de sesiones |
| **Módulo del paciente (tablet)** | Consigna estandarizada del test PBLL; lienzo digital con lápiz, borrador y deshacer; captura de la dimensión temporal (orden, tiempo, presión, pausas, borrados); pantalla de cierre; ruta persistente para la tablet del consultorio |
| **Módulo del examinador (desktop)** | Espejo del dibujo en tiempo real; 7 métricas en vivo; 6 marcas rápidas con marca de tiempo; observaciones estructuradas con autoguardado; grabación de audio condicionada al consentimiento; transcripción automática con alineación temporal; checklist de verificación profesional en 18 secciones |
| **Módulo de análisis** | Cálculo automático de 7 métricas estructurales; cruce con los 201 indicadores del manual PBLL; sugerencias con nivel de confianza; verificación profesional (aceptar / editar / descartar) |
| **Módulo de informe** | Generación de borrador en 9 secciones; editor clínico estructurado; flujo borrador → validado con registro de responsable; exportación a PDF; historial de informes por paciente; panel de control con indicadores de gestión |

El sistema considera dos perfiles de usuario: el **examinador** (psicólogo colegiado), con acceso al panel completo, y el **paciente**, con acceso restringido únicamente al lienzo de su propia sesión activa.

### 1.6.2. Alcance no funcional

Los requerimientos no funcionales del sistema se organizan en nueve grupos:

| Grupo | Requerimientos clave |
|---|---|
| **Rendimiento** | Espejo del dibujo con latencia < 1 segundo; métricas en vivo actualizadas cada 2 segundos; operaciones de consulta y registro < 2 segundos |
| **Escalabilidad** | Motor de reglas configurable: incorporar un nuevo test no requiere reprogramar la lógica de análisis; servidor sin estado en memoria |
| **Disponibilidad** | Disponible durante el horario de atención del centro; respaldo periódico de la base de datos; tolerancia a desconexión momentánea sin pérdida de trazos |
| **Seguridad** | Datos cifrados en tránsito y en reposo; doble capa de autorización (aplicación + RLS en base de datos); sin credenciales de acceso a BD en el navegador; canales de sincronización privados por sesión |
| **Confidencialidad y cumplimiento** | Consentimiento informado previo a cualquier captura; aislamiento por profesional; supresión o anonimización de datos a solicitud del paciente |
| **Restricciones éticas** | Sin inferencia diagnóstica; validación profesional obligatoria para todo indicador; trazabilidad de cada indicador a su sección del manual; auditoría de validaciones |
| **Usabilidad** | Interfaz en español; optimizada para tablet con lápiz digital (paciente) y para computadora (examinador); sin métricas visibles al paciente durante la sesión |
| **Mantenibilidad** | Separación verificable entre lógica de análisis y tecnología; umbrales calibrables sin modificar el código; migraciones versionadas y reversibles |
| **Compatibilidad** | Tablet con soporte de lápiz digital (módulo paciente); computadora de escritorio (módulo examinador); navegadores con Pointer Events API con presión |

### 1.6.3. Alcance tecnológico

| Capa | Tecnología |
|---|---|
| **Frontend** | React 19 + Vite + TypeScript; Pointer Events API para captura del dibujo; Supabase Realtime Broadcast para sincronización en vivo |
| **Backend** | FastAPI (Python); arquitectura hexagonal (puertos y adaptadores); Alembic para migraciones versionadas |
| **Base de datos** | PostgreSQL 17.6 en Supabase; esquema normalizado a 2FN; 22 tablas; Row Level Security en todas las tablas |
| **Almacenamiento** | Supabase Storage (bucket privado `session-files`) para archivos de audio y trazos |
| **Autenticación** | Supabase Auth con firma ES256 asimétrica; verificación del backend contra JWKS público |
| **Servicios externos** | OpenAI Whisper API (transcripción de audio); OpenRouter (generación asistida del borrador de informe, secciones 5, 7 y 8) |
| **Calidad** | 119 tests automatizados (47 unitarios de dominio + 72 de integración y adaptadores); `check-hexagon.sh` para verificación automática de la frontera arquitectónica |

### 1.6.4. Limitaciones

**De carácter funcional.** El sistema no emite diagnósticos clínicos ni conclusiones definitivas. Su función se restringe a registrar medidas objetivas del dibujo y a sugerir los criterios establecidos en el manual, correspondiendo siempre al psicólogo la interpretación y la validación del informe final. Los apartados del manual referidos a expresiones de conflicto (categoría C) y mecanismos de defensa (categoría D) se excluyen deliberadamente del análisis automatizado, decisión sustentada en Lin et al. (2022).

**De cobertura.** La primera versión abarca únicamente el test de la Persona bajo la lluvia como caso piloto. No incluye otros instrumentos proyectivos (test Casa-Árbol-Persona, Dibujo de la Familia, DFH) ni pruebas psicométricas de distinta naturaleza.

**Técnicas.** Veinte de los indicadores modelados corresponden a criterios que el manual describe en términos de proporción o intensidad sin establecer valores numéricos, por lo que requieren una calibración empírica de umbrales prevista para una segunda versión. La detección automática de elementos gráficos de micro-detalle en dibujos esquemáticos presenta una precisión limitada, motivo por el cual dichos indicadores se presentan como verificación profesional.

**De infraestructura.** El uso del módulo del paciente requiere disponer de una tablet con soporte para lápiz digital y conexión estable a internet durante la sesión.

**De tiempo y alcance académico.** El proyecto se desarrolla dentro del periodo académico correspondiente al curso, por lo que la implementación se limita a una versión funcional inicial, sin abarcar el despliegue comercial ni la certificación clínica del instrumento.

**De disponibilidad de datos previos.** No se identificaron estudios empíricos peruanos que midan objetivamente el tiempo que los profesionales dedican a la elaboración de informes de evaluación psicológica. En consecuencia, la línea base de comparación se establece mediante registro directo sobre la muestra del presente proyecto, por lo que los resultados obtenidos son referenciales y no constituyen una validación clínica del instrumento.

---

## BIBLIOGRAFÍA

Congreso de la República del Perú. (2025). *Nota de información referencial 88/2024-2025-ASISP/DIP: Salud mental*. Departamento de Investigación Parlamentaria, Área de Servicios de Investigación y Seguimiento Presupuestal. https://www3.congreso.gob.pe/Docs/DGP/DIDP/files/nir_88_salud_mental.pdf

Defensoría del Pueblo. (2023, 10 de octubre). *Salud mental no se prioriza en la agenda nacional*. https://www.defensoria.gob.pe/defensoria-del-pueblo-salud-mental-no-se-prioriza-en-la-agenda-nacional/

El Comercio. (2025, 30 de abril). 176 psicólogos por cada 100 mil habitantes: cómo repercute la falta de profesionales en la salud mental de los peruanos. https://elcomercio.pe/bienestar/mente-sana/176-psicologos-por-cada-100-mil-habitantes-como-repercute-la-falta-de-profesionales-en-la-salud-mental-de-los-peruanos-psicoterapia-estigmas-depresion-noticia/

Gennari, M., & Tamanza, G. (2022). The conjoint family drawing: A tool to explore about family relationships. *Frontiers in Psychology*, *13*, 884686. https://doi.org/10.3389/fpsyg.2022.884686

Institute of Electrical and Electronics Engineers. (1998). *IEEE recommended practice for software requirements specifications* (IEEE Std 830-1998). https://standards.ieee.org/ieee/830/1222/

Instituto Nacional de Estadística e Informática. (2023). *Compendio estadístico 2023: Capítulo 6, Salud*. https://www.inei.gob.pe/media/MenuRecursivo/publicaciones_digitales/Est/Compendio2023/cap06/cap06010.xlsx

Lin, Y., Zhang, N., Qu, Y., Li, T., Liu, J., & Song, Y. (2022). The House-Tree-Person test is not valid for the prediction of mental health: An empirical study using deep neural networks. *Acta Psychologica*, *230*, 103734. https://doi.org/10.1016/j.actpsy.2022.103734

Ministerio de Salud. (2025a). *SERUMS: Profesionales de psicología en instituciones educativas*. Gobierno del Perú.

Psiconube. (s.f.). *PBLL Test de Persona Bajo la Lluvia: Corrección con software*. Recuperado el 3 de septiembre de 2026, de https://www.psiconube.cl/es/productos/pbll-test-de-persona-bajo-la-lluvia-correccion-con-software/

Querol, S. M., & Chaves Paz, M. I. (2004). *Test de la persona bajo la lluvia: Adaptación y aplicación* (1.ª ed., 3.ª reimp.). Lugar Editorial.

Santamaría, P., & Sánchez-Sánchez, F. (2022). Cuestiones abiertas en el uso de las nuevas tecnologías en la evaluación psicológica. *Papeles del Psicólogo*, *43*(1), 48–54. https://doi.org/10.23923/pap.psicol.2984

Wen, S., Sun, Y., Ku, B., Gao, Z., Ma, L., Yang, Y., & Jiao, C. (2025). From visual perception to deep empathy: An automated assessment framework for House-Tree-Person drawings using multimodal LLMs and multi-agent collaboration [Preprint]. arXiv. https://doi.org/10.48550/arXiv.2512.21360

Xie, Y., Pan, T., Liu, B., Chen, H., & Liu, W. (2024). Interpretable drawing psychoanalysis via House-Tree-Person test. En T. Liu, G. Webb, L. Yue & D. Wang (Eds.), *AI 2023: Advances in artificial intelligence* (Lecture Notes in Computer Science, vol. 14472, pp. 221–233). Springer. https://doi.org/10.1007/978-981-99-8391-9_18

Zhang, J., Yu, Y., Barra, V., Ruan, X., Chen, Y., & Cai, B. (2024). Feasibility study on using house-tree-person drawings for automatic analysis of depression. *Computer Methods in Biomechanics and Biomedical Engineering*, *27*(9), 1129–1140. https://doi.org/10.1080/10255842.2023.2231113

Zhang, Y., Yang, X., Li, X., Yu, S., Luan, Y., Feng, S., Wang, D., & Zhang, Y. (2024). PsyDraw: A multi-agent multimodal system for mental health screening in left-behind children [Preprint]. arXiv. https://doi.org/10.48550/arXiv.2412.14769
