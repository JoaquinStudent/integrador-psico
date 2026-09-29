Facultad de Ingeniería Software y Sistemas

Título

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

**ÍNDICE**

# CAPÍTULO 1: ASPECTOS GENERALES

## 1.1. Definición del problema

### 1.1.1. Descripción del problema

**Contexto internacional**

Los tests proyectivos de dibujo constituyen una de las técnicas de evaluación psicológica de mayor difusión a nivel mundial. Entre ellos, el test Casa-Árbol-Persona, propuesto originalmente por Buck (1948), y el test de la Persona bajo la lluvia, adaptado y sistematizado por Querol y Chaves Paz (2004), se aplican de forma habitual en los ámbitos clínico, educacional y forense, debido a que sus menores exigencias de expresión verbal los hacen especialmente útiles con población infantil y con personas con dificultades de comunicación.

No obstante su extensión, estas técnicas presentan una limitación ampliamente documentada. Wen et al. (2025) señalan que los tests proyectivos de dibujo enfrentan de manera persistente criterios de puntuación heterogéneos, una fuerte dependencia de la experiencia subjetiva del examinador y la ausencia de un sistema de codificación cuantitativa unificado. En la misma línea, Zhang et al. (2024) indican que la interpretación de estos instrumentos exige un conocimiento profesional extenso y supone habitualmente el análisis de más de cien características distintas por protocolo, lo que dificulta su aplicación sistemática.

A esta dificultad se suma el escaso avance en la digitalización de los instrumentos de evaluación. Santamaría y Sánchez-Sánchez (2022) documentan que, en el año 2021, el noventa por ciento de las aplicaciones del SENA y el ochenta y cinco por ciento de las del PAI, dos de las pruebas más utilizadas en evaluación psicológica, se realizaron en formato de lápiz y papel. Los mismos autores señalan que las encuestas sobre uso de tecnologías sitúan a los profesionales de la psicología en una posición predominante de mayoría tardía o de rezagados en la adopción tecnológica.

**Contexto nacional**

En el Perú, la demanda de servicios de salud mental supera de forma sostenida la capacidad de respuesta del sistema. La Defensoría del Pueblo (2023) advierte que aproximadamente el ochenta por ciento de las personas que requieren atención en salud mental no accede a un tratamiento adecuado. Esta brecha convive con un volumen creciente de atenciones: según el Repositorio Único Nacional de Información en Salud, durante el año 2024 se registraron 1 863 674 casos de trastornos de salud mental y problemas psicosociales atendidos en establecimientos del sector público (Congreso de la República del Perú, 2025).

La disponibilidad de profesionales resulta limitada frente a dicha demanda. De acuerdo con el Compendio Estadístico del Instituto Nacional de Estadística e Informática (2023), en el año 2020 se registraron 3 372 psicólogos colegiados en ejercicio a nivel nacional. Si bien el Colegio de Psicólogos del Perú reporta cifras considerablemente mayores de profesionales colegiados, equivalentes a 176 psicólogos por cada cien mil habitantes (El Comercio, 2025), la diferencia se explica porque dicho registro incluye a la totalidad de colegiados, con independencia de su condición de actividad. En el ámbito educativo, el Ministerio de Salud (2025a) informa que 1 201 profesionales de psicología prestan servicio en instituciones educativas públicas mediante el programa SERUMS, cifra que evidencia la magnitud de la cobertura requerida.

Este escenario configura una presión directa sobre el tiempo profesional disponible: cada hora que el psicólogo destina a tareas administrativas o mecánicas constituye tiempo que no dedica a la atención de pacientes en un contexto de brecha estructural.

**Problema en la práctica profesional**

En la práctica cotidiana, la aplicación e interpretación de los tests proyectivos de dibujo se realiza de forma manual y artesanal. El psicólogo debe medir individualmente el tamaño de la figura, la presión del trazo, la ubicación en la hoja y las características de las líneas, consultando un manual distinto según el instrumento aplicado. De manera simultánea registra a mano, en papel, las verbalizaciones y las observaciones conductuales producidas durante la sesión y, finalmente, transcribe y ordena toda esa información para redactar el informe definitivo.

