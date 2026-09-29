# SPEC-S6-02: Editor del Informe

> Estado: SPEC_READY | Sprint: 6 | Epica: Editor | Realiza: RF-36

---

## Descripcion

Pantalla donde el examinador revisa el borrador, corrige lo que el sistema redacto y escribe la
seccion 9.

**Mock de referencia:** `mocks/editor-informe/screen.png`

El punto del editor no es escribir desde cero: es **revisar con el menor esfuerzo posible**. De ahi dos
requisitos que parecen cosmeticos y no lo son. Primero, que se distinga a simple vista lo que redacto
el sistema de lo que ya toco el profesional — sin eso, revisar obliga a releer todo. Segundo, que una
regeneracion nunca pise trabajo humano.

La seccion 9 llega vacia y es la que el examinador siempre escribe. El editor debe empujar hacia ella,
no esconderla al final de una lista de nueve.

---

## Criterios de Aceptacion (Given-When-Then)

### Escenario 1: Carga del borrador
```
GIVEN una sesion con informe en estado draft
WHEN el examinador abre el editor
THEN ve las 9 secciones en orden con su titulo y contenido
AND un indice lateral que permite saltar a cada una
```

### Escenario 2: Se distingue lo generado de lo editado
```
GIVEN un informe con secciones generadas por el sistema y otras ya editadas
WHEN el examinador lo abre
THEN las generadas por IA se marcan visualmente (ambar, segun el design system)
AND las editadas por el profesional se marcan como tales
AND las de plantilla no se marcan como IA
```

### Escenario 3: Editar una seccion
```
GIVEN la seccion 5 con contenido generado por el sistema
WHEN el examinador modifica el texto y guarda
THEN PATCH /api/v1/reports/{id}/sections/5 persiste el contenido
AND edited_by_examiner queda en true
AND updated_at se actualiza
```

### Escenario 4: La seccion 9 se destaca
```
GIVEN un informe recien generado
WHEN el examinador abre el editor
THEN la seccion 9 aparece senalada como pendiente de redaccion
AND el indice indica que falta completarla
```

### Escenario 5: Guardado sin perdidas
```
GIVEN el examinador esta escribiendo en una seccion
WHEN deja de escribir
THEN el contenido se guarda automaticamente con debounce
AND si la request falla, se avisa y el texto no se pierde del editor
```

### Escenario 6: Regenerar no pisa lo editado
```
GIVEN un informe donde las secciones 5 y 7 tienen edited_by_examiner true
WHEN el examinador solicita regenerar el borrador
THEN se le advierte que secciones se van a reemplazar
AND al confirmar, las secciones 5 y 7 se conservan intactas
AND las no editadas se regeneran
```

### Escenario 7: Progreso de revision
```
GIVEN un informe de 9 secciones
WHEN el examinador ha revisado 6
THEN el editor muestra el progreso de revision
AND el boton de validar no se habilita mientras la seccion 9 este vacia
```

### Escenario 8: Informe validado es de solo lectura
```
GIVEN un informe en estado validated
WHEN el examinador lo abre
THEN lo ve en modo lectura
AND los campos de edicion estan deshabilitados
AND PATCH sobre cualquier seccion devuelve 409
```

### Escenario 9: Informe de otro examinador
```
GIVEN un informe de una sesion del examinador B
WHEN el examinador A intenta abrirlo o editarlo
THEN recibe 403
```

---

## Scope

**IN:**
- Pantalla `ReportEditorPage` con indice lateral y las 9 secciones
- `PATCH /reports/{id}/sections/{n}`
- Autoguardado con debounce y aviso de fallo
- Distincion visual entre contenido de plantilla, generado por IA y editado
- Indicador de progreso de revision y bloqueo del boton de validar
- Modo lectura para informes validados
- Advertencia antes de regenerar

**OUT:**
- Transicion draft a validated (SPEC-S6-03)
- Exportacion a PDF (SPEC-S6-04)
- Edicion enriquecida: negritas, listas, tablas. Texto plano en esta version
- Historial de versiones o deshacer entre sesiones de edicion
- Comentarios o revision entre dos profesionales
- Plantillas personalizables

---

## Dependencias

| Dependencia | Tipo | Estado |
|---|---|---|
| SPEC-S6-01 (borrador generado) | Feature | BLOQUEANTE |
| SPEC-S5-06 (cliente de API en el frontend) | Feature | BLOQUEANTE |
| `mocks/editor-informe/code.html` | Diseno | Existe |
| Design system Clinical Precision | Diseno | DONE |

---

## Archivos a Crear/Modificar

| Archivo | Accion |
|---|---|
| `frontend/src/pages/ReportEditorPage.tsx` | Crear |
| `frontend/src/pages/ReportEditorPage.css` | Crear |
| `frontend/src/lib/reports.ts` | Crear (contra apiClient) |
| `frontend/src/App.tsx` | Modificar (ruta del editor) |
| `backend/src/psicograma/adapter/inbound/http/routers/reports.py` | Modificar (PATCH de seccion) |
| `backend/tests/adapter/test_reports_api.py` | Modificar |

---

## Validacion de Dominio

- Ruta en espanol y kebab-case, segun `domain.md`
- `edited_by_examiner` y `is_ai_generated` son los nombres del esquema; no se inventan sinonimos
- Colores semanticos del design system: ambar para sugerencia de IA, verde para validado
- Interfaz en espanol (RNF-21)
- El editor no permite tocar la numeracion ni los titulos de las secciones: son fijos
