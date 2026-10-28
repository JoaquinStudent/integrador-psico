# CAPÍTULO 2: MARCO TEÓRICO

## 2.1. Fundamento teórico

Los antecedentes internacionales, nacionales y locales se presentan en el Estado del arte (§1.3.5) y en el contexto del problema (§1.1 y §1.2.1); aquí se desarrollan las variables y las bases teóricas que sustentan la solución.

### 2.1.1. Variables de estudio

- **Variable independiente:** la aplicación web **Psicograma**, solución tecnológica de apoyo al psicólogo en la aplicación e interpretación del test de la Persona bajo la lluvia. Captura digitalmente el proceso de trazado, registra las observaciones estructuradas de la sesión y genera un borrador de informe a partir de los indicadores validados por el profesional.
- **Variable dependiente:** el **tiempo de elaboración de informes** de tests proyectivos de dibujo, definido operacionalmente como los minutos transcurridos desde el cierre de la sesión hasta la validación final del informe por el examinador. Indicador: minutos por informe y porcentaje de reducción al comparar el procedimiento manual con el asistido. El efecto esperado es una reducción significativa (Defensoría del Pueblo, 2023; Congreso de la República del Perú, 2025).

La distinción se sustenta en el problema identificado: demoras en la entrega de resultados, sobrecarga del psicólogo y documentación poco homogénea, consecuencias del procedimiento manual de medir, anotar y transcribir.

### 2.1.2. Bases teóricas de la variable independiente

#### Arquitectura hexagonal

La arquitectura hexagonal (Cockburn) separa la lógica de negocio de la entrega y la infraestructura. En Psicograma:

- **Núcleo de dominio:** el algoritmo de medición determinista y el motor de reglas del manual PBLL, en Python puro, sin frameworks ni librerías de persistencia.
- **Adaptadores:** los de entrada (controladores REST en FastAPI) y los de salida (repositorios PostgreSQL, clientes de Whisper, OpenRouter, almacenamiento de archivos, generador de PDF y Google Calendar) se comunican con el dominio **solo mediante puertos** (interfaces abstractas).
- **Beneficio verificable:** el motor psicométrico se prueba en milisegundos, sin red; y la pureza de la frontera se audita automáticamente con `backend/scripts/check-hexagon.sh` (RNF-25).

#### Base de datos relacional normalizada a segunda forma normal (2FN)

La persistencia usa PostgreSQL (sobre Supabase) con un esquema normalizado a 2FN de **24 tablas** (22 del esquema base y 2 de la agenda). El modelo separa las tablas maestras de catálogo (`tests`, `indicator_categories`, `manual_sections`, `indicator_catalog`) de las tablas transaccionales (`sessions`, `session_indicators`, `session_quick_marks`…), de modo que el catálogo de reglas ya no se incrusta en cada evaluación. La seguridad se apoya en *Row Level Security* activa en todas las tablas (RNF-15); el navegador no posee credenciales de la base (RNF-12): todas las operaciones pasan por el backend, que propaga la identidad del usuario con `SET LOCAL ROLE authenticated`. El esquema evoluciona con migraciones versionadas y reversibles de Alembic (RNF-27).

#### Captura digital del trazo y dimensión temporal (Pointer Events)

El lienzo del paciente usa la API *Pointer Events* del W3C sobre un `<canvas>` HTML5. A diferencia de los eventos táctiles, permite muestrear coordenadas, **marcas de tiempo absolutas en milisegundos** y la **presión** normalizada (0 a 1). Cada trazo se registra como una serie temporal entre `pointerdown` y `pointerup`. Eso permite calcular de forma determinista indicadores que en papel son inobservables:

- **Latencia de inicio:** tiempo entre la entrega de la consigna y el primer punto del primer trazo.
- **Pausas (quietud):** intervalos entre el fin de un trazo y el inicio del siguiente que superan un umbral de 3 s (constante del dominio; en cambio los umbrales de detección de indicadores sí son parámetros calibrables).
- **Secuencia de partes:** orden en que se dibujan los elementos.
- **Presión y borrados:** media de presión y uso del borrador como evento de edición.

Durante el avance se corrigió un defecto importante: el instante de inicio de cada trazo se guardaba relativo al propio trazo (≈ 0), por lo que la latencia y las pausas salían siempre en cero. Ahora todos los instantes comparten una referencia única (el reloj de la tablet) y se verifica con pruebas automáticas (DT-035).

#### Sincronización en tiempo real (Realtime Broadcast)

El examinador supervisa el dibujo sin invadir el espacio del evaluado gracias a canales de difusión efímeros (WebSockets) de Supabase Realtime. Los trazos viajan como mensajes ligeros entre navegadores, sin pasar por la base de datos; las métricas se recalculan cada 2 s. La persistencia definitiva ocurre al cerrar la sesión.

#### Transcripción y redacción asistida (Whisper y LLM supervisado)

La dimensión verbal se obtiene con la API de transcripción de OpenAI (Whisper), con segmentos y marcas de tiempo, **condicionada al consentimiento informado** (RNF-14). La redacción de secciones narrativas usa un modelo de lenguaje vía OpenRouter con un diseño defensivo: si el servicio falla, el informe se genera igual y marca como «pendientes» las secciones sin redactar. Por principio ético (RNF-17), **las conclusiones nunca las redacta el sistema**; la sección 9 (*Conclusiones del profesional*) se entrega vacía y, como máximo, puede recibir una *sugerencia de recomendaciones* marcada, que bloquea la validación del informe hasta que el profesional la revise (DT-034).

### 2.1.3. Bases teóricas de la variable dependiente

#### Tests proyectivos gráficos