Este procedimiento presenta tres deficiencias que afectan directamente al proceso de evaluación.

En primer lugar, genera un doble esfuerzo de registro y consume un tiempo considerable por evaluación. El profesional anota durante la sesión y posteriormente reescribe esa misma información en el informe, lo que retrasa la entrega de resultados y limita la cantidad de evaluaciones que puede procesar en un periodo determinado.

En segundo lugar, un conjunto de indicadores establecidos por el propio manual del instrumento no queda registrado en el soporte de papel. Querol y Chaves Paz (2004) establecen como criterios interpretativos el tiempo de ejecución, la dificultad para iniciar el dibujo, los momentos de quietud durante la ejecución, la secuencia en que se dibujaron los elementos y los borrados o repasos de líneas realizados. Sin embargo, un dibujo terminado conserva únicamente el resultado final. Esta información se pierde de forma irrecuperable salvo que el examinador la haya anotado manualmente durante la aplicación, lo que depende de su atención y memoria en ese momento.

En tercer lugar, dado que la medición y la interpretación dependen del criterio y la experiencia de cada evaluador, los resultados presentan variaciones entre profesionales. Esta situación dificulta la estandarización de los informes y complica su revisión y auditoría posterior.

Como consecuencia, la práctica profesional enfrenta demoras en la entrega de resultados, sobrecarga en la labor del psicólogo y una documentación clínica poco homogénea. Ante esta situación, se hace necesaria una herramienta tecnológica que reduzca el tiempo dedicado a las tareas mecánicas del proceso de evaluación y elaboración de informes, y que estandarice la aplicación de los criterios del manual sin sustituir el juicio profesional del psicólogo.

### Visión del proyecto

Ser reconocida al año 2030 como la herramienta de referencia para la aplicación e interpretación de tests proyectivos de dibujo en el ámbito psicológico hispanohablante, incorporando de forma progresiva los principales instrumentos gráficos utilizados en la práctica profesional.

### Misión del proyecto

Reducir el tiempo que los psicólogos destinan a las tareas mecánicas de la evaluación de tests proyectivos de dibujo, mediante la captura digital del proceso de trazado y la aplicación consistente de los criterios del manual, potenciando el trabajo del profesional sin reemplazar su criterio clínico.

### Entorno

El proyecto se inserta en un contexto caracterizado por una demanda creciente de servicios de salud mental, una disponibilidad limitada de profesionales y un bajo nivel de digitalización de los instrumentos de evaluación. En el mercado hispanohablante existen soluciones comerciales orientadas a la generación de informes psicológicos, aunque operan mediante formularios que el profesional completa previamente, sin analizar el dibujo. En el ámbito académico, los desarrollos disponibles se concentran en el test Casa-Árbol-Persona y provienen mayoritariamente de instituciones asiáticas, con enfoque diagnóstico y sobre imágenes estáticas.

### Estrategias

Se han definido cuatro líneas estratégicas para el desarrollo de la solución:

Primera, la especialización en profundidad antes que en extensión: se implementa un único instrumento, el test de la Persona bajo la lluvia, hasta lograr un funcionamiento completo, antes de incorporar cualquier otro.

Segunda, la diferenciación mediante la captura del proceso de elaboración del dibujo, atendiendo aquellos indicadores del manual que el soporte de papel no permite registrar.

Tercera, el diseño bajo una arquitectura de motor de reglas configurable, que permita incorporar nuevos instrumentos mediante la carga de sus criterios, sin necesidad de reprogramar el sistema.

Cuarta, la delimitación explícita del alcance a funciones de apoyo profesional, excluyendo de forma permanente toda inferencia de carácter diagnóstico.

### Planes

