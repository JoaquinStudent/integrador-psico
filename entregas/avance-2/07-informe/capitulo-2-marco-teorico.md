Facultad de Ingeniería Software y Sistemas

**"Implementación de una aplicación web para reducir el tiempo de elaboración de informes de tests proyectivos de dibujo en la práctica psicológica, Lima, 2026."**

---

# CAPÍTULO 2: MARCO TEÓRICO

## 2.1. Estado del arte

### 2.1.1. Variables de estudio

El presente proyecto trabaja con dos variables. La **variable independiente** es la aplicación web Psicograma, definida como una solución tecnológica de apoyo al psicólogo en la aplicación e interpretación del test de la Persona bajo la lluvia, que captura digitalmente el proceso de trazado, registra las observaciones estructuradas de la sesión y genera un borrador de informe a partir de los indicadores validados por el profesional.

La **variable dependiente** es el tiempo de elaboración de informes de tests proyectivos de dibujo, definida operacionalmente como los minutos transcurridos desde el cierre de la sesión hasta la validación final del informe por el examinador. El indicador de medición es el tiempo en minutos por informe y el porcentaje de reducción obtenido al comparar el procedimiento manual con el asistido por la aplicación. El efecto esperado es una reducción significativa de dicho tiempo (Defensoría del Pueblo, 2023; Congreso de la República del Perú, 2025).

Esta distinción entre variables se sustenta en la estructura del problema identificado: la práctica psicológica enfrenta demoras en la entrega de resultados, sobrecarga en la labor del psicólogo y una documentación clínica poco homogénea, consecuencias directas del procedimiento manual en el que el profesional mide indicadores, registra observaciones en papel y transcribe toda la información para redactar el informe definitivo.

---

### 2.1.2. Antecedentes internacionales

**Zhang et al. (2024) — PsyDraw**

Zhang et al. (2024) desarrollaron PsyDraw, un sistema multiagente basado en modelos multimodales de lenguaje para el análisis de dibujos del test Casa-Árbol-Persona, orientado al tamizaje de salud mental en población infantil de zonas rurales de China. La evaluación se realizó sobre dibujos de 290 estudiantes de primaria, obteniéndose una consistencia alta con las evaluaciones profesionales en el 71.03% de los casos. Los autores destacan además la necesidad de anonimizar los datos y de presentar el sistema como herramienta de apoyo y no como sustituto del profesional. De este trabajo se adoptaron dos criterios aplicados en Psicograma: la descomposición del análisis en agentes especializados por componente y el principio de anonimización previa al procesamiento, implementado mediante el campo `patients.anonymized_at` (migración 001).

**Wen et al. (2025) — Marco automatizado multiagente**

Wen et al. (2025) propusieron un marco automatizado de evaluación de dibujos del test Casa-Árbol-Persona mediante modelos multimodales de lenguaje y colaboración multiagente. El estudio reporta una similitud semántica media de aproximadamente 0.75 entre las interpretaciones del modelo y las de expertos humanos, que se eleva a 0.85 en conjuntos de datos orientados a la estructura. Los autores concluyen que la separación de roles permite desacoplar el reconocimiento de características de la inferencia psicológica. De este trabajo se tomó el principio de desacoplamiento, aplicado en Psicograma mediante la separación entre la capa de detección descriptiva y el motor de reglas interpretativas: las medidas objetivas (tamaño, presión, emplazamiento, latencia, pausas, borrados) se calculan automáticamente, mientras que la interpretación clínica es responsabilidad exclusiva del examinador.

**Xie et al. (2024) — Psicoanálisis interpretable**

Xie et al. (2024) presentaron un método de psicoanálisis interpretable del dibujo aplicado al test Casa-Árbol-Persona, orientado a que los resultados del análisis automatizado resulten explicables para el profesional. De este trabajo se adoptó el principio de trazabilidad, incorporado en Psicograma mediante la obligación de que todo indicador mostrado por el sistema declare el criterio y la sección del manual que lo origina. Los 201 indicadores del manual PBLL almacenados en la tabla `indicator_catalog` contienen el campo `manual_section` que referencia exactamente la sección del manual de Querol y Chaves Paz (2004) que los origina.

**Zhang, J., Yu et al. (2024) — Análisis automático de depresión mediante HTP**

