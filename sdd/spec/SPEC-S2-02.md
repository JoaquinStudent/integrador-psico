# SPEC-S2-02: Listado de Pacientes

> Estado: DONE | Sprint: 2 | Epica: Pacientes | Realiza: RF-06
> Renumerado desde `SPEC-S1-02` al pasar a la estructura de 6 sprints + auditoria

---

## Descripcion

Implementar la pantalla de listado de pacientes con tabla paginada, busqueda por nombre/documento, y filtros predefinidos.

**Mock de referencia:** `mocks/listado-pacientes/screen.png`

---

## Criterios de Aceptacion (Given-When-Then)

### Escenario 1: Carga inicial
```
GIVEN el examinador esta autenticado
WHEN navega a /pacientes
THEN ve una tabla con columnas: Paciente, Documento, Edad, Ultima Evaluacion, Evaluaciones, Estado, Acciones
AND los pacientes se muestran paginados (max 10 por pagina)
AND el filtro "Todos" esta activo por defecto
```

### Escenario 2: Busqueda por nombre
```
GIVEN el examinador esta en /pacientes
WHEN escribe "Martina" en el campo de busqueda
THEN la tabla filtra mostrando solo pacientes cuyo nombre contiene "Martina"
AND el filtro se aplica con debounce de 300ms
```

### Escenario 3: Busqueda por documento
```
GIVEN el examinador esta en /pacientes
WHEN escribe "34.567" en el campo de busqueda
THEN la tabla filtra mostrando pacientes cuyo documento contiene "34.567"
```

### Escenario 4: Filtro por evaluacion pendiente
```
GIVEN existen pacientes con sesiones en estado "completed" sin informe validado
WHEN el examinador hace click en el filtro "Con evaluacion pendiente"
THEN solo se muestran esos pacientes
AND el chip del filtro se marca como activo
```

### Escenario 5: Paginacion
```
GIVEN existen 25 pacientes
WHEN el examinador esta en la pagina 1
THEN ve "Pagina 1 de 3"
AND puede navegar a pagina 2 con el boton ">"
```

### Escenario 6: Sin pacientes
```
GIVEN no existen pacientes registrados
WHEN navega a /pacientes
THEN ve un estado vacio con mensaje "No hay pacientes registrados"
AND un boton "Nuevo paciente" prominente
```

---

## Scope

**IN:**
- Tabla paginada con datos de Supabase
- Busqueda por nombre o documento (input unico)
- Filtros: Todos, Con evaluacion pendiente, Menores de edad, Este mes
- Paginacion con controles prev/next
- Boton "+ Nuevo paciente" que navega al formulario

**OUT:**
- Ordenamiento por columna (Sprint futuro)
- Exportar listado a CSV
- Acciones del menu "..." (editar, eliminar — van en SPEC-S1-03 y SPEC-S1-04)

---

## Dependencias

| Dependencia | Tipo | Estado |
|---|---|---|
| `patients` table en Supabase | DB | schema.sql listo |
| Auth context | Codigo | DONE (Sprint 0) |
| Layout shell | Codigo | DONE (Sprint 0) |
| SPEC-S1-03 (crear paciente) | Feature | Puede desarrollarse en paralelo |

---

## Archivos a Crear/Modificar

| Archivo | Accion |
|---|---|
| `src/pages/PacientesPage.tsx` | Crear |
| `src/pages/PacientesPage.css` | Crear |
| `src/lib/patients.ts` | Crear (hook usePatients) |
| `src/App.tsx` | Modificar (reemplazar PlaceholderPage en ruta /pacientes) |

---

## Validacion de Dominio

- Tabla: `patients` (ver domain.md)
- Columna edad: calculada desde `birth_date`, no almacenada
- Estado "Informe pendiente" / "Al dia": derivado de join con `sessions` y `reports`
