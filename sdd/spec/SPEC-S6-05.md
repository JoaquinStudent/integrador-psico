# SPEC-S6-05: Baja Logica de Paciente y Supresion de Datos

> Estado: DONE | Sprint: 6 | Epica: Pacientes | Realiza: RF-08, RNF-16

---

## Descripcion

Dos operaciones distintas que suelen confundirse, y conviene separarlas desde el diseno.

La **baja logica** es administrativa: el paciente ya no esta en tratamiento y no deberia aparecer en
los listados de trabajo. Su historial clinico se conserva intacto, porque los informes emitidos son
documentos profesionales con valor de registro.

La **supresion a solicitud** es un derecho del paciente o de su apoderado sobre sus datos personales.
Aqui la decision de diseno importa: no se borran las filas, se **anonimizan**. Eliminar una sesion en
cascada destruiria los datos de investigacion y las metricas agregadas del centro; anonimizar quita la
identificacion y conserva el registro clinico despersonalizado.

`patients.is_active` ya existe en el esquema desde v1. Lo que falta es la operacion y la distincion.

---

## Criterios de Aceptacion (Given-When-Then)

### Escenario 1: Desactivar un paciente
```
GIVEN un paciente activo con 3 sesiones y 2 informes validados
WHEN el examinador lo desactiva
THEN is_active pasa a false
AND las 3 sesiones y los 2 informes siguen existiendo sin cambios
```

### Escenario 2: El paciente inactivo sale del listado por defecto
```
GIVEN un paciente desactivado
WHEN el examinador abre el listado con el filtro por defecto
THEN el paciente no aparece
AND aparece al seleccionar el filtro de inactivos
```

### Escenario 3: La ficha del paciente inactivo sigue consultable
```
GIVEN un paciente desactivado
WHEN el examinador abre su ficha por enlace directo
THEN ve sus datos, su historial de sesiones y sus informes
AND la ficha indica claramente que esta inactivo
```

### Escenario 4: Reactivar
```
GIVEN un paciente desactivado
WHEN el examinador lo reactiva
THEN is_active pasa a true
AND vuelve a aparecer en el listado por defecto
```

### Escenario 5: No se abren sesiones nuevas a un paciente inactivo
```
GIVEN un paciente desactivado
WHEN el examinador intenta crearle una sesion
THEN la respuesta es 409
AND el detalle indica que hay que reactivarlo primero
```

### Escenario 6: Supresion a solicitud anonimiza
```
GIVEN un paciente que solicita la supresion de sus datos
WHEN el examinador ejecuta la supresion
THEN full_name y document_number quedan reemplazados por valores anonimos
AND birth_date se reduce al ano de nacimiento
AND las sesiones, metricas e indicadores se conservan
AND queda registrado que el paciente fue anonimizado y cuando
```

### Escenario 7: La supresion no destruye el registro clinico
```
GIVEN un paciente anonimizado que tenia 2 informes validados
WHEN se consultan los informes
THEN siguen existiendo
AND su contenido ya no permite identificar a la persona
```

### Escenario 8: La supresion es irreversible y se confirma
```
GIVEN el examinador solicita anonimizar un paciente
WHEN se ejecuta la accion
THEN la interfaz exige una confirmacion explicita que advierte que no se puede deshacer
AND sin esa confirmacion no se ejecuta
```

### Escenario 9: Paciente de otro examinador
```
GIVEN un paciente registrado por el examinador B
WHEN el examinador A intenta desactivarlo o anonimizarlo
THEN la respuesta es 403
```

---

## Scope

**IN:**
- `PATCH /patients/{id}` acepta cambio de `is_active`
- Operacion de anonimizacion, separada y con confirmacion explicita
- Filtro de inactivos en el listado
- Aviso de estado inactivo en la ficha
- Bloqueo de creacion de sesiones para pacientes inactivos
- Registro de la anonimizacion con fecha

**OUT:**
- Borrado fisico de pacientes, sesiones o informes: nunca, en ninguna version
- Politica de retencion automatica por antiguedad
- Exportacion de los datos del paciente para portabilidad
- Anonimizacion del audio grabado y de su transcripcion: se evalua aparte, porque la voz es
  biometrica y requiere decision del centro
- Flujo de solicitud formal del paciente: hoy lo ejecuta el examinador a peticion

---

## Dependencias

| Dependencia | Tipo | Estado |
|---|---|---|
| Endpoints de pacientes tras la API | Feature | BLOQUEANTE |
| `patients.is_active` | DB | Existe en el esquema |
| Campo para registrar la anonimizacion | DB | **Falta** — requiere migracion (SPEC-S5-07) |
| SPEC-S5-06 (cliente de API) | Feature | BLOQUEANTE para la parte de UI |

**Nota:** el esquema v2 no tiene donde registrar que un paciente fue anonimizado. Hay que anadir
`anonymized_at TIMESTAMPTZ` a `patients` en una revision de Alembic. Sin ese campo, el escenario 6 no
se puede verificar.

---

## Archivos a Crear/Modificar

| Archivo | Accion |
|---|---|
| `backend/migrations/versions/xxxx_anonymized_at_en_patients.py` | Crear |
| `backend/src/psicograma/application/deactivate_patient.py` | Crear |
| `backend/src/psicograma/application/anonymize_patient.py` | Crear |
| `backend/src/psicograma/adapter/inbound/http/routers/patients.py` | Modificar |
| `frontend/src/pages/PatientsPage.tsx` | Modificar (filtro de inactivos, accion de desactivar) |
| `frontend/src/pages/PatientDetailPage.tsx` | Modificar (aviso de inactivo, anonimizar) |
| `sdd/database/schema.sql` | Modificar (`anonymized_at`) |
| `backend/tests/adapter/test_patients_api.py` | Crear |

---

## Validacion de Dominio

- `is_active` respeta la convencion de booleanos con prefijo `is_` (`domain.md`)
- `anonymized_at` es `TIMESTAMPTZ`, como todos los timestamps del esquema
- Las FK de `sessions` hacia `patients` tienen `ON DELETE CASCADE`: precisamente por eso **no se
  borra** un paciente, porque arrastraria sesiones, dibujos, metricas e informes
- La baja logica y la supresion son operaciones distintas y se nombran distinto en la interfaz:
  "Desactivar" y "Anonimizar". No se mezclan en un boton de "Eliminar"