Los tests proyectivos de dibujo piden producir una figura sobre un soporte en blanco frente a una consigna deliberadamente abierta. Su marco es la hipótesis proyectiva formulada por Frank (1939) y desarrollada en el dibujo de la figura humana por Machover (1949) y Buck (1948). Ante la ausencia de estructura externa, la persona organiza el campo perceptual proyectando esquemas corporales, ansiedades y recursos de adaptación. Por su baja demanda verbal son útiles con niños pequeños, personas con inhibición social o en contextos de estrés.

> **Esencia del test que el sistema respeta.** El paciente solo ve una hoja en blanco, lápiz, borrador y deshacer: sin colores, grosores, guías ni mensajes de aliento, porque en un test proyectivo todo estímulo adicional contamina lo que se interpreta. La consigna se presenta exactamente como la fija el manual: «Dibuje una persona bajo la lluvia».

#### Test de la Persona bajo la lluvia (PBLL)

Prueba proyectiva gráfica sistematizada y adaptada al contexto hispanohablante por Querol y Chaves Paz (2004). Introduce un factor de tensión ambiental (la lluvia) frente a una figura humana en situación común, y permite observar cómo reacciona la persona ante la presión o la adversidad. El manual organiza el análisis en cuatro categorías:

| Categoría | Denominación | Secciones | Estado en Psicograma |
|---|---|---|---|
| **A** | Recursos expresivos | A-1 Dimensiones · A-2 Emplazamiento · A-3 Trazos · A-4 Presión · A-5 Tiempo · A-6 Secuencia · A-7 Movimiento · A-8 Sombreados | **Activa** |
| **B** | Análisis de contenido | B-1 Orientación · B-2 Posturas · B-3 Borrados · B-5 Detalles accesorios · B-6 Vestimenta · B-7 Paraguas · B-9 Partes del cuerpo · B-10 Identidad sexual | **Activa** (8 secciones modeladas) |
| **C** | Expresiones de conflicto | Una sección en el catálogo (11 indicadores) | Modelada pero **desactivada** por decisión ética |
| **D** | Mecanismos de defensa | Una sección en el catálogo (7 indicadores) | Modelada pero **desactivada** por decisión ética |

El catálogo modela **201 indicadores** en 18 secciones; con C y D desactivadas quedan **183 indicadores activos en 16 secciones** (8 de la categoría A y 8 de la B), que se procesan así:

| Tipo | Cantidad | Cómo se obtiene |
|---|---|---|
| Automáticos | **23** | El motor los calcula a partir de la cinemática y la geometría del trazo (tamaño, cuadrícula 3×3, tiempo, latencia, borrados, presión) |
| Semiautomáticos | **20** | El sistema aporta datos del trazo, marcas rápidas y transcripción; el profesional confirma o rechaza. La propuesta asistida por modelo de lenguaje está **prevista, no implementada** |
| Verificación profesional | **140** | Checklist por secciones para contenido visual complejo (rasgos, vestimenta, accesorios); presencia/ausencia con un clic |
| **Total activos** | **183** | |

**Indicadores activos por sección del catálogo:** A-1 (4) · A-2 (5) · A-3 (16) · A-4 (6) · A-5 (7) · A-6 (3) · A-7 (5) · A-8 (1) · B-1 (12) · B-2 (3) · B-3 (1) · B-5 (22) · B-6 (8) · B-7 (18) · B-9 (69) · B-10 (3) = **183**.

> ⚠️ El manual de Querol y Chaves Paz (2004) describe además las secciones B-4 (repaso de líneas), B-8 (reemplazo del paraguas) y B-11 (personaje), que el catálogo **no modela como secciones propias**. Confirmar con el equipo si sus indicadores se incorporaron a otras secciones o quedaron fuera, y dejarlo escrito.

#### Indicadores temporales y cinemáticos del proceso gráfico

Querol y Chaves Paz (2004) dan importancia central a los aspectos cinemáticos. La sección A-5 indica que una latencia inicial prolongada puede reflejar dificultad ante situaciones nuevas, y que los momentos de quietud a mitad del dibujo pueden asociarse con dudas respecto de ciertas áreas; la A-6 señala que el orden de aparición de los elementos informa sobre la autoimagen. En el papel estos indicadores casi no se registran, porque dependen de la memoria o de notas sueltas del examinador. Capturar la serie temporal de trazos los convierte en métricas objetivas y evita la pérdida de información del proceso. **Se presentan como datos para el profesional, nunca como conclusiones.**

#### Etapas del proceso manual y su consumo de tiempo

El tiempo de elaboración del informe suma tres etapas que hoy se hacen a mano:

1. **Medición física y registro en sesión (T₁):** el psicólogo anota observaciones y verbalizaciones dividiendo la atención entre el paciente y el cuaderno, y al final mide el dibujo con regla.
2. **Cotejo bibliográfico y puntuación (T₂):** consulta las tablas del manual para cruzar los rasgos observados con las interpretaciones de cada sección.
3. **Transcripción y redacción (T₃):** abre una plantilla, transcribe notas, consolida indicadores y redacta síntesis, observaciones y recomendaciones.

El tiempo total manual se estima de forma preliminar entre **45 y 90 minutos** por informe. Es una **estimación del equipo, no una medición**: la medición real es el objeto del Capítulo 4 y su ficha de registro está lista (`medicion/`). Con Psicograma, el sistema captura el proceso, calcula las 7 métricas deterministas, ofrece el checklist de los 183 indicadores y genera un borrador de nueve secciones. La **hipótesis** del proyecto es que ello reduce el tiempo a un rango menor; **ese rango se contrastará con datos reales** y no se da por cierto aquí.