El desarrollo se organiza en cuatro fases sucesivas. La primera comprende la planificación y el análisis de requisitos. La segunda abarca el diseño de la solución y la construcción del módulo de captura del dibujo. La tercera corresponde al desarrollo del motor de análisis y del generador de informes. La cuarta contempla las pruebas, el despliegue y la medición del tiempo de elaboración de informes frente al procedimiento manual. La incorporación de instrumentos adicionales, así como la calibración empírica de los indicadores que requieren umbrales, se proyecta para fases posteriores.

## 1.2. Definición de objetivos

### 1.2.1. Objetivo general

Desarrollar una aplicación web para reducir el tiempo de elaboración de informes de tests proyectivos de dibujo en la práctica psicológica profesional, durante el año 2026.

### 1.2.2. Objetivos específicos

- Analizar el proceso actual de evaluación y elaboración de informes de tests proyectivos de dibujo, identificando las actividades manuales que generan mayor consumo de tiempo.
- Especificar los requerimientos funcionales y no funcionales de la aplicación web bajo el estándar de especificación de requisitos de software (IEEE, 1998).
- Establecer la arquitectura y las interfaces del sistema, considerando el módulo del paciente para la captura digital del dibujo y el módulo del examinador para el registro de la sesión.
- Organizar los módulos de captura de trazos, registro de observaciones, transcripción de la sesión y generación del borrador del informe según el formato del test aplicado.
- Estimar la reducción del tiempo de elaboración de informes obtenida mediante el uso de la aplicación web, comparándola con el tiempo empleado en el procedimiento manual.

### 1.2.3. Alcances y limitaciones

**Alcances**

El presente proyecto comprende el desarrollo de una aplicación web destinada a apoyar al psicólogo en el proceso de evaluación y elaboración de informes de tests proyectivos de dibujo. El alcance funcional contempla los siguientes elementos:

Ámbito de aplicación. El sistema está dirigido a psicólogos colegiados que aplican tests proyectivos de dibujo en su práctica profesional, ya sea en consultorios independientes o en centros de atención psicológica.

Test considerado. La presente versión implementa el test de la Persona bajo la lluvia como caso piloto, por ser uno de los instrumentos proyectivos de dibujo de mayor aplicación en el medio local. El sistema se diseña bajo una arquitectura de motor de reglas configurable, que permite la incorporación de otros tests en fases posteriores.

Módulos del sistema. Se contempla un módulo de gestión de pacientes y sesiones, un módulo de paciente para la captura digital del dibujo, un módulo de examinador con el registro estructurado de la sesión, un módulo de procesamiento que extrae las medidas objetivas del trazo, y un módulo de generación del borrador de informe.

Indicadores procesados. El sistema modela ciento cuarenta y nueve indicadores establecidos por Querol y Chaves Paz (2004). De estos, setenta y seis se procesan de forma automática y treinta y cinco se presentan como checklist estructurado de verificación profesional.

Usuarios. El sistema considera dos perfiles: el examinador, con acceso al panel de análisis y a los informes, y el paciente, con acceso restringido únicamente al lienzo de dibujo durante su sesión.

Resultado esperado. El sistema entrega un borrador de informe editable, que el psicólogo revisa, ajusta y valida antes de su emisión final, manteniendo en todo momento el criterio profesional sobre la interpretación.

Plataforma. La solución se desarrolla como aplicación web responsiva, accesible desde tablet con lápiz digital para el paciente y desde computadora o dispositivo móvil para el examinador.

**Limitaciones**

De carácter funcional. El sistema no emite diagnósticos clínicos ni conclusiones definitivas. Su función se restringe a registrar medidas objetivas del dibujo y a sugerir los criterios establecidos en el manual, correspondiendo siempre al psicólogo la interpretación y la validación del informe final. En consecuencia, los apartados del manual referidos a expresiones de conflicto y a mecanismos de defensa se excluyen deliberadamente del sistema. Esta decisión se sustenta en los hallazgos de Lin et al. (2022), quienes concluyen que los indicadores de los tests proyectivos de dibujo no presentan una asociación confiable con problemas de salud mental.

De cobertura. La primera versión abarca únicamente el test de la Persona bajo la lluvia, por lo que no incluye otros instrumentos proyectivos ni pruebas psicométricas de distinta naturaleza.

