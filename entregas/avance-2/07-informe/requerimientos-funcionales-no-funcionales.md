*REQUERIMIENTOS FUNCIONALES Y NO FUNCIONALES — PSICOGRAMA*

> Aplicación web de apoyo a la aplicación e interpretación de tests proyectivos de dibujo
> Centro Psicológico Ser Integral E.I.R.L. · San Juan de Lurigancho, Lima, 2026
> Especificación bajo el estándar IEEE Std 830-1998 · Corte: **30/09/2026**

Para diseñar la solución informática es necesario definir tanto los requerimientos funcionales, que
describen qué debe hacer el sistema, como los no funcionales, que establecen bajo qué condiciones de
calidad debe hacerlo. Ambos se derivan del alcance declarado en el apartado 1.3.3 y de los cinco
objetivos específicos del proyecto.

Cada requerimiento lleva un identificador (`RF-nn`, `RNF-nn`) para poder trazarlo desde los
diagramas de casos de uso, de clases y de entidad-relación, y desde las especificaciones de
desarrollo en `sdd/spec/`. El sistema no emite diagnósticos clínicos: esa restricción no es una
decisión de diseño sino un requerimiento no funcional de cumplimiento, recogido en el apartado 6.

---

## Requerimientos Funcionales

**1. Autenticación y Perfiles de Usuario:**

* **RF-01 Registro e inicio de sesión:** El sistema debe permitir que un psicólogo se registre e
  inicie sesión con correo y contraseña, creando automáticamente su perfil profesional.
* **RF-02 Perfil profesional:** El usuario debe poder consultar y actualizar su nombre completo,
  número de matrícula profesional y especialidad.
* **RF-03 Control de acceso por perfil:** El sistema debe distinguir dos perfiles — examinador y
  paciente — y restringir el acceso del paciente exclusivamente al lienzo de su propia sesión.

**2. Gestión de Pacientes:**

* **RF-04 Registrar paciente:** Permitir el registro de un paciente con nombre completo, documento
  de identidad, fecha de nacimiento y sexo, impidiendo documentos duplicados para el mismo
  examinador.
* **RF-05 Actualizar paciente:** Permitir la modificación de los datos de un paciente ya registrado.
* **RF-06 Listar pacientes:** Mostrar el listado paginado con búsqueda por nombre o documento y
  filtros por estado y por evaluación pendiente.
* **RF-07 Consultar ficha del paciente:** Presentar en una sola vista los datos personales, el
  historial de sesiones y los informes emitidos.
* **RF-08 Desactivar paciente:** Permitir la baja lógica de un paciente conservando su historial
  clínico, sin eliminación física del registro.

**3. Gestión de Sesiones y Consentimiento:**

* **RF-09 Configurar nueva sesión:** Permitir la creación de una sesión mediante un asistente que
  seleccione paciente, test a aplicar y motivo de evaluación.
* **RF-10 Registrar consentimiento informado:** Exigir y almacenar, antes de iniciar la sesión, la
  autorización explícita para la grabación de audio, para el uso del medio digital y el
  reconocimiento del carácter confidencial, junto con la firma del paciente o su apoderado.
* **RF-11 Iniciar sesión y emparejar dispositivos:** Vincular la tablet del paciente con el panel del
  examinador sobre una misma sesión activa.
* **RF-12 Finalizar sesión:** Permitir el cierre de la sesión desde cualquiera de los dos
  dispositivos, notificando al otro y consolidando los datos capturados.
* **RF-13 Cancelar sesión:** Permitir la cancelación de una sesión no concluida, conservando el
  registro de que ocurrió.

**4. Captura del Dibujo:**

* **RF-14 Lienzo digital:** Proveer al paciente un lienzo con herramientas de lápiz y borrador.
* **RF-15 Deshacer:** Permitir al paciente revertir el último trazo realizado.
* **RF-16 Captura de la dimensión temporal:** Registrar, para cada trazo, el orden de ejecución, el
  instante de inicio y fin, la presión aplicada y las pausas entre trazos. Este requerimiento
  constituye el aporte diferencial del proyecto frente al escaneo del dibujo terminado.
