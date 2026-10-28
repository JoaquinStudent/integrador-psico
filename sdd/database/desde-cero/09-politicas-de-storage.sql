-- =============================================================================
-- PSICOGRAMA — Policies del bucket session-files
-- =============================================================================
--
-- Correr en el SQL Editor DESPUES de schema.sql (necesita la funcion
-- owns_session) y despues de crear el bucket.
--
-- El bucket guarda material clinico: el dibujo del paciente, el audio de la
-- sesion y el PDF del informe. Sin policies nadie puede subir nada; con el
-- bucket publico se filtran datos de pacientes. Estas cuatro policies dejan que
-- cada examinador toque solo los archivos de las sesiones que el creo.
--
-- TODO archivo va bajo una unica convencion de ruta:
--
--     sessions/<session_id>/drawing.png
--     sessions/<session_id>/audio_<timestamp>.webm
--     sessions/<session_id>/report.pdf
--
-- Una sola convencion es una sola policy. Cuando hay dos layouts hay dos
-- policies que mantener sincronizadas, y cuando se desincronizan es una fuga.
--
-- NOTA: el backend accede a Storage con la service key, que salta RLS. Estas
-- policies protegen el acceso desde el navegador (hoy) y quedan como segunda
-- capa cuando todo el trafico pase por el backend (SPEC-S5-06).
-- =============================================================================

-- --- Helper -------------------------------------------------------------------
-- Extrae el session_id de la ruta y delega en owns_session.
--
-- Va en una funcion y no inline en cada policy por una razon concreta: si la
-- ruta no tiene el formato esperado, un cast directo a uuid lanza excepcion en
-- vez de denegar, y una policy que revienta es una policy que no protege. Aqui
-- cualquier ruta malformada devuelve false.
CREATE OR REPLACE FUNCTION public.owns_storage_session(object_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
    parts TEXT[] := storage.foldername(object_name);
    sid   UUID;
BEGIN
    -- Se exige el prefijo 'sessions' y un segundo segmento.
    IF parts IS NULL OR array_length(parts, 1) < 2 OR parts[1] <> 'sessions' THEN
        RETURN false;
    END IF;

    BEGIN
        sid := parts[2]::UUID;
    EXCEPTION WHEN others THEN
        RETURN false;   -- el segmento no es un UUID: se deniega, no se rompe
    END;

    RETURN public.owns_session(sid);
END;
$$;

-- --- Policies -----------------------------------------------------------------
-- RLS ya esta habilitada en storage.objects por defecto en Supabase.

DROP POLICY IF EXISTS "session-files: lectura del examinador dueno"     ON storage.objects;
DROP POLICY IF EXISTS "session-files: escritura del examinador dueno"   ON storage.objects;
DROP POLICY IF EXISTS "session-files: reemplazo del examinador dueno"   ON storage.objects;
DROP POLICY IF EXISTS "session-files: borrado del examinador dueno"     ON storage.objects;

CREATE POLICY "session-files: lectura del examinador dueno"
    ON storage.objects FOR SELECT TO authenticated
    USING (
        bucket_id = 'session-files'
        AND public.owns_storage_session(name)
    );

CREATE POLICY "session-files: escritura del examinador dueno"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'session-files'
        AND public.owns_storage_session(name)
    );

-- El dibujo se sube con upsert al finalizar la sesion, asi que hace falta UPDATE.
CREATE POLICY "session-files: reemplazo del examinador dueno"
    ON storage.objects FOR UPDATE TO authenticated
    USING (
        bucket_id = 'session-files'
        AND public.owns_storage_session(name)
    )
    WITH CHECK (
        bucket_id = 'session-files'
        AND public.owns_storage_session(name)
    );

CREATE POLICY "session-files: borrado del examinador dueno"
    ON storage.objects FOR DELETE TO authenticated
    USING (
        bucket_id = 'session-files'
        AND public.owns_storage_session(name)
    );

-- =============================================================================
-- VERIFICACION
-- =============================================================================
--
-- 1. Las 4 policies existen:
--
--    SELECT policyname, cmd FROM pg_policies
--    WHERE schemaname = 'storage' AND tablename = 'objects'
--      AND policyname LIKE 'session-files%'
--    ORDER BY cmd;
--
-- 2. El helper deniega rutas malformadas en vez de fallar. Las cuatro deben
--    devolver false sin lanzar error:
--
--    SELECT public.owns_storage_session('drawings/abc.png')               AS prefijo_malo,
--           public.owns_storage_session('sessions/no-es-uuid/drawing.png') AS uuid_malo,
--           public.owns_storage_session('sessions')                        AS sin_segmento,
--           public.owns_storage_session('')                                AS vacio;
--
-- 3. Con una sesion real, logueado como su examinador, debe devolver true:
--
--    SELECT public.owns_storage_session(
--             'sessions/' || (SELECT id FROM sessions LIMIT 1) || '/drawing.png');
--
-- =============================================================================
-- Si el SQL Editor rechaza crear policies sobre storage.objects por permisos,
-- se crean desde Dashboard > Storage > session-files > Policies, con la misma
-- expresion: bucket_id = 'session-files' AND public.owns_storage_session(name)
-- =============================================================================