Técnicas. Veinte de los indicadores modelados corresponden a criterios que el manual describe en términos de proporción o intensidad sin establecer valores numéricos, por lo que requieren una calibración empírica de umbrales prevista para una segunda versión. Asimismo, la detección automática de elementos gráficos de micro-detalle en dibujos esquemáticos presenta una precisión limitada, motivo por el cual dichos indicadores se presentan como verificación profesional.

De infraestructura. El uso del módulo del paciente requiere disponer de una tablet con soporte para lápiz digital y conexión estable a internet durante la sesión.

De tiempo y alcance académico. El proyecto se desarrolla dentro del periodo académico correspondiente al curso, por lo que la implementación se limita a una versión funcional inicial, sin abarcar el despliegue comercial ni la certificación clínica del instrumento.

De disponibilidad de datos previos. No se identificaron estudios empíricos peruanos que midan objetivamente el tiempo que los profesionales dedican a la elaboración de informes de evaluación psicológica. En consecuencia, la línea base de comparación se establece mediante registro directo sobre la muestra del presente proyecto, por lo que los resultados obtenidos son referenciales y no constituyen una validación clínica del instrumento.

### 1.2.4. Justificación

**Justificación práctica**

El proyecto responde a una necesidad concreta de la práctica psicológica: la elaboración de informes de tests proyectivos de dibujo consume un tiempo considerable debido al registro manual de los rasgos del dibujo, a la toma de notas en papel durante la sesión y a la posterior transcripción de esa información. Al automatizar las tareas mecánicas del proceso, la aplicación permite que el profesional destine su tiempo al análisis clínico y a la atención del paciente. Esta orientación coincide con los hallazgos de Zhang et al. (2024), quienes plantean que los sistemas de apoyo basados en modelos multimodales permiten aliviar la carga de trabajo del clínico manteniendo los estándares profesionales de la disciplina.

**Justificación económica**

La reducción del tiempo requerido por informe permite al profesional incrementar su capacidad de atención sin ampliar proporcionalmente sus horas de trabajo, optimizando el uso de los recursos disponibles. Este aspecto adquiere relevancia particular en el contexto peruano, donde la brecha entre la demanda de atención y la disponibilidad de profesionales alcanza al ochenta por ciento de las personas que requieren atención en salud mental (Defensoría del Pueblo, 2023).

**Justificación social**

Durante el año 2024 se registraron más de un millón ochocientos mil casos de trastornos de salud mental atendidos en el sector público peruano (Congreso de la República del Perú, 2025), y 1 201 profesionales de psicología prestan servicio en instituciones educativas públicas (Congreso de la República del Perú, 2025). Al agilizar el proceso de evaluación, el proyecto contribuye a que un mayor número de pacientes, entre ellos niños y adolescentes derivados de instituciones educativas, acceda oportunamente a sus resultados, favoreciendo intervenciones más tempranas.

**Justificación tecnológica**

Santamaría y Sánchez-Sánchez (2022) reportan que en 2021 el noventa por ciento de las aplicaciones del SENA y el ochenta y siete por ciento de las del test Matrices se realizaron en formato de lápiz y papel, pese a la disponibilidad de alternativas informatizadas. La solución propuesta incorpora captura y reconocimiento de trazos digitales que permiten registrar no solo el resultado final del dibujo, sino también variables objetivas de su proceso de elaboración, tales como el tamaño, la presión, la ubicación, el orden y el tiempo de trazado. Adicionalmente, el diseño bajo una arquitectura de motor de reglas configurable garantiza la escalabilidad hacia otros instrumentos.

**Justificación metodológica y ética**

La aplicación estandariza los criterios establecidos en el manual del test, generando registros trazables y auditables que facilitan la revisión y la homogeneidad de la documentación clínica. La pertinencia de este enfoque se sustenta en la evidencia de que los sistemas de codificación estructurada permiten alcanzar niveles elevados de concordancia entre evaluadores en técnicas gráficas (Gennari & Tamanza, 2022). Cabe precisar que la herramienta ha sido concebida como un instrumento de apoyo al profesional: no emite diagnósticos ni sustituye el juicio clínico del psicólogo, quien mantiene en todo momento la responsabilidad sobre la interpretación y la validación del informe final.

