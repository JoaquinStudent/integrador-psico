-- PSICOGRAMA · desde cero · PASO 08: catalogo del manual · PARTE 1 DE 7
-- GENERADO por desde-cero/generar.py a partir de seed-catalog.sql. No editar a mano.
-- Ejecutar las partes EN ORDEN (1 a 7). Cada una es una transaccion y se puede repetir.
-- Debe terminar en COMMIT; si el editor corto el texto, copia de nuevo.

BEGIN;

-- Tests ----------------------------------------------------------------------
INSERT INTO tests (code, name, is_available) VALUES ('PBLL', 'Persona bajo la lluvia', true)
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, is_available = EXCLUDED.is_available;
INSERT INTO tests (code, name, is_available) VALUES ('HTP', 'Casa-Arbol-Persona', false)
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, is_available = EXCLUDED.is_available;
INSERT INTO tests (code, name, is_available) VALUES ('DF', 'Dibujo de la Familia', false)
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, is_available = EXCLUDED.is_available;
INSERT INTO tests (code, name, is_available) VALUES ('DFH', 'Dibujo de la Figura Humana', false)
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, is_available = EXCLUDED.is_available;

-- Categorias de indicadores ---------------------------------------------------
INSERT INTO indicator_categories (test_id, code, name)
  SELECT id, 'A', 'Recursos expresivos' FROM tests WHERE code = 'PBLL'
  ON CONFLICT (test_id, code) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO indicator_categories (test_id, code, name)
  SELECT id, 'B', 'Analisis de contenido' FROM tests WHERE code = 'PBLL'
  ON CONFLICT (test_id, code) DO UPDATE SET name = EXCLUDED.name;

-- Secciones del manual --------------------------------------------------------
INSERT INTO manual_sections (category_id, code, name, code_prefix)
  SELECT c.id, 'A-1', 'Dimensiones', 'DIM'
  FROM indicator_categories c JOIN tests t ON t.id = c.test_id
  WHERE t.code = 'PBLL' AND c.code = 'A'
  ON CONFLICT (category_id, code) DO UPDATE SET name = EXCLUDED.name, code_prefix = EXCLUDED.code_prefix;
INSERT INTO manual_sections (category_id, code, name, code_prefix)
  SELECT c.id, 'A-2', 'Emplazamiento', 'UBI'
  FROM indicator_categories c JOIN tests t ON t.id = c.test_id
  WHERE t.code = 'PBLL' AND c.code = 'A'
  ON CONFLICT (category_id, code) DO UPDATE SET name = EXCLUDED.name, code_prefix = EXCLUDED.code_prefix;
INSERT INTO manual_sections (category_id, code, name, code_prefix)
  SELECT c.id, 'A-3', 'Trazos', 'TRZ'
  FROM indicator_categories c JOIN tests t ON t.id = c.test_id
  WHERE t.code = 'PBLL' AND c.code = 'A'
  ON CONFLICT (category_id, code) DO UPDATE SET name = EXCLUDED.name, code_prefix = EXCLUDED.code_prefix;
INSERT INTO manual_sections (category_id, code, name, code_prefix)
  SELECT c.id, 'A-4', 'Presion', 'PRE'
  FROM indicator_categories c JOIN tests t ON t.id = c.test_id
  WHERE t.code = 'PBLL' AND c.code = 'A'
  ON CONFLICT (category_id, code) DO UPDATE SET name = EXCLUDED.name, code_prefix = EXCLUDED.code_prefix;
INSERT INTO manual_sections (category_id, code, name, code_prefix)
  SELECT c.id, 'A-5', 'Tiempo', 'TMP'
  FROM indicator_categories c JOIN tests t ON t.id = c.test_id
  WHERE t.code = 'PBLL' AND c.code = 'A'
  ON CONFLICT (category_id, code) DO UPDATE SET name = EXCLUDED.name, code_prefix = EXCLUDED.code_prefix;
INSERT INTO manual_sections (category_id, code, name, code_prefix)
  SELECT c.id, 'A-6', 'Secuencia', 'SEC'
  FROM indicator_categories c JOIN tests t ON t.id = c.test_id
  WHERE t.code = 'PBLL' AND c.code = 'A'
  ON CONFLICT (category_id, code) DO UPDATE SET name = EXCLUDED.name, code_prefix = EXCLUDED.code_prefix;
