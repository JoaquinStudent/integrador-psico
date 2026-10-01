# SPEC-S5-06: Retirar el Acceso Directo a la Base de Datos del Navegador

> Estado: DONE | Sprint: 5 | Epica: Frontend | Realiza: RNF-12, RNF-13

---

## Descripcion

Hoy el navegador tiene la `anon key` y consulta las tablas via PostgREST: **34 llamadas directas** en
`frontend/src/`. Cualquiera que abra las herramientas de desarrollo tiene la credencial y puede
consultar el esquema con los filtros que quiera. RLS lo limita a sus propios datos, pero la superficie
expuesta es el esquema completo en vez de un conjunto acotado de operaciones.

Este SPEC cierra esa frontera: el frontend pasa a hablar solo con la API, y `@supabase/supabase-js`
queda reducido a dos usos legitimos — el login y el canal de sincronizacion en vivo.

El realtime se conserva y se documenta como excepcion: es pub/sub efimero que no persiste nada, y
relevarlo por el backend obligaria a operar un hub WebSocket propio para mover datos que de todos
modos se guardan al finalizar (DT-006). Lo que si cambia es que el canal pasa a ser **privado**,
autorizado por un token que emite el backend.

---

## Criterios de Aceptacion (Given-When-Then)

### Escenario 1: No queda acceso directo a tablas
```
GIVEN el codigo del frontend despues del cambio
WHEN se ejecuta grep -rn "supabase.from\|\.rpc(" frontend/src/
THEN no hay ninguna coincidencia
```

### Escenario 2: Supabase solo se usa para auth y realtime
```
GIVEN los imports de @supabase/supabase-js en frontend/src/
WHEN se revisan uno por uno
THEN solo aparecen en el modulo de autenticacion y en el de realtime
AND ningun otro modulo importa el cliente
```

### Escenario 3: El cliente de API adjunta el token
```
GIVEN un examinador con sesion activa
WHEN cualquier pantalla pide datos mediante apiClient
THEN la request lleva el header Authorization con el access token vigente
```

### Escenario 4: Token expirado
```
GIVEN el access token expiro
WHEN el cliente hace una request
THEN recibe 401
AND el cliente refresca la sesion contra Supabase Auth y reintenta una vez
AND si el refresco falla, redirige al login
```

### Escenario 5: Los errores de la API se muestran al usuario
```
GIVEN la API responde 403 con cuerpo application/problem+json
WHEN el cliente recibe la respuesta
THEN lanza un error tipado con el detail del problema
AND la pantalla muestra un mensaje en espanol, no un volcado tecnico
```

### Escenario 6: Canal de sincronizacion privado
```
GIVEN una sesion activa entre la tablet del paciente y el panel del examinador
WHEN cada dispositivo se une al canal session:{id}
THEN lo hace con un token obtenido de POST /api/v1/sessions/{id}/realtime-token
AND el canal transporta los eventos stroke:add, stroke:erase, metrics:update y status:update
```

### Escenario 7: Dispositivo ajeno al canal
```
GIVEN un tercero conoce el id de una sesion
WHEN intenta unirse al canal session:{id} sin token del backend
THEN la union es rechazada
AND no recibe ningun evento
```

### Escenario 8: El espejo sigue funcionando
```
GIVEN el paciente dibuja en la tablet
WHEN completa un trazo
THEN el panel del examinador lo refleja en menos de un segundo
AND las metricas en vivo siguen actualizandose
```

### Escenario 9: Las pantallas no cambian de comportamiento
```
GIVEN las 13 pantallas existentes
WHEN se navega por el flujo completo tras la migracion
THEN cada pantalla muestra los mismos datos que antes
AND no hay regresiones visibles de UI
```

### Escenario 10: El bundle no contiene credenciales de base de datos
```
GIVEN el build de produccion
WHEN se inspecciona el bundle generado
THEN no aparece cadena de conexion a Postgres ni service key
AND la unica clave presente es la anon key, usada solo para Auth y Realtime
```

---

## Scope

**IN:**
- `frontend/src/lib/apiClient.ts`: cliente unico con el token, manejo de `problem+json`,
  refresco y reintento
- Reescritura de los consumidores de datos: `patients.ts`, `sessions.ts`, `observations.ts`,
  `drawingData.ts`, `analyzeDrawing.ts`
- `realtime.ts`: pasa a canal privado con token del backend
- `supabase.ts`: se reduce a Auth y Realtime
- Actualizacion de las pantallas que llamaban a Supabase directamente
- `auth.tsx`: se mantiene contra Supabase Auth, sin cambios de fondo

**OUT:**
- Cambios de diseno o de comportamiento de UI: es una migracion de la capa de datos
- Migrar a React Query o similar: `fetch` con un cliente delgado alcanza, y anadir dependencia
  ahora solo agrega superficie
- Modo offline o cola de reintentos
- Reemplazar Supabase Auth por tokens propios

---

## Dependencias

| Dependencia | Tipo | Estado |
|---|---|---|
| SPEC-S5-05 (endpoints de analisis y audio) | Feature | **BLOQUEANTE parcial** — las pantallas de analisis y post-sesion lo necesitan |
| Endpoints de pacientes, sesiones y dibujo | Feature | **BLOQUEANTE** — sin ellos no se pueden migrar esas pantallas |
| `POST /sessions/{id}/realtime-token` | Feature | Por implementar |
| Canales privados habilitados en el proyecto | Infra | Por configurar |

**Nota de secuencia:** este SPEC no puede cerrarse antes que los endpoints que consume. Hasta
entonces la frontera queda parcialmente abierta, y esa es deuda explicita: el escenario 1 es el
criterio que la declara cerrada.

---

## Archivos a Crear/Modificar

| Archivo | Accion |
|---|---|
| `frontend/src/lib/apiClient.ts` | Crear |
| `frontend/src/lib/patients.ts` | Reescribir |
| `frontend/src/lib/sessions.ts` | Reescribir |
| `frontend/src/lib/observations.ts` | Reescribir |
| `frontend/src/lib/drawingData.ts` | Reescribir |
| `frontend/src/lib/analyzeDrawing.ts` | Reescribir |
| `frontend/src/lib/realtime.ts` | Modificar (canal privado con token) |
| `frontend/src/lib/supabase.ts` | Modificar (solo Auth y Realtime) |
| `frontend/src/pages/*.tsx` | Modificar los que consultaban Supabase |
| `frontend/.env.example` | Modificar (anadir la URL de la API) |
| `frontend/CLAUDE.md` | Modificar (el stack ya no incluye acceso directo a datos) |

---

## Validacion de Dominio

- Las rutas que consume el cliente son exactamente las de `sdd/api-contracts.md`
- Request y response en snake_case; la conversion a camelCase, si se hace, ocurre en el borde
- Los nombres de los tipos del cliente siguen `domain.md`: PascalCase y singular
- Mensajes de error al usuario en espanol (RNF-21)
- La pantalla del paciente sigue sin exponer metricas ni indicadores (RNF-23)
