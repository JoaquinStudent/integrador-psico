-- =============================================================================
-- PSICOGRAMA — Datos de demo
-- =============================================================================
--
-- Pega este archivo completo en el SQL Editor de Supabase y ejecutalo. No hace
-- falta levantar el backend ni tu contrasena: el editor corre como superusuario.
--
-- Siembra, sobre la cuenta indicada abajo:
--   3 pacientes con edades y motivos distintos
--   3 sesiones completadas con consentimiento firmado
--   3 dibujos con sus trazos, de perfil metrico plausible
--   observaciones, marcas rapidas y actitudes
--   las 7 metricas objetivas, CALCULADAS desde los trazos insertados
--   indicadores sugeridos, con dos validados para poder probar el informe
--
-- Es re-ejecutable: borra primero los pacientes de demo anteriores. Solo toca
-- filas cuyo documento empieza con '[demo]', asi que no puede afectar a un
-- paciente real.
--
-- DOS LIMITES, dichos de frente:
--
-- 1. Inserta por SQL directo, salteando la API y RLS. Sirve para tener datos que
--    mirar, **no** para verificar que la API funciona. Para eso esta
--    `backend/scripts/seed-demo.py`, que hace lo mismo por HTTP con token real.
--
-- 2. La geometria de los trazos es de segmentos rectos: da un perfil de metricas
--    realista (area, presion, tiempos, pausas), que es lo que la pantalla de
--    analisis necesita, pero el dibujo no se parece a una figura humana. Si
--    necesitas que el espejo o el PNG se vean bien, usa el script de Python.
-- =============================================================================

BEGIN;

-- --- A quien pertenecen los datos --------------------------------------------
-- Cambia el correo para sembrar sobre otra cuenta.
CREATE TEMP TABLE _cfg AS SELECT 'joaquiningsoft@gmail.com'::text AS email;

DO $$
DECLARE v_email text;
BEGIN
    SELECT email INTO v_email FROM _cfg;
    IF NOT EXISTS (
        SELECT 1 FROM profiles p JOIN auth.users u ON u.id = p.id
        WHERE lower(u.email) = lower(v_email)
    ) THEN
        RAISE EXCEPTION
            'No existe perfil para %. Registrate primero en la aplicacion: el trigger handle_new_user lo crea.',
            v_email;
    END IF;
END $$;

CREATE TEMP TABLE _yo AS
SELECT p.id FROM profiles p JOIN auth.users u ON u.id = p.id
WHERE lower(u.email) = lower((SELECT email FROM _cfg));

-- La seccion 1 del informe imprime la matricula; sin esto sale incompleta.
UPDATE profiles
SET license_number = COALESCE(license_number, '12345'),
    specialty      = COALESCE(specialty, 'Psicologia Clinica')
WHERE id = (SELECT id FROM _yo);

-- El borrado en cascada se lleva sesiones, dibujos, trazos, metricas,
-- observaciones, marcas e indicadores.
DELETE FROM patients
WHERE created_by = (SELECT id FROM _yo) AND document_number LIKE '[demo]%';

-- =============================================================================
-- 1. Pacientes
-- =============================================================================

CREATE TEMP TABLE _pac (n int, id uuid, escena real);

WITH nuevos AS (
    INSERT INTO patients (full_name, document_number, birth_date, sex, created_by)
    VALUES
      ('Martina Quispe Flores', '[demo]-1',
       (current_date - interval '9 years 4 months')::date,  'F', (SELECT id FROM _yo)),
      ('Diego Huaman Rojas',    '[demo]-2',
       (current_date - interval '12 years 7 months')::date, 'M', (SELECT id FROM _yo)),
      ('Camila Vasquez Leon',   '[demo]-3',
       (current_date - interval '7 years 2 months')::date,  'F', (SELECT id FROM _yo))
    RETURNING id, document_number
)
INSERT INTO _pac (n, id, escena)
SELECT right(document_number, 1)::int, id,
       -- Fraccion de **cada lado** de la hoja que abarca la escena, no del area:
       -- el area crece al cuadrado. Para apuntar a ~5%, ~30% y ~55% de hoja
       -- ocupada hay que tomar la raiz, y eso da tres indicadores DIM distintos:
       -- DIM-01 (pequeno), DIM-04 (mediano) y DIM-02 (grande).
       (ARRAY[0.24, 0.59, 0.88])[right(document_number, 1)::int]