### 1.2.5. Estado del arte

**Soluciones comerciales existentes**

En el mercado hispanohablante se comercializan diversas soluciones de corrección asistida para el test de la Persona bajo la lluvia. Entre ellas se identificó la ofrecida por Psiconube (s.f.), que incluye un software de corrección con generación ilimitada de informes para el mismo instrumento abordado en el presente proyecto. El funcionamiento de estas herramientas se basa en un sistema de formulario en el que el profesional ingresa previamente su interpretación de cada criterio y el software compone el informe resultante. En consecuencia, ninguna de ellas realiza análisis alguno sobre el dibujo, ni sobre su resultado final ni sobre su proceso de elaboración, manteniéndose íntegramente en el profesional la carga de medir e interpretar los indicadores del manual.

**Antecedentes académicos**

Zhang et al. (2024) desarrollaron PsyDraw, un sistema multiagente basado en modelos multimodales de lenguaje para el análisis de dibujos del test Casa-Árbol-Persona, orientado al tamizaje de salud mental en población infantil de zonas rurales de China. La evaluación se realizó sobre dibujos de 290 estudiantes de primaria, obteniéndose una consistencia alta con las evaluaciones profesionales en el 71.03% de los casos. Los autores destacan además la necesidad de anonimizar los datos y de presentar el sistema como herramienta de apoyo y no como sustituto del profesional. De este trabajo se adoptaron dos criterios: la descomposición del análisis en agentes especializados por componente y el principio de anonimización previa al procesamiento.

Wen et al. (2025) propusieron un marco automatizado de evaluación de dibujos del test Casa-Árbol-Persona mediante modelos multimodales de lenguaje y colaboración multiagente. El estudio reporta una similitud semántica media de aproximadamente 0.75 entre las interpretaciones del modelo y las de expertos humanos, que se eleva a 0.85 en conjuntos de datos orientados a la estructura. Los autores concluyen que la separación de roles permite desacoplar el reconocimiento de características de la inferencia psicológica. De este trabajo se tomó precisamente ese principio de desacoplamiento, aplicado en el presente proyecto mediante la separación entre la capa de detección descriptiva y el motor de reglas interpretativas.

Xie et al. (2024) presentaron un método de psicoanálisis interpretable del dibujo aplicado al test Casa-Árbol-Persona, orientado a que los resultados del análisis automatizado resulten explicables para el profesional. De este trabajo se adoptó el principio de trazabilidad, incorporado mediante la obligación de que todo indicador mostrado por el sistema declare el criterio y la sección del manual que lo origina.

Zhang, J., Yu et al. (2024) evaluaron la viabilidad de emplear dibujos del test Casa-Árbol-Persona para el análisis automático de la depresión. Sobre una muestra de 599 dibujos, extrajeron ocho características gráficas y aplicaron cuatro modelos de aprendizaje automático, alcanzando una precisión de clasificación máxima del 97.2%. El estudio confirma que la extracción automatizada de características gráficas objetivas resulta técnicamente viable, aspecto que sustenta la capa de medición determinista del presente proyecto.

Gennari y Tamanza (2022) desarrollaron un sistema de codificación estructurada para el Dibujo Familiar Conjunto, compuesto por 10 indicadores de producto y 9 indicadores de proceso, aplicado sobre 117 protocolos. El sistema alcanzó una concordancia entre evaluadores de K = .998. Este antecedente resulta relevante porque demuestra que la estructuración explícita de los criterios de codificación permite reducir la variabilidad interpretativa en técnicas gráficas, y porque distingue formalmente entre indicadores de producto e indicadores de proceso, distinción que el presente proyecto retoma.

