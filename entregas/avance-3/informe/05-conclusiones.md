# CONCLUSIONES

Se redacta una conclusión por objetivo específico, indicando si se cumplió y con qué evidencia. Donde la evidencia no existe todavía, se dice.

**1. Analizar el proceso actual (objetivo 1).** *Cumplido en lo cualitativo.* Se describió el proceso manual paso a paso, se identificaron tres deficiencias —doble registro, pérdida de los indicadores temporales y variabilidad entre evaluadores— y se determinó que las etapas de medición, cotejo y transcripción son las que más tiempo consumen (§3.1). Queda **pendiente la cuantificación**: el tiempo actual no se ha medido y hoy solo hay una estimación del equipo (45 a 90 minutos).

**2. Especificar los requerimientos (objetivo 2).** *Cumplido en la especificación; falta la validación del centro.* Se especificaron 41 requerimientos funcionales y 30 no funcionales bajo IEEE 830, trazados a los objetivos. La meta de que el 100 % sea validado por el psicólogo del centro mediante una matriz firmada **todavía no está evidenciada**.

**3. Establecer la arquitectura y las interfaces (objetivo 3).** *Cumplido en lo técnico; falta la usabilidad.* La arquitectura hexagonal quedó implementada y verificable: el dominio no importa infraestructura (`check-hexagon.sh`: OK), el esquema está normalizado a 2FN con RLS en las 24 tablas y las 13 pantallas del prototipo existen como pantallas reales. Los 41 requerimientos tienen componente (37 implementados, 4 parciales; Anexo 14). **La meta de usabilidad SUS ≥ 68 no se ha medido.**

**4. Desarrollar los módulos de captura, registro, transcripción y borrador (objetivo 4).** *Cumplido en su mayor parte.* Están implementados la captura del trazo con su dimensión temporal, el espejo en vivo, el registro de observaciones y marcas, la grabación con transcripción, la medición objetiva, el checklist de 183 indicadores y el borrador de nueve secciones con exportación a PDF. **Limitaciones:** la propuesta asistida por modelo de lenguaje de los indicadores semiautomáticos no está implementada; el recorrido completo hasta el PDF y el espejo con la tablet física no se verificaron en esta auditoría; y los dibujos guardados antes de corregir los tiempos del trazo tienen latencia y pausas en cero.

**5. Estimar la reducción del tiempo (objetivo 5).** *No cumplido todavía.* El instrumento, el protocolo y el análisis estadístico están listos y probados con datos simulados, pero **no hay mediciones reales**. No se afirma ninguna reducción. Cuando se mida, se reportará tal como resulte, sea cual sea.

## Conclusión general

El proyecto alcanzó una versión funcional del sistema que cubre la gran mayoría del alcance comprometido y con una arquitectura que se puede auditar, pero **la pregunta central —si Psicograma reduce el tiempo de elaboración del informe— sigue sin respuesta empírica**. Esa respuesta depende de una medición que solo puede hacerse con el centro y que es irrecuperable si se retrasa más allá de su adopción del sistema.

## Recomendaciones

1. **Iniciar ya la medición de la línea base manual** con la ficha de registro, antes de que el centro use el sistema.
2. Aplicar los dos scripts pendientes en la base (catálogo de 183 indicadores y migración de la agenda).
3. Recorrer el flujo completo con la tablet y el lápiz físicos y medir la latencia del espejo.
4. Crear un rol de base de datos sin `BYPASSRLS` (R-08) y persistir las notas del paciente en la base.
5. Integrar a `main` y etiquetar los sprints en el repositorio (el README de la raíz ya existe).
6. Aplicar el cuestionario SUS a los psicólogos y obtener la validación firmada de la matriz de requerimientos.
