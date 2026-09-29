# domain.md — Lenguaje Ubicuo y Convenciones

> Ultima actualizacion: 2026-08-25

## Glosario del Dominio

| Termino | Definicion | Contexto de Uso |
|---|---|---|
| **PBLL** | Persona Bajo La Lluvia. Test proyectivo de dibujo | Tipo de test, filtros, referencias al manual |
| **Examinador** | Psicologo clinico que administra el test y analiza resultados | Rol de usuario, interfaz desktop |
| **Paciente** | Persona evaluada que realiza el dibujo | Rol de usuario, interfaz tablet |
| **Sesion** | Instancia de administracion de un test a un paciente | Entidad central del sistema |
| **Consentimiento** | Autorizacion firmada del paciente/apoderado para la sesion | Paso obligatorio antes de iniciar sesion |
| **Trazo (Stroke)** | Secuencia de puntos entre pen-down y pen-up con timestamps y presion | Unidad atomica de captura del dibujo |
| **Indicador** | Criterio del manual PBLL evaluable en el dibujo | ~149 indicadores, categorias A-D |
| **Sugerencia IA** | Indicador detectado automaticamente, pendiente de validacion profesional | Estado ambar hasta que el examinador acepta/rechaza |
| **Indicador Validado** | Indicador confirmado por el examinador | Estado verde |
| **Borrador** | Informe generado por IA, sin validacion profesional | Estado inicial del informe |
| **Informe Validado** | Informe revisado y firmado por el examinador | Estado final, exportable a PDF |
| **Medicion Objetiva** | Datos estructurales extraidos automaticamente del dibujo | Tamano, emplazamiento, presion, tiempo, etc. |
| **Verificacion Profesional** | Checklist de indicadores visuales que requieren juicio del examinador | Rasgos faciales, extremidades, vestimenta, paraguas |
| **Marca Rapida** | Anotacion predefinida que el examinador registra durante la sesion en vivo | "Pausa prolongada", "Uso borrador", etc. |
| **Verbalizacion** | Comentario del paciente durante la sesion, capturado por transcripcion | Se extrae del audio via Whisper API |
| **Motor de Reglas** | JSON de reglas que mapea indicadores del manual a interpretaciones | Estructura: codigo, categoria, seccion, texto |
| **Latencia de Inicio** | Tiempo entre la entrega de la consigna y el primer trazo | Indicador del manual, seccion A-5 |
| **Secuencia de Inicio** | Primera parte del cuerpo que dibuja el paciente | Indicador del manual, seccion A-6 |

---

## Convenciones de Nomenclatura

### Base de Datos (Postgres/Supabase)

| Convencion | Ejemplo | Regla |
|---|---|---|
| Tablas | `patients`, `stroke_metrics` | snake_case, plural |
| Columnas | `full_name`, `created_at` | snake_case |
| PKs | `id` | UUID, siempre `id` |
| FKs | `patient_id`, `session_id` | `{tabla_singular}_id` |
| Timestamps | `created_at`, `updated_at` | Siempre con timezone |
| Booleanos | `is_active`, `has_umbrella` | Prefijo `is_` o `has_` |
| Enums | `status`, `detection_type` | Valores en snake_case: `draft`, `validated` |
| PK compuesta | `(session_id, indicator_code)` | Cuando la clave natural es la correcta; sin `id` surrogate redundante |
| Catalogos | `indicator_catalog`, `quick_mark_catalog` | Sufijo `_catalog` para tablas de referencia estables |
| Tablas puente | `session_indicators`, `session_quick_marks` | Prefijo con la entidad padre |
| JSONB | `strokes.points` | Solo para datos atomicos que nunca se consultan por dentro. Sin sufijo `_json`. Una lista que se filtra u ordena va en su propia tabla (1FN) |

### Codigo TypeScript/React

