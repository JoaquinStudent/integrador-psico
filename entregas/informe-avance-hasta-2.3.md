# Facultad de Ingeniería Software y Sistemas

**"Implementación de una aplicación web para reducir el tiempo de elaboración de informes de tests proyectivos de dibujo en la práctica psicológica, Lima, 2026."**

**Autor (es):**
* Bernable Pantaleon Yefrei Eyder
* Diaz Fernandez Jose Eduardo
* Arias Yaranga Iam Kaled Fabricio
* Tuppia Lozano Jonathan Edilson
* Chaparro Villavicencio Joaquin Sebastian

**Curso Integrador I: Sistemas Software**  
**Sección:** 38195  
**Entorno de Aplicación:** Centro Psicológico Ser Integral E.I.R.L.  
**Lima - Perú, 2026**

---

# ÍNDICE

* [CAPÍTULO 1. PLANTEAMIENTO DEL PROBLEMA](#capítulo-1-planteamiento-del-problema)
  * [1.1. Análisis del contexto de la empresa](#11-análisis-del-contexto-de-la-empresa)
    * [1.1.1. Descripción de la empresa](#111-descripción-de-la-empresa)
    * [1.1.2. Misión de la empresa](#112-misión-de-la-empresa)
    * [1.1.3. Visión de la empresa](#113-visión-de-la-empresa)
    * [1.1.4. Análisis del entorno](#114-análisis-del-entorno)
    * [1.1.5. Estrategias de la empresa](#115-estrategias-de-la-empresa)
    * [1.1.6. Planes de la empresa](#116-planes-de-la-empresa)
  * [1.2. Modelo de negocio](#12-modelo-de-negocio)
    * [1.2.1. Business Model Canvas (Cuadro)](#121-business-model-canvas-cuadro)
    * [1.2.2. Análisis del Business Model Canvas](#122-análisis-del-business-model-canvas)
  * [1.3. Identificación y descripción del problema](#13-identificación-y-descripción-del-problema)
    * [1.3.1. Situación problemática](#131-situación-problemática)
    * [1.3.2. Identificación de causas](#132-identificación-de-causas)
    * [1.3.3. Identificación de consecuencias](#133-identificación-de-consecuencias)
  * [1.4. Justificación de la investigación](#14-justificación-de-la-investigación)
    * [1.4.1. Justificación teórica](#141-justificación-teórica)
    * [1.4.2. Justificación metodológica](#142-justificación-metodológica)
    * [1.4.3. Justificación práctica](#143-justificación-práctica)
  * [1.5. Objetivos](#15-objetivos)
    * [1.5.1. Objetivo general](#151-objetivo-general)
    * [1.5.2. Objetivos específicos](#152-objetivos-específicos)
  * [1.6. Alcance de la solución](#16-alcance-de-la-solución)
    * [1.6.1. Alcance funcional](#161-alcance-funcional)
    * [1.6.2. Alcance no funcional](#162-alcance-no-funcional)
    * [1.6.3. Alcance tecnológico](#163-alcance-tecnológico)
    * [1.6.4. Limitaciones](#164-limitaciones)
* [CAPÍTULO 2. MARCO TEÓRICO](#capítulo-2-marco-teórico)
  * [2.1. Estado del arte](#21-estado-del-arte)
    * [2.1.1. Variables de estudio](#211-variables-de-estudio)
    * [2.1.2. Antecedentes internacionales](#212-antecedentes-internacionales)
    * [2.1.3. Antecedentes nacionales](#213-antecedentes-nacionales)
    * [2.1.4. Antecedentes locales](#214-antecedentes-locales)
  * [2.2. Bases teóricas de la variable independiente](#22-bases-teóricas-de-la-variable-independiente)
  * [2.3. Bases teóricas de la variable dependiente](#23-bases-teóricas-de-la-variable-dependiente)
* [BIBLIOGRAFÍA](#bibliografía)

---

# CAPÍTULO 1. PLANTEAMIENTO DEL PROBLEMA

## 1.1. Análisis del contexto de la empresa

### 1.1.1. Descripción de la empresa
El presente proyecto se desarrolla en el **Centro Psicológico Ser Integral E.I.R.L.**, institución prestadora de servicios de salud mental ubicada en el distrito de San Juan de Lurigancho, Lima, Perú. El centro brinda atención psicológica integral en las áreas clínica, educativa y psicoterapéutica, atendiendo de manera cotidiana a niños, adolescentes y adultos de la comunidad local y zonas aledañas. 

Dentro de su batería diagnóstica estándar, los profesionales del centro aplican de forma regular pruebas proyectivas gráficas, destacando el **test de la Persona bajo la lluvia (PBLL)** como uno de los instrumentos de mayor demanda debido a su capacidad para evaluar la imagen corporal y los recursos de afrontamiento frente a situaciones de tensión ambiental. Asimismo, el centro mantiene convenios informales y coordina derivaciones regulares con instituciones educativas públicas y privadas del distrito, lo que genera un flujo constante de evaluaciones psicológicas que requieren la emisión periódica y estructurada de informes clínicos para padres de familia, docentes y especialistas tratantes.

### 1.1.2. Misión de la empresa
Brindar servicios de evaluación, diagnóstico y tratamiento psicológico de alta calidad técnica y calidez humana a la comunidad de San Juan de Lurigancho, facilitando el bienestar emocional, el desarrollo personal y la salud mental integral de los pacientes mediante la aplicación rigurosa de técnicas clínicas actualizadas y la continua optimización de sus procesos de atención.

### 1.1.3. Visión de la empresa
Consolidarse al año 2030 como el centro psicológico de referencia en la zona este de Lima Metropolitana por su excelencia diagnóstica, su compromiso social y la incorporación de tecnologías asistivas e innovadoras que optimicen la práctica profesional, reduciendo los tiempos de respuesta y ampliando la cobertura de atención en salud mental comunitaria.

### 1.1.4. Análisis del entorno
El entorno en el que opera el centro y en el que se enmarca la intervención del proyecto se encuentra condicionado por factores estructurales del sistema sanitario nacional, la disponibilidad de recursos humanos y la madurez tecnológica de la disciplina:

1. **Alta demanda y brecha estructural de cobertura en salud mental:** La Defensoría del Pueblo (2023) señala que aproximadamente el 80% de las personas que sufren de trastornos o malestares psicológicos en el Perú no acceden a un tratamiento oportuno ni adecuado. Según el Repositorio Único Nacional de Información en Salud (REUNIS), solo durante el año 2024 se atendieron 1 863 674 casos por trastornos mentales y problemas psicosociales en el sector público de salud (Congreso de la República del Perú, 2025). El distrito de San Juan de Lurigancho, al ser el más poblado del país con más de un millón de habitantes, concentra una presión asistencial severa sobre los consultorios y centros especializados.
2. **Escasez de profesionales en ejercicio:** Según datos del Instituto Nacional de Estadística e Informática (INEI, 2023), el número de psicólogos colegiados en ejercicio activo en el país es insuficiente frente al volumen de la población. En las instituciones educativas públicas, el Ministerio de Salud (MINSA, 2025a) reporta solo 1 201 profesionales SERUMS asignados a nivel nacional. Esta desproporción significa que cada hora que un psicólogo pierde en la redacción mecánica de informes representa tiempo sustraído a la intervención y atención directa de pacientes.
3. **Rezagada adopción digital en evaluación psicológica:** Como documentan Santamaría y Sánchez-Sánchez (2022), la psicología presenta una posición predominante de "mayoría tardía" en la adopción tecnológica: en 2021, entre el 85% y el 90% de las aplicaciones de pruebas clínicas masivas como el SENA y el PAI se administraron en papel y lápiz. En el ámbito de los tests proyectivos gráficos, las pocas herramientas digitales existentes se restringen a formularios estáticos donde el psicólogo digita los resultados una vez calculados a mano, sin registrar ni procesar el dibujo real.

### 1.1.5. Estrategias de la empresa
Para dar respuesta a los cuellos de botella identificados en el proceso de evaluación, se establecieron cuatro líneas estratégicas organizacionales y tecnológicas:

* **Estrategia de especialización y foco:** Concentrar el desarrollo en un único instrumento base —el test de la Persona bajo la lluvia (PBLL)— hasta alcanzar un funcionamiento integral, robusto y clínicamente validado, antes de expandir el soporte hacia otras pruebas proyectivas.
* **Estrategia de diferenciación por captura temporal:** Distinguirse radicalmente del software existente mediante la captura digital dinámica del trazo (cinemática, orden de ejecución, latencia inicial, pausas y borrados), cubriendo los indicadores que el papel pierde irrecuperablemente.
* **Estrategia de arquitectura desacoplada y escalable:** Construir el software mediante arquitectura hexagonal (puertos y adaptadores) y un catálogo de reglas desacoplado en base de datos relacional a 2FN, lo que garantiza la incorporación futura de pruebas como HTP o Dibujo de la Familia sin alterar la lógica de negocio.
* **Estrategia de asistencia profesional ("Copiloto") y rigor ético:** Delimitar taxativamente la función del sistema como una herramienta de apoyo a la medición que no sustituye el juicio del psicólogo y prescinde por principio de cualquier inferencia diagnóstica automatizada.

### 1.1.6. Planes de la empresa
El plan de implementación y desarrollo del proyecto contempla cuatro fases secuenciales:

| Fase | Denominación | Horizonte temporal | Entregables y Actividades Clave |
|---|---|---|---|
| **Fase 1** | Planificación y Relevamiento de Requisitos | 10/08/2026 – 05/10/2026 | Levantamiento de procesos manuales en Ser Integral; definición de misión, visión, entorno, estrategias; SRS bajo estándar IEEE Std 830-1998 (41 RF, 30 RNF); arquitectura de dominio y diseño relacional. |
| **Fase 2** | Construcción Incremental (6 Sprints) | 18/08/2026 – 01/10/2026 | **S1:** Fundación React/Vite, backend FastAPI, UI Shell.<br>**S2:** Pacientes, ficha clínica, panel de control, asistente de sesiones.<br>**S3:** Lienzo táctil con captura temporal a 60 fps, espejo desktop en tiempo real y audio.<br>**S4:** Transcripción Whisper, catálogo de 201 indicadores PBLL y medición objetiva.<br>**S5:** Rearquitectura hexagonal y normalización a 2FN (22 tablas con RLS).<br>**S6:** Generación de borrador de informe de 9 secciones, editor clínico, auditoría y PDF. |
| **Fase 3** | Auditoría y Medición del Sistema | 02/11/2026 – 11/11/2026 | Auditoría de los 41 RF (AUD-01); validación de seguridad RLS y JWT (AUD-02); auditoría de trazabilidad ética sin diagnóstico (AUD-03); pruebas de latencia < 200 ms (AUD-04); y recolección pre/post de la variable dependiente (AUD-05). |
| **Fase 4** | Cierre y Evaluación Empírica | 12/11/2026 – 11/12/2026 | Procesamiento de mediciones temporales mediante prueba de Wilcoxon, cálculo formal de porcentaje de reducción de tiempo y sustentación del proyecto integrador. |

---

## 1.2. Modelo de negocio

### 1.2.1. Business Model Canvas (Cuadro)

| **Socios Clave (Key Partners)** | **Actividades Clave (Key Activities)** | **Propuestas de Valor (Value Propositions)** | **Relación con Clientes (Customer Relationships)** | **Segmentos de Clientes (Customer Segments)** |
|---|---|---|---|---|
| • Colegio de Psicólogos del Perú (CDR I Lima).<br>• Facultades de Psicología de universidades locales.<br>• Psicólogos clínicos colaboradores en consultorios y centros privados.<br>• Proveedores cloud y de IA: Supabase (PostgreSQL / Auth / Realtime Broadcast), OpenAI (Whisper API para transcripción de audio), OpenRouter (LLM para estructuración textual asistida). | • Desarrollo continuo y mantenimiento de las dos interfaces sincronizadas (paciente en tablet / examinador en desktop).<br>• Modelado e ingestión de reglas psicométricas de los manuales en base de datos relacional.<br>• Calibración del algoritmo de medición temporal y espacial del trazo.<br>• Aseguramiento de la confidencialidad, anonimización y cifrado de datos de salud (RLS, JWT ES256).<br>• Capacitación y soporte técnico al examinador. | • **El copiloto digital del psicólogo:** Reduce sustancialmente el tiempo de elaboración de informes clínicos proyectivos (de 45–90 min a menos de 20 min).<br>• **Captura de la dimensión temporal:** Registra lo que el papel pierde (presión, velocidad, secuencia de inicio, pausas y borrados).<br>• **Estandarización y trazabilidad:** Aplica los criterios del manual PBLL referenciando sección y criterio exacto.<br>• **Enfoque copiloto ético:** Potencia al profesional sin sustituir su juicio ni emitir diagnósticos automáticos. | • Autoservicio asistido con onboarding interactivo y prueba piloto gratuita.<br>• Soporte técnico y guías de uso clínico en línea.<br>• Retroalimentación continua y co-diseño con psicólogos usuarios para el refinamiento de indicadores. | • **Primario:** Psicólogos clínicos independientes que aplican tests proyectivos y elaboran informes de forma frecuente.<br>• **Secundario:** Centros de atención psicológica y consultorios multidisciplinarios (equipos de 2 a 10 profesionales).<br>• **Early adopters:** Psicólogos jóvenes habituados a dispositivos táctiles con alta sobrecarga de redacción.<br>• **Nicho de expansión:** Psicólogos educativos y consultores en selección laboral/RR.HH. |
| **Recursos Clave (Key Resources)** | | | **Canales (Channels)** | |
| • Algoritmo de captura dinámica de trazos a 60 fps mediante Pointer Events API.<br>• Motor de reglas con catálogo normalizado de 201 indicadores PBLL.<br>• Repositorio de código y arquitectura hexagonal desacoplada.<br>• Base documental psicométrica (manuales validados de Querol y Chaves Paz).<br>• Equipo de ingeniería de software multidisciplinario. | | | • Plataforma web responsiva accesible vía navegador sin instalación local.<br>• Eventos científicos, congresos de psicología y jornadas del Colegio de Psicólogos.<br>• Alianzas de investigación con universidades.<br>• Demostraciones en consultorios y clínicas de salud mental. | |
| **Estructura de Costos (Cost Structure)** | | **Fuentes de Ingresos (Revenue Streams)** | | |
| • Costos operativos de infraestructura cloud (servidor de base de datos PostgreSQL, storage privado y websockets en Supabase).<br>• Consumo de APIs especializadas (transcripción de audio con Whisper y motor LLM de OpenRouter para redacción de borradores).<br>• Mantenimiento de software, refactorizaciones y auditorías de seguridad.<br>• Soporte técnico al cliente y materiales de capacitación profesional. | | • Suscripción SaaS mensual o anual individual por psicólogo evaluador.<br>• Licenciamiento multiusuario institucional para clínicas y consultorios con panel administrativo.<br>• Modalidad freemium (paquete base de evaluaciones mensuales gratuitas con upgrade a volumen ilimitado). | | |

### 1.2.2. Análisis del Business Model Canvas
* **Socios clave:** La legitimidad de una herramienta tecnológica en evaluación psicológica requiere vinculación estrecha con los entes reguladores de la profesión (Colegio de Psicólogos) y entidades académicas formadoras. Los psicólogos clínicos del Centro Psicológico Ser Integral aportan los casos y flujos reales de consulta que permiten calibrar la herramienta. Los proveedores de infraestructura especializada (Supabase, OpenAI Whisper, OpenRouter) permiten tercerizar componentes de alta complejidad asegurando estándares industriales de disponibilidad y latencia.
* **Actividades clave:** Mantener la sincronización en vivo mediante WebSockets con latencia sub-segundo entre el lienzo táctil del paciente y la pantalla del examinador es indispensable para el acto clínico. El modelado riguroso de las 18 secciones del manual de Querol y Chaves Paz (2004) evita la improvisación, y la gobernanza de datos sensibles garantiza que la información clínica se mantenga cifrada y aislada.
* **Propuesta de valor:** La propuesta resuelve directamente el dolor central del psicólogo: eliminar el trabajo mecánico de transcripción y medición con regla física, recortando el tiempo de redacción sin atentar contra la rigurosidad interpretativa. A diferencia de competidores que solo proveen plantillas de texto para rellenar, Psicograma analiza el dibujo real y sus propiedades físicas y cinemáticas.
* **Relación con clientes:** Dado el perfil conservador en tecnología del gremio psicológico, la relación debe priorizar la confianza, la transparencia sobre cómo se procesan los datos y la asistencia personalizada. El modelo de co-creación garantiza que las sugerencias del sistema reflejen la terminología real usada en la clínica.
* **Segmentos de clientes:** Se orienta inicialmente a psicólogos clínicos particulares y consultorios distritales que enfrentan un alto volumen de pacientes infantiles y adolescentes, donde las pruebas proyectivas son mandatorias. Los psicólogos jóvenes con tablets compatibles con stylus representan el punto de entrada de menor resistencia tecnológica.
* **Recursos clave:** El motor de captura desarrollado sobre HTML5 Canvas y Pointer Events API con precisión de presión representa la barrera técnica más diferenciadora. El esquema relacional normalizado en 22 tablas y el catálogo normalizado de 201 indicadores posibilitan la escalabilidad del sistema.
* **Canales:** El canal SaaS 100% web democratiza el acceso sin forzar instalaciones de software complejas en los consultorios. La validación profesional en jornadas académicas y el boca a boca entre colegiados impulsan la adopción orgánica.
* **Estructura de costos:** El costo variable primordial está regido por el consumo de cómputo en la nube y consumo de APIs de IA por cada informe generado. La arquitectura hexagonal minimiza el costo de mantenimiento facilitando cambios de proveedores cloud si fuera requerido.
* **Fuentes de ingresos:** La predictibilidad del ingreso recurrente vía membresía SaaS para profesionales independientes y paquetes corporativos para centros psicológicos asegura la sostenibilidad financiera del proyecto a bajo costo marginal.

---

## 1.3. Identificación y descripción del problema

### 1.3.1. Situación problemática
En la práctica profesional cotidiana del Centro Psicológico Ser Integral E.I.R.L., el proceso de evaluación psicológica mediante tests proyectivos de dibujo —y en particular el test de la Persona bajo la lluvia— se ejecuta de forma totalmente manual, artesanal y fragmentada. Al administrar la prueba, el evaluador proporciona una hoja de papel bond en blanco, un lápiz y un borrador, dando la consigna estandarizada. Mientras el paciente dibuja, el profesional intenta observar simultáneamente la secuencia de los trazos, las dudas, las pausas y las conductas no verbales, tomando notas rápidas en una libreta auxiliar.

Una vez que el paciente se retira, comienza una fase manual intensiva: el psicólogo toma una regla milimetrada para medir la altura y anchura del dibujo para clasificar su tamaño, evalúa a simple vista la zona de emplazamiento en la hoja (dividiéndola imaginariamente en cuadrantes), analiza la intensidad de la línea para inferir la presión y revisa minuciosamente un manual físico de más de cien páginas para cotejar cada rasgo gráfico detectado. Posteriormente, debe transcribir manualmente todas sus notas de observación, cruzar los indicadores y redactar desde cero un informe psicológico estructurado. 

Investigaciones como las de Zhang et al. (2024) y Wen et al. (2025) señalan que un protocolo gráfico exige inspeccionar más de un centenar de características independientes bajo criterios interpretativos heterogéneos y dependientes de la memoria del evaluador. En el Centro Psicológico Ser Integral, este flujo tradicional toma entre 45 y 90 minutos por cada paciente evaluado, lo que ocasiona un embotellamiento crítico en la entrega de resultados y limita severamente el número de pacientes que el centro puede atender por semana.

### 1.3.2. Identificación de causas
El relevamiento del flujo de trabajo en el centro permitió aislar tres causas raíz del problema:

1. **Doble esfuerzo de registro y transcripción mecánica:** El psicólogo debe registrar observaciones manuscritas en papel durante la sesión de evaluación (comentarios del paciente, dudas, borrados) y, posteriormente, transcribir esas mismas notas al procesador de textos para redactar el informe clínico. Esta redundancia operativa no añade ningún valor analítico y consume entre el 30% y el 40% del tiempo total de post-sesión.
2. **Pérdida irrecuperable de la dimensión temporal del dibujo:** Los criterios de interpretación formal del manual PBLL (Querol y Chaves Paz, 2004) otorgan alto valor diagnóstico a variables cinemáticas del proceso: el tiempo total de ejecución, la latencia inicial previa al primer trazo, los momentos de quietud o bloqueo, la secuencia de partes corporales dibujadas y la cantidad de repasos o borrados. Sin embargo, sobre una hoja de papel terminada únicamente subsiste el producto final estático; toda la riqueza del proceso temporal se pierde de forma irreversible, a menos que el evaluador haya podido anotarla a mano, lo que resulta sumamente propenso a omisiones y sesgos por la limitación de la atención humana dividida.
3. **Variabilidad y falta de estandarización en la medición inter-evaluador:** La medición física de proporciones, la estimación subjetiva de la presión de trazo (fuerte, débil o normal) y la búsqueda manual en el catálogo bibliográfico dependen enteramente de la experiencia del psicólogo. Profesionales con distinta formación asignan interpretaciones discrepantes a un mismo dibujo o aplican umbrales dispares, lo que dificulta la supervisión clínica, la auditoría de historias clínicas y la reproducibilidad de los informes diagnósticos.

### 1.3.3. Identificación de consecuencias
Las causas señaladas desencadenan repercusiones directas sobre la operatividad del centro y la calidad del servicio clínico:

1. **Demoras prolongadas en la entrega de informes diagnósticos:** Los tiempos de redacción provocan demoras de varios días e incluso semanas en la entrega formal de resultados a las familias y colegios derivantes. En casos que involucran sospechas de desajustes emocionales severos, dificultades de adaptación escolar o situaciones de maltrato infantil, el retraso en la emisión del informe obstaculiza la toma inmediata de decisiones terapéuticas o de derivación médica.
2. **Sobrecarga laboral y agotamiento del profesional evaluador:** La fatiga generada por tareas burocráticas y mecánicas repetitivas satura la jornada laboral de los psicólogos, reduciendo el tiempo disponible para la empatía terapéutica, la atención a nuevos consultantes y la capacitación continua. Esto agrava la brecha asistencial en una localidad con alta densidad poblacional como San Juan de Lurigancho.
3. **Falta de homogeneidad en la documentación clínica:** La disparidad en la estructura y el nivel de exhaustividad de los informes emitidos dentro de un mismo centro afecta la trazabilidad de los casos a lo largo del tiempo, complicando la transferencia de expedientes entre colegas y devaluando el estándar de calidad documental de la institución.

---

## 1.4. Justificación de la investigación

### 1.4.1. Justificación teórica
Desde una perspectiva teórica, la investigación se fundamenta en la formalización sistemática y computacional de los criterios psicométricos proyectivos del test de la Persona bajo la lluvia establecidos por Querol y Chaves Paz (2004). Diversos autores (Gennari & Tamanza, 2022) han demostrado empíricamente que la introducción de sistemas de codificación estructurada y parametrizada eleva drásticamente la concordancia entre evaluadores (alcanzando coeficientes Kappa de concordancia inter-jueces de hasta $K = .998$). 

Asimismo, la investigación integra los marcos teóricos modernos de desacoplamiento entre reconocimiento descriptivo e inferencia clínica formulados por Wen et al. (2025), y el principio de explicabilidad y trazabilidad algorítmica propuesto por Xie et al. (2024), demostrando que es teóricamente viable informatizar la extracción de variables gráficas sin vulnerar las premisas conceptuales de la psicología proyectiva. Al mismo tiempo, se asumen con rigor epistemológico los hallazgos de Lin et al. (2022), quienes desestiman la capacidad predictiva diagnóstica directa de los trazos, justificando teóricamente por qué el sistema adopta una postura de copiloto descriptivo y no de motor diagnóstico automatizado.

### 1.4.2. Justificación metodológica
Metodológicamente, la investigación adopta estándares reconocidos de ingeniería de software para el modelado de requisitos y la verificación de calidad de sistemas de información:
* Se implementa la especificación formal de requisitos mediante el estándar **IEEE Std 830-1998**, estructurando 41 requerimientos funcionales (RF) y 30 no funcionales (RNF) plenamente trazables.
* Se adopta un diseño de investigación pre-experimental con diseño comparativo pre-test / post-test sobre una misma muestra de evaluaciones en el entorno clínico real del centro, utilizando pruebas estadísticas no paramétricas (prueba de rangos con signo de Wilcoxon) idóneas para muestras acotadas.
* Se aplica una metodología arquitectónica hexagonal con validación algorítmica continua de fronteras de dominio (`check-hexagon.sh`), garantizando la neutralidad tecnológica del núcleo de negocio y asegurando la auditabilidad completa de cada sugerencia que el sistema emite.

### 1.4.3. Justificación práctica
En el terreno práctico, el desarrollo de Psicograma beneficia directamente a dos actores fundamentales:
* **Para los psicólogos del Centro Ser Integral:** Elimina la carga repetitiva de medir con regla sobre papel y transcribir anotaciones dispersas, automatizando la compilación de datos y la redacción del borrador en 9 secciones estructuradas. Esto libera tiempo que el profesional puede reinvertir en la entrevista clínica y la devolución de resultados.
* **Para los pacientes y la comunidad:** Permite acortar los plazos de entrega de los informes psicológicos, posibilitando intervenciones terapéuticas o psicopedagógicas oportunas en niños y adolescentes en situación de riesgo emocional o escolar en el distrito de San Juan de Lurigancho.

---

## 1.5. Objetivos

### 1.5.1. Objetivo general
Desarrollar una aplicación web para reducir el tiempo de elaboración de informes de tests proyectivos de dibujo en la práctica psicológica del Centro Psicológico Ser Integral E.I.R.L., San Juan de Lurigancho, Lima, 2026.

### 1.5.2. Objetivos específicos
1. **Analizar** el proceso actual de evaluación y elaboración de informes de tests proyectivos de dibujo en el Centro Psicológico Ser Integral E.I.R.L., identificando las actividades manuales que demandan mayor consumo de tiempo.
2. **Especificar** los requerimientos funcionales y no funcionales de la aplicación web bajo el estándar de especificación de requisitos de software (IEEE Std 830-1998).
3. **Establecer** la arquitectura y las interfaces del sistema, considerando el módulo del paciente para la captura digital del trazo y el módulo del examinador para el registro de la sesión y el monitoreo en vivo.
4. **Organizar** los módulos de captura de trazos, registro estructurado de observaciones, transcripción de la sesión y generación del borrador del informe clínico según el formato normativo del test aplicado.
5. **Estimar** la reducción del tiempo de elaboración de informes obtenida mediante el uso de la aplicación web en comparación con el tiempo empleado en el procedimiento manual tradicional dentro del centro de aplicación.

---

## 1.6. Alcance de la solución

### 1.6.1. Alcance funcional
El sistema contempla cinco módulos funcionales interconectados que cubren el ciclo completo de la evaluación clínica:

| Módulo Funcional | Funcionalidades Específicas Incluidas | Perfiles Involucrados |
|---|---|---|
| **1. Gestión de Pacientes y Sesiones** | • Registro, actualización, búsqueda paginada y visualización de historias clínicas.<br>• Baja lógica y anonimización de pacientes (`patients.anonymized_at`) conservando la integridad de informes preexistentes.<br>• Asistente de configuración de nueva sesión clínica en 3 pasos (selección de paciente, test y motivo de consulta).<br>• Registro y firma digital del consentimiento informado obligatorio (con autorización opcional de audio).<br>• Emparejamiento de tablet del paciente y panel de examinador sobre la misma sesión activa. | Examinador (Psicólogo) |
| **2. Captura del Dibujo (Módulo Paciente)** | • Consigna estandarizada e interactiva del test PBLL.<br>• Lienzo digital optimizado para interacción táctil y stylus (Pointer Events API a 60 fps).<br>• Herramientas de dibujo: lápiz con sensibilidad a la presión física, borrador por trazo y función de deshacer.<br>• Serialización atómica de trazos punto a punto con marca temporal, coordenadas y presión.<br>• Pantalla de cierre de sesión sin exposición de métricas ni resultados al evaluado. | Paciente |
| **3. Monitoreo y Registro (Módulo Examinador)** | • Espejo del dibujo en tiempo real mediante WebSockets (latencia < 200 ms).<br>• Visualización de 7 métricas estructurales actualizadas en vivo cada 2 segundos.<br>• Panel de 6 marcas rápidas predefinidas con estampado de tiempo instantáneo.<br>• Bitácora de observaciones conductuales con mecanismo de autoguardado continuo.<br>• Grabación de audio de la sesión condicionada al consentimiento informado.<br>• Transcripción automática de audio vía Whisper API alineada al reloj de la sesión (offset de eventos). | Examinador |
| **4. Motor de Análisis y Reglas PBLL** | • Cálculo determinista de métricas estructurales (área porcentual, cuadrícula 3×3 de emplazamiento, presión media, tiempo total, latencia inicial, pausas y borrados).<br>• Cruce con el catálogo relacional de 201 indicadores del manual PBLL organizados en 18 secciones.<br>• Clasificación operativa: 23 indicadores automáticos, 25 semiautomáticos (asistidos con nivel de confianza) y 153 de verificación profesional.<br>• Checklist interactivo en 3 pestañas para validación clínica (aceptar, editar o descartar cada sugerencia). | Examinador |
| **5. Informe Clínico y Exportación** | • Generación asistida de borrador de informe estructurado en 9 secciones clínicas estandarizadas.<br>• Apoyo de redacción en secciones narrativas (análisis, síntesis y recomendaciones) vía LLM con mecanismo de fallback determinista.<br>• Editor clínico enriquecido con navegación por índice y distinción visual de contenido asistido.<br>• Bloqueo ético de conclusiones diagnósticas automáticas (sección de conclusiones se entrega vacía para juicio exclusivo del profesional).<br>• Flujo formal de aprobación (borrador → validado) con firma del examinador y exportación a PDF. | Examinador |

### 1.6.2. Alcance no funcional
El sistema implementa 30 requerimientos no funcionales (RNF-01 a RNF-30) agrupados en 9 dimensiones de calidad:

1. **Rendimiento:** Latencia de transmisión en el espejo del dibujo menor a 200 ms; métricas en vivo actualizadas con desfase no superior a 2 segundos; respuesta de consultas y filtros de pacientes e informes por debajo de 2 segundos.
2. **Escalabilidad:** Arquitectura de motor de reglas orientada a datos; soporte para incorporar nuevos instrumentos proyectivos (HTP, DF, DFH) sin modificar el núcleo analítico; servidor backend asíncrono y sin estado en memoria de sesión.
3. **Disponibilidad y Confiabilidad:** Respaldo automático periódico de la base de datos relacional; almacenamiento en búfer local de trazos ante desconexiones transitorias de red para evitar pérdida de datos del evaluado.
4. **Seguridad:** Cifrado integral TLS/HTTPS en tránsito y AES-256 en reposo; aislamiento estricto de accesos mediante políticas de Row Level Security (RLS) en todas las tablas PostgreSQL; tokens JWT asimétricos ES256 validados vía JWKS; y arquitectura sin exposición de credenciales directas de BD en el navegador (desacoplamiento total vía API Gateway).
5. **Confidencialidad y Cumplimiento Normativo:** Requisito de consentimiento informado firmado previo al inicio de captura; segregación multi-inquilino lógica por profesional; y anonimización de registros sensibles conforme a la legislación de protección de datos personales de salud.
6. **Restricciones Éticas y Trazabilidad:** Prohibición absoluta de inferencia diagnóstica no supervisada; obligación de validación profesional explícita para todo indicador; y trazabilidad obligatoria de cada sugerencia hacia la sección y criterio específico del manual fuente.
7. **Usabilidad:** Interfaz de usuario intuitiva en idioma español; experiencia optimizada para stylus en pantalla completa para el paciente; y entorno de examinador ergonómico para uso simultáneo en consulta.
8. **Mantenibilidad:** Separación estricta y verificable de capas mediante script de auditoría hexagonal (`check-hexagon.sh`); migraciones de base de datos versionadas y reversibles con Alembic; y suite de 119 pruebas automatizadas (unitarias y de integración).
9. **Compatibilidad:** Interfaz de paciente compatible con navegadores Chromium modernos en tablets con soporte de lápiz óptico W3C Pointer Events (presión y coordenadas); interfaz de examinador compatible con cualquier navegador web de escritorio estándar.

### 1.6.3. Alcance tecnológico
La solución se apoya en una pila tecnológica moderna orientada al rendimiento, la precisión cinemática y la robustez arquitectónica:

* **Frontend:** Desarrollado con **React 19**, **TypeScript** y empaquetado ultra-rápido mediante **Vite**. Captura táctil sobre `<canvas>` HTML5 utilizando la **W3C Pointer Events API** para muestreo de presión y posición a 60 fps. Sincronización en vivo sustentada en **Supabase Realtime Broadcast** (canales WebSockets efímeros de baja sobrecarga).
* **Backend:** Implementado en **Python 3.12** utilizando el framework de alto rendimiento asíncrono **FastAPI**, estructurado bajo una **Arquitectura Hexagonal pura** (puertos de entrada/salida y dominio desacoplado de dependencias externas). Gestión de evolución de esquema con **Alembic**.
* **Base de Datos y Almacenamiento:** Instancia gestionada de **PostgreSQL 17.6** sobre **Supabase**, con un esquema normalizado en Segunda Forma Normal (2FN) distribuido en **22 tablas relacionales**, con políticas activas de Row Level Security (RLS) y propagación de rol autenticado (`SET LOCAL ROLE authenticated`). Almacenamiento de archivos binarios (grabaciones de audio y serialización vectorial de trazos) en bucket privado `session-files` de Supabase Storage.
* **Autenticación e Identidad:** **Supabase Auth** con firma asimétrica de tokens **ES256**, validados criptográficamente en el backend contra el conjunto de claves públicas JWKS.
* **Servicios de Inteligencia Artificial Externa:** **OpenAI Whisper API** para la transcripción y alineación temporal de audio; y **OpenRouter API** para la redacción asistida de secciones narrativas del informe, dotado de un mecanismo de fallback determinista local ante indisponibilidad del servicio externo.
* **Aseguramiento de Calidad:** Cobertura de pruebas automatizadas compuesta por **119 tests** (47 tests unitarios puros de lógica de dominio y medición determinista sin llamadas a red, y 72 tests de adaptadores, repositorios y contratos de API).

### 1.6.4. Limitaciones
* **Delimitación funcional no diagnóstica:** El sistema no emite conclusiones diagnósticas automatizadas ni dictámenes psicológicos categóricos. Las categorías C (expresiones de conflicto) y D (mecanismos de defensa) del manual PBLL quedan expresamente aisladas del generador automático de informes, reservándose la sección de conclusiones diagnósticas a la redacción exclusiva y firma del psicólogo colegiado.
* **Cobertura de instrumentos:** La versión desarrollada abarca únicamente el test proyectivo de la Persona bajo la lluvia (PBLL). Otros instrumentos gráficos proyectivos (como el test HTP o el test de la Familia) quedan planificados para fases posteriores a partir de la infraestructura extensible construida.
* **Dependencia de hardware del paciente:** La captura fidedigna de indicadores cinemáticos (como la presión del trazo) está condicionada a que el consultorio cuente con una tablet dotada de un lápiz digital que exponga eventos de presión a nivel de hardware y sistema operativo.
* **Calibración empírica continua:** Ciertos umbrales que el manual cualitativo de Querol y Chaves Paz (2004) describe sin cuantificación numérica precisa (p. ej., noción de sombreado sutil vs. sombreado intenso) se configuran mediante parámetros en base de datos que requieren calibración empírica continua con datos reales.
* **Alcance de la investigación:** El presente trabajo corresponde a un Proyecto Integrador de nivel universitario; los resultados de la reducción de tiempos obtenidos constituyen evidencia descriptiva y referencial en el contexto acotado del Centro Psicológico Ser Integral E.I.R.L. y no pretenden una certificación psicométrica formal del instrumento a nivel nacional.

---

# CAPÍTULO 2. MARCO TEÓRICO

## 2.1. Estado del arte

### 2.1.1. Variables de estudio
El presente trabajo de investigación se estructura en torno a dos variables principales:

* **Variable Independiente (VI):** Aplicación web copiloto (**Psicograma**), definida conceptualmente como un sistema de información y soporte clínico diseñado para asistir al psicólogo en la captura temporal del trazo, la medición objetiva de métricas estructurales, el cotejo estructurado de indicadores psicométricos y la generación asistida del borrador de informe del test de la Persona bajo la lluvia.
* **Variable Dependiente (VD):** Tiempo de elaboración de informes de tests proyectivos de dibujo, definida operacionalmente como el intervalo medido en minutos transcurrido desde que finaliza la sesión de aplicación del test hasta que el psicólogo examinador concluye la revisión, valida los indicadores y firma el informe clínico final.

### 2.1.2. Antecedentes internacionales

1. **Zhang et al. (2024) — PsyDraw (China):** Desarrollaron *PsyDraw*, un sistema multiagente multimodal concebido para el tamizaje de problemas de salud mental en 290 niños de zonas rurales de China mediante el test Casa-Árbol-Persona (HTP). El sistema alcanzó una consistencia del 71.03% en comparación con evaluaciones de psicólogos expertos. El estudio aporta dos principios fundamentales que fueron incorporados al presente proyecto: la modularización de tareas analíticas mediante componentes especializados y la rigurosa anonimización previa de datos personales de salud infantil. En Psicograma, este principio se materializa en la estructura de dominio y en la migración de anonimización (`patients.anonymized_at`).
2. **Wen et al. (2025) — Marco automatizado multiagente para HTP (China):** Propusieron un marco de evaluación asistida para dibujos del test HTP basado en colaboración multiagente y modelos multimodales, reportando una similitud semántica media de 0.75 a 0.85 frente a juicios de evaluadores humanos. Su principal aporte teórico fue la postulación del **principio de desacoplamiento**, según el cual la capa de reconocimiento de rasgos gráficos perceptuales debe permanecer completamente independiente de la inferencia psicológica. Este principio rige la arquitectura de Psicograma: el software mide objetivamente los trazos y parámetros cinemáticos, pero delega íntegramente la interpretación diagnóstica en el evaluador profesional.
3. **Xie et al. (2024) — Psicoanálisis interpretable de dibujos (Australia/China):** Diseñaron un método explicable de psicoanálisis sobre dibujos del test HTP que exige que cada característica detectada exponga un razonamiento transparente y comprensible para el clínico. Psicograma adopta este **principio de trazabilidad psicométrica**: en el catálogo relacional de 201 indicadores, cada regla y sugerencia generada por el sistema incluye el identificador de sección y la página correspondiente del manual de Querol y Chaves Paz (2004), eliminando cualquier fenómeno de "caja negra".
4. **Zhang, J., Yu et al. (2024) — Análisis computacional de características en HTP (Francia/China):** Analizaron 599 protocolos de dibujo para identificar la viabilidad de predecir estados depresivos mediante la extracción automática de ocho rasgos gráficos objetivos, alcanzando precisiones de clasificación de hasta 97.2% mediante algoritmos supervisados. Este trabajo confirma la validez técnica de la extracción computacional determinista de métricas gráficas, sustentando la capa de medición objetiva de Psicograma (área de la figura, emplazamiento en cuadrícula 3×3, tiempo, presión media y borrados).
5. **Gennari y Tamanza (2022) — Codificación estructurada en técnicas gráficas (Italia):** Evaluaron un sistema de codificación estructurada para el Dibujo Familiar Conjunto sobre 117 protocolos, discriminando entre 10 indicadores de producto (rasgos finales) y 9 de proceso (conductas durante la ejecución). Obtuvieron una concordancia inter-evaluadores casi perfecta ($K = .998$). Este antecedente valida formalmente la premisa metodológica de Psicograma: estructurar un catálogo formal de indicadores reduce radicalmente la subjetividad y variabilidad entre evaluadores.
6. **Lin et al. (2022) — Crítica a la validez diagnóstica del HTP mediante Deep Learning (China):** Sometieron a prueba la validez diagnóstica de los dibujos de 4 196 participantes mediante redes neuronales profundas. Aunque las redes aprendieron a clasificar objetos gráficos, fallaron completamente en predecir trastornos depresivos o de salud mental. Este hallazgo empírico fue decisivo para fijar el alcance ético de Psicograma: el sistema no intenta clasificar patologías ni emitir diagnósticos automatizados, enfocándose estrictamente en ser un copiloto de medición y redacción asistida.
7. **Santamaría y Sánchez-Sánchez (2022) — Nuevas tecnologías en evaluación psicológica (España):** Analizaron el ritmo de adopción digital en psicología, documentando que entre el 85% y el 90% de las pruebas clínicas se administran en papel, y advirtiendo sobre el riesgo de comercializar aplicaciones que operen sin la intermediación de un profesional colegiado. A partir de este estudio, Psicograma implementa autenticación estricta restringida a psicólogos colegiados (RF-01, RF-03) y concibe la plataforma como un sistema de apoyo supervisado.

### 2.1.3. Antecedentes nacionales

1. **Defensoría del Pueblo (2023) — Informe de brecha en salud mental:** Documenta de manera fehaciente que el 80% de los ciudadanos peruanos que experimentan trastornos de salud mental carecen de cobertura terapéutica oportuna. El informe resalta la necesidad imperiosa de modernizar y optimizar los flujos de trabajo en los centros asistenciales para incrementar su capacidad de respuesta con los mismos recursos profesionales disponibles.
2. **Instituto Nacional de Estadística e Informática (INEI, 2023) — Compendio Estadístico de Salud:** Registra un total de 3 372 psicólogos colegiados en ejercicio activo en el país en el año 2020. Aunque la cifra total de colegiados brutos sea mayor, el ratio de profesionales activos por habitante es crítico. La optimización del tiempo dedicado a labores mecánicas e informes es una necesidad prioritaria para descongestionar la atención asistencial.
3. **Congreso de la República del Perú (2025) — Nota Informativa Referencial sobre Salud Mental:** Detalla que durante 2024 se reportaron más de 1.8 millones de atenciones en salud mental en el sector público. Este documento fundamenta la urgencia de proyectos tecnológicos orientados a mejorar la eficiencia de los servicios psicológicos comunitarios en distritos populosos como San Juan de Lurigancho.

### 2.1.4. Antecedentes locales

1. **Centro Psicológico Ser Integral E.I.R.L. (San Juan de Lurigancho, Lima):** Constituye el centro de aplicación y entorno de referencia empírico del presente proyecto. El relevamiento inicial del proceso confirmó que el 100% de las aplicaciones del test de la Persona bajo la lluvia se realiza con lápiz de grafito y papel bond, registrándose manualmente observaciones y demorando entre 45 y 90 minutos por informe, con pérdida total de datos cinemáticos y alta variabilidad de redacción. La medición directa pre/post implementación en este establecimiento proveerá los datos empíricos para validar la efectividad de la solución.
2. **Psiconube (Solución comercial en español):** Plataforma comercial que provee un módulo de generación de informes para el test PBLL. No obstante, su funcionamiento consiste exclusivamente en un formulario digital donde el psicólogo debe rellenar manualmente las opciones observadas en papel; el software no realiza ningún tipo de captura gráfica, no interactúa con el paciente ni analiza los trazos o tiempos, manteniendo intacta la sobrecarga de medición física y transcripción en el profesional. Psicograma se distingue de esta alternativa al procesar directamente el lienzo interactivo y capturar la cinemática del trazo.

---

## 2.2. Bases teóricas de la variable independiente

La variable independiente es la aplicación web **Psicograma**, cuya formulación conceptual, diseño e implementación descansan sobre sólidos fundamentos de ingeniería de software, arquitectura de sistemas y tecnologías de procesamiento digital:

### 2.2.1. Arquitectura Hexagonal (Ports and Adapters)
Concebida originalmente por Alistair Cockburn, la arquitectura hexagonal persigue aislar por completo la lógica del negocio (el dominio) de los mecanismos de entrega (interfaz gráfica, APIs REST) y de la infraestructura de persistencia (bases de datos, servicios cloud de terceros). En Psicograma, el núcleo de dominio —que contiene el algoritmo de medición determinista y el motor de evaluación de reglas del manual PBLL— está implementado en Python puro sin dependencias de frameworks ni librerías de persistencia. 

Los adaptadores de entrada (controladores REST en FastAPI) y los adaptadores de salida (repositorios PostgreSQL, clientes de Whisper y OpenRouter) se comunican con el dominio exclusivamente a través de puertos formalizados (interfaces abstractas). Esta separación garantiza que el motor de reglas psicométricas pueda ser probado de forma unitaria en milisegundos sin levantar conexiones de red, y permite auditar automáticamente la pureza de la frontera arquitectónica mediante el script `backend/scripts/check-hexagon.sh` (cumpliendo RNF-25).

```
                      +---------------------------------------+
                      |         ADAPTADORES DE ENTRADA        |
                      |  - FastAPI Endpoints (REST)           |
                      |  - Controladores HTTP                 |
                      +-------------------+-------------------+
                                          |
                                          v  [Puertos de Entrada]
+-----------------------------------------------------------------------------------+
|                                 NÚCLEO DE DOMINIO                                 |
|  - Entidades de Dominio: Patient, Session, Stroke, StrokeMetrics, SessionIndicator |
|  - Value Objects: PressureLevel, PlacementZone, DrawingSize                       |
|  - Servicios Puros: ObjectiveMetricsService, RuleEngineService                    |
|  - Catálogo del Manual: 201 Indicadores PBLL (18 Secciones, 4 Categorías)         |
+-----------------------------------------------------------------------------------+
                                          |
                                          v  [Puertos de Salida]
                      +-------------------+-------------------+
                      |         ADAPTADORES DE SALIDA         |
                      |  - Repositorios PostgreSQL / Supabase |
                      |  - Adaptador Whisper API (Audio STT)  |
                      |  - Adaptador OpenRouter LLM (Borrador)|
                      |  - Supabase Realtime Broadcast        |
                      +---------------------------------------+
```

### 2.2.2. Base de Datos Relacional Normalizada a Segunda Forma Normal (2FN)
La persistencia de datos del sistema está implementada en **PostgreSQL 17.6** (sobre Supabase) estructurada bajo un esquema normalizado en **Segunda Forma Normal (2FN)** compuesto por **22 tablas relacionales**. Esta arquitectura resuelve la redundancia y acoplamiento presentes en aproximaciones no normalizadas, donde el catálogo de reglas se incrustaba repetitivamente en cada registro de evaluación. 

El modelo desacopla las tablas maestras de catálogo (`tests`, `indicator_categories`, `manual_sections`, `indicator_catalog`) de las tablas de ejecución transaccional (`sessions`, `session_indicators`, `session_quick_marks`). La seguridad se garantiza a través de **Row Level Security (RLS)** activa en todas las tablas, aplicando el principio de mínimo privilegio y asegurando la estricta segregación de expedientes entre examinadores (RNF-15). La conexión desde el cliente web no posee credenciales directas a la base de datos (RNF-12); todas las operaciones transaccionales son gestionadas por el backend, que propaga la identidad autenticada mediante `SET LOCAL ROLE authenticated`. La trazabilidad y evolución del esquema se administran a través de migraciones versionadas y reversibles gestionadas con Alembic (RNF-27).

```
                      +-------------------------+
                      |          tests          |
                      +------------+------------+
                                   | 1
                                   | N
                      +------------v------------+
                      |  indicator_categories   |
                      +------------+------------+
                                   | 1
                                   | N
                      +------------v------------+
                      |     manual_sections     |
                      +------------+------------+
                                   | 1
                                   | N
+------------------+  +------------v------------+
|     patients     |  |    indicator_catalog    |
+--------+---------+  +------------+------------+
         | 1                       | 1
         | N                       |
+--------v---------+               |
|     sessions     |               |
+--------+---------+               |
         | 1                       | N
         +------------+------------+
                      |
           +----------v-----------+
           |  session_indicators  |
           +----------------------+
```

### 2.2.3. Captura Digital del Trazo y Dimensión Temporal mediante Pointer Events API
El componente de captura gráfica opera en el navegador web del paciente mediante la **W3C Pointer Events API** encapsulada en un lienzo `<canvas>` HTML5 interactivo. A diferencia de eventos táctiles tradicionales (`touch`), la API de puntero permite muestrear de forma unificada coordenadas espaciales $(X, Y)$, marcas temporales absolutas en milisegundos (`timestamp`) y el valor de fuerza física normalizada (`pressure`, con valores en punto flotante de $0.0$ a $1.0$). 

Cada trazo se registra de forma atómica como una serie temporal de puntos capturada a 60 cuadros por segundo entre los eventos `pointerdown` y `pointerup`. Esta secuencia de trazos permite calcular de forma analítica y determinista indicadores del manual que en papel son inobservables o efímeros:
* **Latencia de inicio:** Diferencia de tiempo entre la consigna y el registro del primer punto del primer trazo ($t_0$).
* **Momentos de quietud (Pausas):** Intervalos entre el `pointerup` de un trazo y el `pointerdown` del subsiguiente mayores a umbrales configurables (p. ej., pausas prolongadas $> 5$ segundos).
* **Secuencia de partes:** Mapeo de los primeros trazos para verificar si el paciente inició el dibujo por la cabeza, el paraguas o los pies.
* **Presión y borrados:** Cálculo de la media y varianza de presión sobre el conjunto de puntos y registro del uso de la herramienta borrador como evento de edición formal.

### 2.2.4. Sincronización en Tiempo Real vía WebSockets Efímeros (Realtime Broadcast)
Para posibilitar la experiencia clínica de consultorio —donde el evaluador supervisa el dibujo sin interferir en el espacio personal del evaluado—, el sistema implementa canales de difusión basados en **WebSockets efímeros** provistos por **Supabase Realtime Broadcast**. 

La transmisión desacopla el almacenamiento en base de datos del flujo de visualización en vivo: los trazos viajan como mensajes ligeros directos de navegador a navegador con una latencia de transmisión inferior a 200 milisegundos (RNF-01). Esto permite al examinador visualizar el dibujo replicándose en su monitor trazo a trazo en tiempo real, observando el cálculo dinámico de métricas estructurales cada 2 segundos sin generar sobrecarga de escritura en disco, reservando la persistencia transaccional definitiva para el cierre formal de la sesión.

### 2.2.5. Transcripción y Procesamiento de Lenguaje Natural (Whisper y LLM Supervisado)
El sistema complementa la información gráfica con la dimensión verbal de la sesión. Utiliza la API de **OpenAI Whisper** para la transcripción fonética y segmentación con estampas de tiempo de las verbalizaciones producidas durante la prueba, condicionada a la firma del consentimiento informado (RNF-14). Gracias a la decisión técnica de alineación temporal (DT-032), cada verbalización se sincroniza con el reloj de la sesión activa, vinculando qué decía el paciente con qué parte de la figura dibujaba en ese instante.

Posteriormente, el módulo de redacción utiliza la API de **OpenRouter** para asistir en la estructuración de las secciones narrativas del informe clínico (secciones 5, 7 y 8). El adaptador opera bajo un diseño defensivo provisto de un **fallback determinista local** (DT-030) que genera resúmenes tabulares y narrativos basados en reglas si el servicio externo de IA pierde conexión. Bajo un estricto principio ético y legal, las conclusiones diagnósticas automáticas quedan bloqueadas (RNF-17), entregándose dicha sección en blanco para que el psicólogo plasme su criterio clínico indelegable.

---

## 2.3. Bases teóricas de la variable dependiente

La variable dependiente es el **tiempo de elaboración de informes de tests proyectivos de dibujo**. Comprender los fundamentos de esta variable exige analizar el funcionamiento del instrumento evaluado, las exigencias que impone al profesional y las ineficiencias del procedimiento manual tradicional:

### 2.3.1. Tests Proyectivos Gráficos y Fundamentos Psicométricos
Los tests proyectivos de dibujo o técnicas proyectivas gráficas constituyen métodos de exploración de la personalidad en los cuales se solicita a la persona la producción de una figura sobre un soporte en blanco frente a una consigna deliberadamente ambigua o abierta. Su marco conceptual descansa sobre la hipótesis proyectiva formulada originalmente por Lawrence Frank (1939) y desarrollada en el dibujo de la figura humana por Karen Machover (1949) y John Buck (1948, test HTP). 

Bajo este enfoque, ante la ausencia de una estructura externa prefijada, el individuo organiza el campo perceptual proyectando en el espacio gráfico sus esquemas corporales inconscientes, sus ansiedades, sus recursos de defensión y sus mecanismos de adaptación frente al medio ambiente. Debido a que exigen una baja demanda de comunicación verbal estructurada, son herramientas indispensables en la evaluación de niños pequeños, personas con inhibición social y pacientes en contextos de estrés emocional o trauma.

### 2.3.2. Test de la Persona bajo la lluvia (PBLL)
El test de la Persona bajo la lluvia es una prueba proyectiva gráfica sistematizada y adaptada en el contexto hispanohablante por Silvia Mabel Querol y María Inés Chaves Paz (2004). Su premisa operativa consiste en introducir un factor de tensión ambiental (la lluvia) frente a una figura humana en situación común, permitiendo observar cómo reacciona el sujeto frente a situaciones de presión o adversidad no anticipadas.

El manual de Querol y Chaves Paz (2004) organiza el análisis clínico formal en **cuatro categorías fundamentales**:

| Categoría | Denominación del Manual | Secciones Abarcadas | Contenido y Tipología de Indicadores |
|---|---|---|---|
| **Categoría A** | **Recursos Expresivos** | Secciones A-1 a A-8 | A-1: Dimensiones (tamaño de la figura).<br>A-2: Emplazamiento (ubicación en los márgenes de la hoja).<br>A-3: Trazos (líneas armónicas, entrecortadas, redondeadas, angulosas).<br>A-4: Presión (fuerza del trazo: normal, débil, fuerte, discontinua).<br>A-5: Tiempo (velocidad, dificultad inicial, momentos de quietud).<br>A-6: Secuencia (orden en que dibuja las partes de la persona y accesorios).<br>A-7: Movimiento (rigidez, dinamismo, despatarrada).<br>A-8: Sombreados (zonas sombreadas, ansiedad localizada). |
| **Categoría B** | **Análisis de Contenido** | Secciones B-1 a B-11 | B-1: Orientación de la persona (hacia derecha, izquierda, frente).<br>B-2: Posturas (sentado, acostado, de espaldas).<br>B-3: Borrados (borrado excesivo, tachaduras).<br>B-4: Repaso de líneas.<br>B-5: Detalles accesorios (nubes, charcos, rayos, animales).<br>B-6: Vestimenta (botones, bolsillos, transparencias).<br>B-7: Paraguas (presencia, ausencia, tamaño, orientación).<br>B-8: Reemplazo del paraguas (capucha, aleros, diarios).<br>B-9: Partes del cuerpo (ojos sin pupilas, boca abierta, extremidades).<br>B-10: Identidad sexual (figura de sexo contrario).<br>B-11: Personaje (dibujo de payaso, estatua, robot). |
| **Categoría C** | **Expresiones de Conflicto** | Secciones C-1 a C-11 | Indicadores sugeridos de neurosis fóbica, histeria, obsesión, cuadros depresivos, psicosis y tendencias paranoides. *(Aisladas por diseño en Psicograma por requerimiento ético y metodológico).* |
| **Categoría D** | **Mecanismos de Defensa** | Secciones D-1 a D-7 | Desplazamiento, regresión, anulación, aislamiento, represión, inhibición y defensas maníacas. *(Aisladas por diseño en Psicograma por requerimiento ético y metodológico).* |

En el proyecto **Psicograma**, el catálogo del manual fue modelado rigurosamente en **201 indicadores** que abarcan las 18 secciones del instrumento. En función de la capacidad de procesamiento de la aplicación web, estos 201 indicadores se estructuran operativamente en:
1. **23 Indicadores Automáticos:** Calculados directamente por el motor algorítmico a partir de la cinemática y geometría del trazo (dimensiones exactas en milímetros, posición en cuadrícula 3×3, tiempo de ejecución, latencia inicial, borrados y presión promedio).
2. **25 Indicadores Semiautomáticos:** Detectados de forma asistida por el cruce de eventos, marcas rápidas y transcripciones, emitiendo una sugerencia con grado de confianza que el examinador debe confirmar o ajustar.
3. **153 Indicadores de Verificación Profesional:** Elementos de contenido visual complejo y semántica gráfica (rasgos faciales, detalles de indumentaria, accesorios) organizados como un checklist estructurado por secciones del manual, permitiendo al psicólogo marcar presencia/ausencia con un solo clic.

### 2.3.3. Indicadores Temporales y Cinemáticos del Proceso Gráfico
La literatura clásica de evaluación psicológica (Querol & Chaves Paz, 2004) asigna una importancia crítica a los aspectos cinemáticos del trazado. La sección A-5 del manual estipula que una latencia inicial prolongada antes del primer trazo refleja dificultad para enfrentar situaciones nuevas o bloqueos ansiosos; los momentos de quietud en medio del dibujo sugieren dudas o conflictos con determinadas áreas corporales; y la velocidad excesiva puede asociarse a impulsividad o defensas maníacas. 

Asimismo, la sección A-6 señala que el orden o secuencia de aparición de los elementos (iniciar por los pies en vez de la cabeza, o dibujar primero el paraguas o la lluvia antes que la figura humana) indica distorsiones en la autoimagen o defensas anticipatorias. No obstante, en la práctica manual tradicional sobre papel bond, estos indicadores rara vez se registran de forma rigurosa, dependiendo de la memoria o notas volantes del examinador. La capacidad de Psicograma de capturar automáticamente la serie temporal de trazos transforma estos criterios teóricos en métricas objetivas cuantificables, eliminando la pérdida de información del proceso clínico.

### 2.3.4. Etapas del Proceso Manual Tradicional y su Consumo de Tiempo
El tiempo de elaboración del informe (variable dependiente) está compuesto por la suma de tres etapas secuenciales que el psicólogo efectúa manualmente:

1. **Etapa de Medición Física y Registro en Sesión ($T_1 \approx 10\text{--}15\text{ min}$):** Durante la consulta, el psicólogo observa al evaluado y anota precipitadamente en papel las observaciones de conducta y verbalizaciones, dividiendo su atención entre el paciente y el cuaderno de notas. Al finalizar, mide con regla el dibujo físico para categorizar el tamaño y la ubicación.
2. **Etapa de Cotejo Bibliográfico y Puntuación ($T_2 \approx 15\text{--}25\text{ min}$):** El profesional consulta las tablas del manual físico de Querol y Chaves Paz para cruzar los rasgos gráficos observados con las interpretaciones clínicas descritas para cada una de las 18 secciones.
3. **Etapa de Transcripción y Redacción Estructurada del Informe ($T_3 \approx 20\text{--}50\text{ min}$):** El evaluador abre una plantilla en un procesador de textos convencional, transcribe las notas de la sesión, consolida los indicadores validados, redacta la síntesis narrativa, las observaciones y recomendaciones, y genera el archivo final para impresión o envío.

La duración total del procedimiento manual ($T_{\text{total}} = T_1 + T_2 + T_3$) se sitúa de forma típica entre **45 y 90 minutos por informe**, con una mediana empírica estimada de aproximadamente 60 minutos en el Centro Psicológico Ser Integral. 

Al introducir la aplicación web Psicograma, el sistema asume la captura del proceso gráfico en tiempo real, calcula de inmediato las 7 métricas deterministas, cruza los 201 indicadores del catálogo mediante un checklist dinámico y genera automáticamente un borrador estructurado en 9 secciones clínicas listo para revisión en el editor web. La hipótesis del proyecto sostiene que este soporte reduce significativamente el tiempo de elaboración a un rango estimado de 15 a 25 minutos, optimizando la capacidad de atención y disminuyendo la sobrecarga laboral del psicólogo.

---

# BIBLIOGRAFÍA

* Buck, J. N. (1948). The H-T-P test. *Journal of Clinical Psychology*, *4*(2), 151–159. https://doi.org/10.1002/1097-4679(194804)4:2<151::aid-jclp2270040203>3.0.co;2-o
* Cockburn, A. (2005). *Hexagonal architecture (Ports and Adapters)*. Alistair Cockburn's Blog. https://alistair.cockburn.us/hexagonal-architecture/
* Congreso de la República del Perú. (2025). *Nota de información referencial 88/2024-2025-ASISP/DIP: Salud mental*. Departamento de Investigación Parlamentaria, Área de Servicios de Investigación y Seguimiento Presupuestal. https://www3.congreso.gob.pe/Docs/DGP/DIDP/files/nir_88_salud_mental.pdf
* Defensoría del Pueblo. (2023, 10 de octubre). *Salud mental no se prioriza en la agenda nacional*. https://www.defensoria.gob.pe/defensoria-del-pueblo-salud-mental-no-se-prioriza-en-la-agenda-nacional/
* El Comercio. (2025, 30 de abril). 176 psicólogos por cada 100 mil habitantes: cómo repercute la falta de profesionales en la salud mental de los peruanos. *El Comercio*. https://elcomercio.pe/bienestar/mente-sana/176-psicologos-por-cada-100-mil-habitantes-como-repercute-la-falta-de-profesionales-en-la-salud-mental-de-los-peruanos-psicoterapia-estigmas-depresion-noticia/
* Frank, L. K. (1939). Projective methods for the study of personality. *The Journal of Philosophy*, *36*(15), 389–413. https://doi.org/10.2307/2017770
* Gennari, M., & Tamanza, G. (2022). The conjoint family drawing: A tool to explore about family relationships. *Frontiers in Psychology*, *13*, 884686. https://doi.org/10.3389/fpsyg.2022.884686
* Institute of Electrical and Electronics Engineers. (1998). *IEEE recommended practice for software requirements specifications* (IEEE Std 830-1998). IEEE Computer Society. https://standards.ieee.org/ieee/830/1222/
* Instituto Nacional de Estadística e Informática. (2023). *Compendio estadístico 2023: Capítulo 6, Salud*. INEI. https://www.inei.gob.pe/media/MenuRecursivo/publicaciones_digitales/Est/Compendio2023/cap06/cap06010.xlsx
* Lin, Y., Zhang, N., Qu, Y., Li, T., Liu, J., & Song, Y. (2022). The House-Tree-Person test is not valid for the prediction of mental health: An empirical study using deep neural networks. *Acta Psychologica*, *230*, 103734. https://doi.org/10.1016/j.actpsy.2022.103734
* Machover, K. (1949). *Personality projection in the drawing of the human figure: A method of personality investigation*. Charles C. Thomas.
* Ministerio de Salud. (2025a). *SERUMS: Profesionales de psicología en instituciones educativas*. Gobierno del Perú.
* Psiconube. (s.f.). *PBLL Test de Persona Bajo la Lluvia: Corrección con software*. Recuperado el 3 de septiembre de 2026, de https://www.psiconube.cl/es/productos/pbll-test-de-persona-bajo-la-lluvia-correccion-con-software/
* Querol, S. M., & Chaves Paz, M. I. (2004). *Test de la persona bajo la lluvia: Adaptación y aplicación* (1.ª ed., 3.ª reimp.). Lugar Editorial.
* Santamaría, P., & Sánchez-Sánchez, F. (2022). Cuestiones abiertas en el uso de las nuevas tecnologías en la evaluación psicológica. *Papeles del Psicólogo*, *43*(1), 48–54. https://doi.org/10.23923/pap.psicol.2984
* Wen, S., Sun, Y., Ku, B., Gao, Z., Ma, L., Yang, Y., & Jiao, C. (2025). *From visual perception to deep empathy: An automated assessment framework for House-Tree-Person drawings using multimodal LLMs and multi-agent collaboration* [Preprint]. arXiv. https://doi.org/10.48550/arXiv.2512.21360
* World Wide Web Consortium. (2020). *Pointer Events (Level 2): W3C Recommendation*. https://www.w3.org/TR/pointerevents2/
* Xie, Y., Pan, T., Liu, B., Chen, H., & Liu, W. (2024). Interpretable drawing psychoanalysis via House-Tree-Person test. En T. Liu, G. Webb, L. Yue & D. Wang (Eds.), *AI 2023: Advances in artificial intelligence* (Lecture Notes in Computer Science, vol. 14472, pp. 221–233). Springer. https://doi.org/10.1007/978-981-99-8391-9_18
* Zhang, J., Yu, Y., Barra, V., Ruan, X., Chen, Y., & Cai, B. (2024). Feasibility study on using house-tree-person drawings for automatic analysis of depression. *Computer Methods in Biomechanics and Biomedical Engineering*, *27*(9), 1129–1140. https://doi.org/10.1080/10255842.2023.2231113
* Zhang, Y., Yang, X., Li, X., Yu, S., Luan, Y., Feng, S., Wang, D., & Zhang, Y. (2024). *PsyDraw: A multi-agent multimodal system for mental health screening in left-behind children* [Preprint]. arXiv. https://doi.org/10.48550/arXiv.2412.14769
