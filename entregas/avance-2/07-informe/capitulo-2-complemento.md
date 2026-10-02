Facultad de Ingeniería Software y Sistemas

**"Implementación de una aplicación web para reducir el tiempo de elaboración de informes de tests proyectivos de dibujo en la práctica psicológica, Lima, 2026."**

---

# CAPÍTULO 2: MARCO TEÓRICO — COMPLEMENTO DEL SEGUNDO AVANCE

> Las secciones 2.1 a 2.3 están desarrolladas en `capitulo-2-marco-teorico.md`.  
> Este documento agrega las secciones 2.4, 2.5 y 2.6 que faltaban.

---

## 2.4. Hipótesis

### 2.4.1. Hipótesis general

El uso de la aplicación web Psicograma reduce significativamente el tiempo de elaboración de informes del test de la Persona bajo la lluvia en comparación con el procedimiento manual actual en el Centro Psicológico Ser Integral E.I.R.L., San Juan de Lurigancho, Lima, 2026.

### 2.4.2. Hipótesis específicas

**HE-1.** La captura digital del proceso de trazado mediante la Pointer Events API permite registrar automáticamente los indicadores temporales del manual (secciones A-5 y A-6) que en el procedimiento manual se pierden o dependen de la anotación manual del examinador durante la sesión.

**HE-2.** La presentación estructurada de los 201 indicadores del manual PBLL —clasificados en detección automática, semiautomática y verificación profesional— reduce el tiempo que el psicólogo destina a la consulta del manual y a la puntuación de los indicadores frente al procedimiento manual.

**HE-3.** La generación asistida del borrador de informe a partir de los indicadores validados por el examinador reduce el tiempo de redacción del informe definitivo sin sustituir el juicio clínico del profesional.

**HE-4.** La sincronización en tiempo real entre la tablet del paciente y el panel del examinador, combinada con la transcripción automática del audio de la sesión, elimina el doble esfuerzo de registro —anotación durante la sesión y transcripción posterior— que constituye una de las principales fuentes de tiempo elevado en el procedimiento manual.

---

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

---

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
│                                      PBLL                       │
│                                                                  │
│  ─────────────────── Sincronización en tiempo real ──────────── │
│                      Supabase Realtime Broadcast                 │
│                      Latencia < 200 ms (RNF-01)                 │
│                                                                  │
│  ─────────────── Principio rector: el profesional valida ─────  │
│                  Ningún indicador entra al informe sin           │
│                  validación explícita del examinador             │
└─────────────────────────────────────────────────────────────────┘
```

---

## BIBLIOGRAFÍA (complemento)

Lin, Y., Zhang, N., Qu, Y., Li, T., Liu, J., & Song, Y. (2022). The House-Tree-Person test is not valid for the prediction of mental health: An empirical study using deep neural networks. *Acta Psychologica*, *230*, 103734. https://doi.org/10.1016/j.actpsy.2022.103734

Querol, S. M., & Chaves Paz, M. I. (2004). *Test de la persona bajo la lluvia: Adaptación y aplicación* (1.ª ed., 3.ª reimp.). Lugar Editorial.

Wen, S., Sun, Y., Ku, B., Gao, Z., Ma, L., Yang, Y., & Jiao, C. (2025). From visual perception to deep empathy: An automated assessment framework for House-Tree-Person drawings using multimodal LLMs and multi-agent collaboration [Preprint]. arXiv. https://doi.org/10.48550/arXiv.2512.21360

Xie, Y., Pan, T., Liu, B., Chen, H., & Liu, W. (2024). Interpretable drawing psychoanalysis via House-Tree-Person test. En T. Liu, G. Webb, L. Yue & D. Wang (Eds.), *AI 2023: Advances in artificial intelligence* (Lecture Notes in Computer Science, vol. 14472, pp. 221–233). Springer. https://doi.org/10.1007/978-981-99-8391-9_18