INSERT INTO manual_sections (category_id, code, name, code_prefix)
  SELECT c.id, 'A-7', 'Movimiento', 'MOV'
  FROM indicator_categories c JOIN tests t ON t.id = c.test_id
  WHERE t.code = 'PBLL' AND c.code = 'A'
  ON CONFLICT (category_id, code) DO UPDATE SET name = EXCLUDED.name, code_prefix = EXCLUDED.code_prefix;
INSERT INTO manual_sections (category_id, code, name, code_prefix)
  SELECT c.id, 'A-8', 'Sombreados', 'SOM'
  FROM indicator_categories c JOIN tests t ON t.id = c.test_id
  WHERE t.code = 'PBLL' AND c.code = 'A'
  ON CONFLICT (category_id, code) DO UPDATE SET name = EXCLUDED.name, code_prefix = EXCLUDED.code_prefix;
INSERT INTO manual_sections (category_id, code, name, code_prefix)
  SELECT c.id, 'B-1', 'Orientacion persona', 'ORI'
  FROM indicator_categories c JOIN tests t ON t.id = c.test_id
  WHERE t.code = 'PBLL' AND c.code = 'B'
  ON CONFLICT (category_id, code) DO UPDATE SET name = EXCLUDED.name, code_prefix = EXCLUDED.code_prefix;
INSERT INTO manual_sections (category_id, code, name, code_prefix)
  SELECT c.id, 'B-10', 'Identidad sexual', 'IDX'
  FROM indicator_categories c JOIN tests t ON t.id = c.test_id
  WHERE t.code = 'PBLL' AND c.code = 'B'
  ON CONFLICT (category_id, code) DO UPDATE SET name = EXCLUDED.name, code_prefix = EXCLUDED.code_prefix;
INSERT INTO manual_sections (category_id, code, name, code_prefix)
  SELECT c.id, 'B-2', 'Posturas', 'POS'
  FROM indicator_categories c JOIN tests t ON t.id = c.test_id
  WHERE t.code = 'PBLL' AND c.code = 'B'
  ON CONFLICT (category_id, code) DO UPDATE SET name = EXCLUDED.name, code_prefix = EXCLUDED.code_prefix;
INSERT INTO manual_sections (category_id, code, name, code_prefix)
  SELECT c.id, 'B-3', 'Borrados', 'BOR'
  FROM indicator_categories c JOIN tests t ON t.id = c.test_id
  WHERE t.code = 'PBLL' AND c.code = 'B'
  ON CONFLICT (category_id, code) DO UPDATE SET name = EXCLUDED.name, code_prefix = EXCLUDED.code_prefix;
INSERT INTO manual_sections (category_id, code, name, code_prefix)
  SELECT c.id, 'B-5', 'Detalles accesorios', 'DET'
  FROM indicator_categories c JOIN tests t ON t.id = c.test_id
  WHERE t.code = 'PBLL' AND c.code = 'B'
  ON CONFLICT (category_id, code) DO UPDATE SET name = EXCLUDED.name, code_prefix = EXCLUDED.code_prefix;
INSERT INTO manual_sections (category_id, code, name, code_prefix)
  SELECT c.id, 'B-6', 'Vestimenta', 'VES'
  FROM indicator_categories c JOIN tests t ON t.id = c.test_id
  WHERE t.code = 'PBLL' AND c.code = 'B'
  ON CONFLICT (category_id, code) DO UPDATE SET name = EXCLUDED.name, code_prefix = EXCLUDED.code_prefix;
INSERT INTO manual_sections (category_id, code, name, code_prefix)
  SELECT c.id, 'B-7', 'Paraguas', 'PAR'
  FROM indicator_categories c JOIN tests t ON t.id = c.test_id
  WHERE t.code = 'PBLL' AND c.code = 'B'
  ON CONFLICT (category_id, code) DO UPDATE SET name = EXCLUDED.name, code_prefix = EXCLUDED.code_prefix;
