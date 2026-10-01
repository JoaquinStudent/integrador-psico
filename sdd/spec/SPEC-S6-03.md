# SPEC-S6-03: Flujo Borrador a Informe Validado

> Estado: DONE | Sprint: 6 | Epica: Validacion | Realiza: RF-37, RNF-20

---

## Descripcion

La transicion de `draft` a `validated` es el acto por el cual un profesional colegiado asume la
responsabilidad del contenido. No es un cambio de estado cosmetico: es la firma.

De eso se derivan tres cosas. Que quede registrado **quien** valido y **cuando** (RNF-20, y es la
trazabilidad que pide la supervision clinica). Que un informe validado sea inmutable, porque si se
puede editar despues de firmado la firma no vale nada. Y que la validacion sea el punto donde se mide
el tiempo de elaboracion: `reports.validated_at` menos el cierre de la sesion es, literalmente, la
variable dependiente de la investigacion.

---

## Criterios de Aceptacion (Given-When-Then)

### Escenario 1: Validar un informe completo
```
GIVEN un informe en draft con las 9 secciones con contenido
WHEN el examinador hace POST /api/v1/reports/{id}/validate
THEN el estado pasa a validated
AND validated_by queda con el examinador autenticado
AND validated_at queda sellado con la fecha y hora
```

### Escenario 2: No se valida con la seccion 9 vacia
```
GIVEN un informe en draft cuya seccion 9 esta vacia
WHEN se intenta validar
THEN la respuesta es 409
AND el detalle indica que las conclusiones del profesional son obligatorias
```

### Escenario 3: No se valida sin indicadores validados
```
GIVEN un informe cuya sesion no tiene ningun indicador en estado validated
WHEN se intenta validar el informe
THEN la respuesta es 409
AND el detalle indica que no hay indicadores validados que sustenten el informe
```

### Escenario 4: Revalidar es conflicto
```
GIVEN un informe ya en estado validated
WHEN se intenta validarlo de nuevo
THEN la respuesta es 409
AND validated_by y validated_at conservan sus valores originales
```

### Escenario 5: Un informe validado es inmutable
```
GIVEN un informe en estado validated
WHEN se intenta modificar cualquiera de sus secciones
THEN la respuesta es 409
AND el contenido no cambia
```

### Escenario 6: Solo el examinador de la sesion valida
```
GIVEN un informe de una sesion del examinador B
WHEN el examinador A intenta validarlo
THEN la respuesta es 403
```

### Escenario 7: La sesion queda sin evaluacion pendiente
```
GIVEN un paciente con una sesion completada y su informe en draft
WHEN el informe pasa a validated
THEN el paciente deja de aparecer en el filtro "Con evaluacion pendiente"
AND el contador de evaluaciones pendientes del panel baja en uno
```

### Escenario 8: Queda registrado el tiempo de elaboracion
```
GIVEN una sesion con completed_at conocido
WHEN su informe se valida
THEN validated_at permite calcular los minutos transcurridos desde el cierre de la sesion
AND ese dato queda disponible para la medicion de SPEC-AUD-05
```

### Escenario 9: La restriccion del esquema respalda la regla
```
GIVEN un intento de dejar status validated sin validated_by o sin validated_at
WHEN se escribe en la base de datos
THEN el CHECK del esquema lo rechaza
AND la regla no depende unicamente del codigo de la aplicacion
```

---

## Scope

**IN:**
- `POST /reports/{id}/validate`
- Validaciones previas: seccion 9 con contenido, al menos un indicador validado
- Sellado de `validated_by` y `validated_at`
- Inmutabilidad del informe validado, aplicada en la API
- Efecto en el filtro de evaluacion pendiente y en el contador del panel
- Confirmacion en la UI antes de firmar, advirtiendo que el informe queda cerrado

**OUT:**
- Firma digital criptografica o con certificado: fuera del alcance academico
- Reapertura de un informe validado. Si hace falta corregir, se emite uno nuevo (Sprint futuro)
- Notificacion al paciente
- Exportacion a PDF (SPEC-S6-04)
- Flujo de aprobacion por un supervisor

---

## Dependencias

| Dependencia | Tipo | Estado |
|---|---|---|
| SPEC-S6-01 (borrador generado) | Feature | BLOQUEANTE |
| SPEC-S6-02 (editor, para completar la seccion 9) | Feature | BLOQUEANTE |
| `CHECK` de `reports` en el esquema | DB | En `schema.sql`, sin aplicar |
| SPEC-S6-06 (panel) | Feature | Consume el efecto, puede ir en paralelo |

---

## Archivos a Crear/Modificar

| Archivo | Accion |
|---|---|
| `backend/src/psicograma/application/validate_report.py` | Crear |
| `backend/src/psicograma/adapter/inbound/http/routers/reports.py` | Modificar |
| `backend/src/psicograma/adapter/outbound/postgres/repositories.py` | Modificar |
| `frontend/src/pages/ReportEditorPage.tsx` | Modificar (accion de validar y confirmacion) |
| `backend/tests/adapter/test_reports_api.py` | Modificar |

---

## Validacion de Dominio

- Glosario: **Borrador** es el informe sin validacion profesional; **Informe Validado** es el revisado
  y firmado por el examinador, y es el unico exportable (ver `domain.md`)
- `reports.status` admite solo `draft` y `validated`
- `validated_by` referencia `profiles(id)`, no `auth.users` directamente
- Timestamps con zona horaria, siempre
- "Evaluacion pendiente" significa sesion `completed` sin informe `validated`: la misma definicion que
  usa el filtro de pacientes y el panel
