-- ============================================================================
-- PSICOGRAMA · desde cero · PASO 10: verificación final (SOLO LECTURA)
--
-- Devuelve ÚNICAMENTE lo que falla, más una última fila «RESULTADO».
--   · Última fila = «TODO OK ✔»  → la base está lista.
--   · Última fila = «HAY PROBLEMAS ✖» → las filas de arriba dicen qué falta.
-- No crea, modifica ni borra nada.
-- ============================================================================

WITH esperadas(t) AS (
  VALUES ('tests'),('indicator_categories'),('manual_sections'),('indicator_catalog'),
         ('quick_mark_catalog'),('attitude_catalog'),('profiles'),('patients'),('sessions'),
         ('consent_records'),('drawings'),('strokes'),('stroke_metrics'),('audio_recordings'),
         ('transcript_segments'),('session_observations'),('session_quick_marks'),
         ('session_attitudes'),('verbalizations'),('session_indicators'),('reports'),
         ('report_sections'),('appointments'),('google_connections')
),
cuenta(consulta, esperado, descripcion) AS (
  VALUES
    ('SELECT count(*) AS c FROM public.indicator_catalog WHERE is_active', '183', 'catalogo: 183 indicadores activos'),
    ('SELECT count(*) AS c FROM public.indicator_catalog',                 '183', 'catalogo: 183 indicadores en total (C y D no se siembran)'),
    ('SELECT count(*) AS c FROM public.manual_sections',                   '16',  'catalogo: 16 secciones'),
    ('SELECT count(*) AS c FROM public.tests WHERE code = ''PBLL''',       '1',   'catalogo: test PBLL'),
    ('SELECT count(*) AS c FROM auth.users u LEFT JOIN public.profiles p ON p.id = u.id WHERE p.id IS NULL',
                                                                           '0',   'perfil creado para cada cuenta')
),
checks AS (
  SELECT 'tabla ' || e.t AS chequeo, to_regclass('public.' || e.t) IS NOT NULL AS ok FROM esperadas e
  UNION ALL
  SELECT 'RLS activa en ' || c.relname, c.relrowsecurity
  FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relkind = 'r'
  UNION ALL
  SELECT 'extension ' || x, EXISTS (SELECT 1 FROM pg_extension WHERE extname = x)
  FROM (VALUES ('btree_gist'), ('uuid-ossp')) v(x)
  UNION ALL
  SELECT 'funcion owns_session', to_regprocedure('public.owns_session(uuid)') IS NOT NULL
  UNION ALL
  SELECT 'funcion owns_storage_session', to_regprocedure('public.owns_storage_session(text)') IS NOT NULL
  UNION ALL
  SELECT 'disparador on_auth_user_created', EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created')
  UNION ALL
  SELECT 'restriccion anti-cruces de citas',
         EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = to_regclass('public.appointments') AND contype = 'x')
  UNION ALL
  SELECT 'bucket session-files existe', EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'session-files')
  UNION ALL
  SELECT 'bucket session-files es PRIVADO',
         COALESCE((SELECT NOT public FROM storage.buckets WHERE id = 'session-files'), false)
  UNION ALL
  SELECT 'policies del bucket (4)',
         (SELECT count(*) FROM pg_policies
          WHERE schemaname = 'storage' AND tablename = 'objects'
            AND (coalesce(qual, '') ILIKE '%owns_storage_session%'
              OR coalesce(with_check, '') ILIKE '%owns_storage_session%')) = 4
  UNION ALL
  SELECT k.descripcion,
         CASE WHEN to_regclass('public.indicator_catalog') IS NULL
                OR to_regclass('public.profiles') IS NULL THEN false
              ELSE (xpath('/row/c/text()', query_to_xml(k.consulta, false, true, '')))[1]::text = k.esperado END
  FROM cuenta k
)
SELECT chequeo, estado FROM (
  SELECT chequeo, 'FALLA' AS estado, 0 AS orden FROM checks WHERE NOT ok
  UNION ALL
  SELECT 'RESULTADO', CASE WHEN bool_and(ok) THEN 'TODO OK ✔' ELSE 'HAY PROBLEMAS ✖' END, 1 FROM checks
) r
ORDER BY orden, chequeo;
