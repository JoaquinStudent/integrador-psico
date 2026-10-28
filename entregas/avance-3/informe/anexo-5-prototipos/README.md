# Anexo 5. Prototipos y pantallas implementadas

> Cada prototipo del Avance 1 (`entregas/avance-1/05-prototipo/`) junto a la pantalla real que lo implementa. Las capturas son del sistema funcionando (28/10/2026), en `capturas/`. La comparación lado a lado está en [`comparacion.html`](comparacion.html).

**13 prototipos → 13 pantallas implementadas**, más 3 pantallas nuevas sin prototipo (Sesiones, Informes y Ajustes), la de Citas (sin captura) y el inicio de sesión.

## Cómo se tomaron

- Navegador Chrome sobre la aplicación local (frontend `:5173`, backend `:8000`) con datos de demostración.
- Pantallas del paciente: segunda pestaña actuando como tablet, con un dibujo hecho a mano alzada; el espejo y las métricas de la captura 10 son **en vivo**, no simulados (no se usó la tablet física).
- Para la sesión en vivo se creó una sesión de prueba y se canceló después. Para el editor se generó el borrador del informe de una sesión de demostración.
- Algunas capturas están reducidas (zoom del 72 %) para que quepa la pantalla completa.

## Prototipo 1 — Dashboard principal

| | |
|---|---|
| Pantalla | `DashboardPage` · ruta `/` |
| Prototipo | ![prototipo](../../../avance-1/05-prototipo/01-examinador/01-dashboard-principal.png) |

![01-dashboard](capturas/01-dashboard.jpg)

**Se mantuvo**

- Misma estructura: saludo, 4 indicadores, sesiones recientes y próximas citas.
- «Próximas citas» lee la agenda real (CU-03).

**Cambió o no se implementó**

- Sin barra superior de búsqueda ni notificaciones.
- «Tiempo prom. por informe» muestra «--» hasta que exista la medición (Capítulo 4).
- La acción de cada sesión depende de su estado (Ver análisis, Revisar, Ver detalle).

## Prototipo 2 — Listado de pacientes

| | |
|---|---|
| Pantalla | `PatientsPage` · ruta `/pacientes` |
| Prototipo | ![prototipo](../../../avance-1/05-prototipo/01-examinador/02-listado-pacientes.png) |

![02-listado-pacientes](capturas/02-listado-pacientes.jpg)

**Se mantuvo**

- Búsqueda por nombre o documento, los 4 filtros, y las columnas Paciente, Documento, Edad, Última evaluación, Evaluaciones, Estado y Acciones.
- Paginación.

**Cambió o no se implementó**

- Estado «Pendiente / Al día» en lugar de «Informe pendiente».
- Acciones «Editar | Ver» en lugar del menú ⋮.
- Sin subtítulo bajo el nombre (p. ej. «Paciente recurrente»).

## Prototipo 3 — Ficha del paciente

| | |
|---|---|
| Pantalla | `PatientDetailPage` · ruta `/pacientes/:id` |
| Prototipo | ![prototipo](../../../avance-1/05-prototipo/01-examinador/03-ficha-paciente.png) |

![03-ficha-paciente](capturas/03-ficha-paciente.jpg)

**Se mantuvo**

- Cabecera con datos y «Iniciar nueva evaluación»; tres pestañas (Datos generales, Historial de evaluaciones, Informes).

**Cambió o no se implementó**

- El historial es una tabla con estado y la acción adecuada (no tarjetas con miniatura).
- «Notas clínicas» pasa a «Notas personales» y avisa que se guardan solo en el navegador.
- Se agregan «Desactivar» (baja lógica) y «Anonimizar» (supresión a solicitud).

## Prototipo 4 — Catálogo de tests proyectivos

| | |
|---|---|
| Pantalla | `TestCatalogPage` · ruta `/tests` |
| Prototipo | ![prototipo](../../../avance-1/05-prototipo/01-examinador/04-catalogo-tests-proyectivos.png) |

![04-catalogo-tests](capturas/04-catalogo-tests.jpg)

**Se mantuvo**

- Tarjetas por instrumento: PBLL disponible; HTP, DF y DFH como «Próximamente».

**Cambió o no se implementó**

- El número de indicadores sale del catálogo real (183) y no está escrito a mano.

## Prototipo 5 — Nueva sesión y consentimiento

| | |
|---|---|
| Pantalla | `NewSessionPage` · ruta `/sesiones/nueva` |
| Prototipo | ![prototipo](../../../avance-1/05-prototipo/01-examinador/05-nueva-sesion-consentimiento.png) |