Zhang, J., Yu et al. (2024) evaluaron la viabilidad de emplear dibujos del test Casa-Árbol-Persona para el análisis automático de la depresión. Sobre una muestra de 599 dibujos, extrajeron ocho características gráficas y aplicaron cuatro modelos de aprendizaje automático, alcanzando una precisión de clasificación máxima del 97.2%. El estudio confirma que la extracción automatizada de características gráficas objetivas resulta técnicamente viable, aspecto que sustenta la capa de medición determinista de Psicograma: las 7 métricas estructurales (área ocupada, cuadrícula 3×3 de emplazamiento, presión promedio, tiempo total, latencia de inicio, pausas y borrados) se calculan de forma automática a partir de los trazos capturados.

**Gennari y Tamanza (2022) — Sistema de codificación estructurada**

Gennari y Tamanza (2022) desarrollaron un sistema de codificación estructurada para el Dibujo Familiar Conjunto, compuesto por 10 indicadores de producto y 9 indicadores de proceso, aplicado sobre 117 protocolos. El sistema alcanzó una concordancia entre evaluadores de K = .998. Este antecedente resulta relevante porque demuestra que la estructuración explícita de los criterios de codificación permite reducir la variabilidad interpretativa en técnicas gráficas, y porque distingue formalmente entre indicadores de producto e indicadores de proceso, distinción que Psicograma retoma al separar los indicadores automáticos (23), semautomáticos (25) y de verificación profesional (153).

**Lin et al. (2022) — Validez diagnóstica del HTP**

Lin et al. (2022) examinaron la validez del test Casa-Árbol-Persona para el diagnóstico de problemas de salud mental mediante dos aproximaciones. En primer lugar, revisaron los indicadores diagnósticos reportados en estudios previos, sin hallar asociaciones confiables con los problemas de salud mental estudiados. En segundo lugar, aplicaron redes neuronales profundas sobre dibujos y puntuaciones de depresión de 4 196 niños y adolescentes; si bien las redes lograron extraer características de los objetos representados, no consiguieron clasificar los dibujos de individuos con depresión frente a los de individuos sin ella. Este hallazgo resultó determinante para la delimitación del alcance de Psicograma: el sistema no realiza inferencia diagnóstica alguna, y la sección de conclusiones del informe se entrega vacía para su redacción por el profesional (RNF-17).

**Santamaría y Sánchez-Sánchez (2022) — Tecnología en evaluación psicológica**

Santamaría y Sánchez-Sánchez (2022) analizaron el estado de adopción de las nuevas tecnologías en la evaluación psicológica, aportando datos de uso que evidencian la persistencia del formato de lápiz y papel: en 2021, el 90% de las aplicaciones del SENA, el 85% de las del PAI y el 87% de las del test Matrices se realizaron en ese formato. Los autores advierten además sobre el riesgo de desarrollar herramientas tecnológicas de evaluación al margen del conocimiento psicométrico, y sobre la proliferación de instrumentos ofrecidos directamente al usuario final sin intervención profesional. De este trabajo se adoptaron dos criterios de diseño: la restricción del acceso al sistema exclusivamente a profesionales colegiados (RF-01, RF-03) y la delimitación de la herramienta como apoyo al juicio del psicólogo y no como sustituto de este.

---

### 2.1.3. Antecedentes nacionales

**Defensoría del Pueblo (2023) — Brecha en salud mental**

La Defensoría del Pueblo (2023) advierte que aproximadamente el ochenta por ciento de las personas que requieren atención en salud mental no accede a un tratamiento adecuado en el Perú. Esta brecha coexiste con un volumen creciente de atenciones: según el Repositorio Único Nacional de Información en Salud, durante el año 2024 se registraron 1 863 674 casos de trastornos de salud mental y problemas psicosociales atendidos en establecimientos del sector público (Congreso de la República del Perú, 2025). Este escenario configura una presión directa sobre el tiempo profesional disponible: cada hora que el psicólogo destina a tareas administrativas o mecánicas constituye tiempo que no dedica a la atención de pacientes.

**Instituto Nacional de Estadística e Informática (2023) — Disponibilidad de profesionales**