* **RF-17 Orientación de la hoja:** Registrar si el paciente utilizó la hoja en posición horizontal o
  vertical.
* **RF-18 Persistencia del dibujo:** Almacenar los trazos capturados y la imagen final del dibujo al
  concluir la sesión.
* **RF-19 Consigna y cierre:** Presentar al paciente la consigna del test al inicio y una pantalla de
  agradecimiento al finalizar, sin exponerle ningún resultado.

**5. Sincronización en Vivo y Registro de la Sesión:**

* **RF-20 Espejo del dibujo en vivo:** Reproducir en el panel del examinador el dibujo del paciente a
  medida que se ejecuta.
* **RF-21 Métricas en vivo:** Mostrar al examinador, durante la sesión, el tiempo transcurrido, la
  latencia de inicio, el número de trazos, la presión promedio, las pausas, los borrados y el
  porcentaje de hoja ocupada.
* **RF-22 Marcas rápidas:** Permitir al examinador registrar anotaciones predefinidas con su marca de
  tiempo, sin interrumpir la observación.
* **RF-23 Observaciones estructuradas:** Permitir el registro de notas en texto libre con guardado
  automático.
* **RF-24 Actitudes observadas:** Permitir seleccionar de un catálogo las actitudes manifestadas por
  el paciente durante la aplicación.
* **RF-25 Estado de conexión:** Informar al examinador si la tablet del paciente está conectada.

**6. Grabación y Transcripción de Audio:**

* **RF-26 Grabar audio de la sesión:** Registrar el audio de la sesión, condicionado a que exista
  autorización expresa en el consentimiento.
* **RF-27 Transcribir la grabación:** Obtener la transcripción del audio al concluir la sesión,
  segmentada con marcas de tiempo.
* **RF-28 Extraer verbalizaciones:** Permitir que el examinador seleccione de la transcripción las
  verbalizaciones del paciente que considere clínicamente relevantes, o las registre manualmente.

**7. Análisis y Motor de Reglas:**

* **RF-29 Medición objetiva:** Calcular automáticamente, a partir de los trazos capturados, las
  medidas estructurales del dibujo: tamaño, emplazamiento, presión, tiempo total, latencia de
  inicio, pausas y borrados.
* **RF-30 Detección automática de indicadores:** Cruzar las medidas objetivas con los criterios del
  manual y proponer los indicadores correspondientes, declarando en cada caso la medición y el
  umbral que originaron la propuesta.
* **RF-31 Sugerencia asistida de indicadores:** Proponer indicadores adicionales sobre los criterios
  que las medidas objetivas no resuelven por sí solas, indicando el nivel de confianza.
* **RF-32 Verificación profesional:** Presentar como checklist organizado por secciones del manual
  los indicadores que requieren juicio visual o clínico del examinador.
* **RF-33 Validar o descartar indicadores:** Permitir al examinador aceptar, editar o rechazar cada
  indicador propuesto, registrando quién lo validó y cuándo.
* **RF-34 Motor de reglas configurable:** Mantener los criterios de cada test como datos y no como
  código, de modo que la incorporación de un nuevo instrumento no requiera reprogramar la lógica de
  análisis.

**8. Generación del Informe Psicológico:**

* **RF-35 Generar borrador del informe:** Componer un borrador de nueve secciones a partir de los
  datos de la sesión y de los indicadores validados por el examinador.
* **RF-36 Editar el informe:** Permitir la edición de cada sección del borrador, distinguiendo el
  contenido generado por el sistema del modificado por el profesional.
* **RF-37 Validar el informe:** Permitir el paso de borrador a informe validado, registrando el
  profesional responsable y la fecha.
* **RF-38 Exportar a PDF:** Generar el documento final en formato PDF a partir del informe validado.
* **RF-39 Historial de informes:** Consultar desde la ficha del paciente los informes emitidos y su
  estado.