FROM nuevos;

-- =============================================================================
-- 2. Sesiones, consentimiento y observaciones
-- =============================================================================

CREATE TEMP TABLE _ses AS
WITH nuevas AS (
    INSERT INTO sessions (patient_id, test_id, status, reason, created_by,
                          started_at, completed_at)
    SELECT p.id,
           (SELECT id FROM tests WHERE code = 'PBLL'),
           'completed',
           (ARRAY[
             'Derivacion de la institucion educativa por dificultades atencionales y cambios recientes en la interaccion con sus pares.',
             'Consulta de los padres por retraimiento y descenso del rendimiento escolar en el ultimo trimestre.',
             'Evaluacion psicodiagnostica de ingreso solicitada por el centro.'
           ])[p.n],
           (SELECT id FROM _yo),
           now() - (p.n || ' days')::interval,
           now() - (p.n || ' days')::interval + ((ARRAY[9, 13, 20])[p.n] || ' minutes')::interval
    FROM _pac p
    RETURNING id, patient_id
)
SELECT n.id, n.patient_id, p.n, p.escena
FROM nuevas n JOIN _pac p ON p.id = n.patient_id;

INSERT INTO consent_records (session_id, audio_authorized, digital_authorized,
                             confidential_ack, signed_at)
SELECT id, n <> 2, true, true, now() - (n || ' days')::interval FROM _ses;

INSERT INTO session_observations (session_id, additional_notes)
SELECT id, (ARRAY[
  'Se mostro colaboradora desde el inicio. Tomo el lapiz con firmeza y pregunto si podia usar toda la hoja. Tono de voz bajo al responder consignas.',
  'Demoro en comenzar. Verbalizo "no se dibujar" antes del primer trazo. Borraduras frecuentes en la zona del rostro. Contacto visual intermitente.',
  'Ejecucion rapida y continua. Pregunto por el paraguas al terminar la figura.'
])[n]
FROM _ses;

-- Se mapea con VALUES y no con arrays anidados: Postgres trata `ARRAY[ARRAY[...]]`
-- como una matriz y exige que todas las filas tengan la misma longitud.
INSERT INTO session_attitudes (session_id, attitude_code)
SELECT s.id, a.code
FROM _ses s
CROSS JOIN (VALUES
    ('colaborador', 1), ('meticuloso', 1),
    ('inseguro',    2), ('ansioso',    2),
    ('impulsivo',   3)
) AS a(code, para)
WHERE a.para = s.n
  AND EXISTS (SELECT 1 FROM attitude_catalog c WHERE c.code = a.code);

INSERT INTO session_quick_marks (session_id, mark_code, marked_at_ms)
SELECT s.id, m.code, m.ms
FROM _ses s
CROSS JOIN (VALUES
    ('pausa_prolongada', 125000, 2),
    ('uso_borrador',     198000, 2),
    ('roto_la_hoja',     260000, 1),
    ('pregunto_por_el_paraguas', 310000, 3)
) AS m(code, ms, para)
WHERE m.para = s.n
  AND EXISTS (SELECT 1 FROM quick_mark_catalog q WHERE q.code = m.code);

INSERT INTO verbalizations (session_id, offset_ms, text, source)
SELECT s.id, v.ms, v.txt, 'examiner'
FROM _ses s
CROSS JOIN (VALUES
    ('Esta lloviendo mucho, no?',              98000,  1),
    ('Le voy a poner un paraguas.',            240000, 1),
    ('No se dibujar.',                         15000,  2),
    ('Le puedo poner botas?',                  180000, 3)
) AS v(txt, ms, para)
WHERE v.para = s.n;

