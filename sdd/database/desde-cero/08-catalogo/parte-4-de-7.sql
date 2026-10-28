-- PSICOGRAMA · desde cero · PASO 08: catalogo del manual · PARTE 4 DE 7
-- GENERADO por desde-cero/generar.py a partir de seed-catalog.sql. No editar a mano.
-- Ejecutar las partes EN ORDEN (1 a 7). Cada una es una transaccion y se puede repetir.
-- Debe terminar en COMMIT; si el editor corto el texto, copia de nuevo.

BEGIN;

INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'DET-20', s.id, 'Persona encerrada entre lineas', 'Necesidad de ser contenido por el medio ambiente. Poca capacidad para crecer. Bloqueado. A veces rasgos obsesivos.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-5'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'DET-21', s.id, 'Anteojos (en persona que no los usa)', 'Ocultamiento, curiosidad sexual, voyeurismo.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-5'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'DET-22', s.id, 'Baston, pipa', 'Fantasias sexuales.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-5'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'VES-01', s.id, 'Bolsillos', 'Organos receptivos. En varones: dependencia materna, conflicto homosexual. En mujeres: comportamiento histerico. Conflicto interior, sexual, culpa.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-6'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'VES-02', s.id, 'Botones', 'Inmadurez, dependencia, caracter obsesivo, preocupacion por lo social, preocupacion somatica. Un solo boton: apego al vinculo materno.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-6'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'VES-03', s.id, 'Botas', 'Sobrecomprension, reafirmacion de la decision.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-6'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'VES-04', s.id, 'Transparencias', 'Angustia frente al cuerpo. A veces dano neurologico, lesion cerebral, intoxicacion, organicidad. Poco criterio. Conducta actuadora.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-6'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'VES-05', s.id, 'Detalles de ropa sin terminar', 'Sentimientos de inadecuacion.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-6'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'VES-06', s.id, 'Corbatas', 'Signo sexual. Debilidad.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-6'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'VES-07', s.id, 'Zapatos muy marcados', 'Conflicto sexual. Con cordones: impulsos sexuales. Frecuente en adolescentes.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-6'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'VES-08', s.id, 'Zapatos en punta, con tacos', 'Agresion.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-6'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'PAR-01', s.id, 'Ausencia de paraguas', 'Falta de defensas. Con anchos hombros: se defiende con su cuerpo, apechuga, se expone y corre riesgos.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-7'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'PAR-02', s.id, 'Paraguas cubriendo adecuadamente', 'Defensas sanas, sentimiento de adecuacion, confianza en si mismo, seguridad. Capacidad de prever.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-7'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'PAR-03', s.id, 'Paraguas cubriendo media cabeza', 'Retraimiento, escape, ocultamiento, recorte de la percepcion.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-7'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'PAR-04', s.id, 'Paraguas muy grande', 'Excesiva proteccion y defensa. Recortamiento del medio y distancia con el entorno. Poco criterio.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-7'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'PAR-05', s.id, 'Paraguas muy chico', 'Defensas labiles. Deja a la persona casi expuesta. Conflicto, perturbacion sexual, dificultades interpersonales.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-7'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'PAR-06', s.id, 'Paraguas cerrado', 'Resignacion. Bajar la guardia, dejar que otro lo defienda. Sin fuerzas para luchar.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-7'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'PAR-07', s.id, 'Paraguas cerrado y en el piso', 'Poca energia para defenderse. En ocasiones enfermedad terminal.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-7'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'PAR-08', s.id, 'Paraguas hacia la derecha', 'Se defiende del ambiente. Temor a lo social. Desconfianza. Defensa por temor al padre y/o autoridad.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-7'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'PAR-09', s.id, 'Paraguas hacia la izquierda', 'Se defiende de la figura materna, de los deseos edipicos y las pulsiones infantiles.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-7'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'PAR-10', s.id, 'Paraguas volando', 'Defensa labil. Yo muy debil. Preocupaciones.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-7'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'PAR-11', s.id, 'Paraguas y nubes fusionados', 'Contaminacion. Indice de esquizofrenia. Ideas confusas.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-7'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'PAR-12', s.id, 'Paraguas con agujeros', 'Fabulacion. Psicopatia. Enfermedad organica.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-7'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'PAR-13', s.id, 'Paraguas con dibujos', 'En muchos casos personas con enfermedades organicas.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-7'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'PAR-14', s.id, 'Paraguas como sombrero', 'Confusion de ideas.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-7'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'PAR-15', s.id, 'Paraguas tipo lanza', 'Recurre a la agresion como defensa.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-7'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'PAR-16', s.id, 'Paraguas con varillas remarcadas', 'Fabulacion. Crea historias falsas. Se miente.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-7'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'PAR-17', s.id, 'Mango de paraguas remarcado', 'Falta de plasticidad. Necesidad de aferrarse a algo aunque sin saber si le sirve como defensa.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-7'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'PAR-18', s.id, 'Mango de paraguas debil', 'Defensas pobres, poca fortaleza para sostenerse.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-7'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'CUE-01', s.id, 'Cabeza dibujada primero', 'Localizacion del yo. Centro de todos los estimulos. Poder intelectual, poder social o dominio.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-9'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'CUE-02', s.id, 'Dibujo de la cabeza solamente', 'Disociacion cuerpo-mente. Se defiende con el pensamiento.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-9'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;
INSERT INTO indicator_catalog (code, section_id, title, interpretation, detection_type)
  SELECT 'CUE-03', s.id, 'Cabeza grande, desproporcionada', 'Deseo de poder, vanidad, narcisismo, autoexigencia, dificultades para el aprendizaje.', 'manual'
  FROM manual_sections s JOIN indicator_categories c ON c.id = s.category_id
  JOIN tests t ON t.id = c.test_id WHERE t.code = 'PBLL' AND s.code = 'B-9'
  ON CONFLICT (code) DO UPDATE SET section_id = EXCLUDED.section_id,
    title = EXCLUDED.title, interpretation = EXCLUDED.interpretation,
    detection_type = EXCLUDED.detection_type;

COMMIT;
