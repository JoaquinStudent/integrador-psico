# Psicograma — Frontend

Aplicación web en **React 19 + TypeScript + Vite** con dos interfaces sobre la misma sesión, sincronizadas
en tiempo real:

| Interfaz | Dispositivo | Qué hace |
|---|---|---|
| **Examinador** | Computadora | Pacientes, citas, sesión en vivo (espejo del dibujo, métricas, marcas, audio), análisis, informes |
| **Paciente** | Tablet con lápiz | Consigna, lienzo en blanco y cierre. Nada más |

El frontend **no habla con la base de datos**: todo pasa por el [backend](../backend/README.md) (RNF-12).
Supabase se usa solo para **autenticación** y para el **canal en tiempo real** (*Realtime Broadcast*).

---

## Requisitos

- **Node.js 22.18 o superior** (las pruebas ejecutan TypeScript directamente; probado con Node 26) y npm.
- El backend corriendo en `http://localhost:8000`.
- Un proyecto de Supabase (URL y *anon key*).

## Arranque rápido

```bash
cd frontend
npm install
cp .env.example .env            # completar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
npm run dev                     # http://localhost:5173
```

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run build` | Comprueba tipos (`tsc -b`) y genera `dist/` |
| `npm run preview` | Sirve el build de producción localmente |
| `npm run lint` | Linter (oxlint) |
| `npm test` | Pruebas de la lógica pura del lienzo (`node --test`) |

### Variables de entorno

| Variable | Descripción |
|---|---|
| `VITE_SUPABASE_URL` | URL del proyecto de Supabase |
| `VITE_SUPABASE_ANON_KEY` | Clave *anon* (pública por diseño: lo que protege los datos es RLS) |
| `VITE_API_URL` | **Déjala vacía en desarrollo.** Sin valor, el cliente deduce la API del host desde el que se cargó la app (`localhost:5173` → `localhost:8000`; la tablet en `192.168.x.x:5173` → `192.168.x.x:8000`). Se define solo en despliegue |

> Estas variables son **públicas**: Vite las incrusta en el bundle. **Nunca** pongas secretos con prefijo
> `VITE_`. Los secretos viven solo en `backend/.env`.

### Usar la tablet del paciente

1. Arranca Vite expuesto a la red: `npm run dev -- --host`.
2. Arranca el backend con `--host 0.0.0.0` y agrega el origen `http://<IP-de-tu-PC>:5173` a `CORS_ORIGINS`
   del backend (se lee al arrancar: reinícialo).
3. En la tablet abre `http://<IP-de-tu-PC>:5173`, inicia sesión con la cuenta del examinador y abre el enlace
   que muestra la pantalla de la sesión (`/sesion/activa` entra siempre a la sesión lista).

Si el puerto 5173 está ocupado, Vite sube al 5174 sin avisar más que con una línea en la consola, y ese
origen distinto queda bloqueado por CORS. Si el navegador abre «otra aplicación», revisa el puerto.

---

## Pantallas y rutas

| Ruta | Pantalla | Quién |
|---|---|---|
| `/login` | Inicio de sesión y registro | Examinador |
| `/` | Panel: indicadores de gestión, sesiones recientes y próximas citas | Examinador |
| `/pacientes`, `/pacientes/:id` | Listado con búsqueda y filtros; ficha con historial e informes | Examinador |
| `/tests` | Catálogo de tests (PBLL disponible; HTP, DF y DFH próximamente) | Examinador |
| `/citas` | Agenda de citas sin cruces; sincroniza con Google Calendar | Examinador |
| `/sesiones`, `/sesiones/nueva` | Historial; asistente de 3 pasos con consentimiento firmado | Examinador |
| `/sesion/:id` | Sesión en vivo: espejo, métricas cada 2 s, guion, marcas y audio | Examinador |
| `/sesion/:id/observaciones` | Observaciones post-sesión, línea de tiempo y transcripción | Examinador |
| `/sesion/:id/analisis` | Medición objetiva, elementos detectados y verificación profesional | Examinador |
| `/informes`, `/informes/:id` | Lista de informes y editor de las 9 secciones | Examinador |
| `/ajustes` | Perfil profesional y conexión con Google Calendar | Examinador |
| `/sesion/activa` | Entrada de la tablet a la sesión lista | Paciente |
| `/sesion/:id/paciente/{bienvenida,dibujo,cierre}` | Consigna, lienzo y cierre | Paciente |

