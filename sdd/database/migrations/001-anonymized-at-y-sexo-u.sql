-- =============================================================================
-- Migracion 001 — patients.anonymized_at y sexo 'U'
-- =============================================================================
--
-- Aplicada el 30/09/2026 en el SQL Editor.
--
-- POR QUE EXISTE ESTE ARCHIVO
--
-- Estos dos cambios se agregaron a `schema.sql` y a `models.py` pero no a la base.
-- Consecuencia: SQLAlchemy selecciona todas las columnas mapeadas, asi que **toda**
-- consulta que tocara `patients` fallaba con
--
--     column "anonymized_at" of relation "patients" does not exist
--
-- La aplicacion quedo inutilizable y 23 tests en rojo, por una columna.
--
-- Es el riesgo R-06 materializado: mientras `SPEC-S5-07` (Alembic) siga fuera de
-- alcance, un cambio de esquema se hace a mano y se olvida. Hasta que Alembic
-- exista, **todo cambio de esquema se escribe aqui**, numerado, para que
-- `schema.sql` y la base no se separen. Quien clone el repo aplica `schema.sql` y
-- despues las migraciones en orden.
--
-- Idempotente: se puede correr dos veces sin efecto.
-- =============================================================================

-- --- 1. Registro de anonimizacion --------------------------------------------
-- Lo exige RNF-16 (supresion a solicitud del paciente). La supresion **anonimiza**,
-- no borra: eliminar en cascada destruiria las sesiones, metricas e informes, que
-- son registro clinico. Esta columna marca cuando se hizo.
ALTER TABLE patients ADD COLUMN IF NOT EXISTS anonymized_at TIMESTAMPTZ;

-- --- 2. Sexo no especificado --------------------------------------------------
-- 'U' se agrega para el caso en que el dato no este disponible o el paciente no lo
-- declare. El manual PBLL interpreta la identidad sexual de la figura (B-10)
-- comparandola con el sexo del paciente, asi que forzar 'M' o 'F' cuando no se sabe
-- introduciria un dato falso en la interpretacion.
ALTER TABLE patients DROP CONSTRAINT IF EXISTS patients_sex_check;
ALTER TABLE patients ADD  CONSTRAINT patients_sex_check CHECK (sex IN ('M', 'F', 'U'));

-- =============================================================================
-- VERIFICACION
-- =============================================================================
-- Ambas consultas deben devolver una fila:
--
--   SELECT column_name, data_type FROM information_schema.columns
--   WHERE table_name = 'patients' AND column_name = 'anonymized_at';
--
--   SELECT pg_get_constraintdef(oid) FROM pg_constraint
--   WHERE conrelid = 'patients'::regclass AND conname = 'patients_sex_check';
--
-- La prueba que de verdad cuenta es `cd backend && uv run pytest`: el test
-- `test_toda_columna_modelada_existe` compara los modelos contra la base y falla si
-- vuelven a separarse.
-- =============================================================================
