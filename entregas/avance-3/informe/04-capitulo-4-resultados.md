# CAPÍTULO 4: RESULTADOS

> Este capítulo se escribe en **dos bloques** porque los dos tienen un grado de evidencia distinto: los resultados de **construcción** existen hoy y se pueden verificar; los de la **variable dependiente** (el tiempo de elaboración del informe) todavía no existen, porque la medición no se ha hecho. No se rellenan con estimaciones.

## 4.1. Resultados

### 4.1.1. Resultados de construcción

Corte: **28/10/2026**, rama `test`. Todas las cifras proceden de una corrida real de esa fecha.

#### Cobertura de requerimientos

| Resultado | Valor | Fuente |
|---|---|---|
| Requerimientos funcionales con componente | **41 de 41** | Anexo 14 |
| Implementados y verificados (prueba automática o revisión en navegador) | 28 | Anexo 14 |
| Implementados sin verificación completa | 9 | Anexo 14 |
| Cubiertos parcialmente | 4 (RF-03, RF-09, RF-31, RF-34) | Anexo 14 |
| Requerimientos no funcionales especificados | 30 | SRS (Avance 2) |

#### Calidad del código y pruebas

| Verificación | Resultado del 28/10/2026 |
|---|---|
| Pruebas de backend recogidas | **153** |
| Pruebas de backend sin red ni base de datos | **67 de 67 pasan** |
| Pruebas contra la base real | 83 pasan · 1 omitida · **9 fallan por dos pendientes de despliegue** (ver abajo), ninguna por regresión |
| Pruebas del frontend | 11 de 11 pasan |
| Frontera hexagonal (`check-hexagon.sh`) | **OK**: el dominio no importa infraestructura |
| Linter del backend (Ruff) | Sin errores en `src` y `tests` |
| Compilación del frontend (TypeScript + build) | Sin errores |
| Linter del frontend | 14 avisos de estilo, ningún error |
| Vulnerabilidades de dependencias del frontend (`npm audit`, producción) | 0 |

**Los 9 fallos son esperados y tienen dos causas** que dependen de aplicar scripts en la base de datos, no de defectos del código: (1) el *seed* que deja el catálogo en 183 indicadores todavía no se aplicó (1 prueba: la base tiene 201 activos); (2) la migración `0003` de la agenda y Google no se aplicó (8 pruebas: 6 de citas y 2 que comparan los modelos con la base).

#### Resultados funcionales

| Resultado | Valor |
|---|---|
| Indicadores del manual modelados / activos | 201 / **183** (23 automáticos, 20 semiautomáticos, 140 de verificación profesional) |
| Métricas objetivas del trazo calculadas de forma determinista | 7 (área, emplazamiento, presión, tiempo total, latencia, pausas, borrados) |
| Secciones del borrador de informe | 9; la 9 (*Conclusiones del profesional*) se entrega vacía |
| Tablas del esquema, todas con RLS | 24 |
| Pantallas del examinador y del paciente | 18 páginas |

#### Auditoría de interfaz y flujo (28/10/2026)

Se recorrieron las pantallas en un navegador real (Chrome). Se detectaron y corrigieron:

| Tipo | Hallazgo | Estado |
|---|---|---|
| Visual | Cinco variables de CSS sin definir dejaban botones y fondos invisibles, entre ellos «Generar informe» y «Guardar verificación» | Corregido |
| Visual | El dibujo del paciente quedaba fuera de pantalla en el análisis | Corregido |
| Datos | «Última evaluación» mostraba la fecha de registro; «Evaluaciones» contaba sesiones canceladas | Corregido |
| Datos | El catálogo de tests decía «149 indicadores» | Corregido (183, calculado) |
| Flujo | Una sesión sin consentimiento firmado permitía iniciar la toma | Corregido (bloqueada) |
| Flujo | Sesiones completadas se abrían en la pantalla en vivo desde el panel y la ficha | Corregido |
| Flujo | Errores del servidor se mostraban como «sin conexión»; `alert()` bloqueantes; sin página para direcciones inexistentes | Corregido |
| Rendimiento | La lista de sesiones tardaba ~7 s con 11 sesiones (consultas repetidas por sesión) | Corregido: ~2,5 s |
| Consigna | La pantalla del paciente decía «Dibuja…»; el manual dice «Dibuje…» | Corregido |
| Pendiente | Las notas del paciente solo viven en el navegador | Declarado en pantalla; falta persistirlas |

#### Datos del proceso del trazo

