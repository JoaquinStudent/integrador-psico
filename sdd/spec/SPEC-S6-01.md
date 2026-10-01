# SPEC-S6-01: Generar Borrador de Informe de 9 Secciones

> Estado: DONE | Sprint: 6 | Epica: Informe | Realiza: RF-35, RNF-17, RNF-18, RNF-19

---

## Descripcion

Componer el borrador del informe psicologico a partir de los datos de la sesion y de los indicadores
que el examinador ya valido.

**Mock de referencia:** `mocks/editor-informe/screen.png`

Este es el entregable que justifica el proyecto entero: la variable dependiente de la investigacion es
el tiempo de elaboracion del informe, y aqui es donde ese tiempo se reduce.

El hallazgo que ordena el diseno: **solo 4 de las 9 secciones necesitan un modelo de lenguaje.** Las
secciones 1 a 4 son plantillas deterministas sobre datos que ya estan en la base, y la 9 se entrega
vacia a proposito. Tratar las nueve como generacion libre seria mas costoso, mas lento y menos
defendible.

Y la restriccion que no se negocia: el modelo recibe **unicamente indicadores validados**. Nunca
sugerencias pendientes, nunca el catalogo completo, nunca interpretacion propia. La conclusion
diagnostica la escribe el psicologo. No es una decision de producto: es lo que el Capitulo 1 del
proyecto declara y sustenta en Lin et al. (2022).

---

## Criterios de Aceptacion (Given-When-Then)

### Escenario 1: Estructura del borrador
```
GIVEN una sesion completada con indicadores validados
WHEN el examinador hace POST /api/v1/sessions/{id}/report
THEN se crea un informe en estado draft
AND se crean 9 filas en report_sections, numeradas del 1 al 9
AND cada una lleva su titulo estandar
```

### Escenario 2: Las secciones 1 a 4 no usan modelo de lenguaje
```
GIVEN una sesion con paciente, examinador, test y consentimiento registrados
WHEN se genera el borrador
THEN las secciones 1 a 4 se componen por plantilla desde la base de datos
AND su is_ai_generated es false
AND su contenido es identico si se regenera con los mismos datos
```

### Escenario 3: La seccion 9 se entrega vacia
```
GIVEN cualquier sesion, con cualquier cantidad de indicadores validados
WHEN se genera el borrador
THEN la seccion 9 "Conclusiones del profesional" tiene content vacio
AND su is_ai_generated es false
```

### Escenario 4: Solo entran indicadores validados
```
GIVEN una sesion con 4 indicadores validated y 9 en suggestion
WHEN se genera el borrador
THEN el contexto enviado al modelo contiene solo los 4 validated
AND ninguno de los 9 en suggestion aparece en el texto de las secciones 7 u 8
```

### Escenario 5: Sin indicadores validados, secciones vacias
```
GIVEN una sesion analizada donde el examinador no valido ningun indicador
WHEN se genera el borrador
THEN las secciones 7 y 8 quedan vacias
AND no se inventa contenido para ellas
AND la respuesta advierte que faltan indicadores validados
```

### Escenario 6: Reparto por categoria
```
GIVEN indicadores validados de categoria A y de categoria B
WHEN se genera el borrador
THEN los de categoria A aparecen en la seccion 7
AND los de categoria B aparecen en la seccion 8
AND ninguno aparece en las dos
```

### Escenario 7: Cada afirmacion cita el manual
```
GIVEN la seccion 7 generada a partir de indicadores validados
WHEN se revisa su contenido
THEN cada afirmacion interpretativa referencia la seccion del manual que la origina
AND la referencia coincide con el section_code del indicador en el catalogo
```

### Escenario 8: La descripcion del dibujo usa las metricas reales
```
GIVEN una sesion con metricas calculadas
WHEN se genera la seccion 5
THEN el texto menciona el tamano, el emplazamiento, la presion, el tiempo total y la latencia
AND los valores coinciden con stroke_metrics
```

