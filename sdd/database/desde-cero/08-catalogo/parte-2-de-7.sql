-- PSICOGRAMA · desde cero · PASO 08: catalogo del manual · PARTE 2 DE 7
-- GENERADO por desde-cero/generar.py a partir de seed-catalog.sql. No editar a mano.
-- Ejecutar las partes EN ORDEN (1 a 7). Cada una es una transaccion y se puede repetir.
-- Debe terminar en COMMIT; si el editor corto el texto, copia de nuevo.

BEGIN;

INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'TRZ-11', s.id, 'Linea con angulos, ganchos o picos', 'Agresividad, impaciencia, vitalidad, independencia. Dureza, tenacidad, obstinacion.', 'semi'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'A-3'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'TRZ-12', s.id, 'Lineas con angulos muy agudos', 'Excesiva reaccion emocional, hiperemotivo.', 'semi'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'A-3'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'TRZ-13', s.id, 'Lineas sin control o en zigzag', 'Imposibilidad de controlar impulsos. Descontrolado. Rasgos psicopaticos. Agresividad violenta.', 'semi'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'A-3'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'TRZ-14', s.id, 'Lineas pegadas al papel formando puntas', 'Rasgo epileptoide.', 'semi'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'A-3'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'TRZ-15', s.id, 'Lineas circulares con adornos', 'Narcisismo.', 'semi'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'A-3'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'TRZ-16', s.id, 'Lineas curvas que se rectangularizan', 'No se permiten emociones, bloqueo afectivo, supresion de afectos.', 'semi'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'A-3'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'PRE-01', s.id, 'Presion normal', 'Equilibrado, adaptado, elaborador, constante. Armonioso.', 'auto'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'A-4'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'PRE-02', s.id, 'Presion debil con velocidad', 'Rapidez mental, originalidad, agilidad, intuicion, hipersensibilidad, creativo, vehemente.', 'auto'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'A-4'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'PRE-03', s.id, 'Presion debil con lentitud', 'Ansiedad, timidez, ocultamiento, falta de sinceridad, desubicacion, rasgos depresivos.', 'auto'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'A-4'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'PRE-04', s.id, 'Presion fuerte pigmentada', 'Fuerza fisica, energia vital, seguridad, extraversion, agresion, hostilidad. En personas evolucionadas: lider. En poco evolucionadas: agresividad.', 'auto'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'A-4'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'PRE-05', s.id, 'Presion fuerte empastada', 'Individuos lentos, sensuales, rutinarios, de poca iniciativa, poco creativos, estaticos.', 'auto'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'A-4'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'PRE-06', s.id, 'Presion muy fuerte', 'Agresividad.', 'auto'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'A-4'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'TMP-01', s.id, 'Dificultad para comenzar', 'Verbalizaciones previas, excusas, disculpas. Dificultad para enfrentar una tarea nueva, para tomar decisiones.', 'auto'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'A-5'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'TMP-02', s.id, 'Dificultad para concluir', 'Agregado de detalles, preguntas superfluas. Dificultad para separarse del otro, caracter epileptoide.', 'auto'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'A-5'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'TMP-03', s.id, 'Momentos de quietud', 'Se detiene en la ejecucion para continuarlo luego. Lagunas, bloqueos.', 'auto'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'A-5'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'TMP-04', s.id, 'Velocidad normal', 'Dibujo espontaneo y continuo.', 'auto'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'A-5'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'TMP-05', s.id, 'Ejecucion lenta y continua', 'Pobreza intelectual, falta de riqueza imaginativa.', 'auto'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'A-5'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'TMP-06', s.id, 'Ejecucion rapida', 'Agilidad, excitabilidad.', 'auto'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'A-5'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'TMP-07', s.id, 'Ejecucion precipitada', 'Generalmente descuidada o inconclusa. Atropello, hipersensibilidad o necesidad de liberarse rapidamente de los problemas.', 'auto'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'A-5'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'SEC-01', s.id, 'Inicio por cabeza, cuerpo, paraguas, lluvia', 'Lo esperable. Secuencia normal.', 'semi'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'A-6'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'SEC-02', s.id, 'Inicio por los pies', 'Perturbacion del pensamiento, no toma el camino adecuado para la resolucion del problema.', 'semi'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'A-6'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'SEC-03', s.id, 'Inicio por el paraguas', 'Excesiva defensa y control.', 'semi'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'A-6'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'MOV-01', s.id, 'Rigidez', 'Sujeto encerrado y protegido del mundo. Despersonalizado. Se siente amenazado. No adaptado, no tiene libertad para actuar.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'A-7'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'MOV-02', s.id, 'Mucha actividad en el dibujo', 'Exceso de fantasia, actitud maniaca.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'A-7'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'MOV-03', s.id, 'En posicion de caminar', 'Se interpreta segun hacia donde se dirige.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'A-7'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'MOV-04', s.id, 'Realizando una accion concreta', 'Energetico. Actitud euforica.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'A-7'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'MOV-05', s.id, 'Exhibiendose', 'Narcisismo.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'A-7'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'SOM-01', s.id, 'Sombreados', 'Ansiedad por el cuerpo segun la zona que senalen. Necesidad de controlar esa parte del cuerpo. Mecanismo de defensa: anulacion.', 'semi'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'A-8'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'ORI-01', s.id, 'Hacia la derecha', 'Comportamiento positivo. Avance hacia el futuro. Necesidad de crecer. Buena relacion con el padre y/o autoridad.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-1'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'ORI-02', s.id, 'Hacia la izquierda', 'Direccion hacia el pasado. Conflictos sin resolver. Algo del pasado que pesa y frena su evolucion. Conflictos con la madre.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-1'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'ORI-03', s.id, 'Hacia el frente', 'Dispuesto a enfrentar al mundo. Comportamiento presente.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-1'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'ORI-04', s.id, 'Orientacion dubitativa', 'Ambivalencia. Tendencias obsesivas o paranoides. Falta de decision. Incoordinacion.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-1'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;

COMMIT;
