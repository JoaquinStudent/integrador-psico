# Prueba del análisis estadístico (datos SIMULADOS)

> ⚠️ **Los datos de esta carpeta son inventados.** Existen solo para comprobar que el
> cálculo funciona. **No son resultados**, no se citan en el Capítulo 4 y no representan
> a ningún psicólogo, paciente ni centro reales. Se reemplazan por la medición real
> (`../mediciones.md`) en cuanto exista.

## Uso

```bash
python3 analizar.py                    # usa SIMULADO-datos-prueba.csv
python3 analizar.py ../mis-datos.csv   # mismo formato, con datos reales
```

Solo requiere Python 3 (sin dependencias). El script se autoverifica al arrancar
(`_autoprueba`): falla si el Wilcoxon exacto deja de dar el valor teórico.

## Formato del CSV

`simulado,condicion,psicologo,paciente,fecha,cierre,validacion,interrupciones_min,informes_previos_con_sistema`

- `condicion`: `manual` o `sistema`. Psicólogos y pacientes **solo por código** (P1, PAC-001).
- Tiempo neto = (validación − cierre) − interrupciones, en minutos.
- Con datos reales, borra la columna `simulado` o déjala vacía; el script la ignora.

## Decisión que debes confirmar con tu docente

El protocolo pide medir "a los mismos psicólogos" pero **no define cómo se emparejan** las
mediciones. El script empareja la k-ésima medición manual con la k-ésima con sistema **de
cada psicólogo**. Si prefieres otra regla (p. ej. comparar la mediana por psicólogo, n = 3,
que casi nunca alcanza significancia), cámbialo en `analizar()` y déjalo escrito en el
protocolo.

## Qué muestra con estos datos simulados

n = 10 pares, reducción de la mediana ≈ 55 min (61 %), Wilcoxon exacto W = 0, p ≈ 0,002.
Es el p mínimo posible con 10 pares (diez diferencias del mismo signo): sirve para probar
el código, no se parecerá a lo que salga con personas reales.
