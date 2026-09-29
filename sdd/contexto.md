# Psicograma — Contexto del Proyecto

> **Proyecto Integrador I** · Centro Psicológico Ser Integral E.I.R.L.
> San Juan de Lurigancho, Lima, 2026

---

## Problema

La interpretación de los tests proyectivos de dibujo se realiza de forma
manual y artesanal. El psicólogo mide tamaño, presión, ubicación y trazos
consultando un manual distinto por cada test, registra a mano las respuestas
del paciente y luego transcribe todo para redactar el informe.

Consecuencias directas en la práctica clínica:

- **Tiempo elevado por informe** (estimado 45–90 min por sesión), con retraso
  en la entrega y límite a la capacidad de atención del centro.
- **Doble esfuerzo de registro**: el examinador anota observaciones en papel
  durante la sesión y luego las transcribe al informe.
- **Pérdida de datos temporales**: el escaneo del dibujo terminado descarta
  información clínicamente relevante — orden de trazado, latencia de inicio,
  pausas, borrados, presión y velocidad — que el manual del test sí contempla
  como indicadores interpretables (secciones A-3 a A-6 del manual PBLL).
- **Variabilidad entre evaluadores**: documentación poco estandarizada y
  difícil de auditar, lo que complica la supervisión clínica y la
  investigación.

---

## Solución

**Psicograma** es una aplicación web copiloto con **dos interfaces
sincronizadas en tiempo real** vinculadas a la ficha del paciente:

| Interfaz | Dispositivo | Función principal |
|---|---|---|
| **Paciente** | Tablet | Lienzo digital que captura el proceso del trazo: orden, tiempo, pausas, presión, borrados y posición |
| **Examinador** | Desktop | Espejo del dibujo en vivo, registro estructurado de observaciones, grabación de audio con transcripción automática y panel de análisis |

Al cerrar la sesión, el sistema entrega en el panel privado del examinador un
**análisis en dos capas**:

1. **Medición objetiva** — métricas estructurales extraídas automáticamente
   del dibujo (tamaño, emplazamiento, presión promedio, tiempo total,
   latencia, secuencia de inicio, conteo de trazos/pausas/borrados).
2. **Sugerencias del manual** — cruce de las métricas con los 201 indicadores
   del manual PBLL, cada sugerencia referenciada a su sección del manual y
   verificable por el profesional (aceptar / editar / descartar).

A partir de los indicadores validados, genera un **borrador de informe
psicológico** (9 secciones estándar) que el psicólogo revisa, edita y firma.

**Principio rector:** el sistema potencia al psicólogo, no lo reemplaza. Toda
sugerencia del sistema requiere validación profesional antes de formar parte
del informe final.

---

## Diferenciador

La competencia comercial existente opera por formulario: el psicólogo ingresa
su interpretación y el software arma el informe. Los trabajos académicos
previos analizan una imagen estática del dibujo terminado.

Psicograma captura **la dimensión temporal del dibujo**. El manual del test
PBLL dedica secciones completas a tiempo (A-5), secuencia de ejecución (A-6)
y borrados (B-3) — información que se pierde por completo en un dibujo
escaneado y que hoy solo se conserva si el examinador la anotó manualmente
durante la sesión.

| Enfoque | Qué captura | Indicadores cubiertos |
|---|---|---|
| Escaneo/foto | Imagen estática final | Solo contenido visual (B) |
| Formulario digital | Lo que el psicólogo transcribe | Depende del evaluador |
| **Psicograma** | Proceso completo del trazo + audio + observaciones | Expresivos (A) + Contenido (B) + Conflicto (C) + Defensa (D) |

---

## Marco teórico de referencia

El instrumento psicológico base es el test proyectivo **Persona Bajo la
Lluvia (PBLL)**, documentado en el manual de referencia almacenado en
`manual-pbll/manual-persona-bajo-la-lluvia.md`.

El manual organiza los indicadores en cuatro categorías:

| Categoría | Nombre | Secciones | Tipo de análisis |
|---|---|---|---|
| **A** | Recursos expresivos | A-1 a A-8 | Dimensiones, emplazamiento, trazos, presión, tiempo, secuencia, movimiento, sombreados |
| **B** | Análisis de contenido | B-1 a B-11 | Orientación, posturas, borrados, detalles, vestimenta, paraguas, cuerpo, identidad sexual |
| **C** | Expresiones de conflicto | C-1 a C-11 | Fobias, histeria, obsesión, depresión, psicosis, paranoia, somatización |
| **D** | Mecanismos de defensa | D-1 a D-7 | Desplazamiento, regresión, anulación, aislamiento, represión, inhibición, defensas maníacas |

Los indicadores están codificados en el sistema con 18 prefijos (`DIM-*`,
`UBI-*`, `TRZ-*`, etc.) según se define en `domain.md`.

---

## Variable de investigación

| Variable | Tipo | Definición operacional | Indicador | Efecto esperado |
|---|---|---|---|---|
| Tiempo de elaboración de informes | Dependiente · Cuantitativa | Minutos transcurridos desde el cierre de la sesión hasta la validación final del informe | Minutos por informe; porcentaje de reducción | Reducir significativamente |

**Variable independiente:** la aplicación web Psicograma.

**Hipótesis de trabajo:** el uso de Psicograma reduce el tiempo de
elaboración de informes del test PBLL en comparación con el procedimiento
manual actual en el Centro Psicológico Ser Integral.

---

## Objetivos

**General.** Desarrollar una aplicación web para reducir el tiempo de
elaboración de informes de tests proyectivos de dibujo en el Centro
Psicológico Ser Integral E.I.R.L., San Juan de Lurigancho, Lima, 2026.

**Específicos.**

1. Analizar el proceso actual de evaluación y elaboración de informes
   mediante observación y entrevistas con los psicólogos del centro.
2. Especificar los requisitos funcionales y no funcionales del sistema bajo
   el estándar IEEE 830 (SRS).
3. Diseñar la arquitectura del sistema y las interfaces de usuario alineadas
   al flujo clínico del test PBLL.
4. Implementar los módulos de captura temporal del dibujo, registro de
   observaciones, transcripción de audio y generación asistida del borrador
   de informe.
5. Estimar la reducción del tiempo de elaboración frente al procedimiento
   manual mediante pruebas comparativas pre/post implementación.

---

## Alcance

**Incluye:**
- Test Persona bajo la lluvia (PBLL) como caso piloto.
- Módulo de gestión de pacientes (CRUD, ficha clínica, historial).
- Módulo de sesiones (wizard de configuración, consentimiento informado,
  sesión en vivo con sincronización tablet-desktop).
- Módulo de captura del dibujo con datos temporales (trazos, presión,
  tiempos, pausas, borrados, secuencia).
- Módulo de registro de sesión (observaciones, grabación y transcripción de
  audio, marcas rápidas, verbalizaciones).
- Módulo de análisis (medición objetiva + sugerencias del manual +
  verificación profesional).
- Módulo de informe (generación de borrador, editor de 9 secciones,
  validación, exportación PDF).
- Dos perfiles de usuario: examinador (psicólogo) y paciente.

**Excluye:**
- Emisión de diagnósticos clínicos. El sistema sugiere indicadores, no
  diagnostica.
- Otros instrumentos proyectivos en esta versión (HTP, Dibujo de la
  Familia, DFH).
- Despliegue comercial, monetización y certificación clínica.
- Aplicación móvil nativa.

**Arquitectura escalable:** el motor de reglas es configurable por test, lo
que permite incorporar HTP, Dibujo de la Familia y DFH en fases posteriores
sin reprogramar la lógica central del sistema.
