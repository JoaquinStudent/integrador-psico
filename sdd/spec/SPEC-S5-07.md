# SPEC-S5-07: Migraciones Versionadas y Reversibles

> Estado: DONE | Sprint: 5 | Epica: Base de datos | Realiza: RNF-27

---

## Descripcion

El esquema v2 existe como un unico `schema.sql` que se ejecuta a mano. Eso alcanza para crearlo una
vez; no alcanza para evolucionarlo: no hay forma de saber que version corre en Supabase, ni de
deshacer un cambio que salio mal, ni de reproducir el esquema en otro entorno.

Este SPEC pone Alembic al frente: la revision inicial reproduce las 22 tablas y desde ahi todo cambio
estructural queda registrado y es reversible. Ademas produce el artefacto de **modelo fisico
versionado** que pide el apartado 3.9.3 del informe.

Hay un detalle de infraestructura que hace fallar el primer intento si no se sabe: **Alembic tiene que
conectarse al puerto directo (5432), no al transaction pooler (6543)**. El pooler no soporta las
sentencias DDL en transaccion que Alembic emite, ni los prepared statements.

---

## Criterios de Aceptacion (Given-When-Then)

### Escenario 1: La revision inicial reproduce el esquema
```
GIVEN una base de datos vacia
WHEN se ejecuta alembic upgrade head
THEN se crean las 22 tablas del esquema v2
AND se crean las policies de RLS, los indices de FK y los triggers
AND el resultado es equivalente a ejecutar schema.sql
```

### Escenario 2: La migracion es reversible
```
GIVEN una base de datos en la revision inicial
WHEN se ejecuta alembic downgrade base
THEN se eliminan las 22 tablas sin error
AND una nueva upgrade head vuelve a dejarla operativa
```

### Escenario 3: Alembic usa el puerto directo
```
GIVEN la configuracion de Alembic
WHEN se inspecciona la URL que usa
THEN apunta al puerto 5432
AND no al 6543 del transaction pooler
```

### Escenario 4: El estado de la base es consultable
```
GIVEN la base migrada
WHEN se ejecuta alembic current
THEN devuelve el identificador de la revision aplicada
```

### Escenario 5: Una migracion destructiva exige confirmacion
```
GIVEN una revision que contiene DROP COLUMN, DROP TABLE o TRUNCATE
WHEN se intenta aplicarla
THEN el proceso se detiene y pide confirmacion explicita
AND la revision declara en su docstring que dato se pierde
```

### Escenario 6: Deteccion de desvio
```
GIVEN el esquema en Supabase fue modificado a mano
WHEN se compara contra las revisiones de Alembic
THEN la diferencia se reporta
AND no se aplica ninguna migracion sobre un esquema desviado sin resolverla
```

### Escenario 7: El seed es independiente de las migraciones
```
GIVEN la base migrada y vacia de datos
WHEN se ejecuta el seed de catalogos
THEN se cargan los 201 indicadores, las 18 secciones, las 4 categorias,
     las marcas rapidas y las actitudes
AND ejecutarlo dos veces no duplica filas
```

---

## Scope

**IN:**
- Inicializacion de Alembic en `backend/migrations/`
- Revision inicial que reproduce el esquema v2 completo: tablas, RLS, policies, funciones,
  triggers e indices
- Configuracion para que tome la URL del entorno y use el puerto directo
- Guarda que detiene las operaciones destructivas sin confirmacion
- Documentacion del procedimiento en `backend/README.md`

**OUT:**
- Autogeneracion de revisiones desde los modelos (`--autogenerate`): las policies de RLS y las
  funciones SQL no se detectan bien; la revision inicial se escribe explicita
- Migracion de los datos de prueba del esquema v1: se decidio recrear, no traspasar
- Pipeline de despliegue automatico de migraciones
- Copias de seguridad: son responsabilidad de la plataforma (RNF-08)

---

## Dependencias

| Dependencia | Tipo | Estado |
|---|---|---|
| `sdd/database/schema.sql` | DB | DONE (SPEC-S5-01) |
| `sdd/database/seed-catalog.sql` | DB | DONE (SPEC-S5-02) |
| Decision sobre recrear vs migrar los datos actuales | Decision | **PENDIENTE del equipo** |
| Cadena de conexion al puerto 5432 | Config | Por definir |
| `alembic` en las dependencias | Codigo | Declarado en `pyproject.toml` |

---

## Archivos a Crear/Modificar

| Archivo | Accion |
|---|---|
| `backend/alembic.ini` | Crear |
| `backend/migrations/env.py` | Crear |
| `backend/migrations/script.py.mako` | Crear |
| `backend/migrations/versions/0001_esquema_inicial_2fn.py` | Crear |
| `backend/scripts/check-migration.sh` | Crear (guarda de operaciones destructivas) |
| `backend/README.md` | Modificar (procedimiento y advertencia del puerto) |
| `backend/.env.example` | Modificar (anadir la URL directa para Alembic) |

---

## Validacion de Dominio

- Los nombres de tablas, columnas, indices y constraints son identicos a `sdd/database/schema.sql`
- Las convenciones de `domain.md` aplican a cualquier objeto nuevo: snake_case, plural en tablas,
  `{tabla_singular}_id` en FK, sufijo `_catalog` en catalogos
- Toda FK lleva su indice: Postgres no los crea solos, y en el esquema v1 faltaban todos
- `SET search_path = public` en cualquier funcion o trigger que se cree en una revision (DT-004)
- Una revision nunca modifica datos clinicos sin declararlo en su docstring