Lin et al. (2022) examinaron la validez del test Casa-Árbol-Persona para el diagnóstico de problemas de salud mental mediante dos aproximaciones. En primer lugar, revisaron los indicadores diagnósticos reportados en estudios previos, sin hallar asociaciones confiables con los problemas de salud mental estudiados. En segundo lugar, aplicaron redes neuronales profundas sobre dibujos y puntuaciones de depresión de 4 196 niños y adolescentes; si bien las redes lograron extraer características de los objetos representados, no consiguieron clasificar los dibujos de individuos con depresión frente a los de individuos sin ella. Este hallazgo resultó determinante para la delimitación del alcance del presente proyecto: la solución propuesta no realiza inferencia diagnóstica alguna.

Santamaría y Sánchez-Sánchez (2022) analizaron el estado de adopción de las nuevas tecnologías en la evaluación psicológica, aportando datos de uso que evidencian la persistencia del formato de lápiz y papel: en 2021, el 90% de las aplicaciones del SENA, el 85% de las del PAI y el 87% de las del test Matrices se realizaron en ese formato. Los autores advierten además sobre el riesgo de desarrollar herramientas tecnológicas de evaluación al margen del conocimiento psicométrico, y sobre la proliferación de instrumentos ofrecidos directamente al usuario final sin intervención profesional. De este trabajo se adoptaron dos criterios de diseño: la restricción del acceso al sistema exclusivamente a profesionales colegiados y la delimitación de la herramienta como apoyo al juicio del psicólogo y no como sustituto de este.

**Aporte diferencial del proyecto**

El análisis del estado del arte permite identificar tres vacíos. En primer lugar, las soluciones comerciales disponibles en español no procesan el dibujo, limitándose a componer informes a partir de formularios. En segundo lugar, los desarrollos académicos se concentran de manera casi exclusiva en el test Casa-Árbol-Persona, sin abordar el test de la Persona bajo la lluvia, de amplia aplicación en el ámbito hispanohablante. En tercer lugar, y de manera central, ninguna de las soluciones revisadas captura la dimensión temporal del proceso de elaboración: todas operan sobre la imagen final del dibujo terminado, pese a que Querol y Chaves Paz (2004) establecen indicadores explícitos relativos al tiempo de ejecución, la secuencia de dibujado y los borrados realizados. El presente proyecto aborda ese vacío mediante la captura digital del proceso de trazado, información que en el procedimiento tradicional se pierde salvo registro manual del examinador.

# ANEXOS

Figura 1

Lean Canva

Figura 2

FODA

Figura 3

Proyect Charter

Figura 4

Cronograma de actividades

# BIBLIOGRAFÍA

Buck, J. N. (1948). The H-T-P test. Journal of Clinical Psychology, 4(2), 151-159.