### Escenario 9: Observaciones conductuales
```
GIVEN una sesion con observaciones, marcas rapidas y transcripcion
WHEN se genera la seccion 6
THEN el texto integra las tres fuentes
AND si no hay transcripcion, la seccion se genera igual con las otras dos
```

### Escenario 10: Regenerar un borrador existente
```
GIVEN una sesion que ya tiene un informe en draft
WHEN se solicita generarlo de nuevo
THEN se reemplaza el contenido de las secciones no editadas por el examinador
AND las secciones con edited_by_examiner true se conservan
```

### Escenario 11: Informe ya validado
```
GIVEN una sesion cuyo informe esta en estado validated
WHEN se intenta generar el borrador otra vez
THEN la respuesta es 409
```

### Escenario 12: Falla del modelo de lenguaje
```
GIVEN el proveedor de LLM no responde
WHEN se genera el borrador
THEN las secciones 1 a 4 y la 9 se crean igual
AND las secciones 5 a 8 quedan vacias y marcadas como pendientes
AND la respuesta indica que la redaccion asistida no estuvo disponible
```

### Escenario 13: Sesion no completada
```
GIVEN una sesion en estado active o setup
WHEN se intenta generar el informe
THEN la respuesta es 409
AND el detalle indica que la sesion debe estar completada
```

---

## Scope

**IN:**
- `POST /sessions/{id}/report` y `GET /sessions/{id}/report`
- Servicio de dominio `compose_report`: decide que seccion es plantilla y que seccion es redactada
- Plantillas deterministas de las secciones 1, 2, 3, 4 y 9
- Prompt de las secciones 5, 6, 7 y 8, con la regla de solo-validados y la cita al manual
- Persistencia en `reports` y `report_sections`
- Degradacion controlada cuando el proveedor de LLM falla

**OUT:**
- Editor de las secciones (SPEC-S6-02)
- Flujo de validacion del informe (SPEC-S6-03)
- Exportacion a PDF (SPEC-S6-04)
- Plantillas configurables por el usuario: las 9 secciones son fijas en esta version
- Informes de otros instrumentos: solo PBLL
- Generacion de conclusiones diagnosticas, en ninguna forma (RNF-17)

---

## Dependencias

| Dependencia | Tipo | Estado |
|---|---|---|
| SPEC-S5-04 (repositorios) | Feature | BLOQUEANTE |
| SPEC-S5-05 (analisis: produce los indicadores a validar) | Feature | BLOQUEANTE |
| Tablas `reports` y `report_sections` | DB | En `schema.sql`, sin aplicar |
| Adaptador `LlmDrafter` | Codigo | Se crea en SPEC-S5-05 |
| `REPORT_SECTIONS` y `CONCLUSIONS_SECTION` en `domain/model.py` | Codigo | DONE (SPEC-S5-03) |

---

## Archivos a Crear/Modificar

| Archivo | Accion |
|---|---|
| `backend/src/psicograma/domain/services/compose_report.py` | Crear |
| `backend/src/psicograma/application/generate_report.py` | Crear |
| `backend/src/psicograma/adapter/inbound/http/routers/reports.py` | Crear |
| `backend/src/psicograma/adapter/outbound/postgres/repositories.py` | Modificar (repositorio de informes) |
| `backend/src/psicograma/adapter/outbound/llm/prompts.py` | Crear |
| `backend/tests/domain/test_compose_report.py` | Crear |
| `backend/tests/adapter/test_reports_api.py` | Crear |

---

## Validacion de Dominio

- Titulos de las 9 secciones tal como estan en `REPORT_SECTIONS` de `domain/model.py` y en el mock
- `report_sections.section_number` entre 1 y 9, con `UNIQUE (report_id, section_number)`
- `reports.status` solo `draft` o `validated`; el `CHECK` del esquema impide `validated` sin autor
  ni fecha
- Las categorias A y B se leen de `indicator_categories.code`, no se infieren del prefijo del codigo
- El informe se redacta en espanol (RNF-21)
- El servicio de dominio no conoce el proveedor de LLM: lo recibe como puerto `LlmDrafter`