El Compendio Estadístico del Instituto Nacional de Estadística e Informática (2023) registra 3 372 psicólogos colegiados en ejercicio a nivel nacional en el año 2020. Si bien el Colegio de Psicólogos del Perú reporta cifras de 176 psicólogos por cada cien mil habitantes (El Comercio, 2025), la diferencia se explica porque dicho registro incluye a la totalidad de colegiados con independencia de su condición de actividad. En el ámbito educativo, el Ministerio de Salud (2025a) informa que 1 201 profesionales de psicología prestan servicio en instituciones educativas públicas mediante el programa SERUMS, cifra que evidencia la magnitud de la cobertura requerida.

**Congreso de la República del Perú (2025) — Nota de información referencial sobre salud mental**

La Nota de Información Referencial 88/2024-2025-ASISP/DIP elaborada por el Departamento de Investigación Parlamentaria documenta que durante el año 2024 se registraron más de un millón ochocientos mil casos de trastornos de salud mental atendidos en el sector público peruano. El documento contextualiza la urgencia de optimizar los recursos disponibles en el sistema de salud mental, situación que el presente proyecto aborda al reducir el tiempo que el psicólogo dedica a las tareas mecánicas de la evaluación.

---

### 2.1.4. Antecedentes locales

**Centro Psicológico Ser Integral E.I.R.L. — San Juan de Lurigancho, Lima**

El proyecto se desarrolla en el Centro Psicológico Ser Integral E.I.R.L., ubicado en el distrito de San Juan de Lurigancho, Lima. Este centro constituye el entorno clínico de referencia para el presente estudio. El proceso de relevamiento inicial confirmó que la aplicación e interpretación de los tests proyectivos de dibujo se realiza de forma completamente manual: el psicólogo mide individualmente el tamaño de la figura, la presión del trazo, la ubicación en la hoja y las características de las líneas, consultando el manual del instrumento durante la sesión; registra a mano las observaciones conductuales y las verbalizaciones del paciente; y transcribe posteriormente toda esa información para redactar el informe definitivo.

Este procedimiento presenta tres deficiencias identificadas en el relevamiento: genera un doble esfuerzo de registro que consume tiempo considerable por evaluación; no captura los indicadores temporales del proceso de dibujo que el propio manual del test establece como criterios interpretativos (Querol y Chaves Paz, 2004); y produce variabilidad entre evaluadores, dificultando la estandarización de la documentación clínica.

La línea base de tiempo de elaboración de informes se medirá directamente en este centro mediante registro pre-implementación, dado que no se identificaron estudios empíricos peruanos previos que cuantifiquen objetivamente ese tiempo. La medición pre-implementación está programada para la fase de auditoría del sistema (AUD-05), en la que se registrará: fecha, psicólogo, paciente codificado, hora de inicio, hora de fin e interrupciones. El análisis previsto utiliza mediana, rango y prueba de Wilcoxon, dada la magnitud esperada de la muestra.

**Psiconube — Antecedente comercial local en español**

En el mercado hispanohablante, Psiconube (s.f.) comercializa un software de corrección con generación de informes para el test de la Persona bajo la lluvia. El funcionamiento de esta herramienta se basa en un sistema de formulario en el que el profesional ingresa previamente su interpretación de cada criterio y el software compone el informe resultante. En consecuencia, no realiza análisis alguno sobre el dibujo, ni sobre su resultado final ni sobre su proceso de elaboración, manteniéndose íntegramente en el profesional la carga de medir e interpretar los indicadores del manual. Psicograma se diferencia de esta solución al analizar directamente el proceso de trazado y al extraer automáticamente las medidas objetivas del dibujo.

---

## 2.2. Bases teóricas de la variable independiente

La variable independiente del presente proyecto es la aplicación web **Psicograma**, concebida como una solución tecnológica de apoyo al psicólogo en la evaluación mediante tests proyectivos de dibujo. Sus bases teóricas abarcan los fundamentos de la arquitectura de software adoptada, la tecnología de captura digital del dibujo, los servicios de inteligencia artificial utilizados y la metodología de especificación de requerimientos que rige el desarrollo.

### 2.2.1. Arquitectura hexagonal (Puertos y Adaptadores)

