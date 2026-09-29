# SPEC-AUD-03: Auditoria Etica y de Trazabilidad Clinica

> Estado: SPEC_READY | Fase: 3 (Auditoria) | Epica: Verificacion | Verifica: RNF-14, RNF-17, RNF-18, RNF-19, RNF-20

---

## Descripcion

Verificar la restriccion que define al proyecto: **el sistema no diagnostica**.

Esta es la auditoria mas importante de las cinco, y la que un evaluador va a mirar con mas atencion.
El Capitulo 1 declara que el sistema no emite diagnosticos ni conclusiones, y lo sustenta en Lin et al.
(2022) —que demostro que los indicadores de los tests proyectivos de dibujo no predicen de forma
confiable problemas de salud mental—. Si el sistema construido se sale de ese limite, el proyecto
pierde su fundamento: no seria una herramienta de apoyo con respaldo teorico, seria exactamente lo que
la literatura citada desaconseja.

De ahi que los escenarios se escriban en negativo: lo que se verifica es que el sistema **no** hace
cosas. Y el caso de prueba mas importante es el mas incomodo de todos: generar un informe sin ningun
indicador validado y comprobar que no rellena nada.

---

## Criterios de Aceptacion (Given-When-Then)

### Escenario 1: Informe sin indicadores validados
```
GIVEN una sesion analizada con 12 indicadores en suggestion y ninguno validated
WHEN se genera el borrador del informe
THEN las secciones 7 y 8 quedan vacias
AND no contienen texto interpretativo de ningun tipo
AND ninguna de las 12 sugerencias aparece en el documento
```

### Escenario 2: La seccion 9 nunca se genera
```
GIVEN diez informes generados de sesiones distintas
WHEN se revisa la seccion 9 de cada uno
THEN en los diez llega vacia
AND en ninguno el sistema escribio conclusiones
```

### Escenario 3: Ninguna sugerencia entra sin validacion
```
GIVEN una sesion con indicadores en suggestion y en rejected
WHEN se genera el informe y se exporta el PDF
THEN el contexto enviado al modelo de lenguaje contiene solo los validated
AND ni el informe ni el PDF mencionan los suggestion ni los rejected
```

### Escenario 4: Todo indicador declara su origen en el manual
```
GIVEN la pantalla de analisis y el informe generado
WHEN se revisa cada indicador mostrado al examinador
THEN declara el codigo y la seccion del manual que lo origina
AND la referencia coincide con indicator_catalog y manual_sections
```

### Escenario 5: Toda sugerencia automatica declara su medicion
```
GIVEN los indicadores detectados automaticamente en una sesion
WHEN se revisa cada uno
THEN su campo evidence contiene la medicion concreta y el umbral que lo disparo
AND no hay sugerencias sin evidencia
```

### Escenario 6: Registro de quien valido
```
GIVEN indicadores validados y un informe validado
WHEN se consultan en base de datos
THEN cada indicador tiene validated_by y validated_at
AND el informe tiene validated_by y validated_at
AND los valores corresponden al profesional que ejecuto la accion
```

### Escenario 7: Ausencia de lenguaje diagnostico
```
GIVEN diez informes generados a partir de sesiones reales de prueba
WHEN un psicologo del centro revisa el texto de las secciones 5 a 8
THEN no encuentra afirmaciones diagnosticas ni categorias clinicas atribuidas al paciente
AND el lenguaje se mantiene descriptivo y referido al manual
```

### Escenario 8: Consentimiento previo obligatorio
```
GIVEN una sesion sin consentimiento firmado
WHEN se intenta iniciarla
THEN el sistema lo impide
AND con audio_authorized en false, la grabacion se rechaza con 403
```

### Escenario 9: El paciente no ve el analisis
```
GIVEN una sesion activa en la tablet del paciente
WHEN se recorren todas las pantallas del modulo del paciente
THEN en ninguna aparecen metricas, indicadores, sugerencias ni resultado alguno
```

### Escenario 10: Las categorias C y D
```
GIVEN la decision del equipo sobre las categorias C (conflicto) y D (defensa)
WHEN se audita el catalogo y el informe
THEN el comportamiento del sistema coincide con lo que declara el Capitulo 1
AND si el Capitulo 1 las excluye, no aparecen en sugerencias ni en el informe
```

---

## Scope

**IN:**
- Generacion de informes en condiciones limite: sin indicadores validados, sin transcripcion,
  sin observaciones
- Verificacion de que la seccion 9 llega vacia, sobre una muestra de informes
- Revision del contexto efectivo que recibe el modelo de lenguaje
- Verificacion de la trazabilidad al manual en pantalla, informe y PDF
- Verificacion del registro de validaciones en base de datos
- **Revision del texto generado por un psicologo del centro**, no solo por el equipo tecnico
- Recorrido del modulo del paciente buscando fugas de informacion de analisis
- Verificacion de la coherencia con el Capitulo 1 en cuanto a las categorias C y D

**OUT:**
- Validacion de la exactitud clinica de las interpretaciones del manual: el sistema reproduce el
  manual, no lo valida
- Estudio de concordancia entre evaluadores
- Verificacion de la calidad de redaccion del modelo mas alla de la ausencia de lenguaje diagnostico
- Aspectos de seguridad tecnica: van en SPEC-AUD-02

---

## Dependencias

| Dependencia | Tipo | Estado |
|---|---|---|
| SPEC-S6-01 (generacion del borrador) | Feature | BLOQUEANTE |
| SPEC-S6-04 (PDF) | Feature | BLOQUEANTE para el escenario 3 |
| **Decision sobre las categorias C y D** | Decision | **PENDIENTE del equipo** (riesgo R-01) |
| Disponibilidad de un psicologo del centro para el escenario 7 | Personas | Por coordinar |
| Sesiones de prueba con datos realistas | Datos | Por preparar |

---

## Evidencia a Producir

| Artefacto | Contenido |
|---|---|
| `entregas/avance-2/07-informe/auditoria-etica.md` | Dictamen por cada RNF verificado |
| Informe generado sin indicadores validados | Documento completo, mostrando las secciones 7, 8 y 9 vacias |
| Volcado del contexto enviado al modelo | Prueba de que solo contiene indicadores validated |
| Revision firmada por el psicologo | Dictamen del escenario 7, con su nombre y matricula |
| Capturas del modulo del paciente | Todas sus pantallas, para el escenario 9 |

---

## Validacion de Dominio

- El glosario es explicito: **Sugerencia IA** es un indicador pendiente de validacion profesional y
  permanece en estado ambar hasta que el examinador lo acepta o lo rechaza (`domain.md`)
- La seccion 9 corresponde a `CONCLUSIONS_SECTION` en `domain/model.py` y se entrega vacia por
  definicion, no por falta de implementacion
- `session_indicators.status` solo admite `suggestion`, `validated` o `rejected`, y el `CHECK` del
  esquema exige autor y fecha para los dos ultimos
- Un hallazgo de generacion de contenido diagnostico se clasifica como **critico**: contradice el
  fundamento teorico del proyecto y bloquea la entrega hasta corregirse
