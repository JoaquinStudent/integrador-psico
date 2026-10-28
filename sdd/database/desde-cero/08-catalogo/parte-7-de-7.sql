-- PSICOGRAMA · desde cero · PASO 08: catalogo del manual · PARTE 7 DE 7
-- GENERADO por desde-cero/generar.py a partir de seed-catalog.sql. No editar a mano.
-- Ejecutar las partes EN ORDEN (1 a 7). Cada una es una transaccion y se puede repetir.
-- Debe terminar en COMMIT; si el editor corto el texto, copia de nuevo.

BEGIN;

INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'IDX-01', s.id, 'Figura del sexo contrario', 'Dificultades o conflictos en relaciones objetales primarias. En varones: conflicto homosexual. En mujeres: masculinizacion de la figura femenina.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-10'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'IDX-02', s.id, 'Figura desnuda', 'Exhibicionismo, psicopatia.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-10'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'IDX-03', s.id, 'Persona bajo la ducha', 'Narcisismo, exhibicionismo. Histeria.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-10'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;

-- Marcas rapidas -------------------------------------------------------------
INSERT INTO quick_mark_catalog (code, label, display_order) VALUES ('pausa_prolongada', 'Pausa prolongada', 1)
  ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label, display_order = EXCLUDED.display_order;
INSERT INTO quick_mark_catalog (code, label, display_order) VALUES ('uso_borrador', 'Uso borrador', 2)
  ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label, display_order = EXCLUDED.display_order;
INSERT INTO quick_mark_catalog (code, label, display_order) VALUES ('comentario_espontaneo', 'Comentario espontaneo', 3)
  ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label, display_order = EXCLUDED.display_order;
INSERT INTO quick_mark_catalog (code, label, display_order) VALUES ('muestra_inseguridad', 'Muestra inseguridad', 4)
  ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label, display_order = EXCLUDED.display_order;
INSERT INTO quick_mark_catalog (code, label, display_order) VALUES ('pregunto_por_el_paraguas', 'Pregunto por el paraguas', 5)
  ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label, display_order = EXCLUDED.display_order;
INSERT INTO quick_mark_catalog (code, label, display_order) VALUES ('roto_la_hoja', 'Roto la hoja', 6)
  ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label, display_order = EXCLUDED.display_order;

-- Actitudes ------------------------------------------------------------------
INSERT INTO attitude_catalog (code, label, display_order) VALUES ('colaborador', 'Colaborador', 1)
  ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label, display_order = EXCLUDED.display_order;
INSERT INTO attitude_catalog (code, label, display_order) VALUES ('ansioso', 'Ansioso', 2)
  ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label, display_order = EXCLUDED.display_order;
INSERT INTO attitude_catalog (code, label, display_order) VALUES ('inseguro', 'Inseguro', 3)
  ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label, display_order = EXCLUDED.display_order;
INSERT INTO attitude_catalog (code, label, display_order) VALUES ('impulsivo', 'Impulsivo', 4)
  ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label, display_order = EXCLUDED.display_order;
INSERT INTO attitude_catalog (code, label, display_order) VALUES ('meticuloso', 'Meticuloso', 5)
  ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label, display_order = EXCLUDED.display_order;
INSERT INTO attitude_catalog (code, label, display_order) VALUES ('desafiante', 'Desafiante', 6)
  ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label, display_order = EXCLUDED.display_order;
INSERT INTO attitude_catalog (code, label, display_order) VALUES ('retraido', 'Retraido', 7)
  ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label, display_order = EXCLUDED.display_order;
INSERT INTO attitude_catalog (code, label, display_order) VALUES ('distraido', 'Distraido', 8)
  ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label, display_order = EXCLUDED.display_order;

-- C y D fuera del motor: desactiva las filas que una siembra anterior haya dejado.
UPDATE indicator_catalog SET is_active = false WHERE is_active AND section_id IN (
  SELECT s.id FROM manual_sections s
  JOIN indicator_categories c ON c.id = s.category_id WHERE c.code IN ('C','D'));

COMMIT;