Psicograma adopta la arquitectura hexagonal propuesta por Alistair Cockburn, también denominada Ports and Adapters. En este modelo, la lógica de negocio —el dominio— se ubica en el núcleo de la aplicación, aislada de cualquier detalle tecnológico. Los adaptadores de entrada (API REST, interfaz de usuario) y los adaptadores de salida (base de datos, servicios externos) se conectan al dominio únicamente a través de interfaces definidas (puertos), de modo que la lógica de análisis del test resulta independiente del framework web y del motor de base de datos, y esa separación es verificable de forma automática mediante el script `check-hexagon.sh`.

Esta decisión sustenta dos requerimientos no funcionales del sistema: el RNF-25 (separación entre lógica y tecnología) y el RNF-05 (escalabilidad por instrumento), que permiten incorporar nuevos tests proyectivos cargando sus criterios en la base de datos sin reprogramar la lógica de análisis.

El backend del sistema está implementado en **FastAPI** (Python), framework asíncrono que permite mantener requests abiertas durante 10 a 30 segundos mientras se generan los borradores de informe con el modelo de lenguaje externo. El dominio Python puro contiene la medición objetiva y el motor de reglas, verificados mediante 119 tests automatizados (47 unitarios de dominio sin red y 72 de integración y adaptadores).

### 2.2.2. Base de datos relacional normalizada a segunda forma normal

El esquema de base de datos de Psicograma está normalizado a segunda forma normal (2FN) y consta de 22 tablas desplegadas en PostgreSQL 17.6 a través de Supabase. La normalización resuelve la dependencia parcial que existía en el esquema anterior, donde los 201 indicadores del manual se repetían por sesión. La estructura actual separa las tablas de catálogo (`indicator_catalog`, `manual_sections`, `indicator_categories`, `tests`) de las tablas transaccionales (`session_indicators`), de modo que los indicadores del manual existen como entidad independiente y se relacionan con cada sesión únicamente mediante la tabla puente.

La seguridad de los datos se implementa mediante Row Level Security (RLS) activa en todas las tablas, garantizando el aislamiento por profesional (RNF-15): un examinador solo puede acceder a los pacientes, las sesiones y los informes que él mismo generó. El frontend no dispone de credenciales de acceso directo a la base de datos (RNF-12); toda lectura y escritura pasa por el backend, que propaga la identidad del usuario autenticado mediante `SET LOCAL ROLE authenticated` en cada transacción.

Los cambios estructurales de la base de datos se gestionan mediante migraciones versionadas y reversibles con Alembic (RNF-27), lo que garantiza la trazabilidad y reproducibilidad del esquema en cualquier entorno.

### 2.2.3. Captura digital del proceso de trazado

El módulo de captura del dibujo de Psicograma está implementado en el frontend mediante la **Pointer Events API** del navegador, que permite registrar eventos de puntero (lápiz digital, stylus) con los atributos de posición (x, y), marca de tiempo y presión (`pressure`). El lienzo es un elemento `<canvas>` HTML5 que opera a 60 fotogramas por segundo, implementado como componente React (~90 líneas), adaptado de la librería Ink Playground con reducción de complejidad de 1 563 a 90 líneas de código.

Cada trazo (`stroke`) se define como la secuencia de puntos capturados entre un evento `pointerdown` y el correspondiente `pointerup`, y se almacena en la tabla `strokes` con sus coordenadas, marca temporal y presión punto a punto en un campo JSONB. Esta estructura permite reconstruir automáticamente los indicadores temporales del manual: latencia de inicio (A-5), secuencia de ejecución (A-6), momentos de quietud (TMP-03) y borrados (B-3), información que en el procedimiento manual depende de la observación del examinador y se pierde irrecuperablemente en el dibujo terminado.

La sincronización en tiempo real entre la tablet del paciente y el panel del examinador se implementa mediante **Supabase Realtime Broadcast**, canal WebSocket efímero con latencia menor a 200 milisegundos (RNF-01), que transmite cuatro tipos de evento: `stroke:add`, `stroke:erase`, `metrics:update` y `status:update`.

### 2.2.4. Transcripción automática de audio con Whisper

