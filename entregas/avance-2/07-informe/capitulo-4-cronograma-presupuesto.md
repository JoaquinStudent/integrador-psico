Facultad de Ingeniería Software y Sistemas

**"Implementación de una aplicación web para reducir el tiempo de elaboración de informes de tests proyectivos de dibujo en la práctica psicológica, Lima, 2026."**

---

# CAPÍTULO 4: CRONOGRAMA Y PRESUPUESTO

---

## 4.1. Cronograma actualizado

El cronograma del proyecto comprende tres fases en la ventana 10/08/2026 – 11/12/2026. El corte de avance al 01/10/2026 registra un 85.1 % de avance global (40/47 tareas completadas).

| Fase | Actividades | Fecha inicio | Fecha fin | Avance al 01/10/2026 |
|---|---|---|---|---|
| **Fase 1 — Análisis y diseño** | 5 actividades | 10/08/2026 | 05/10/2026 | 80 % |
| **Fase 2 — Construcción (6 sprints)** | 36 tareas | 18/08/2026 | 26/10/2026 | 97 % |
| **Fase 3 — Auditoría y cierre** | 5 tareas | 02/11/2026 | 11/12/2026 | 0 % |
| **TOTAL** | **46 tareas** | **10/08/2026** | **11/12/2026** | **85.1 %** |

### Detalle por actividad

| ID | Actividad | Responsable | Fecha inicio | Duración | Fecha fin | Avance | Estado |
|---|---|---|---|---|---|---|---|
| F1-01 | Planificación: misión, visión, alcance | Joaquin Chaparro | 10/08/2026 | 2 días | 11/08/2026 | 100 % | Completado |
| F1-02 | Reunión inicial y relevamiento del proceso manual | Jose Diaz | 15/08/2026 | 3 días | 17/08/2026 | 100 % | Completado |
| F1-03 | Requerimientos funcionales y no funcionales (SRS IEEE 830) | Yefrei Bernable | 08/09/2026 | 3 días | 10/09/2026 | 100 % | Completado |
| F1-04 | Arquitectura hexagonal y esquema normalizado a 2FN | Jonathan Tuppia | 18/09/2026 | 8 días | 25/09/2026 | 100 % | Completado |
| F1-05 | Diagramas: BPM, clases, ER, casos de uso | Iam Arias | 28/09/2026 | 8 días | 05/10/2026 | 80 % | En proceso |
| S1-01 | Sprint 1: Infraestructura, design system, router | Joaquin Chaparro | 18/08/2026 | 5 días | 22/08/2026 | 100 % | Completado |
| S2-01 | Sprint 2: Panel de control, pacientes, sesiones | Yefrei Bernable | 25/08/2026 | 8 días | 01/09/2026 | 100 % | Completado |
| S3-01 | Sprint 3: Lienzo del paciente y sesión en vivo | Jonathan Tuppia | 04/09/2026 | 8 días | 11/09/2026 | 100 % | Completado |
| S4-01 | Sprint 4: Análisis y motor de reglas PBLL | Iam Arias | 16/09/2026 | 7 días | 22/09/2026 | 100 % | Completado |
| S5-01 | Sprint 5: Rearquitectura hexagonal y BD normalizada | Joaquin Chaparro | 25/09/2026 | 6 días | 30/09/2026 | 100 % | Completado |
| S6-01 | Sprint 6: Informe, PDF y cierre funcional | Jose Diaz | 28/09/2026 | 4 días | 01/10/2026 | 100 % | Completado |
| AUD-01 | Auditoría funcional (41 RF con evidencia) | Iam Arias | 02/11/2026 | 10 días | 11/11/2026 | 0 % | Sin empezar |
| AUD-05 | Medición pre/post del tiempo de elaboración | Jose Diaz | 02/11/2026 | 10 días | 11/11/2026 | 0 % | Sin empezar |
| DESP | Despliegue y capacitación de usuarios | Jose Diaz | 20/11/2026 | 5 días | 24/11/2026 | 0 % | Sin empezar |
| CIERRE | Cierre del proyecto | Joaquin Chaparro | 07/12/2026 | 2 días | 08/12/2026 | 0 % | Sin empezar |

Para el diagrama de Gantt completo en formato de barras, ver el Anexo D (Primer Avance). Las celdas de actualización al 01/10/2026 están documentadas en `entregas/avance-2/07-informe/anexos-charter-gantt.md`.

---

## 4.2. Presupuesto del proyecto

El presupuesto cubre el periodo completo del proyecto (10/08/2026 – 11/12/2026) y contempla los costos de recursos humanos (valorados a tarifa académica), infraestructura en la nube, herramientas de software y las API de servicios externos.

### Resumen por categoría

| Categoría | Costo estimado (S/) |
|---|---|
| Recursos humanos | 3,000.00 |
| Infraestructura en la nube | 480.00 |
| Servicios de IA (Whisper + OpenRouter) | 360.00 |
| Herramientas de software | 60.00 |
| Contingencia (10 %) | 390.00 |
| **TOTAL** | **4,290.00** |

---

## 4.3. Recursos requeridos

### Recursos humanos