INSERT INTO manual_sections (category_id, code, name, code_prefix)
  SELECT c.id, 'B-9', 'Partes del cuerpo', 'CUE'
  FROM indicator_categories c JOIN tests t ON t.id = c.test_id
  WHERE t.code = 'PBLL' AND c.code = 'B'
  ON CONFLICT (category_id, code) DO UPDATE SET name = EXCLUDED.name, code_prefix = EXCLUDED.code_prefix;

-- Indicadores ----------------------------------------------------------------
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'DIM-01', s.id, 'Dibujo pequeno', 'Timidez, aplastamiento, autodesvalorizacion, inseguridades, temores. Retraimiento, sentimiento de inadecuacion, inferioridad, dependiente. Inhibicion, inadecuada percepcion de si mismo.', 'auto'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'A-1'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'DIM-02', s.id, 'Dibujo grande', 'Necesidad de mostrarse, de ser reconocido. Autoexpansivo. Indice de agresividad. Teatralidad. Si es poco flexible, falta de adaptacion.', 'auto'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'A-1'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'DIM-03', s.id, 'Dibujo muy grande', 'Controles internos deficientes. Autoreaseguramiento. Inadecuada percepcion de si mismo. Ilusiones paranoides de grandiosidad. Megalomanía.', 'auto'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'A-1'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'DIM-04', s.id, 'Dibujo mediano', 'Persona bien ubicada en el espacio.', 'auto'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'A-1'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'UBI-01', s.id, 'Margen derecho', 'Representa el futuro, lo consciente, el padre o la autoridad. Extravertido. Actividad, empuje, ambicion, optimismo. Confianza en el futuro.', 'auto'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'A-2'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'UBI-02', s.id, 'Margen izquierdo', 'Representa el pasado, lo inconsciente y preconsciente. Introversion, pesimismo, debilidad, depresion, fatiga.', 'auto'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'A-2'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'UBI-03', s.id, 'Margen superior', 'Rasgos de personalidad euforica, alegre, noble, espiritual, idealista. Tocando el margen: defensas pobres, comportamientos maniacos, rasgos psicoticos.', 'auto'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'A-2'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'UBI-04', s.id, 'Margen inferior', 'Rasgos apegados a lo concreto, fuerte tendencia instintiva, falta de imaginacion. En el borde: perdida de contacto con la realidad, hundimiento, depresion.', 'auto'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'A-2'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'UBI-05', s.id, 'Centro de la hoja', 'Criterio ajustado a la realidad. Equilibrio entre introversion y extroversion. Objetividad, control de si mismo, reflexion.', 'auto'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'A-2'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'TRZ-01', s.id, 'Linea armonica, entera, firme', 'Persona sana.', 'semi'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'A-3'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'TRZ-02', s.id, 'Linea entrecortada', 'Ansiedad, inseguridad. Problemas respiratorios, fatiga, estres. Necesidad de detenerse a analizar. Desintegracion.', 'semi'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'A-3'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'TRZ-03', s.id, 'Linea redondeada o curva', 'Rasgos femeninos. Sentido estetico. Dependencia. Espiritu maternal, femineidad. Conciliador, diplomatico.', 'semi'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'A-3'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'TRZ-04', s.id, 'Lineas tirantes', 'Tension.', 'semi'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'A-3'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'TRZ-05', s.id, 'Lineas fragmentadas o esbozadas', 'Ansiedad, timidez, falta de confianza en si mismo. En algunos casos enfermedad organica.', 'semi'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'A-3'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'TRZ-06', s.id, 'Lineas desconectadas', 'No tienen direccion intencional. Tendencias psicoticas. Dispersion del pensamiento.', 'semi'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'A-3'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'TRZ-07', s.id, 'Linea recta', 'Fuerza, vitalidad, razonador, frialdad, logica, capacidad de analisis.', 'semi'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'A-3'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'TRZ-08', s.id, 'Linea recta con ondulaciones', 'Tension, ansiedad.', 'semi'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'A-3'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'TRZ-09', s.id, 'Linea recta con temblor', 'Cuadro organico, persona de avanzada edad, gran angustia, adictos. Signo de decadencia de funciones.', 'semi'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'A-3'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'TRZ-10', s.id, 'Linea recta definida pero tosca', 'Tendencias agresivas.', 'semi'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'A-3'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;

COMMIT;