El módulo de grabación y transcripción de audio utiliza la **API de OpenAI Whisper** para convertir el audio de la sesión en texto segmentado con marcas de tiempo. La grabación se inicia únicamente cuando el consentimiento informado del paciente incluye la autorización explícita para la grabación de audio (RNF-14). Las marcas de tiempo de la transcripción se alinean con el reloj de la sesión mediante la correspondencia entre el offset de la grabación y el inicio de la sesión activa (decisión técnica DT-032), permitiendo cruzar las verbalizaciones del paciente con los eventos del dibujo registrados simultáneamente.

### 2.2.5. Generación asistida del borrador de informe con modelo de lenguaje

El módulo de generación del borrador de informe utiliza la API de **OpenRouter** para redactar las secciones 5 (análisis de indicadores), 7 (síntesis) y 8 (recomendaciones) del informe estructurado en nueve secciones. El adaptador incluye un mecanismo de fallback determinista que garantiza que ninguna sección quede vacía ante una falla de red o del servicio externo (decisión técnica DT-030). Las secciones generadas con asistencia del modelo de lenguaje se marcan visualmente en el editor para que el profesional pueda distinguirlas del contenido que él mismo ha redactado (RF-36).

El sistema no emite diagnósticos clínicos: la sección de conclusiones del informe se entrega vacía para su redacción exclusiva por el psicólogo (RNF-17), y ningún indicador propuesto por el sistema puede incorporarse al informe sin la validación explícita del examinador (RNF-18).

### 2.2.6. Especificación de Requerimientos de Software (IEEE Std 830-1998)

Los requerimientos del sistema se especifican bajo el estándar IEEE Std 830-1998, que establece las prácticas recomendadas para la elaboración de especificaciones de requerimientos de software (SRS). La SRS del proyecto contempla 41 requerimientos funcionales (RF-01 a RF-41) y 30 requerimientos no funcionales (RNF-01 a RNF-30), organizados en nueve grupos: rendimiento, escalabilidad, disponibilidad y confiabilidad, seguridad, confidencialidad y cumplimiento, restricciones éticas y trazabilidad clínica, usabilidad, mantenibilidad y compatibilidad. Cada requerimiento está trazado a los cinco objetivos específicos del proyecto y a los módulos del sistema.

---

## 2.3. Bases teóricas de la variable dependiente

La variable dependiente del proyecto es el **tiempo de elaboración de informes de tests proyectivos de dibujo**, medido en minutos por informe, desde el cierre de la sesión de evaluación hasta la validación final del informe por el psicólogo.

### 2.3.1. Tests proyectivos de dibujo

Los tests proyectivos de dibujo constituyen una de las técnicas de evaluación psicológica de mayor difusión a nivel mundial. Se definen como procedimientos en los que el sujeto es invitado a producir un dibujo libre ante una consigna abierta, con el fin de que proyecte en él su organización psíquica, su imagen corporal y sus modos de afrontamiento frente a situaciones de tensión. Entre los instrumentos más utilizados se encuentran el test Casa-Árbol-Persona, propuesto originalmente por Buck (1948), y el test de la Persona bajo la lluvia, adaptado y sistematizado por Querol y Chaves Paz (2004), que constituye el instrumento piloto del presente proyecto.

Su extensión en la práctica clínica se sustenta en sus menores exigencias de expresión verbal, lo que los hace especialmente útiles con población infantil y con personas con dificultades de comunicación. Sin embargo, presentan limitaciones ampliamente documentadas: criterios de puntuación heterogéneos, dependencia de la experiencia subjetiva del examinador y ausencia de un sistema de codificación cuantitativa unificado (Wen et al., 2025; Zhang et al., 2024).

### 2.3.2. Test de la Persona bajo la lluvia (PBLL)

El test de la Persona bajo la lluvia, en su versión adaptada por Querol y Chaves Paz (2004), solicita al evaluado que dibuje una persona bajo la lluvia sobre una hoja de papel tamaño carta (22 × 28 cm), entregada en posición horizontal. La consigna es deliberadamente abierta para maximizar la proyección del evaluado.

El manual organiza la interpretación en cuatro categorías:

| Categoría | Nombre | Secciones del manual |
|---|---|---|
| **A** | Recursos expresivos | A-1 Dimensiones, A-2 Emplazamiento, A-3 Trazos, A-4 Presión, A-5 Tiempo, A-6 Secuencia, A-7 Movimiento, A-8 Sombreados |
| **B** | Análisis de contenido | B-1 Orientación, B-2 Posturas, B-3 Borrados, B-4 Repaso de líneas, B-5 Detalles accesorios, B-6 Vestimenta, B-7 Paraguas, B-8 Reemplazo del paraguas, B-9 Partes del cuerpo, B-10 Identidad sexual, B-11 Personaje |
| **C** | Expresiones de conflicto | C-1 a C-11 |
| **D** | Mecanismos de defensa | D-1 a D-7 |

El sistema Psicograma modela los indicadores de las categorías A y B. Los indicadores de las categorías C y D se excluyen deliberadamente del análisis automatizado, decisión sustentada en los hallazgos de Lin et al. (2022), quienes concluyen que los indicadores de los tests proyectivos de dibujo no presentan una asociación confiable con problemas de salud mental, lo que hace inviable su inferencia automática sin intervención del criterio clínico del profesional.

El manual establece un total de indicadores que el sistema Psicograma implementa en 201 unidades codificadas, clasificadas según el tipo de detección posible:

| Tipo de detección | Cantidad | Descripción |
|---|---|---|
| Automática | 23 | Indicadores que el sistema calcula directamente a partir de las métricas objetivas del trazo |
| Semiautomática | 25 | Indicadores para los que el sistema propone una sugerencia basada en medidas con nivel de confianza explícito |
| Verificación profesional | 153 | Indicadores que requieren juicio visual o clínico del examinador y se presentan como checklist |

### 2.3.3. Indicadores temporales y su relevancia para el presente proyecto

Las secciones A-5 (Tiempo) y A-6 (Secuencia) del manual establecen indicadores que dependen de la observación directa del proceso de dibujo: la dificultad para comenzar (TMP-01), los momentos de quietud (TMP-03), la velocidad de ejecución (TMP-04 a TMP-07) y la parte del cuerpo con la que el evaluado inicia el dibujo (SEC-01 a SEC-04). Asimismo, la sección B-3 incluye indicadores relacionados con los borrados realizados durante la ejecución.

En el procedimiento manual, estos indicadores solo quedan registrados si el examinador los anotó durante la sesión, lo que depende de su atención y memoria en ese momento y constituye una fuente de pérdida de información clínicamente relevante. Un dibujo terminado conserva únicamente el resultado final; la información temporal se pierde de forma irrecuperable (Querol y Chaves Paz, 2004).

Psicograma resuelve esta limitación capturando automáticamente, mediante la Pointer Events API, los datos temporales de cada trazo: instante de inicio y fin, presión punto a punto y posición de cada punto. A partir de estos datos, el sistema calcula de forma determinista la latencia de inicio, las pausas entre trazos, la secuencia de ejecución, el conteo de borrados y las métricas de presión y velocidad, sin depender de la observación manual del examinador. Este es el aporte diferencial central de Psicograma frente al estado del arte existente.

### 2.3.4. Proceso manual de elaboración de informes y sus deficiencias

En la práctica cotidiana, la elaboración de informes de tests proyectivos de dibujo implica tres etapas secuenciales que generan el tiempo elevado de la variable dependiente:

1. **Registro durante la sesión:** El psicólogo mide manualmente el tamaño de la figura, la presión del trazo, la ubicación en la hoja y las características de las líneas, mientras simultáneamente observa el proceso de dibujo y registra las verbalizaciones y conductas del paciente en papel.

2. **Puntuación y aplicación del manual:** Al concluir la sesión, el profesional consulta el manual para aplicar los criterios a cada indicador observado, proceso que Zhang et al. (2024) documentan como el análisis de más de cien características distintas por protocolo.

3. **Redacción del informe:** El psicólogo transcribe y ordena toda la información recopilada para redactar el informe definitivo en el formato correspondiente al test aplicado.

Este procedimiento genera un doble esfuerzo de registro —el profesional anota durante la sesión y posteriormente reescribe esa misma información en el informe— que retrasa la entrega de resultados y limita la cantidad de evaluaciones que el centro puede procesar en un periodo determinado.

La automatización de las etapas de registro y puntuación, manteniendo al profesional como responsable de la validación e interpretación clínica, es la hipótesis de trabajo central del proyecto: el uso de Psicograma reduce el tiempo de elaboración de informes del test PBLL en comparación con el procedimiento manual en el Centro Psicológico Ser Integral E.I.R.L.