**9. Panel de Control y Catálogo:**

* **RF-40 Panel de indicadores de gestión:** Presentar al examinador las sesiones de la semana, las
  evaluaciones pendientes de informe, los pacientes activos y las sesiones recientes.
* **RF-41 Catálogo de tests:** Mostrar los instrumentos disponibles y los previstos para fases
  posteriores, indicando su estado.

---

## Requerimientos No Funcionales

**1. Rendimiento:**

* **RNF-01 Latencia de la sincronización:** El espejo del dibujo en el panel del examinador debe
  reflejar cada trazo en menos de un segundo desde su ejecución en la tablet.
* **RNF-02 Fluidez de la captura:** El lienzo debe registrar el trazo sin pérdida perceptible de
  puntos durante el dibujo continuo.
* **RNF-03 Tiempo de respuesta:** Las operaciones de consulta y registro deben responder en menos de
  dos segundos. Se exceptúan la transcripción de audio y la generación del borrador del informe, que
  dependen de servicios externos y deben informar su progreso al usuario.
* **RNF-04 Actualización de métricas:** Las métricas en vivo deben refrescarse al menos cada dos
  segundos durante la sesión activa.

**2. Escalabilidad:**

* **RNF-05 Escalabilidad por instrumento:** La incorporación de un nuevo test proyectivo debe
  realizarse mediante la carga de sus criterios, sin modificar la lógica central de análisis.
* **RNF-06 Escalabilidad horizontal:** El componente de servidor no debe mantener estado de sesión en
  memoria, de modo que puedan añadirse instancias para atender mayor concurrencia.

**3. Disponibilidad y Confiabilidad:**

* **RNF-07 Disponibilidad en horario de atención:** El sistema debe estar disponible durante el
  horario de atención del centro, dado que una sesión interrumpida no puede repetirse sin afectar la
  validez del test.
* **RNF-08 Respaldo de información:** Debe existir respaldo periódico de la base de datos con
  posibilidad de recuperación a un punto en el tiempo.
* **RNF-09 Tolerancia a desconexión momentánea:** Una pérdida breve de conectividad no debe provocar
  la pérdida de los trazos ya ejecutados por el paciente.

**4. Seguridad:**

* **RNF-10 Cifrado de la información:** Los datos deben transmitirse cifrados y permanecer cifrados
  en reposo.
* **RNF-11 Doble capa de autorización:** El acceso a los datos debe filtrarse en la capa de
  aplicación y además en la propia base de datos mediante políticas por fila, de modo que un error
  de programación no exponga información de otro profesional.
* **RNF-12 Ausencia de credenciales en el cliente:** La aplicación del navegador no debe disponer de
  credenciales de acceso a la base de datos; toda lectura y escritura debe pasar por el servidor.
* **RNF-13 Canales de sincronización privados:** El canal de comunicación en vivo de una sesión debe
  admitir únicamente a los dispositivos autorizados para esa sesión.

**5. Confidencialidad y Cumplimiento:**

* **RNF-14 Consentimiento previo:** Ninguna captura de audio puede iniciarse sin autorización
  registrada, y ninguna sesión puede iniciarse sin consentimiento informado firmado.
* **RNF-15 Aislamiento por profesional:** Un examinador solo debe poder acceder a los pacientes, las
  sesiones y los informes que él mismo generó.
* **RNF-16 Retención y supresión:** El sistema debe permitir la supresión o anonimización de los
  datos de un paciente a solicitud de este o de su apoderado.

**6. Restricciones Éticas y Trazabilidad Clínica:**

* **RNF-17 Ausencia de inferencia diagnóstica:** El sistema no debe emitir diagnósticos ni
  conclusiones clínicas. La sección de conclusiones del informe se entrega vacía para su redacción
  por el profesional.
* **RNF-18 Validación profesional obligatoria:** Ningún indicador propuesto por el sistema puede
  incorporarse al informe sin la validación explícita del examinador.
