# SPEC-AUD-01: Auditoria Funcional de los 41 Requerimientos

> Estado: SPEC_READY | Fase: 3 (Auditoria) | Epica: Verificacion | Verifica: RF-01 a RF-41, RNF-24

---

## Descripcion

Recorrer los 41 requerimientos funcionales del SRS y dejar evidencia de cada uno.

No es una prueba de humo ni una demo. Es la verificacion formal de que lo construido cumple lo
especificado, con una regla que le da valor: **un requerimiento sin evidencia observable se declara
no cumplido**. Sin esa regla, la auditoria se convierte en una lista de casillas marcadas de memoria.

El resultado es el insumo del apartado 4.1 del informe y lo que permite afirmar que el alcance
comprometido se cubrio, o decir con precision que parte no.

**Fuente de los requerimientos:**
`entregas/avance-2/07-informe/requerimientos-funcionales-no-funcionales.md`

---

## Criterios de Aceptacion (Given-When-Then)

### Escenario 1: Cobertura total del SRS
```
GIVEN los 41 requerimientos funcionales del SRS
WHEN se completa la auditoria
THEN cada RF tiene una fila en la matriz de verificacion
AND ninguno queda sin dictamen
```

### Escenario 2: Evidencia observable por requerimiento
```
GIVEN un requerimiento funcional cualquiera
WHEN se lo declara cumplido
THEN la matriz indica la pantalla o el endpoint donde se observo
AND el resultado concreto que se obtuvo
AND quien lo verifico y en que fecha
```

### Escenario 3: Sin evidencia, no cumplido
```
GIVEN un requerimiento para el que no se pudo producir evidencia
WHEN se cierra la auditoria
THEN se declara NO CUMPLIDO
AND no se marca como cumplido apoyandose en que el codigo existe
```

### Escenario 4: Recorrido de sesion completa
```
GIVEN un paciente de prueba registrado
WHEN se ejecuta el flujo completo en dos dispositivos: crear sesion, consentimiento,
     dibujar en tablet, observar el espejo, grabar audio, finalizar, transcribir,
     analizar, validar indicadores, generar informe, editar, validar y exportar
THEN cada paso queda registrado con su resultado
AND se cubren los RF-09 a RF-38 en un solo recorrido
```

### Escenario 5: Cumplimiento parcial
```
GIVEN un requerimiento que funciona solo en parte
WHEN se lo audita
THEN se declara PARCIAL
AND se describe exactamente que parte falta
AND se registra el impacto en el alcance comprometido
```

### Escenario 6: Trazabilidad a los objetivos
```
GIVEN la matriz completa
WHEN se agrupa por objetivo especifico del proyecto
THEN cada uno de los 5 objetivos muestra el estado de los RF que lo realizan
AND se puede afirmar o negar su cumplimiento con evidencia
```

### Escenario 7: Requerimientos fuera de la version
```
GIVEN un RF que el equipo decidio no implementar en esta version
WHEN se lo audita
THEN se declara DIFERIDO con la decision que lo justifica y donde esta registrada
AND no se presenta como cumplido
```

### Escenario 8: Documentacion suficiente para operar y mantener (RNF-24)
```
GIVEN la documentacion del proyecto
WHEN se audita su suficiencia
THEN existe documentacion tecnica que permite a un desarrollador levantar y desplegar el sistema
AND existe documentacion de usuario que permite a un psicologo aplicar un test sin acompanamiento
AND ambas estan en espanol y corresponden a la version auditada
```

---

## Scope

**IN:**
- Matriz de los 41 RF con dictamen: CUMPLIDO, PARCIAL, NO CUMPLIDO o DIFERIDO
- Recorrido end-to-end en dos dispositivos reales, tablet con lapiz y computadora
- Evidencia por requerimiento: captura, respuesta de la API o registro en base de datos
- Agrupacion por objetivo especifico
- Resumen ejecutivo para el apartado 4.1

**OUT:**
- Requerimientos no funcionales: van en SPEC-AUD-02, 03 y 04
- Medicion de tiempos de elaboracion: va en SPEC-AUD-05
- Correccion de los defectos encontrados: la auditoria los reporta, no los arregla
- Pruebas automatizadas end-to-end: esta auditoria es manual y documentada

---

## Dependencias

| Dependencia | Tipo | Estado |
|---|---|---|
| Sprint 5 cerrado | Feature | Pendiente |
| Sprint 6 cerrado | Feature | Pendiente |
| Tablet con lapiz digital | Infra | Requerida (RNF-28) |
| Datos de prueba sembrados | Datos | Por preparar |
| SRS aprobado | Doc | DONE |

---

## Evidencia a Producir

| Artefacto | Contenido |
|---|---|
| `entregas/avance-2/07-informe/auditoria-funcional.md` | Matriz de los 41 RF con dictamen y evidencia |
| Capturas del recorrido completo | Una por paso del flujo de sesion |
| Registro de respuestas de la API | Para los RF que no tienen pantalla propia |
| Resumen por objetivo especifico | Tabla de 5 filas con el estado de cada uno |

---

## Validacion de Dominio

- Los identificadores `RF-nn` son exactamente los del SRS: no se renumeran ni se agregan
- La terminologia de la matriz sigue el glosario de `domain.md`: Examinador, Paciente, Sesion,
  Indicador, Sugerencia IA, Indicador Validado, Borrador, Informe Validado
- Un RF marcado CUMPLIDO sin evidencia adjunta invalida la auditoria completa