---

## BIBLIOGRAFÍA

Buck, J. N. (1948). The H-T-P test. *Journal of Clinical Psychology*, *4*(2), 151–159.

Congreso de la República del Perú. (2025). *Nota de información referencial 88/2024-2025-ASISP/DIP: Salud mental*. Departamento de Investigación Parlamentaria, Área de Servicios de Investigación y Seguimiento Presupuestal. https://www3.congreso.gob.pe/Docs/DGP/DIDP/files/nir_88_salud_mental.pdf

Defensoría del Pueblo. (2023, 10 de octubre). *Salud mental no se prioriza en la agenda nacional*. https://www.defensoria.gob.pe/defensoria-del-pueblo-salud-mental-no-se-prioriza-en-la-agenda-nacional/

El Comercio. (2025, 30 de abril). 176 psicólogos por cada 100 mil habitantes: cómo repercute la falta de profesionales en la salud mental de los peruanos. https://elcomercio.pe/bienestar/mente-sana/176-psicologos-por-cada-100-mil-habitantes-como-repercute-la-falta-de-profesionales-en-la-salud-mental-de-los-peruanos-psicoterapia-estigmas-depresion-noticia/

Gennari, M., & Tamanza, G. (2022). The conjoint family drawing: A tool to explore about family relationships. *Frontiers in Psychology*, *13*, 884686. https://doi.org/10.3389/fpsyg.2022.884686

Instituto Nacional de Estadística e Informática. (2023). *Compendio estadístico 2023: Capítulo 6, Salud*. https://www.inei.gob.pe/media/MenuRecursivo/publicaciones_digitales/Est/Compendio2023/cap06/cap06010.xlsx

Lin, Y., Zhang, N., Qu, Y., Li, T., Liu, J., & Song, Y. (2022). The House-Tree-Person test is not valid for the prediction of mental health: An empirical study using deep neural networks. *Acta Psychologica*, *230*, 103734. https://doi.org/10.1016/j.actpsy.2022.103734

Psiconube. (s.f.). *PBLL Test de Persona Bajo la Lluvia: Corrección con software*. Recuperado el 3 de septiembre de 2026, de https://www.psiconube.cl/es/productos/pbll-test-de-persona-bajo-la-lluvia-correccion-con-software/

Querol, S. M., & Chaves Paz, M. I. (2004). *Test de la persona bajo la lluvia: Adaptación y aplicación* (1.ª ed., 3.ª reimp.). Lugar Editorial.

Santamaría, P., & Sánchez-Sánchez, F. (2022). Cuestiones abiertas en el uso de las nuevas tecnologías en la evaluación psicológica. *Papeles del Psicólogo*, *43*(1), 48–54. https://doi.org/10.23923/pap.psicol.2984

Wen, S., Sun, Y., Ku, B., Gao, Z., Ma, L., Yang, Y., & Jiao, C. (2025). From visual perception to deep empathy: An automated assessment framework for House-Tree-Person drawings using multimodal LLMs and multi-agent collaboration [Preprint]. arXiv. https://doi.org/10.48550/arXiv.2512.21360

Xie, Y., Pan, T., Liu, B., Chen, H., & Liu, W. (2024). Interpretable drawing psychoanalysis via House-Tree-Person test. En T. Liu, G. Webb, L. Yue & D. Wang (Eds.), *AI 2023: Advances in artificial intelligence* (Lecture Notes in Computer Science, vol. 14472, pp. 221–233). Springer. https://doi.org/10.1007/978-981-99-8391-9_18

Zhang, J., Yu, Y., Barra, V., Ruan, X., Chen, Y., & Cai, B. (2024). Feasibility study on using house-tree-person drawings for automatic analysis of depression. *Computer Methods in Biomechanics and Biomedical Engineering*, *27*(9), 1129–1140. https://doi.org/10.1080/10255842.2023.2231113

Zhang, Y., Yang, X., Li, X., Yu, S., Luan, Y., Feng, S., Wang, D., & Zhang, Y. (2024). PsyDraw: A multi-agent multimodal system for mental health screening in left-behind children [Preprint]. arXiv. https://doi.org/10.48550/arXiv.2412.14769