| Convencion | Ejemplo | Regla |
|---|---|---|
| Componentes | `DashboardPage`, `Sidebar` | PascalCase |
| Hooks | `useAuth`, `usePatients` | camelCase con prefijo `use` |
| Tipos/Interfaces | `Patient`, `StrokeMetrics` | PascalCase, singular |
| Variables | `patientList`, `strokeCount` | camelCase |
| Constantes | `NAV_ITEMS`, `STROKE_DEBOUNCE_MS` | UPPER_SNAKE_CASE |
| Archivos componente | `DashboardPage.tsx` | PascalCase, mismo nombre que el componente |
| Archivos utilidad | `supabase.ts`, `auth.tsx` | camelCase |
| CSS files | `Sidebar.css` | Mismo nombre que el componente |
| Rutas | `/pacientes`, `/sesiones` | kebab-case, espanol |

### API (FastAPI)

| Convencion | Ejemplo | Regla |
|---|---|---|
| Rutas | `/api/v1/sessions/{id}/analyze` | kebab-case, sustantivo-recurso en plural |
| Request body | `{ session_id, indicators }` | snake_case (match DB) |
| Response body | El recurso directo | Sin envoltorio. Los errores van por status HTTP + `application/problem+json` (RFC 9457) |

### Repositorio (directorios y documentos)

| Convencion | Ejemplo | Regla |
|---|---|---|
| Directorios | `manual-pbll/`, `referencia-ink-playground/` | kebab-case, minusculas, sin acentos ni espacios |
| Documentos | `api-contracts.md`, `informe-sprints.md` | kebab-case, minusculas |
| Orden explicito | `01-lean-canvas/`, `05-prototipo/` | Prefijo numerico con cero solo donde el orden importa |
| Excepciones | `README.md`, `LICENSE`, `CONTRIBUTING.md`, `CLAUDE.md`, `AGENTS.md`, `SPEC-*.md` | Convenciones de ecosistema o de la regla R1. No se renombran |

**Prohibido:** acentos en nombres de archivo (se corrompen a `_`: `an_lisis`, `sesi_n`), espacios,
espacios iniciales, y mayusculas fuera de las excepciones. Los renombrados van con `git mv`; los que
solo cambian mayusculas necesitan dos pasos en macOS (`git mv x tmp && git mv tmp X`).

---

## Categorias de Indicadores PBLL

| Codigo | Categoria | Seccion Manual | Ejemplo |
|---|---|---|---|
| `DIM-*` | Dimensiones | A-1 | `DIM-01` Dibujo pequeno |
| `UBI-*` | Emplazamiento | A-2 | `UBI-03` Margen inferior |
| `TRZ-*` | Trazos | A-3 | `TRZ-05` Linea entrecortada |
| `PRE-*` | Presion | A-4 | `PRE-02` Presion debil |
| `TMP-*` | Tiempo | A-5 | `TMP-01` Dificultad para comenzar |
| `SEC-*` | Secuencia | A-6 | `SEC-02` Inicio por paraguas |
| `MOV-*` | Movimiento | A-7 | `MOV-01` Rigidez |
| `SOM-*` | Sombreados | A-8 | `SOM-01` Ansiedad zona X |
| `ORI-*` | Orientacion persona | B-1 | `ORI-01` Hacia derecha |
| `POS-*` | Posturas | B-2 | `POS-01` Sentado |
| `BOR-*` | Borrados | B-3 | `BOR-01` Borrado excesivo |
| `DET-*` | Detalles accesorios | B-5 | `DET-03` Nubes |
| `VES-*` | Vestimenta | B-6 | `VES-02` Botones |
| `PAR-*` | Paraguas | B-7 | `PAR-01` Ausencia de paraguas |
| `CUE-*` | Partes del cuerpo | B-9 | `CUE-05` Ojos sin pupilas |
| `IDX-*` | Identidad sexual | B-10 | `IDX-01` Figura sexo contrario |
| `EXP-*` | Expresiones de conflicto | C | `EXP-04` Depresion |
| `DEF-*` | Mecanismos de defensa | D | `DEF-03` Anulacion |
