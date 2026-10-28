# SPEC-CAL-01: Agenda de citas con Google Calendar

> Estado: IN_PROGRESS | Epica: Sesiones | Realiza: ampliacion de RF-09 (nueva sesion) | Decision: DT-036

---

## Descripcion

El centro necesita fijar fecha y hora de las entrevistas para que dos pacientes no se crucen en el
mismo horario. La app guarda **citas** propias y, si el examinador conecta su Google Calendar, las
refleja alli como eventos. Una cita se convierte en sesion con un clic.

Alcance: **App → Google**, un sentido. Crear, mover o cancelar una cita en la app crea, mueve o borra
su evento. No se lee el calendario de Google (no hay deteccion de cambios hechos desde Google).

Permiso pedido a Google: `calendar.events` (solo eventos), no el calendario completo.

### Privacidad (decision de diseno)

El evento vive en servidores de Google, fuera del control de la app. Por eso lleva **solo las iniciales**
del paciente y un enlace a la cita en la app. Nunca nombre, documento, motivo ni resultados.

### Reglas

- La cita existe aunque Google falle o no este conectado; la sincronizacion es un efecto, no un requisito.
- Un examinador no puede tener dos citas activas que se solapen. Lo valida la app (mensaje claro) y lo
  garantiza la base (restriccion de exclusion), que es lo que cubre la carrera entre dos peticiones.
- El token de refresco de Google se guarda **cifrado** y solo lo lee el backend.

---

## Criterios de Aceptacion (Given-When-Then)

### Escenario 1: Agendar una cita
```
GIVEN un paciente activo y un horario libre
WHEN el examinador crea la cita con inicio, fin y test
THEN la cita queda en estado scheduled
```

### Escenario 2: No se permiten cruces
```
GIVEN una cita scheduled de 10:00 a 11:00
WHEN el examinador crea otra de 10:30 a 11:30
THEN responde 409 con el horario que choca
AND una cita de 11:00 a 12:00 si se acepta (el limite no cuenta como cruce)
```

### Escenario 3: Las canceladas liberan el horario
```
GIVEN una cita cancelada de 10:00 a 11:00
WHEN se crea otra de 10:00 a 11:00
THEN se acepta
```

### Escenario 4: Con Google conectado se crea el evento
```
GIVEN el examinador con Google conectado
WHEN crea una cita
THEN existe un evento en su calendario con google_event_id guardado
AND el titulo y la descripcion no contienen el nombre ni el documento del paciente
```

### Escenario 5: Google no bloquea la agenda
```
GIVEN Google conectado pero la API responde error
WHEN el examinador crea una cita
THEN la cita se guarda
AND la respuesta indica google_sync = "error"
```

### Escenario 6: Mover o cancelar sincroniza
```
GIVEN una cita con evento
WHEN se cambia la hora, o se cancela
THEN el evento se mueve, o se borra, y google_event_id se limpia al cancelar
```

### Escenario 7: Iniciar sesion desde la cita
```
GIVEN una cita scheduled
WHEN el examinador pulsa "Iniciar sesion"
THEN se crea la sesion (setup, con su consentimiento y dibujo) para ese paciente y test
AND la cita pasa a started con session_id
AND no se puede iniciar dos veces
```

### Escenario 8: Aislamiento
```
GIVEN la cita del examinador A
WHEN el examinador B la consulta, la mueve o la cancela
THEN 404
```

### Escenario 9: Conectar y desconectar Google
```
GIVEN el examinador sin conexion
WHEN completa el consentimiento de Google
THEN GET /integrations/google responde connected = true
AND el refresh token esta cifrado en la base
WHEN desconecta
THEN se revoca el token, se borra la fila y las citas existentes siguen en la app
```

### Escenario 10: El estado de OAuth no se puede falsificar ni reutilizar por otro usuario
```
GIVEN un state caducado, alterado, de otro uso, o firmado con otra clave
THEN se rechaza y no se guarda ningun token
GIVEN un state emitido para el examinador A
WHEN el examinador B (u otra sesion) intenta completar la conexion con el
THEN responde 403 y no se vincula ningun calendario
```
> El callback que abre Google no guarda nada; la conexion la completa `POST /complete`
> con la sesion autenticada, que es lo que ata el flujo a un usuario concreto.

---

## Fuera de alcance
Lectura del calendario de Google, avisos de choque con eventos externos, citas recurrentes, varios
calendarios, recordatorios al paciente.