-- =============================================================================
-- 3. Dibujos y trazos
-- =============================================================================

CREATE TEMP TABLE _dib AS
WITH nuevos AS (
    INSERT INTO drawings (session_id, orientation, canvas_width, canvas_height)
    SELECT id, 'horizontal', 1000, 800 FROM _ses
    RETURNING id, session_id
)
SELECT n.id AS drawing_id, s.id AS session_id, s.n, s.escena
FROM nuevos n JOIN _ses s ON s.id = n.session_id;

-- Trazos de lapiz. La posicion se deriva de un hash del par (dibujo, indice), asi
-- que el resultado es el mismo en cada corrida: datos reproducibles.
INSERT INTO strokes (drawing_id, stroke_index, tool, started_at_ms, ended_at_ms,
                     point_count, avg_pressure, bbox_x, bbox_y,
                     bbox_width, bbox_height, points)
SELECT
    d.drawing_id,
    i,
    'pen',
    t.ini,
    t.ini + t.dur,
    3,
    t.presion,
    least(t.x0, t.x1), least(t.y0, t.y1),
    abs(t.x1 - t.x0), abs(t.y1 - t.y0),
    jsonb_build_array(
        jsonb_build_object('x', round(t.x0::numeric, 1), 'y', round(t.y0::numeric, 1),
                           't', 0, 'p', round((t.presion * 0.8)::numeric, 2)),
        jsonb_build_object('x', round(((t.x0 + t.x1) / 2)::numeric, 1),
                           'y', round(((t.y0 + t.y1) / 2)::numeric, 1),
                           't', t.dur / 2, 'p', round(t.presion::numeric, 2)),
        jsonb_build_object('x', round(t.x1::numeric, 1), 'y', round(t.y1::numeric, 1),
                           't', t.dur, 'p', round((t.presion * 0.85)::numeric, 2))
    )
FROM _dib d
CROSS JOIN generate_series(0, 43) AS i
CROSS JOIN LATERAL (
    SELECT
        -- Caja de la escena, centrada en la hoja.
        500 - 450 * d.escena AS bx,
        400 - 350 * d.escena AS by,
        900 * d.escena       AS bw,
        700 * d.escena       AS bh,
        -- Pseudoaleatorio determinista.
        (abs(hashtext(d.drawing_id::text || ':' || i)) % 1000) / 1000.0 AS r1,
        (abs(hashtext(d.drawing_id::text || ':b:' || i)) % 1000) / 1000.0 AS r2
) AS g
CROSS JOIN LATERAL (
    SELECT
        -- Latencia distinta por caso, y el tiempo avanza con el indice. Cada
        -- tantos trazos se deja un hueco largo, que el manual lee como pausa (A-5).
        (ARRAY[9000, 21000, 6000])[d.n]
            + i * 1400
            + (CASE WHEN i > 0 AND i % 14 = 0 THEN 22000 * (i / 14) ELSE 0 END) AS ini,
        (200 + (g.r1 * 900))::int AS dur,
        (0.22 + g.r2 * 0.55)::real AS presion,
        -- Los 12 primeros trazos arman la figura, en el tercio central de la
        -- escena; el resto es lluvia distribuida por la escena.
        CASE WHEN i < 12
             THEN g.bx + g.bw * (0.38 + g.r1 * 0.24)
             ELSE g.bx + g.bw * g.r1 END::real AS x0,
        CASE WHEN i < 12
             THEN g.by + g.bh * (i / 12.0) * 0.9
             ELSE g.by + g.bh * g.r2 * 0.7 END::real AS y0,
        CASE WHEN i < 12
             THEN g.bx + g.bw * (0.38 + g.r2 * 0.24)
             ELSE g.bx + g.bw * g.r1 + 8 END::real AS x1,
        CASE WHEN i < 12
             THEN g.by + g.bh * ((i + 1) / 12.0) * 0.9
             ELSE g.by + g.bh * g.r2 * 0.7 + 26 END::real AS y1
) AS t;

