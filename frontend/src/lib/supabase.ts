/**
 * Cliente de Supabase, reducido a dos usos legítimos:
 *
 *  - **Auth**: el login sigue acá. El backend no emite tokens, solo verifica los
 *    que emite Supabase.
 *  - **Realtime**: el canal de sincronización tablet↔desktop. Es pub/sub efímero
 *    que no persiste nada; relevarlo por el backend significaría operar un hub
 *    WebSocket propio para mover datos que de todos modos se guardan al finalizar.
 *
 * **No se usa para consultar datos.** Todo el acceso a la base pasa por
 * `apiClient.ts`, que habla con el backend — el único que tiene credenciales de
 * Postgres (RNF-12).
 *
 * Por eso el cliente ya no lleva el genérico `<Database>`: tipar el esquema de las
 * tablas no tiene sentido si no se consultan tablas. El tipado de los datos vive
 * ahora en los tipos que devuelve la API.
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

export const supabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder',
)