![05-nueva-sesion-paso1-paciente](capturas/05-nueva-sesion-paso1-paciente.jpg)

![06-nueva-sesion-paso2-test](capturas/06-nueva-sesion-paso2-test.jpg)

![07-nueva-sesion-paso3-consentimiento-vacio](capturas/07-nueva-sesion-paso3-consentimiento-vacio.jpg)

![08-nueva-sesion-paso3-consentimiento-firmado](capturas/08-nueva-sesion-paso3-consentimiento-firmado.jpg)

**Se mantuvo**

- Asistente de 3 pasos, texto del consentimiento, tres autorizaciones, aviso para menores, firma y resumen de la sesión.

**Cambió o no se implementó**

- «Comenzar sesión» solo se activa con las tres autorizaciones y la firma (sin consentimiento no hay toma).
- El resumen no muestra el código del paciente.
- No hay campo de motivo de evaluación (RF-09 parcial).

## Prototipo 6 — Sesión en vivo

| | |
|---|---|
| Pantalla | `ExaminerSessionPage` · ruta `/sesion/:id` |
| Prototipo | ![prototipo](../../../avance-1/05-prototipo/01-examinador/06-sesion-en-vivo-pbll.png) |

![09-sesion-en-vivo-esperando-tablet](capturas/09-sesion-en-vivo-esperando-tablet.jpg)

![10-sesion-en-vivo-con-espejo-y-metricas](capturas/10-sesion-en-vivo-con-espejo-y-metricas.jpg)

**Se mantuvo**

- Dibujo en tiempo real con «Tablet conectada» y la orientación de la hoja; cronómetro; las 7 métricas en vivo; finalizar sesión.

**Cambió o no se implementó**

- La columna central muestra el guion del protocolo (Preparación, Consigna, Ejecución, Cierre) con las respuestas del manual ante cada situación; las observaciones y marcas rápidas quedan debajo.
- Se agrega «Cancelar sesión» y la tarjeta con el enlace para abrir la tablet.
- Una sesión sin consentimiento firmado se bloquea.
- Sin la nota de IA del prototipo: el sistema no interpreta.

## Prototipo 7 — Registro de observaciones

| | |
|---|---|
| Pantalla | `PostSessionPage` · ruta `/sesion/:id/observaciones` |
| Prototipo | ![prototipo](../../../avance-1/05-prototipo/01-examinador/07-registro-observaciones-pbll.png) |

![15-observaciones-post-sesion](capturas/15-observaciones-post-sesion.jpg)

**Se mantuvo**

- Línea de tiempo con la grabación y su transcripción segmentada por tiempo; continuar al análisis.

**Cambió o no se implementó**

- Reproductor de audio real con la grabación de la sesión.
- No existe «Reproducir secuencia de trazado» ni los controles de zoom del dibujo.

## Prototipo 8 — Verificación profesional

| | |
|---|---|
| Pantalla | `AnalysisPage (pestaña)` · ruta `/sesion/:id/analisis` |
| Prototipo | ![prototipo](../../../avance-1/05-prototipo/01-examinador/08-verificacion-profesional-pbll.png) |

![18-analisis-verificacion-profesional](capturas/18-analisis-verificacion-profesional.jpg)

![19-verificacion-seccion-expandida](capturas/19-verificacion-seccion-expandida.jpg)

**Se mantuvo**

- Checklist por secciones con casillas, información de cada indicador y barra de progreso; «Guardar verificación».

**Cambió o no se implementó**

- Las secciones siguen las del manual (Trazos, Secuencia, Movimiento…) y no «Rasgos faciales / Extremidades».
- El progreso se calcula sobre los indicadores de verificación y semiautomáticos (160), no sobre 35.

## Prototipo 9 — Análisis de resultados

| | |
|---|---|
| Pantalla | `AnalysisPage` · ruta `/sesion/:id/analisis` |
| Prototipo | ![prototipo](../../../avance-1/05-prototipo/01-examinador/09-analisis-resultados-pbll.png) |

![16-analisis-medicion-objetiva](capturas/16-analisis-medicion-objetiva.jpg)

![17-analisis-elementos-detectados](capturas/17-analisis-elementos-detectados.jpg)

**Se mantuvo**

- Tres pestañas: Medición objetiva, Elementos detectados y Verificación profesional; sugerencias que se aceptan o rechazan; «Generar informe».

**Cambió o no se implementó**

- El dibujo es el trazado real capturado (no una foto); sin cuadrantes ni mapa de presión.
- Las sugerencias salen de reglas deterministas y se rotulan «Sugerencias del sistema», no «por AI».
- Solo se puede aceptar o rechazar (no editar). El umbral de pausa es de 3 s (el prototipo decía 20 s).
- «Generar informe» está en el pie de la pantalla.