-- Borrados (B-3). Solo los casos 2 y 3, con cantidades distintas.
INSERT INTO strokes (drawing_id, stroke_index, tool, started_at_ms, ended_at_ms,
                     point_count, avg_pressure, bbox_x, bbox_y,
                     bbox_width, bbox_height, points)
SELECT d.drawing_id, 44 + k, 'eraser',
       420000 + k * 9000, 420000 + k * 9000 + 500,
       2, 0.6,
       500 - 300 * d.escena, 400 - 250 * d.escena, 18, 14,
       jsonb_build_array(
           jsonb_build_object('x', 500 - 300 * d.escena, 'y', 400 - 250 * d.escena,
                              't', 0, 'p', 0.6),
           jsonb_build_object('x', 500 - 300 * d.escena + 18, 'y', 400 - 250 * d.escena + 14,
                              't', 500, 'p', 0.6)
       )
FROM _dib d
CROSS JOIN generate_series(0, 4) AS k
WHERE k < (ARRAY[0, 3, 5])[d.n];

-- =============================================================================
-- 4. Metricas objetivas, calculadas desde los trazos
-- =============================================================================
--
-- No se insertan a mano: se derivan de lo que quedo en `strokes`. Asi los numeros
-- son coherentes con el dibujo, y de paso se ve para que sirvio normalizar el
-- trazo a nivel de fila — en el esquema v1, con todo dentro de un unico
-- `strokes_json`, nada de esto era una consulta.

INSERT INTO stroke_metrics (session_id, total_time_ms, latency_ms, stroke_count,
                            pressure_avg, pause_count, erase_count, area_pct,
                            sequence_start)
SELECT
    d.session_id,
    (SELECT (extract(epoch FROM (completed_at - started_at)) * 1000)::int
     FROM sessions WHERE id = d.session_id),
    (SELECT min(started_at_ms) FROM strokes
     WHERE drawing_id = d.drawing_id AND tool = 'pen'),
    (SELECT count(*) FROM strokes WHERE drawing_id = d.drawing_id AND tool = 'pen'),
    -- Promedio sobre los puntos, no sobre los trazos: un trazo largo pesa mas.
    (SELECT avg((p->>'p')::numeric)
     FROM strokes s, jsonb_array_elements(s.points) AS p
     WHERE s.drawing_id = d.drawing_id AND s.tool = 'pen')::real,
    -- Pausas: huecos de mas de 3 s entre el fin de un trazo y el inicio del
    -- siguiente. Con offsets absolutos esto es una ventana; en la v1 era imposible
    -- (error E-002).
    (SELECT count(*) FROM (
        SELECT started_at_ms - lag(ended_at_ms) OVER (ORDER BY started_at_ms) AS hueco
        FROM strokes WHERE drawing_id = d.drawing_id
     ) h WHERE h.hueco > 3000),
    (SELECT count(*) FROM strokes WHERE drawing_id = d.drawing_id AND tool = 'eraser'),
    -- Area: caja que contiene todos los trazos de lapiz, sobre el area de la hoja.
    -- Ojo: mide la extension de la escena, no el tamanio de la figura. Ver la nota
    -- al final de backend/scripts/seed-demo.py.
    (SELECT least(1.0, (max(bbox_x + bbox_width) - min(bbox_x))
                     * (max(bbox_y + bbox_height) - min(bbox_y)) / (1000.0 * 800.0))
     FROM strokes WHERE drawing_id = d.drawing_id AND tool = 'pen')::real,
    'cabeza'
FROM _dib d;