| Rol | Miembro | Dedicación | Duración | Costo unitario | Costo total (S/) |
|---|---|---|---|---|---|
| Jefe de proyecto / Arquitecto | Joaquin Chaparro | 12 h/semana | 16 semanas | S/ 15/h | 2,880.00 |
| Desarrollador backend / ER | Jonathan Tuppia | 8 h/semana | 16 semanas | S/ 15/h | 1,920.00 |
| Analista / Motor de reglas | Iam Arias | 8 h/semana | 16 semanas | S/ 15/h | 1,920.00 |
| Desarrollador frontend / Alternativas | Yefrei Bernable | 8 h/semana | 16 semanas | S/ 15/h | 1,920.00 |
| Redactor técnico / Informe | Jose Diaz | 8 h/semana | 16 semanas | S/ 15/h | 1,920.00 |

> **Nota:** Los costos de recursos humanos se valoran a tarifa académica referencial. En un proyecto comercial equivalente, la tarifa correspondería a desarrolladores junior/semi-senior con experiencia en la pila tecnológica utilizada.

**Total recursos humanos: S/ 10,560.00**  
*(Para los efectos del presupuesto del proyecto académico, se presenta la valoración proporcional al periodo: S/ 3,000.00 considerando la dedicación efectiva del equipo.)*

### Recursos de infraestructura

| Recurso | Proveedor | Plan | Duración | Costo mensual (USD) | Costo total (S/) |
|---|---|---|---|---|---|
| Base de datos PostgreSQL + Auth + Realtime + Storage | Supabase | Free (hasta 500 MB) | 4 meses | $0 | 0.00 |
| Despliegue backend Java (JAR) | Railway | Hobby ($5/mes) | 4 meses | $5 | 72.00 |
| Despliegue frontend React | Vercel | Hobby (gratuito) | 4 meses | $0 | 0.00 |
| Dominio personalizado (opcional) | Namecheap | — | 1 año | — | 40.00 |
| Ambiente de desarrollo (equipos del equipo) | — | — | — | — | 0.00 |
| **Subtotal infraestructura** | | | | | **112.00** |

> **Nota:** Supabase y Vercel ofrecen planes gratuitos suficientes para el volumen académico del proyecto. El plan Hobby de Railway cubre el backend Java con las limitaciones de recursos del plan gratuito.

### Recursos de herramientas de software

| Herramienta | Uso | Costo |
|---|---|---|
| Java 21 LTS (OpenJDK) | Backend y dominio | Gratuito |
| Spring Boot 3 | Framework backend | Gratuito (Apache 2.0) |
| React 18 + Vite | Frontend | Gratuito (MIT) |
| PostgreSQL 17 | Base de datos | Gratuito (PostgreSQL License) |
| IntelliJ IDEA Community | IDE backend | Gratuito |
| VS Code | IDE frontend | Gratuito |
| Git + GitHub | Control de versiones | Gratuito |
| Figma Starter | Diseño de interfaces | Gratuito |
| **Subtotal herramientas** | | **S/ 0.00** |

---

## 4.4. Costos de implementación

Los costos de implementación corresponden al uso de las API de servicios externos de inteligencia artificial durante el periodo del proyecto.

| Servicio | Uso estimado | Tarifa | Costo mensual (USD) | Duración | Costo total (S/) |
|---|---|---|---|---|---|
| OpenAI Whisper API | ~50 sesiones × 30 min de audio = 25 horas de audio | $0.006/min = $9/mes | $9 | 4 meses | 129.60 |
| OpenRouter LLM (redacción de informes) | ~50 informes × 2.000 tokens = 100K tokens | $0.50/1M tokens input ≈ $0.05/mes | $0.50 | 4 meses | 7.20 |
| **Subtotal servicios IA** | | | | | **S/ 136.80** |

### Resumen de presupuesto final

| Categoría | Costo (S/) |
|---|---|
| Recursos humanos (valoración académica proporcional) | 3,000.00 |
| Infraestructura en la nube | 112.00 |
| Herramientas de software | 0.00 |
| Servicios de IA (Whisper + OpenRouter) | 136.80 |
| **Subtotal** | **3,248.80** |
| Contingencia (10 %) | 324.88 |
| **TOTAL DEL PROYECTO** | **S/ 3,573.68** |

> **Tipo de cambio referencial:** 1 USD = 3.60 PEN (octubre 2026).

### Proyección de costos post-académico (implementación productiva)

Si el proyecto fuera implementado de forma productiva en el Centro Psicológico Ser Integral E.I.R.L., los costos recurrentes mensuales serían:

| Ítem | Costo mensual (S/) |
|---|---|
| Supabase Pro ($25/mes) | 90.00 |
| Railway Developer ($20/mes) | 72.00 |
| OpenAI Whisper (uso real ~100 sesiones/mes) | 64.80 |
| OpenRouter LLM (~100 informes/mes) | 18.00 |
| **Total mensual productivo** | **S/ 244.80** |

Esta proyección muestra que el costo operativo mensual del sistema es considerablemente inferior al tiempo que el sistema permite ahorrar al psicólogo, sustentando la justificación económica del proyecto presentada en el apartado 1.4.2 del Capítulo 1.

---

## BIBLIOGRAFÍA (Capítulo 4)

Supabase. (2026). *Pricing*. https://supabase.com/pricing

Railway. (2026). *Pricing*. https://railway.app/pricing

OpenAI. (2026). *Whisper API pricing*. https://openai.com/api/pricing

OpenRouter. (2026). *Models and pricing*. https://openrouter.ai/models
