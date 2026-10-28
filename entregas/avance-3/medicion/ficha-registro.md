# Ficha de registro — Tiempo de elaboración del informe

> Centro Psicológico Ser Integral E.I.R.L. · Proyecto Psicograma · una ficha por informe
> Imprimir o llenar en digital. **Nunca anotar nombres**: solo los códigos.

## Qué se mide

**Minutos desde el cierre de la sesión con el paciente hasta la validación final del informe.**
Se descuentan las interrupciones ajenas a la tarea (llamadas, otro paciente, descanso).
La definición es la misma con el procedimiento manual y con Psicograma, y no se cambia durante el estudio.

## Ficha

| Campo | Valor |
|---|---|
| N.º de medición | |
| Fecha (dd/mm/aaaa) | |
| Psicólogo (código: P1, P2…) | |
| Paciente (código: PAC-001…) | |
| Condición (marcar una) | ☐ Manual   ☐ Con Psicograma |
| Hora de cierre de la sesión (hh:mm) | |
| Hora de validación del informe (hh:mm) | |
| Interrupciones (minutos, total) | |
| **Tiempo neto (min)** = fin − inicio − interrupciones | |
| Informes previos hechos con Psicograma (0 si es manual) | |
| Observaciones | |

## Reglas de llenado

1. **Inicio:** la hora en que se cierra la sesión (manual: cuando el paciente se retira o se guarda el dibujo; Psicograma: se toma de `sessions.completed_at`).
2. **Fin:** la hora en que el informe queda listo para entregar (manual: cuando se da por terminado el documento; Psicograma: `reports.validated_at`).
3. **Interrupciones:** se anotan al momento, no de memoria al final del día.
4. **Una ficha por informe**, aunque el psicólogo lo haga en varios momentos.
5. **No se descarta ninguna medición** por salir "larga" o "corta". Un valor atípico se anota en Observaciones.
6. Los códigos de psicólogo y paciente los asigna el equipo; la tabla de equivalencias la guarda solo el centro.

## Cuántas fichas

- **Mínimo 10 con procedimiento manual**, antes de que el psicólogo use Psicograma.
- **Mínimo 10 con Psicograma**, de los mismos psicólogos.
