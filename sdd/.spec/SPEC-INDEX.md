# SPEC-INDEX.md — Indice de Especificaciones

> Ultima actualizacion: 2026-08-26

---

## Sprint 0 — Fundacion (1 semana)

| ID | Epica/Modulo | Historia | Estado | Tests | Responsable |
|---|---|---|---|---|---|
| `SPEC-S0-01` | Infraestructura | Crear proyecto React+Vite, design system, router | DONE | N/A (scaffolding) | Agente |
| `SPEC-S0-02` | Infraestructura | Configurar Supabase client + tipos base | DONE | N/A (config) | Agente |
| `SPEC-S0-03` | Auth | Login/registro con Supabase Auth + rutas protegidas | DONE | Pendiente | Agente |
| `SPEC-S0-04` | Infraestructura | Deploy inicial Vercel | PENDIENTE | N/A | Usuario |
| `SPEC-S0-05` | Layout | Layout shell: sidebar + topbar + responsive | DONE | N/A (UI) | Agente |

---

## Sprint 1 — Pacientes + Dashboard + Wizard (2 semanas)

| ID | Epica/Modulo | Historia | Estado | Tests | Responsable |
|---|---|---|---|---|---|
| `SPEC-S1-01` | Dashboard | KPIs + sesiones recientes + proximas citas | DONE | Pendiente | Agente |
| `SPEC-S1-02` | Pacientes | Listado paginado + busqueda + filtros | DONE | Pendiente | Agente |
| `SPEC-S1-03` | Pacientes | Crear/editar paciente (formulario) | DONE | Pendiente | Agente |
| `SPEC-S1-04` | Pacientes | Ficha del paciente (tabs + notas clinicas) | DONE | Pendiente | Agente |
| `SPEC-S1-05` | Tests | Catalogo de tests proyectivos | DONE | N/A (UI) | Agente |
| `SPEC-S1-06` | Sesiones | Wizard nueva sesion (3 pasos + consentimiento) | DONE | Pendiente | Agente |

---

## Sprint 2 — Lienzo + Sesion en Vivo (2 semanas)

| ID | Epica/Modulo | Historia | Estado | Tests | Responsable |
|---|---|---|---|---|---|
| `SPEC-S2-01` | Paciente UI | Bienvenida PBLL + cierre | DONE | N/A (UI) | Agente |
| `SPEC-S2-02` | Canvas | Adaptar Ink Playground como lienzo paciente | DONE | Pendiente | Agente |
| `SPEC-S2-03` | Captura | Serializar strokes + guardar drawing_data + PNG | DONE | Pendiente | Agente |
| `SPEC-S2-04` | Realtime | Sync en vivo paciente → examinador (Supabase Realtime) | DONE | Pendiente | Agente |
| `SPEC-S2-05` | Metricas | Metricas en vivo en panel examinador | DONE | Pendiente | Agente |
| `SPEC-S2-06` | Observaciones | Marcas rapidas + estado conexion tablet | DONE | Pendiente | Agente |
| `SPEC-S2-07` | Audio | Grabacion audio + Storage | DONE | Pendiente | Agente |
| `SPEC-S2-08` | Sesion | Finalizar sesion + calcular metricas finales | DONE | Pendiente | Agente |

---

## Sprint 3 — Analisis + Motor de Reglas (2 semanas)

| ID | Epica/Modulo | Historia | Estado | Tests | Responsable |
|---|---|---|---|---|---|
| `SPEC-S3-01` | Post-sesion | Registro observaciones + transcripcion Whisper | DONE | Pendiente | Agente |
| `SPEC-S3-02` | Motor Reglas | JSON de ~202 indicadores PBLL | DONE | N/A (datos) | Agente |
| `SPEC-S3-03` | Analisis | Medicion objetiva automatica | DONE | Pendiente | Agente |
| `SPEC-S3-04` | IA | Criterios sugeridos por AI (Edge Function OpenRouter) | DONE | Pendiente | Agente |
| `SPEC-S3-05` | Verificacion | Checklist profesional por categorias | DONE | Pendiente | Agente |

---

## Sprint 4 — Informe + PDF + Pulido (2 semanas)

| ID | Epica/Modulo | Historia | Estado | Tests | Responsable |
|---|---|---|---|---|---|
| `SPEC-S4-01` | Informe | Generar borrador 9 secciones (Edge Function) | BACKLOG | — | — |
| `SPEC-S4-02` | Editor | Editor de informe + indice + validacion | BACKLOG | — | — |
| `SPEC-S4-03` | Validacion | Flujo borrador → validar → finalizar | BACKLOG | — | — |
| `SPEC-S4-04` | Export | Exportar a PDF | BACKLOG | — | — |
| `SPEC-S4-05` | Dashboard | Dashboard con datos reales | BACKLOG | — | — |
| `SPEC-S4-06` | Pacientes | Historial informes en ficha paciente | BACKLOG | — | — |
| `SPEC-S4-07` | QA | Testing E2E + correcciones UX | BACKLOG | — | — |

---

## Resumen por Sprint

| Sprint | Total SPECs | DONE | IN PROGRESS | BACKLOG | BLOCKED/DIFERIDO |
|---|---|---|---|---|---|
| 0 | 5 | 4 | 0 | 0 | 1 (deploy) |
| 1 | 6 | 6 | 0 | 0 | 0 |
| 2 | 8 | 8 | 0 | 0 | 0 |
| 3 | 5 | 5 | 0 | 0 | 0 |
| 4 | 7 | 0 | 0 | 7 | 0 |
| **Total** | **31** | **23** | **0** | **6** | **1** |

---

## Estados Validos

| Estado | Significado |
|---|---|
| `BACKLOG` | Spec no escrito aun, en cola |
| `SPEC_READY` | Spec escrito y aprobado, listo para desarrollo |
| `IN_PROGRESS` | Tests escritos y/o codigo en desarrollo |
| `REVIEW` | Codigo listo, en revision |
| `DONE` | Tests VERDE + DOMAIN check + MEMORY update |
| `BLOCKED` | Depende de algo externo |