## Prototipo 10 — Editor de informe

| | |
|---|---|
| Pantalla | `ReportsPage` · ruta `/informes/:id` |
| Prototipo | ![prototipo](../../../avance-1/05-prototipo/01-examinador/10-editor-informe.png) |

![20-editor-informe-inicio](capturas/20-editor-informe-inicio.jpg)

![21-editor-informe-secciones-6-a-9](capturas/21-editor-informe-secciones-6-a-9.jpg)

**Se mantuvo**

- Las 9 secciones editables, el índice de secciones y el estado «Borrador».

**Cambió o no se implementó**

- Las secciones sin contenido se marcan en ámbar y bloquean «Validar informe».
- La sección 9 llega vacía (o con una sugerencia que obliga a revisar).
- «Exportar PDF» aparece solo cuando el informe está validado. No hay «Guardar borrador» (cada sección se guarda sola) ni «Paleta de tensión».
- El índice está a la izquierda y no en un panel lateral con «Revisión obligatoria».

## Prototipo 11 — Bienvenida del paciente

| | |
|---|---|
| Pantalla | `PatientWelcomePage` · ruta `/sesion/:id/paciente/bienvenida` |
| Prototipo | ![prototipo](../../../avance-1/05-prototipo/02-paciente/01-bienvenida-paciente.png) |

![11-paciente-bienvenida](capturas/11-paciente-bienvenida.jpg)

**Se mantuvo**

- Pantalla mínima con la consigna y un solo botón.

**Cambió o no se implementó**

- La consigna es exactamente la del manual: «Dibuje una persona bajo la lluvia».

## Prototipo 12 — Lienzo de dibujo

| | |
|---|---|
| Pantalla | `PatientDrawingPage` · ruta `/sesion/:id/paciente/dibujo` |
| Prototipo | ![prototipo](../../../avance-1/05-prototipo/02-paciente/02-lienzo-dibujo-paciente.png) |

![12-paciente-lienzo](capturas/12-paciente-lienzo.jpg)

![13-paciente-confirmacion-termine](capturas/13-paciente-confirmacion-termine.jpg)

**Se mantuvo**

- Hoja en blanco con lápiz, borrador, deshacer y «Terminé»; sin colores ni guías (no se contamina el estímulo).

**Cambió o no se implementó**

- Se agrega una confirmación neutra al pulsar «Terminé»: «¿Terminaste tu dibujo?».
- La hoja respeta si el paciente la gira y lo registra.

## Prototipo 13 — Cierre del paciente

| | |
|---|---|
| Pantalla | `PatientClosePage` · ruta `/sesion/:id/paciente/cierre` |
| Prototipo | ![prototipo](../../../avance-1/05-prototipo/02-paciente/03-cierre-paciente.png) |

![14-paciente-cierre](capturas/14-paciente-cierre.jpg)

**Se mantuvo**

- Agradecimiento sin mostrar ningún resultado.

## Pantallas nuevas (sin prototipo previo)

### Sesiones — `SessionsPage` · `/sesiones`

![Sesiones](capturas/22-listado-sesiones.jpg)

Historial con búsqueda, filtros por estado con conteo y acción por estado.

### Informes — `ReportsPage` · `/informes`

![Informes](capturas/23-listado-informes.jpg)

Borradores e informes validados, con búsqueda y filtros.

### Ajustes — `SettingsPage` · `/ajustes`

![Ajustes](capturas/24-ajustes.jpg)

Perfil profesional (la matrícula firma el informe) y conexión con Google Calendar. ⚠️ La tarjeta de Google muestra «No se pudo consultar el estado» porque la migración 0003 aún no está aplicada en la base.

### Citas (`/citas`) — sin captura

La pantalla está implementada (agenda sin cruces, iniciar sesión desde la cita) pero **no se fotografió** porque requiere aplicar la migración `0003` en la base; hoy muestra el error de carga. Hay que tomarla después de aplicarla.

## Hallazgos de esta toma de capturas

- «Analizar con IA» era una etiqueta engañosa: el análisis es determinista. Ahora dice «Analizar dibujo».
- El examinador perdía el aviso «el paciente terminó» cuando la tablet se desconectaba; corregido.
- Los títulos del catálogo de indicadores no llevan tildes («Presion normal», «Ejecucion rapida»): pendiente de normalizar en el catálogo.
- El prototipo 7 mostraba verbalizaciones destacadas, actitudes y observaciones adicionales; la captura 15 muestra solo la parte superior de la pantalla (reproductor y transcripción).
