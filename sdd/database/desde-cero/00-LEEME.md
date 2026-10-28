# Reconstruir la base de datos desde cero — paso a paso

> Guía para dejar el proyecto de Supabase listo **desde una base vacía** (o repararla si quedó a medias).
> Tiempo estimado: 15 minutos. Todo se ejecuta en el **SQL Editor de Supabase**.

## Antes de empezar (2 minutos)

1. **Confirma el proyecto.** En la barra del navegador debe aparecer el identificador del proyecto que usa tu backend
   (`SUPABASE_URL` de `backend/.env`). Si pegas los scripts en otro proyecto, la app no los verá.
2. **Mira si hay copia de seguridad** (*Database → Backups*). Si existe una de antes del problema, **restaurarla es mejor
   que reconstruir**: recupera también los datos.
3. **No ejecutes nada de la carpeta `../peligro/`.** Ese `reset-DESTRUCTIVO.sql` borra todas las tablas clínicas.
   Está ahí aparte, con otro nombre, para que no se confunda con un paso.

## Cómo se ejecuta cada paso

1. Abre el archivo en tu editor, selecciona todo y cópialo.
2. En Supabase: **SQL Editor → New query**, pega y revisa que **la última línea sea `COMMIT;`**
   (si falta, el editor cortó el texto: vuelve a copiar). El archivo grande del catálogo ya viene partido por eso.
3. Pulsa **Run** y espera el resultado antes de pasar al siguiente.
4. Si un paso falla, **no sigas**: lee el error en la sección *Si algo falla* de abajo. Cada paso es una transacción,
   así que un paso que falla no deja nada a medias.

## Los pasos, en orden

| Paso | Archivo | Qué hace | Resultado esperado |
|---|---|---|---|
| 01 | `01-diagnostico.sql` | **Solo lectura.** Dice qué hay y qué falta | Lista de tablas con `OK` / `FALTA` |
| 02 | `02-extensiones-y-catalogos.sql` | Extensión `uuid-ossp` y las 6 tablas de catálogo | `Success. No rows returned` |
| 03 | `03-pacientes-y-sesiones.sql` | Perfiles, pacientes, sesiones, consentimiento y el disparador que crea el perfil de cada cuenta nueva | ídem |
| 04 | `04-dibujo-audio-y-observaciones.sql` | Dibujo y trazos, audio y transcripción, observaciones, marcas, actitudes y verbalizaciones | ídem |
| 05 | `05-indicadores-e-informes.sql` | Indicadores de sesión, informes y los disparadores de fecha | ídem |
| 06 | `06-agenda-y-google.sql` | Agenda de citas (sin cruces) y conexión con Google. Instala `btree_gist` | ídem |
| 07 | `07-perfiles.sql` | Crea el perfil de las cuentas que **ya existían** en Auth | Una fila por cada cuenta |
| 08 | `08-catalogo/parte-1-de-7.sql` … `parte-7-de-7.sql` | Carga los **183 indicadores** del catálogo (categorías A y B, 16 secciones); la última parte desactiva C y D si una siembra anterior las había dejado. **Siete archivos, en orden** | `Success` en cada uno |
| 09 | `09-politicas-de-storage.sql` | Políticas del bucket privado `session-files` (cada examinador solo ve lo suyo) | `Success` |
| 10 | `10-verificacion-final.sql` | **Solo lectura.** Comprueba todo lo anterior | Última fila: **`TODO OK ✔`** |
| 11 | `11-datos-demo.sql` | *Opcional.* Pacientes y sesiones de demostración | `Success` |

**Importante:** el paso 06 ya incluye lo que antes era la «migración 0003». No ejecutes aparte nada que se llame así.

### Notas por paso

- **Paso 07.** El disparador del paso 03 solo crea perfil para cuentas **nuevas**. Si la base se reconstruyó y ya había
  cuentas, sin este paso la app falla con «perfil no encontrado». Es seguro repetirlo.
- **Paso 09.** Necesita que el bucket `session-files` exista y sea **privado** (*Storage*). Si no existe, créalo primero
  (*New bucket → nombre `session-files`, desactivado «Public bucket»*). Las políticas dependen de la función `owns_session`
  del paso 03: por eso los pasos van en orden.
- **Paso 11.** Está preparado para la cuenta indicada en la primera línea del archivo (`_cfg`). Se puede repetir: solo borra y
  recrea pacientes cuyo documento empieza con `[demo]`. Siembra por SQL directo; para datos que ejerciten la API completa usa
  `backend/scripts/seed-demo.py`.

## Después de la base de datos (en tu computadora)

```bash
cd backend

# 1. Registra en Alembic en qué revisión quedó la base (solo anota la versión; no cambia tablas).
uv run alembic stamp 0004_politicas_con_with_check
#    NO ejecutes `alembic upgrade head` sobre una base armada con estos scripts.

# 2. Verifica el bucket (solo lectura).
uv run python scripts/check-storage.py

# 3. Reinicia el backend: lee la configuración una sola vez al arrancar.
uv run uvicorn psicograma.adapter.inbound.http.app:app --reload
```

Prueba rápida en la app: **Tests** debe decir 183 indicadores, **Citas** debe cargar vacía (sin error rojo) y **Ajustes** debe
mostrar el botón de Google Calendar.

## Si algo falla

| Síntoma | Causa más probable | Qué hacer |
|---|---|---|
| `relation "…" does not exist` | Te saltaste un paso anterior, o estás en otro proyecto | Corre `01-diagnostico.sql`, mira qué `FALTA` y ejecuta ese paso |
| `relation "…" already exists` | Ese paso ya se ejecutó | Sigue con el siguiente. No repitas pasos 02 a 06 |
| `syntax error at or near "…"` en una línea cortada (`WHER`, `JOI`…) | El editor cortó el texto al pegar | Vuelve a copiar el archivo completo y comprueba que termina en `COMMIT;` |
| `permission denied to create extension` | El rol del editor no puede instalar la extensión | *Database → Extensions* y activa `btree_gist` a mano; repite el paso 06 |
| `10-verificacion-final.sql` dice `HAY PROBLEMAS` | Falta algo | Las filas de arriba dicen qué; repite el paso que corresponde |

## De dónde salen estos archivos

Los pasos 02 a 06 y la carpeta `08-catalogo/` **se generan** a partir de las fuentes `../schema.sql` y `../seed-catalog.sql`, y no
se editan a mano. Si cambias el esquema o el catálogo, regenera:

```bash
python3 sdd/database/desde-cero/generar.py            # regenera los pasos
python3 sdd/database/desde-cero/generar.py --check    # comprueba que coinciden con las fuentes
```

El generador verifica que los pasos reconstruyen exactamente las fuentes, sentencia por sentencia.

## Mapa de la carpeta `sdd/database/`

| Ruta | Qué es |
|---|---|
| `desde-cero/` | **Esta guía y los pasos numerados** |
| `schema.sql` | Fuente de verdad del esquema (24 tablas) |
| `seed-catalog.mjs` → `seed-catalog.sql` | Fuente del catálogo: el `.mjs` lo genera desde el código del frontend |
| `check-sql.py` | Revisión estática de los scripts, sin conectarse a nada |
| `migrations/` | Cambios históricos de la v1 a la v2 (ya incluidos en `schema.sql`) |
| `peligro/` | Scripts **destructivos**. Léelos, no los ejecutes por costumbre |
