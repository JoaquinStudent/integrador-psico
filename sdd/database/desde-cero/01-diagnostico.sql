-- =============================================================================
-- PSICOGRAMA — Diagnóstico de la base de datos (SOLO LECTURA)
-- Ejecutar completo en el SQL Editor de Supabase y copiar TODO el resultado.
-- No crea, modifica ni borra nada: son únicamente SELECT.
-- =============================================================================

WITH esperadas(t) AS (
  VALUES ('tests'),('indicator_categories'),('manual_sections'),('indicator_catalog'),
         ('quick_mark_catalog'),('attitude_catalog'),('profiles'),('patients'),('sessions'),
         ('consent_records'),('drawings'),('strokes'),('stroke_metrics'),('audio_recordings'),
         ('transcript_segments'),('session_observations'),('session_quick_marks'),
         ('session_attitudes'),('verbalizations'),('session_indicators'),('reports'),
         ('report_sections'),('appointments'),('google_connections')
)

-- 1) Dónde estoy
SELECT '0. donde estoy' AS chequeo, 'base de datos' AS detalle, current_database() AS resultado
UNION ALL
SELECT '0. donde estoy', 'usuarios en auth.users (cuentas de este proyecto)',
       (SELECT count(*)::text FROM auth.users)
UNION ALL
SELECT '0. donde estoy', 'version de Postgres', split_part(version(), ' ', 2)

-- 2) ¿Existe cada tabla que el sistema necesita? (22 base + 2 de la agenda)
UNION ALL
SELECT '1. tabla', e.t,
       CASE WHEN to_regclass('public.' || e.t) IS NOT NULL THEN 'OK' ELSE 'FALTA' END
FROM esperadas e

-- 3) Todas las tablas que SÍ hay en public (para ver si es el esquema viejo, el nuevo u otro proyecto)
UNION ALL
SELECT '2. hay en public', c.relname,
       CASE WHEN c.relrowsecurity THEN 'con RLS' ELSE 'SIN RLS' END
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r'

-- 4) Extensiones necesarias
UNION ALL
SELECT '3. extension', x.n,
       CASE WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname = x.n) THEN 'OK' ELSE 'NO INSTALADA' END
FROM (VALUES ('btree_gist'), ('uuid-ossp')) AS x(n)

-- 5) Columnas clave que agregaron migraciones anteriores
UNION ALL
SELECT '4. columna', 'patients.anonymized_at',
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'patients' AND column_name = 'anonymized_at')
            THEN 'OK' ELSE 'FALTA' END
UNION ALL
SELECT '4. columna', 'drawings.orientation',
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'drawings' AND column_name = 'orientation')
            THEN 'OK' ELSE 'FALTA' END

-- 6) Catálogo (se calcula solo si las tablas existen; si no, dice "n/a")
UNION ALL
SELECT '5. catalogo', 'indicadores activos (debe ser 183)',
       CASE WHEN to_regclass('public.indicator_catalog') IS NULL THEN 'n/a'
            ELSE (xpath('/row/c/text()', query_to_xml(
                  'SELECT count(*) AS c FROM public.indicator_catalog WHERE is_active', false, true, '')))[1]::text END
UNION ALL
SELECT '5. catalogo', 'indicadores totales (debe ser 183)',
       CASE WHEN to_regclass('public.indicator_catalog') IS NULL THEN 'n/a'
            ELSE (xpath('/row/c/text()', query_to_xml(
                  'SELECT count(*) AS c FROM public.indicator_catalog', false, true, '')))[1]::text END
UNION ALL
SELECT '5. catalogo', 'secciones (debe ser 16)',
       CASE WHEN to_regclass('public.manual_sections') IS NULL THEN 'n/a'
            ELSE (xpath('/row/c/text()', query_to_xml(
                  'SELECT count(*) AS c FROM public.manual_sections', false, true, '')))[1]::text END

-- 7) Datos de demostración que ya existen
UNION ALL
SELECT '6. datos', 'pacientes',
       CASE WHEN to_regclass('public.patients') IS NULL THEN 'n/a'
            ELSE (xpath('/row/c/text()', query_to_xml('SELECT count(*) AS c FROM public.patients', false, true, '')))[1]::text END
UNION ALL
SELECT '6. datos', 'sesiones',
       CASE WHEN to_regclass('public.sessions') IS NULL THEN 'n/a'
            ELSE (xpath('/row/c/text()', query_to_xml('SELECT count(*) AS c FROM public.sessions', false, true, '')))[1]::text END

-- 8) Versión de Alembic (si se usó)
UNION ALL
SELECT '7. alembic', 'version registrada',
       CASE WHEN to_regclass('public.alembic_version') IS NULL THEN 'sin registro'
            ELSE (xpath('/row/v/text()', query_to_xml(
                  'SELECT version_num AS v FROM public.alembic_version LIMIT 1', false, true, '')))[1]::text END

ORDER BY 1, 2;