-- =============================================================================
-- 5. Indicadores sugeridos y validados
-- =============================================================================
--
-- Sugerencias con la evidencia a la vista, tal como las produce el analisis. Dos
-- quedan validadas por el examinador para que el generador del informe tenga
-- material: sin al menos uno validado, las secciones 7 y 8 salen vacias, que es el
-- comportamiento correcto pero no muestra nada en una demo.

INSERT INTO session_indicators (session_id, indicator_code, status, source,
                                confidence, evidence)
SELECT m.session_id, x.code, 'suggestion', 'auto', x.conf,
       replace(x.ev, '{}', to_char(m.area_pct * 100, 'FM999.9'))
FROM stroke_metrics m
JOIN _dib d ON d.session_id = m.session_id
CROSS JOIN LATERAL (VALUES
    (CASE WHEN m.area_pct <= 0.08 THEN 'DIM-01'
          WHEN m.area_pct >= 0.70 THEN 'DIM-03'
          WHEN m.area_pct >= 0.45 THEN 'DIM-02'
          ELSE 'DIM-04' END, 'high',   'Area: {}% de la hoja'),
    ('UBI-05', 'high',   'Centro: 50%, 50% (centrado)'),
    ('PRE-01', 'high',   'Presion ' || to_char(m.pressure_avg, 'FM0.99') || ' (normal)'),
    ('TMP-04', 'low',    'Velocidad normal: ' || (m.total_time_ms / 1000) || 's')
) AS x(code, conf, ev)
WHERE EXISTS (SELECT 1 FROM indicator_catalog c WHERE c.code = x.code);

-- Latencia alta y borrados, solo donde corresponde segun la medicion.
INSERT INTO session_indicators (session_id, indicator_code, status, source,
                                confidence, evidence)
SELECT session_id, 'TMP-01', 'suggestion', 'auto', 'high',
       'Latencia ' || to_char(latency_ms / 1000.0, 'FM990.0') || 's hasta el primer trazo'
FROM stroke_metrics WHERE latency_ms > 15000;

INSERT INTO session_indicators (session_id, indicator_code, status, source,
                                confidence, evidence)
SELECT session_id, 'BOR-01', 'suggestion', 'auto', 'high',
       erase_count || ' borrados'
FROM stroke_metrics WHERE erase_count >= 5;

-- Validacion profesional de dos indicadores por sesion: uno de categoria A y uno
-- de B, para que las secciones 7 y 8 del informe tengan contenido.
UPDATE session_indicators si
SET status = 'validated',
    validated_by = (SELECT id FROM _yo),
    validated_at = now()
WHERE si.session_id IN (SELECT session_id FROM _dib)
  AND si.indicator_code IN ('DIM-01', 'DIM-02', 'DIM-04', 'PRE-01');

INSERT INTO session_indicators (session_id, indicator_code, status, source,
                                confidence, evidence, validated_by, validated_at)
SELECT d.session_id, 'PAR-01', 'validated', 'manual', NULL,
       'Verificacion profesional en el checklist',
       (SELECT id FROM _yo), now()
FROM _dib d
WHERE EXISTS (SELECT 1 FROM indicator_catalog c WHERE c.code = 'PAR-01')
  AND d.n = 1;

COMMIT;

-- =============================================================================
-- VERIFICACION
-- =============================================================================
-- Deberia devolver 3 filas con areas distintas y sus indicadores:
--
-- select p.full_name, s.status,
--        m.stroke_count, round(m.area_pct * 100, 1) as area_pct,
--        m.latency_ms, m.pause_count, m.erase_count,
--        round(m.pressure_avg::numeric, 2) as presion,
--        (select count(*) from session_indicators i
--         where i.session_id = s.id) as indicadores,
--        (select count(*) from session_indicators i
--         where i.session_id = s.id and i.status = 'validated') as validados
-- from patients p
-- join sessions s on s.patient_id = p.id
-- join stroke_metrics m on m.session_id = s.id
-- where p.document_number like '[demo]%'
-- order by m.area_pct;
-- =============================================================================
