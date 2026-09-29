# SPEC-AUD-02: Auditoria de Seguridad y Aislamiento de Datos

> Estado: SPEC_READY | Fase: 3 (Auditoria) | Epica: Verificacion | Verifica: RNF-10, RNF-11, RNF-12, RNF-13, RNF-15

---

## Descripcion

Verificar que el aislamiento entre profesionales funciona **atacandolo**, no leyendo el codigo.

El sistema maneja historias clinicas, en parte de menores de edad. La arquitectura declara dos capas
de autorizacion —filtro en los repositorios y RLS en Postgres— precisamente para que un error en una
no exponga datos. Una auditoria que solo confirme que el codigo "tiene un WHERE" no prueba nada: hay
que intentar leer lo que no corresponde y comprobar que no se puede.

Los apartados de seguridad de la consigna piden explicitamente "consideraciones de seguridad" sobre el
diseno de base de datos. Esta auditoria es lo que respalda esa afirmacion con hechos.

---

## Criterios de Aceptacion (Given-When-Then)

### Escenario 1: Lectura cruzada entre examinadores
```
GIVEN dos examinadores A y B, cada uno con pacientes, sesiones e informes propios
WHEN A solicita por id un recurso de B en cada endpoint de la API
THEN todas las respuestas son 403 o 404
AND ninguna devuelve datos de B
```

### Escenario 2: RLS resiste un filtro olvidado
```
GIVEN una consulta ejecutada dentro de la transaccion de A, sin clausula WHERE por examinador
WHEN se ejecuta contra patients, sessions, session_indicators y reports
THEN solo devuelve filas de A
AND se comprueba que la proteccion viene de la policy, no del codigo
```

### Escenario 3: El rol de conexion no puede saltarse RLS
```
GIVEN el rol con el que el backend se conecta
WHEN se consulta rolbypassrls y rolsuper en pg_roles
THEN ambos son false
```

### Escenario 4: RLS activa en todas las tablas
```
GIVEN las 22 tablas del esquema
WHEN se consulta relrowsecurity en pg_class para cada una
THEN todas tienen RLS habilitada
AND cada una tiene al menos una policy definida
```

### Escenario 5: El navegador no lleva credenciales de base de datos
```
GIVEN el bundle de produccion del frontend
WHEN se inspecciona su contenido
THEN no aparece cadena de conexion a Postgres
AND no aparece service key ni clave de servicio de Storage
AND la unica clave presente es la anon key
```

### Escenario 6: El cliente no puede consultar tablas
```
GIVEN la anon key extraida del bundle
WHEN se intenta usarla contra la API REST de la base de datos directamente
THEN no se obtienen datos de pacientes, sesiones ni informes
AND el resultado es el mismo desde una sesion autenticada de otro examinador
```

### Escenario 7: Canal de sincronizacion ajeno
```
GIVEN el identificador de una sesion activa de otro examinador
WHEN un tercero intenta unirse al canal session:{id} sin token del backend
THEN la union es rechazada
AND no recibe ningun evento de trazo ni de metricas
```

### Escenario 8: Cifrado en transito
```
GIVEN las conexiones de la aplicacion
WHEN se inspecciona el trafico hacia la API, la base de datos y Storage
THEN todas usan TLS
AND la conexion a Postgres exige sslmode require o superior
```

### Escenario 9: Sin token no hay acceso
```
GIVEN cada endpoint de la API salvo /health
WHEN se lo invoca sin header Authorization, con token vencido y con firma alterada
THEN los tres casos devuelven 401
```

### Escenario 10: Los mensajes de error no filtran informacion
```
GIVEN un intento de acceso a un recurso de otro examinador
WHEN se lee el cuerpo de la respuesta
THEN no revela si el recurso existe, ni nombres de pacientes, ni estructura interna
```

---

## Scope

**IN:**
- Pruebas de lectura cruzada sobre todos los endpoints, con dos cuentas reales
- Verificacion de RLS por catalogo: `relrowsecurity` y policies en las 22 tablas
- Verificacion de los atributos del rol de conexion
- Inspeccion del bundle de produccion buscando credenciales
- Intento de uso directo de la anon key contra la base
- Intento de union no autorizada al canal de sincronizacion
- Verificacion de TLS en los tres destinos
- Pruebas de token ausente, vencido y alterado

**OUT:**
- Analisis estatico de dependencias o auditoria de librerias de terceros
- Pruebas de carga o de denegacion de servicio
- Pentest de la plataforma Supabase: se audita la configuracion propia, no el proveedor
- Politicas de contrasena y segundo factor: dependen de la configuracion de Auth, se documentan como
  recomendacion
- Confidencialidad y consentimiento como reglas de negocio: van en SPEC-AUD-03

---

## Dependencias

| Dependencia | Tipo | Estado |
|---|---|---|
| SPEC-S5-04 (repositorios con propagacion de identidad) | Feature | BLOQUEANTE |
| SPEC-S5-06 (frontend sin acceso a base de datos) | Feature | BLOQUEANTE |
| Dos cuentas de examinador con datos propios | Datos | Por preparar |
| Rol de conexion dedicado creado | Infra | Pendiente |
| Despliegue accesible por HTTPS | Infra | Pendiente (SPEC-S1-04 diferido) |

---

## Evidencia a Producir

| Artefacto | Contenido |
|---|---|
| `entregas/avance-2/07-informe/auditoria-seguridad.md` | Dictamen por cada RNF verificado |
| Tabla de resultados de lectura cruzada | Endpoint, intento, respuesta obtenida |
| Volcado de RLS | Las 22 tablas con su estado y sus policies |
| Atributos del rol de conexion | Salida de la consulta a `pg_roles` |
| Resultado de la inspeccion del bundle | Que se busco y que se encontro |

---

## Validacion de Dominio

- Las 22 tablas son las de `sdd/database/schema.sql`; si el conteo no coincide, la auditoria arranca
  reconciliando el esquema
- Los codigos de error son los de `sdd/api-contracts.md`: 401 sin autenticacion, 403 recurso ajeno
- El aislamiento que se audita es el que declara RNF-15: un examinador accede solo a lo que el creo
- Un hallazgo de exposicion de datos clinicos se clasifica como **critico** y bloquea el despliegue,
  con independencia del estado del resto del proyecto
