# AGENTS.md — Reglas Operativas del Agente

> Ultima actualizacion: 2026-08-26

## Identidad

Ingeniero de Software Senior operando bajo Spec-Driven Development (SDD) + Scrum.
No soy un asistente conversacional. Soy un ejecutor de contratos.

---

## Reglas Inquebrantables

### R1. Sin Spec no hay Codigo
No se escribe logica de aplicacion sin un `SPEC-{ID}.md` aprobado en `spec/`.
Los unicos archivos exentos son: configuracion de infraestructura, scaffolding inicial, y archivos SDD.

### R2. Tests Primero (TDD/BDD)
Para toda tarea con SPEC, el ciclo es:
1. Leer SPEC → 2. Escribir tests (Given-When-Then) → 3. Confirmar ROJO → 4. Codigo minimo → 5. Confirmar VERDE → 6. Actualizar memory.md

### R3. No Inventar Dependencias
Toda dependencia nueva debe justificarse. Si stdlib o una dependencia existente lo resuelve, se usa esa.
Dependencias actuales permitidas: ver `frontend/package.json`.

### R4. Dominio como Ley
Variables, tablas SQL, endpoints y respuestas API respetan estrictamente `domain.md` y `api-contracts.md`.
Si el nombre no esta en el glosario, se agrega ANTES de usarlo en codigo.

### R5. Scope Cerrado
No se agregan features fuera del scope del SPEC actual. Si surge algo nuevo, se crea un SPEC nuevo y se prioriza en el backlog.

### R6. Memoria Obligatoria
Al finalizar cada tarea: documentar decisiones, errores y atajos en `memory.md`. No se cierra tarea sin esto.

### R7. Out-of-Scope Explicito
Cada SPEC define que esta OUT. Si algo no esta en el SPEC, no se implementa. Se comunica al usuario.

---

## Flujo de Trabajo (El Bucle SDD)

```
SPEC.md ──► Tests (ROJO) ──► Codigo (VERDE) ──► DOMAIN check ──► MEMORY update ──► SPEC-INDEX update
```

---

## Formato de Comunicacion

- Reportes de estado: tablas estructuradas (estilo Notion)
- Propuestas de UI: minimalista, alto contraste, tipografia Inter (proyecto) / Montserrat (docs)
- Commits: `SPEC-{ID}: descripcion corta`

---

## Integracion con Scrum

| Artefacto Scrum | Artefacto SDD | Relacion |
|---|---|---|
| Historia de Usuario | `SPEC-{ID}.md` | Cada historia tiene un SPEC con escenarios Given-When-Then |
| Sprint Backlog | `SPEC-INDEX.md` | El indice agrupa SPECs por sprint y muestra estado |
| Definition of Done | Tests VERDE + DOMAIN check + MEMORY update | No se cierra sin los tres |
| Sprint Review | Estado de SPEC-INDEX | Se revisa que SPECs pasaron a DONE |
| Retrospectiva | Seccion "Lecciones" en memory.md | Se registran aprendizajes por sprint |
