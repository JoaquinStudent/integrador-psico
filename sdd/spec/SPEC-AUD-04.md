# SPEC-AUD-04: Auditoria de Rendimiento y Compatibilidad

> Estado: SPEC_READY | Fase: 3 (Auditoria) | Epica: Verificacion
> Verifica: RNF-01, RNF-02, RNF-03, RNF-04, RNF-09, RNF-28, RNF-29, RNF-30

---

## Descripcion

Medir los cuatro requerimientos de rendimiento sobre una sesion real, con la tablet y el escritorio
que va a usar el centro.

Dos de ellos no son comodidad, son validez del instrumento. Si el lienzo pierde puntos del trazo, las
metricas de presion y de tiempo quedan mal y el analisis se apoya en datos corruptos. Y si el espejo
se atrasa, el examinador observa un dibujo que ya no es el que el paciente esta haciendo, con lo que
sus anotaciones quedan desalineadas del momento en que ocurrieron.

Medir en el navegador del desarrollador con un raton no sirve: la presion solo la reporta un stylus, y
la latencia depende de la red del consultorio.

---

## Criterios de Aceptacion (Given-When-Then)

### Escenario 1: Latencia del espejo
```
GIVEN una sesion activa entre la tablet del paciente y el escritorio del examinador
WHEN el paciente completa 30 trazos
THEN cada uno aparece en el panel del examinador en menos de 1 segundo
AND se reporta la latencia media y la peor medicion
```

### Escenario 2: Fluidez de la captura
```
GIVEN el paciente dibuja un trazo continuo de al menos 3 segundos
WHEN se compara la cantidad de puntos capturados con los eventos de puntero emitidos
THEN no hay perdida perceptible de puntos
AND los timestamps de los puntos son monotonos crecientes
```

### Escenario 3: La presion se registra de verdad
```
GIVEN una tablet con lapiz digital
WHEN el paciente dibuja variando la presion
THEN los puntos guardados tienen valores de pressure distintos entre si
AND no todos valen el valor por defecto de 0.5
```

### Escenario 4: Tiempo de respuesta de la API
```
GIVEN la aplicacion desplegada
WHEN se miden los endpoints de consulta y de registro
THEN responden en menos de 2 segundos
AND se reporta el percentil 95 por endpoint
```

### Escenario 5: Las operaciones lentas informan progreso
```
GIVEN la transcripcion del audio y la generacion del borrador del informe
WHEN se ejecutan
THEN pueden exceder los 2 segundos, segun la excepcion que declara RNF-03
AND la interfaz muestra que la operacion esta en curso
AND se reporta su duracion tipica
```

### Escenario 6: Frecuencia de las metricas en vivo
```
GIVEN una sesion activa
WHEN se observa el panel del examinador durante 2 minutos
THEN las metricas se refrescan al menos cada 2 segundos
AND el refresco no interrumpe el dibujo en la tablet
```

### Escenario 7: Sesion larga
```
GIVEN una sesion de 20 minutos con mas de 200 trazos
WHEN concluye
THEN el lienzo no se degrada de forma perceptible
AND la persistencia final de los trazos se completa sin error
AND se reporta el tamano del payload enviado
```

### Escenario 8: Red degradada y tolerancia a desconexion (RNF-09, RNF-30)
```
GIVEN una conexion con latencia alta o intermitente
WHEN el paciente dibuja
THEN los trazos no se pierden localmente
AND el espejo se recupera al restablecerse la conexion
AND al finalizar, los trazos ejecutados durante el corte se persisten igual
AND se reporta el comportamiento observado, aunque exceda el umbral de RNF-01
```

### Escenario 9: Navegadores y dispositivos soportados (RNF-28, RNF-29)
```
GIVEN la matriz de navegadores y dispositivos que el centro puede usar
WHEN se recorre el flujo de sesion en cada combinacion
THEN el modulo del paciente funciona en tablet con lapiz digital
AND el modulo del examinador funciona en computadora de escritorio
AND se registra en que navegadores la captura de presion del puntero esta disponible
AND se documentan las combinaciones no soportadas, para advertirlo antes de una sesion
```

---

## Scope

**IN:**
- Medicion de la latencia del espejo sobre 30 trazos, con media y peor caso
- Comparacion de puntos capturados contra eventos de puntero emitidos
- Verificacion de que la presion del stylus llega con valores reales
- Percentil 95 de tiempo de respuesta por endpoint
- Duracion tipica de transcripcion y de generacion del informe
- Prueba de sesion larga: 20 minutos, mas de 200 trazos
- Observacion del comportamiento con red degradada y tras una desconexion (RNF-09, RNF-30)
- Matriz de navegadores y dispositivos soportados, con disponibilidad de presion (RNF-28, RNF-29)
- **Medicion sobre el hardware real del centro**, no sobre el equipo de desarrollo

**OUT:**
- Pruebas de carga con usuarios concurrentes: el centro opera con un examinador por sesion; la
  escalabilidad horizontal (RNF-06) se documenta como diseno, no se mide
- Perfilado y optimizacion del codigo: la auditoria mide y reporta, no optimiza
- Medicion de disponibilidad sostenida (RNF-07): requiere una ventana de observacion mas larga que
  la fase de auditoria
- Consumo de bateria de la tablet

---

## Dependencias

| Dependencia | Tipo | Estado |
|---|---|---|
| Sprint 5 y Sprint 6 cerrados | Feature | Pendiente |
| Despliegue accesible | Infra | Pendiente (SPEC-S1-04 diferido) |
| **Tablet con lapiz digital del centro** | Infra | Requerida; sin ella el escenario 3 no se puede verificar |
| Red del consultorio | Infra | Requerida para los escenarios 1 y 8 |
| Instrumentacion de tiempos en el cliente | Codigo | Por anadir para medir |

---

## Evidencia a Producir

| Artefacto | Contenido |
|---|---|
| `entregas/avance-2/07-informe/auditoria-rendimiento.md` | Dictamen por cada RNF con los numeros medidos |
| Tabla de latencias | 30 mediciones, media y peor caso |
| Tabla de tiempos de respuesta | Endpoint, percentil 95, cantidad de muestras |
| Registro de la sesion larga | Trazos, duracion, tamano del payload, errores |
| Descripcion del entorno de medicion | Modelo de tablet, navegador, red, fecha |

---

## Validacion de Dominio

- Las metricas medidas son las 7 de `stroke_metrics`, con los nombres del esquema
- La presion es un valor de 0.0 a 1.0, como declara el esquema y el modelo de dominio
- `PAUSE_THRESHOLD_MS` y los umbrales de `Thresholds` son perillas de calibracion: si la auditoria
  muestra que no se ajustan a las sesiones reales, se reportan para recalibrar, no se declaran defecto
- Todo numero reportado indica el entorno donde se midio. Una medicion sin su entorno no es
  interpretable