Durante la revisión del lienzo se encontró y corrigió un defecto que afectaba a la variable de estudio: el instante de inicio de cada trazo se guardaba relativo al propio trazo, de modo que **la latencia de inicio y las pausas salían siempre en cero** (indicadores A-5 del manual). Se corrigió con una referencia de tiempo única y se cubrió con pruebas (11 pruebas del frontend y validación de coherencia temporal en la API). Los dibujos guardados antes de la corrección conservan esos ceros y no pueden recuperarse.

#### Lo que no se midió

| Aspecto | Estado |
|---|---|
| Latencia del espejo en vivo (RNF-01: < 1 s; objetivo de diseño < 200 ms) | ⚠️ **No medida**. Es parte de AUD-04 |
| Espejo en vivo con la tablet física y el lápiz | ⚠️ Sin verificar en esta auditoría |
| Recorrido completo hasta el PDF en navegador | ⚠️ Pendiente (generar el informe consume el servicio de lenguaje) |
| Latencia de la API contra la base remota | Medida: ~1,2 s de base por petición (la base está lejos del servidor); la lista de sesiones, ~2,5 s |
| Usabilidad (escala SUS ≥ 68, objetivo 3) | ⚠️ **No aplicada** |

### 4.1.2. Resultados de la variable dependiente

**La variable dependiente es el tiempo de elaboración del informe** (minutos desde el cierre de la sesión hasta la validación final; §2.1.1). **No hay resultados todavía**: no existe una sola medición registrada en `medicion/mediciones.md`. Este apartado deja armado el instrumento, el análisis y la estructura de las tablas.

#### Instrumento y estado

| Elemento | Estado | Ubicación |
|---|---|---|
| Definición operacional idéntica en ambas condiciones | ✅ Escrita | `medicion/protocolo-medicion.md` |
| Ficha de registro (11 campos; solo códigos de psicólogo y paciente) | ✅ Lista | `medicion/ficha-registro.md` |
| Tabla de mediciones (≥ 10 manuales y ≥ 10 con sistema) | ✅ Vacía, lista para llenar | `medicion/mediciones.md` |
| Análisis estadístico (mediana, rango, reducción, Wilcoxon exacto) | ✅ Programado y autoverificado; probado con **datos simulados** | `medicion/prueba-analisis/` |
| **Línea base manual** | ❌ **Sin datos** | — |
| Medición con el sistema | ❌ Sin datos | — |

La medición posterior se obtiene **del propio sistema**, sin depender del autorreporte: es la diferencia entre `reports.validated_at` y `sessions.completed_at`. La línea base manual, en cambio, depende de que el psicólogo anote sus horas (autorreporte).

#### Estructura de las tablas de resultados (a completar con datos reales)

**Tabla 4.1.** Tiempo neto de elaboración del informe por condición (minutos).

| Condición | n | Mediana | Mínimo | Máximo |
|---|---|---|---|---|
| Manual (línea base) | ⚠️ | ⚠️ | ⚠️ | ⚠️ |
| Con Psicograma | ⚠️ | ⚠️ | ⚠️ | ⚠️ |

**Tabla 4.2.** Reducción y contraste.

| Indicador | Valor |
|---|---|
| Reducción de la mediana (minutos) | ⚠️ |
| Reducción respecto de la línea base (%) | ⚠️ |
| Pares analizados (mismo psicólogo) | ⚠️ |
| Estadístico W de Wilcoxon y p (exacto, bilateral) | ⚠️ |

**Tabla 4.3.** Efecto de aprendizaje: tiempo con el sistema según informes previos de cada psicólogo. ⚠️

> **Regla de redacción (SPEC-AUD-05, escenario 9).** Si la medición no muestra reducción, o muestra aumento, se informa tal como se obtuvo; no se ajusta la definición operacional ni se descartan mediciones para favorecer la hipótesis.

#### Limitaciones que se declararán junto con los resultados

1. La medición manual depende del **autorreporte** del profesional, mientras que la medición con el sistema es automática: esa asimetría puede sesgar el resultado.
2. La muestra es **pequeña y de un solo centro** (Centro Psicológico Ser Integral).
3. Un profesional se vuelve más rápido con la práctica: se registra cuántos informes llevaba cada psicólogo con el sistema y se discute el efecto de aprendizaje como explicación alternativa.
4. El resultado es **referencial** y **no constituye una validación clínica** del instrumento.
5. El método de emparejamiento de las mediciones (la k-ésima manual con la k-ésima con el sistema, dentro de cada psicólogo) lo definió el equipo y debe confirmarse con el docente.

> **Aviso sobre los datos de prueba.** La carpeta `medicion/prueba-analisis/` contiene datos **inventados** que solo sirven para comprobar que el cálculo funciona. **No son resultados y no deben citarse como tales.**