Defensoría del Pueblo. (2023, 10 de octubre). Salud mental no se prioriza en la agenda nacional. [https://www.defensoria.gob.pe/defensoria-del-pueblo-salud-mental-no-se-prioriza-en-la-agenda-nacional/](https://www.defensoria.gob.pe/defensoria-del-pueblo-salud-mental-no-se-prioriza-en-la-agenda-nacional/)

El Comercio. (2025, 30 de abril). 176 psicólogos por cada 100 mil habitantes: cómo repercute la falta de profesionales en la salud mental de los peruanos. [https://elcomercio.pe/bienestar/mente-sana/176-psicologos-por-cada-100-mil-habitantes-como-repercute-la-falta-de-profesionales-en-la-salud-mental-de-los-peruanos-psicoterapia-estigmas-depresion-noticia/](https://elcomercio.pe/bienestar/mente-sana/176-psicologos-por-cada-100-mil-habitantes-como-repercute-la-falta-de-profesionales-en-la-salud-mental-de-los-peruanos-psicoterapia-estigmas-depresion-noticia/)

Gennari, M., & Tamanza, G. (2022). The conjoint family drawing: A tool to explore about family relationships. Frontiers in Psychology, 13, 884686. [https://doi.org/10.3389/fpsyg.2022.884686](https://doi.org/10.3389/fpsyg.2022.884686)

Institute of Electrical and Electronics Engineers. (1998). IEEE recommended practice for software requirements specifications (IEEE Std 830-1998). [https://standards.ieee.org/ieee/830/1222/](https://standards.ieee.org/ieee/830/1222/)

Instituto Nacional de Estadística e Informática. (2023). Compendio estadístico 2023: Capítulo 6, Salud. [https://www.inei.gob.pe/media/MenuRecursivo/publicaciones\_digitales/Est/Compendio2023/cap06/cap06010.xlsx](https://www.inei.gob.pe/media/MenuRecursivo/publicaciones_digitales/Est/Compendio2023/cap06/cap06010.xlsx)

Lin, Y., Zhang, N., Qu, Y., Li, T., Liu, J., & Song, Y. (2022). The House-Tree-Person test is not valid for the prediction of mental health: An empirical study using deep neural networks. Acta Psychologica, 230, 103734. [https://doi.org/10.1016/j.actpsy.2022.103734](https://doi.org/10.1016/j.actpsy.2022.103734)

Congreso de la República del Perú. (2025). Nota de información referencial 88/2024-2025-ASISP/DIP: Salud mental. Departamento de Investigación Parlamentaria, Área de Servicios de Investigación y Seguimiento Presupuestal. [https://www3.congreso.gob.pe/Docs/DGP/DIDP/files/nir\_88\_salud\_mental.pdf](https://www3.congreso.gob.pe/Docs/DGP/DIDP/files/nir_88_salud_mental.pdf)

Querol, S. M., & Chaves Paz, M. I. (2004). Test de la persona bajo la lluvia: Adaptación y aplicación (1.ª ed., 3.ª reimp.). Lugar Editorial.

Psiconube. (s.f.). PBLL Test de Persona Bajo la Lluvia: Corrección con software. Recuperado el 3 de septiembre de 2026, de [https://www.psiconube.cl/es/productos/pbll-test-de-persona-bajo-la-lluvia-correccion-con-software/](https://www.psiconube.cl/es/productos/pbll-test-de-persona-bajo-la-lluvia-correccion-con-software/)

Santamaría, P., & Sánchez-Sánchez, F. (2022). Cuestiones abiertas en el uso de las nuevas tecnologías en la evaluación psicológica. Papeles del Psicólogo, 43(1), 48-54. [https://doi.org/10.23923/pap.psicol.2984](https://doi.org/10.23923/pap.psicol.2984)

Wen, S., Sun, Y., Ku, B., Gao, Z., Ma, L., Yang, Y., & Jiao, C. (2025). From visual perception to deep empathy: An automated assessment framework for House-Tree-Person drawings using multimodal LLMs and multi-agent collaboration [Preprint]. arXiv. [https://doi.org/10.48550/arXiv.2512.21360](https://doi.org/10.48550/arXiv.2512.21360)

Xie, Y., Pan, T., Liu, B., Chen, H., & Liu, W. (2024). Interpretable drawing psychoanalysis via House-Tree-Person test. En T. Liu, G. Webb, L. Yue & D. Wang (Eds.), AI 2023: Advances in artificial intelligence (Lecture Notes in Computer Science, vol. 14472, pp. 221-233). Springer. [https://doi.org/10.1007/978-981-99-8391-9\_18](https://doi.org/10.1007/978-981-99-8391-9_18)

Zhang, J., Yu, Y., Barra, V., Ruan, X., Chen, Y., & Cai, B. (2024). Feasibility study on using house-tree-person drawings for automatic analysis of depression. Computer Methods in Biomechanics and Biomedical Engineering, 27(9), 1129-1140. [https://doi.org/10.1080/10255842.2023.2231113](https://doi.org/10.1080/10255842.2023.2231113)

Zhang, Y., Yang, X., Li, X., Yu, S., Luan, Y., Feng, S., Wang, D., & Zhang, Y. (2024). PsyDraw: A multi-agent multimodal system for mental health screening in left-behind children [Preprint]. arXiv. [https://doi.org/10.48550/arXiv.2412.14769](https://doi.org/10.48550/arXiv.2412.14769)