* **RNF-19 Trazabilidad al manual:** Todo indicador presentado debe declarar el criterio y la sección
  del manual del test que lo origina, de modo que el profesional pueda verificarlo.
* **RNF-20 Auditoría de las validaciones:** El sistema debe conservar qué profesional validó cada
  indicador y cada informe, y en qué momento.

**7. Usabilidad:**

* **RNF-21 Idioma:** La totalidad de la interfaz y de los informes generados debe presentarse en
  español.
* **RNF-22 Interfaz según dispositivo y rol:** La interfaz del paciente debe estar optimizada para
  tablet con lápiz digital y la del examinador para computadora de escritorio.
* **RNF-23 Interfaz del paciente sin distracciones:** La pantalla del paciente no debe exponer
  métricas, indicadores ni resultado alguno del análisis, para no condicionar su producción gráfica.
* **RNF-24 Documentación de uso:** El sistema debe acompañarse de documentación técnica y de usuario
  suficiente para su operación y mantenimiento.

**8. Mantenibilidad:**

* **RNF-25 Separación entre lógica y tecnología:** La lógica de análisis del test debe permanecer
  independiente del framework web y del motor de base de datos, y esa separación debe ser
  verificable de forma automática.
* **RNF-26 Umbrales calibrables:** Los valores numéricos que el manual describe en términos de
  proporción o intensidad deben poder ajustarse sin modificar la lógica de las reglas.
* **RNF-27 Versionado del esquema:** Todo cambio en la estructura de la base de datos debe quedar
  registrado como migración versionada y reversible.

**9. Compatibilidad:**

* **RNF-28 Dispositivos soportados:** El sistema debe operar sobre tablet con soporte de lápiz
  digital para el módulo del paciente y sobre computadora de escritorio para el del examinador.
* **RNF-29 Navegadores:** Debe funcionar en navegadores que implementen la captura de eventos de
  puntero con presión.
* **RNF-30 Requisito de conectividad:** El uso del módulo del paciente requiere conexión estable
  durante la sesión, condición que debe advertirse antes de iniciar la aplicación del test.

---

## Trazabilidad a los objetivos específicos

| Objetivo específico | Requerimientos que lo realizan |
|---|---|
| 1. Analizar el proceso actual de evaluación | Levantamiento previo; no genera requerimientos de software |
| 2. Especificar requerimientos bajo IEEE 830 | El presente documento |
| 3. Establecer arquitectura e interfaces de paciente y examinador | RF-03, RF-11, RF-14 a RF-25, RNF-22, RNF-23, RNF-25 |
| 4. Organizar los módulos de captura, registro, transcripción y generación del borrador | RF-16, RF-22 a RF-28, RF-35 a RF-38, RNF-05 |
| 5. Estimar la reducción del tiempo de elaboración | RF-37, RF-40 (registro de fechas de validación como base de la medición) |

## Cobertura del alcance declarado en 1.3.3

| Módulo del alcance | Requerimientos |
|---|---|
| Gestión de pacientes y sesiones | RF-04 a RF-13 |
| Módulo del paciente: captura digital del dibujo | RF-14 a RF-19 |
| Módulo del examinador: registro estructurado de la sesión | RF-20 a RF-28 |
| Módulo de procesamiento: medidas objetivas del trazo | RF-29, RF-30 |
| Módulo de generación del borrador de informe | RF-31 a RF-39 |

**Total:** 41 requerimientos funcionales y 30 no funcionales.

**Nota sobre los apartados 5 y 6 de los no funcionales.** El formato de referencia corresponde a un
sistema de ventas y contempla siete categorías. Se añadieron dos —Confidencialidad y Cumplimiento, y
Restricciones Éticas y Trazabilidad Clínica— porque el sistema maneja datos clínicos de personas, en
parte menores de edad, y porque la delimitación explícita frente a la inferencia diagnóstica es una
condición que el proyecto asume desde el apartado 1.3.3 y que sustenta en Lin et al. (2022). Omitirlas
dejaría fuera las restricciones que más condicionan el diseño de la solución.