## Estructura

```
src/
  pages/               Una pantalla por ruta (18)
  components/
    layout/            AppLayout y Sidebar
    session/           Paneles de la sesión: métricas, observaciones, guion, audio, enlace a la tablet
    ui/                Componentes compartidos (Toast)
  canvas/              Lienzo y captura del trazo (ver abajo)
  lib/                 Cliente de la API, autenticación, tiempo real y acceso a cada recurso
  data/                Catálogo de 183 indicadores del manual PBLL (categorías A y B)
  types/               Tipos de la API
tests/                 Pruebas de la lógica pura del lienzo
supabase/functions/    Funciones heredadas de la v1 (la lógica ahora vive en el backend)
```

### `lib/` — acceso a datos

- `apiClient.ts` es el **único** punto que habla con el backend: agrega el token, reintenta una vez tras
  refrescar la sesión y traduce los errores a mensajes en español sin volcados técnicos.
- Un archivo por recurso: `patients`, `sessions`, `appointments`, `reports`, `observations`, `drawingData`…
- `status.ts` concentra las etiquetas de estado y las acciones por estado, para que una sesión se vea y se
  abra igual en el panel, las listas y la ficha del paciente.

### `canvas/` — el lienzo del paciente

Es la parte que más importa para el test. Reglas que **no se rompen**:

- El paciente solo ve una **hoja en blanco, lápiz, borrador y deshacer**. Sin colores, grosores, guías,
  cuadrícula ni mensajes de aliento: en un test proyectivo todo estímulo adicional contamina lo que se
  interpreta.
- La consigna es **exactamente** la del manual: *«Dibuje una persona bajo la lluvia»*.
- La hoja se entrega **horizontal**; si el paciente la gira antes del primer trazo, se respeta y se registra
  como dato (RF-17).
- Se capturan, por trazo, el **orden, los instantes de inicio y fin, la presión y las pausas** (RF-16). Todos
  los instantes comparten una sola referencia de tiempo (`timing.ts`).
- Se ignora la palma cuando hay lápiz y solo dibuja un puntero a la vez (`input.ts`).

La lógica sin dependencias (`timing.ts`, `orientation.ts`, `input.ts`) está cubierta por `npm test`.

### Tiempo real

El dibujo viaja del navegador del paciente al del examinador por *Supabase Realtime Broadcast* (`lib/realtime.ts`),
sin pasar por la base. Se persiste al cerrar la sesión. Eventos: trazo, borrado, métricas (cada 2 s) y estado
de la tablet (conectada, orientación, terminó).

> **Riesgo declarado (R-07):** el canal no es privado, porque el paciente no tiene cuenta. Solo transporta
> trazos en vuelo, no datos persistidos.

---

## Convenciones

- Interfaz **en español**; sin tildes faltantes. Estados y fechas se muestran con `lib/status.ts`.
- Componentes y páginas en `PascalCase`; hooks con prefijo `use`; archivos de utilidad en `camelCase`.
- **Sin `alert()`**: los avisos usan `components/ui/Toast`.
- **Los ids que llegan por la URL no se confían**: se validan (UUID) antes de usarlos en una ruta de la API.
- El diseño sigue el sistema «Clinical Precision»: variables de color en `src/index.css` (`:root`). Si usas
  una variable, tiene que estar definida allí.

## Calidad

```bash
npm run build      # tipos + build: debe pasar sin errores
npm test           # 11 pruebas de la lógica del lienzo
npm run lint
```

## Archivos heredados

- `supabase/functions/` (`analyze-drawing`, `transcribe-audio`) pertenecen a la v1, cuando el análisis y la
  transcripción corrían en funciones de Supabase. Hoy lo hace el backend.
- `validate-bucket.mjs` es un script suelto de la v1 con la URL de un proyecto fijo; revísalo antes de usarlo.

## Referencias

- Backend: [`../backend/README.md`](../backend/README.md)
- Especificaciones y decisiones: [`../sdd/`](../sdd/) · Prototipos: [`../mocks/`](../mocks/)
