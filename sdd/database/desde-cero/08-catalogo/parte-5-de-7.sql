-- PSICOGRAMA · desde cero · PASO 08: catalogo del manual · PARTE 5 DE 7
-- GENERADO por desde-cero/generar.py a partir de seed-catalog.sql. No editar a mano.
-- Ejecutar las partes EN ORDEN (1 a 7). Cada una es una transaccion y se puede repetir.
-- Debe terminar en COMMIT; si el editor corto el texto, copia de nuevo.

BEGIN;

INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'CUE-04', s.id, 'Cabeza tronchada', 'Limitacion de la capacidad de simbolizar.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-9'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'CUE-05', s.id, 'Cara sin rasgos', 'Desconocimiento de si mismo, problemas de identidad.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-9'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'CUE-06', s.id, 'Ojos sin pupilas', 'Inmadurez emocional, egocentrismo. Negacion de si mismo o del mundo. Dependencia materna. Vaciedad.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-9'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'CUE-07', s.id, 'Ojos muy marcados', 'Rasgos paranoides.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-9'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'CUE-08', s.id, 'Ojos bizcos', 'Rebeldia, hostilidad hacia los demas.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-9'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'CUE-09', s.id, 'Ojos cerrados', 'De menor patologia que ojo sin pupila. Narcisismo.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-9'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'CUE-10', s.id, 'Ojos como puntos', 'Retraimiento. Inseguridad.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-9'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'CUE-11', s.id, 'Ojos con pestanas', 'En hombre: afeminamiento. En mujeres: seduccion.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-9'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'CUE-12', s.id, 'Ojos en V', 'Agresion.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-9'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'CUE-13', s.id, 'Boca linea recta unica', 'Tendencia verbal sadico-agresiva.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-9'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'CUE-14', s.id, 'Boca linea concava unica', 'Pasivo, complaciente.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-9'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'CUE-15', s.id, 'Boca linea convexa unica', 'Amargura.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-9'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'CUE-16', s.id, 'Boca abierta o rota', 'Dificultad de introyecciones adecuadas.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-9'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'CUE-17', s.id, 'Labios marcados', 'Dependencia oral.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-9'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'CUE-18', s.id, 'Labios pintados', 'Caracter femenino.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-9'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'CUE-19', s.id, 'Dientes', 'Agresividad oral. Conflicto sexual.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-9'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'CUE-20', s.id, 'Cejas muy marcadas', 'Agresividad.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-9'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'CUE-21', s.id, 'Nariz muy marcada', 'Virilidad, simbolo falico. Agujeros en la nariz: agresividad, problemas respiratorios, alucinaciones olfativas.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-9'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'CUE-22', s.id, 'Orejas', 'Preocupacion por criticas y opiniones de otros. Deficiencia en la audicion, alucinaciones auditivas.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-9'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'CUE-23', s.id, 'Menton', 'Energia de caracter.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-9'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'CUE-24', s.id, 'Menton sombreado', 'Tendencia a dominar, a ejercer el poder.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-9'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'CUE-25', s.id, 'Menton muy sombreado', 'Indice de conflicto con el medio.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-9'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'CUE-26', s.id, 'Cuello', 'Coordina lo que se siente con lo que se piensa. Sensacion de comodidad y confianza.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-9'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'CUE-27', s.id, 'Cuello angosto', 'Depresion.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-9'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'CUE-28', s.id, 'Cuello grueso', 'Sentimiento de inmovilidad.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-9'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'CUE-29', s.id, 'Cuello largo', 'Arrogancia. Desarmonia entre el intelecto y la emocion. Incoordinacion.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-9'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'CUE-30', s.id, 'Cuello inmovilizado', 'Inhibicion sexual.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-9'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'CUE-31', s.id, 'Cabello', 'Potencia sexual, vitalidad. Signo de virilidad, apasionamiento y seduccion.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-9'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'CUE-32', s.id, 'Cabello muy sombreado o sucio', 'Regresion anal-expulsiva.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-9'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'CUE-33', s.id, 'Cabellos en punta', 'Agresion.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-9'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'CUE-34', s.id, 'Cabello con raya al medio', 'Identificacion femenina y resolucion del conflicto por medio de mecanismos compulsivos-obsesivos y narcisistas.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-9'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'CUE-35', s.id, 'Adornos en el cabello', 'Indicador de control.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-9'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'CUE-36', s.id, 'Cuerpo cuadrado', 'Primitivismo, debilidad mental.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-9'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'CUE-37', s.id, 'Cuerpo estrecho', 'Disconforme con su propio cuerpo. Conflicto en el esquema corporal.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-9'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;

COMMIT;
