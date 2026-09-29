# SPEC-AUD-05: Medicion Pre/Post del Tiempo de Elaboracion del Informe

> Estado: SPEC_READY | Fase: 3 (Auditoria) | Epica: Investigacion
> Verifica: RF-37, objetivo especifico 5, hipotesis de trabajo

---

## Descripcion

Producir el dato que sostiene toda la investigacion.

La variable dependiente del proyecto es el **tiempo de elaboracion del informe**, y la hipotesis es que
Psicograma lo reduce frente al procedimiento manual. Sin esta medicion, el Capitulo 4 no tiene
resultados y el objetivo especifico 5 queda sin cumplir: el proyecto habria construido un sistema sin
demostrar que resuelve el problema que dice resolver.

**Advertencia de calendario, y es lo mas importante de este SPEC.** La medicion **pre** solo se puede
tomar mientras el centro siga elaborando informes a mano. En cuanto los psicologos adopten el sistema,
la linea base es irrecuperable: no hay forma de reconstruirla despues, y el Capitulo 1 ya documenta que
no existen estudios peruanos de los que tomarla prestada.

Por eso este SPEC **arranca ya**, no en noviembre. La recoleccion de la linea base va en paralelo al
desarrollo; lo que queda para la fase de auditoria es la medicion post y el contraste.

---

## Criterios de Aceptacion (Given-When-Then)

### Escenario 1: La linea base se recolecta antes de la adopcion
```
GIVEN el centro aun elabora informes de PBLL con el procedimiento manual
WHEN se registra el tiempo de cada informe con la ficha de registro
THEN se acumulan al menos 10 mediciones validas del procedimiento manual
AND todas son anteriores a que el psicologo empiece a usar Psicograma
```

### Escenario 2: Definicion operacional identica en ambas condiciones
```
GIVEN una medicion cualquiera, manual o con el sistema
WHEN se registra el tiempo
THEN se cuentan los minutos desde el cierre de la sesion con el paciente hasta la
     validacion final del informe
AND se excluyen las interrupciones ajenas a la tarea, registradas aparte
```

### Escenario 3: La medicion post se obtiene del sistema
```
GIVEN una sesion atendida con Psicograma y su informe validado
WHEN se consulta la base de datos
THEN el tiempo es la diferencia entre reports.validated_at y sessions.completed_at
AND no depende de que el psicologo lo anote a mano
```

### Escenario 4: Muestra suficiente en la condicion post
```
GIVEN el sistema en uso en el centro
WHEN concluye la ventana de medicion
THEN se han registrado al menos 10 informes validados
AND provienen de los mismos psicologos que aportaron la linea base
```

### Escenario 5: Analisis apropiado al tamano de muestra
```
GIVEN las mediciones pre y post
WHEN se analizan
THEN se reporta la mediana y el rango de cada condicion
AND se aplica la prueba de Wilcoxon de rangos con signo para muestras relacionadas
AND no se aplica una prueba t, porque el n es pequeno y no se asume normalidad
```

### Escenario 6: Reduccion expresada en minutos y en porcentaje
```
GIVEN los resultados del analisis
WHEN se redacta el Capitulo 4
THEN se informa la reduccion en minutos por informe
AND el porcentaje de reduccion respecto de la linea base
AND el valor del estadistico con su p
```

### Escenario 7: Las limitaciones se declaran
```
GIVEN el informe de resultados
WHEN se redactan sus limitaciones
THEN se declara que la medicion pre depende del autorreporte del profesional
     mientras la post es automatica, y que esa asimetria puede sesgar el resultado
AND se declara que la muestra es pequena y de un solo centro
AND se declara que el resultado es referencial y no constituye validacion clinica
```

### Escenario 8: Factores que confunden el resultado
```
GIVEN que un profesional se vuelve mas rapido con la practica
WHEN se interpretan los resultados
THEN se registra cuantos informes habia hecho cada psicologo con el sistema
AND se discute el efecto de aprendizaje como explicacion alternativa
```

### Escenario 9: Un resultado negativo tambien se publica
```
GIVEN que la medicion no muestre reduccion, o muestre aumento
WHEN se redacta el Capitulo 4
THEN se informa el resultado tal como se obtuvo
AND no se ajusta la definicion operacional ni se descartan mediciones para
    favorecer la hipotesis
```

---

## Scope

**IN:**
- Ficha de registro del procedimiento manual: fecha, psicologo, paciente codificado, hora de inicio,
  hora de fin, interrupciones
- Recoleccion de la linea base: minimo 10 informes, **antes de la adopcion**
- Extraccion automatica de la condicion post desde `sessions.completed_at` y `reports.validated_at`
- Analisis con mediana, rango y prueba de Wilcoxon
- Redaccion del apartado 4.1 con resultados y limitaciones
- Registro del numero de informes previos por psicologo, para discutir el efecto de aprendizaje

**OUT:**
- Validacion clinica del instrumento: excluida del alcance del proyecto
- Medicion de la calidad de los informes: solo se mide tiempo, que es la variable declarada
- Estudio de concordancia entre evaluadores
- Generalizacion a otros centros: la muestra es de uno solo
- Medicion del tiempo de la sesion con el paciente: la variable es el tiempo de **elaboracion del
  informe**, posterior al cierre de la sesion
- Instrumentacion adicional en el sistema para cronometrar pasos intermedios

---

## Dependencias

| Dependencia | Tipo | Estado |
|---|---|---|
| **Disponibilidad de los psicologos del centro** | Personas | **CRITICA** — sin su participacion no hay dato |
| Ficha de registro consensuada con el centro | Doc | Por elaborar. **Bloquea el inicio de la linea base** |
| SPEC-S6-03 (validacion del informe sella `validated_at`) | Feature | BLOQUEANTE para la condicion post |
| Sistema en uso real en el centro | Feature | Pendiente del cierre del Sprint 6 |
| Autorizacion del centro para usar los datos con fines academicos | Legal | Por confirmar |

---

## Evidencia a Producir

| Artefacto | Contenido |
|---|---|
| `entregas/avance-2/07-informe/protocolo-medicion.md` | Definicion operacional, muestra, procedimiento y analisis previsto |
| Ficha de registro manual | Plantilla impresa o digital para el psicologo |
| `auditoria-medicion.md` | Tabla de mediciones pre y post, anonimizadas |
| Analisis estadistico | Medianas, rangos, estadistico de Wilcoxon y p |
| Apartado 4.1 redactado | Resultados, discusion y limitaciones |

---

## Validacion de Dominio

- La definicion operacional es la del Capitulo 1: **minutos transcurridos desde el cierre de la sesion
  hasta la validacion final del informe**. No se cambia a mitad del estudio
- El **Informe Validado** es el hito que marca el fin de la medicion, segun el glosario de `domain.md`
- Los pacientes se identifican por codigo en todo registro de investigacion, nunca por nombre
- La asimetria entre una medicion pre autorreportada y una post automatica es una limitacion real y se
  declara. No se compensa con estimaciones
