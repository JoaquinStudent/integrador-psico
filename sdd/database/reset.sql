-- =============================================================================
-- PSICOGRAMA — Reset del esquema
-- =============================================================================
--
-- DESTRUCTIVO. Borra todos los datos clinicos: pacientes, sesiones, dibujos,
-- trazos, audio, observaciones, indicadores e informes.
--
-- NO borra las cuentas de usuario: auth.users queda intacto. Solo se elimina el
-- trigger que cuelga de esa tabla. Ver la NOTA al final, que importa.
--
-- Es idempotente y re-ejecutable: todo va con IF EXISTS, y limpia tanto los
-- objetos de la v1 (10 tablas) como los de la v2 (21 tablas), de modo que
-- tambien sirve para recuperarse de un schema.sql aplicado a medias.
--
-- Orden de ejecucion:
--   1. reset.sql          (este archivo)
--   2. schema.sql         (21 tablas, RLS, indices, triggers)
--   3. seed-catalog.sql   (201 indicadores, secciones, categorias, catalogos)
--   4. El backfill de la NOTA, si ya existen cuentas de usuario
-- =============================================================================

-- --- Triggers y funciones -----------------------------------------------------
-- El trigger vive en auth.users, que NO se toca. Solo se quita el trigger.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS owns_session(UUID) CASCADE;
DROP FUNCTION IF EXISTS touch_updated_at() CASCADE;

-- --- Tablas de la v2 ----------------------------------------------------------
-- En orden inverso de dependencia. CASCADE cubre lo que quede.
DROP TABLE IF EXISTS report_sections       CASCADE;
DROP TABLE IF EXISTS reports               CASCADE;
DROP TABLE IF EXISTS session_indicators    CASCADE;
DROP TABLE IF EXISTS verbalizations        CASCADE;
DROP TABLE IF EXISTS session_attitudes     CASCADE;
DROP TABLE IF EXISTS session_quick_marks   CASCADE;
DROP TABLE IF EXISTS session_observations  CASCADE;
DROP TABLE IF EXISTS transcript_segments   CASCADE;
DROP TABLE IF EXISTS audio_recordings      CASCADE;
DROP TABLE IF EXISTS stroke_metrics        CASCADE;
DROP TABLE IF EXISTS strokes               CASCADE;
DROP TABLE IF EXISTS drawings              CASCADE;
DROP TABLE IF EXISTS consent_records       CASCADE;
DROP TABLE IF EXISTS sessions              CASCADE;
DROP TABLE IF EXISTS patients              CASCADE;
DROP TABLE IF EXISTS profiles              CASCADE;

-- Catalogos
DROP TABLE IF EXISTS indicator_catalog     CASCADE;
DROP TABLE IF EXISTS manual_sections       CASCADE;
DROP TABLE IF EXISTS indicator_categories  CASCADE;
DROP TABLE IF EXISTS quick_mark_catalog    CASCADE;
DROP TABLE IF EXISTS attitude_catalog      CASCADE;
DROP TABLE IF EXISTS tests                 CASCADE;

-- --- Tablas que solo existian en la v1 ---------------------------------------
DROP TABLE IF EXISTS indicators            CASCADE;  -- v2: indicator_catalog + session_indicators
DROP TABLE IF EXISTS observations          CASCADE;  -- v2: session_observations + tablas hijas
DROP TABLE IF EXISTS drawing_data          CASCADE;  -- v2: drawings + strokes

-- =============================================================================
-- VERIFICACION — debe devolver 0 filas
-- =============================================================================
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- =============================================================================
-- NOTA IMPORTANTE: las cuentas existentes se quedan sin perfil
-- =============================================================================
--
-- auth.users sobrevive al reset, pero profiles se recrea vacio. El trigger
-- handle_new_user solo dispara en INSERT, asi que las cuentas que ya existian
-- NO recuperan su fila en profiles.
--
-- Y eso rompe la aplicacion para esos usuarios: patients.created_by y
-- sessions.created_by referencian profiles(id), de modo que no podrian
-- registrar un paciente ni abrir una sesion.
--
-- Despues de aplicar schema.sql, ejecutar este backfill:
--
--   INSERT INTO profiles (id, full_name)
--   SELECT u.id, COALESCE(u.raw_user_meta_data->>'full_name', 'Usuario')
--   FROM auth.users u
--   WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = u.id);
--
-- Comprobacion de que no quedo nadie fuera:
--
--   SELECT count(*) AS cuentas_sin_perfil
--   FROM auth.users u
--   WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = u.id);
--
-- =============================================================================
