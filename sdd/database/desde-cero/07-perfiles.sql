-- =============================================================================
-- PSICOGRAMA — Recrear los perfiles de las cuentas que ya existen en Auth
-- Ejecutar DESPUÉS de schema.sql y ANTES de usar la aplicación.
--
-- Por qué hace falta: el disparador `on_auth_user_created` crea el perfil solo
-- cuando se registra una cuenta NUEVA. Si la base se reconstruyó, las cuentas que
-- ya existían en auth.users se quedaron sin fila en `profiles` y la app falla con
-- «perfil no encontrado».
--
-- Es seguro repetirlo: no duplica ni pisa perfiles que ya existan.
-- =============================================================================

INSERT INTO profiles (id, full_name)
SELECT u.id,
       COALESCE(NULLIF(u.raw_user_meta_data->>'full_name', ''), split_part(u.email, '@', 1), 'Usuario')
FROM auth.users u
ON CONFLICT (id) DO NOTHING;

-- Comprobación: debe mostrar una fila por cada cuenta de auth.users.
SELECT p.id, p.full_name, p.license_number, p.specialty FROM profiles p ORDER BY p.created_at;
