# Protocolo de medición — Tiempo de elaboración del informe

> Implementa `sdd/spec/SPEC-AUD-05.md` · Verifica el objetivo específico 5 y la hipótesis de trabajo

## 1. Variable y definición operacional

| Elemento | Valor |
|---|---|
| Variable dependiente | Tiempo de elaboración de informes de tests proyectivos de dibujo |
| Definición operacional | Minutos desde el cierre de la sesión hasta la validación final del informe, sin interrupciones ajenas a la tarea |
| Unidad | Minutos por informe |
| Indicador | Mediana por condición; reducción en minutos y en porcentaje respecto de la línea base |
| Variable independiente | Uso de la aplicación web Psicograma |

La definición es idéntica en ambas condiciones y **no se modifica durante el estudio**.

## 2. Diseño

Comparación **pre/post en los mismos psicólogos** del Centro Psicológico Ser Integral.

| Condición | Cuándo | Cómo se mide |
|---|---|---|
| Manual (línea base) | **Antes** de que el psicólogo use Psicograma | Ficha de registro, autorreporte del psicólogo |
| Con Psicograma | Con el sistema en uso | Automática: `reports.validated_at − sessions.completed_at` |

**Advertencia de calendario.** La línea base solo puede tomarse mientras el centro siga
elaborando informes a mano. En cuanto se adopte el sistema, es irrecuperable. Por eso la
recolección arranca ya y no en la fase de auditoría.

## 3. Muestra

- Mínimo 10 informes manuales y 10 con Psicograma.
- Mismos psicólogos en ambas condiciones.
- Test: Persona bajo la lluvia (PBLL).
- Pacientes identificados solo por código. Se requiere la autorización del centro para usar los datos con fines académicos.

## 4. Procedimiento

1. Consensuar la ficha con el centro (`ficha-registro.md`).
2. Asignar códigos de psicólogo y paciente.
3. Recolectar la línea base. Cada informe manual genera una ficha.
4. Cerrar la línea base cuando haya ≥ 10 fichas válidas, antes del primer uso del sistema.
5. Registrar la condición con Psicograma consultando la base de datos (sin intervención del psicólogo).
6. Anotar cuántos informes previos con el sistema lleva cada psicólogo en cada medición.

Consulta de la condición post:

```sql
SELECT s.id AS sesion,
       round(extract(epoch FROM (r.validated_at - s.completed_at)) / 60.0, 1) AS minutos
FROM reports r
JOIN sessions s ON s.id = r.session_id
WHERE r.status = 'validated'
ORDER BY r.validated_at;
```

## 5. Análisis

| Paso | Método | Razón |
|---|---|---|
| Descripción | Mediana y rango por condición | n pequeño; la media se distorsiona con valores atípicos |
| Contraste | **Prueba de Wilcoxon de rangos con signo** (muestras relacionadas) | No se asume normalidad |
| Reporte | Reducción en minutos y en % + estadístico + p | Escenario 6 de SPEC-AUD-05 |

No se usa prueba t: el n es pequeño y no se asume normalidad.

## 6. Limitaciones que se declaran

1. La medición pre depende del autorreporte del profesional; la post es automática. Esa asimetría puede sesgar el resultado.
2. Muestra pequeña y de un solo centro.
3. **Efecto de aprendizaje:** un profesional se vuelve más rápido con la práctica. Se registra cuántos informes previos tenía cada psicólogo para discutirlo como explicación alternativa.
4. El resultado es referencial y no constituye validación clínica del instrumento.

## 7. Resultado negativo

Si no hay reducción, o hay aumento, **se informa tal como se obtuvo**. No se ajusta la
definición operacional ni se descartan mediciones para favorecer la hipótesis.

## 8. Fuera de alcance

Validación clínica · calidad de los informes · concordancia entre evaluadores · otros centros ·
tiempo de la sesión con el paciente · cronometrar pasos intermedios.
