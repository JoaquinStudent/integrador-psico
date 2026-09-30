import { supabase } from './supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

export function createSessionChannel(sessionId: string): RealtimeChannel {
  return supabase.channel(`session:${sessionId}`)
}

/**
 * Estado de la tablet, tal como lo ve el examinador.
 *
 * La tablet lo reemite completo cada 2 s, no solo cuando algo cambia: el broadcast
 * de Supabase no reenvía lo pasado, así que un examinador que recarga el monitoreo a
 * mitad de la toma se perdería el `connected: true` y vería "Sin conexión" con el
 * paciente dibujando delante. Reemitirlo lo sincroniza en 2 s.
 */
export interface TabletStatus {
  connected: boolean
  orientation?: string
  /** El `started_at` que selló el servidor al pasar la sesión a `active`. */
  startedAt?: string | null
  /** Hay al menos un trazo. Es lo que dispara la grabación automática. */
  drawingStarted?: boolean
  patientFinished?: boolean
}

export function broadcastStroke(channel: RealtimeChannel, stroke: unknown) {
  channel.send({ type: 'broadcast', event: 'stroke:add', payload: { stroke } })
}

export function broadcastEraseStroke(channel: RealtimeChannel, strokeIndexes: number[]) {
  channel.send({ type: 'broadcast', event: 'stroke:erase', payload: { indexes: strokeIndexes } })
}

export function broadcastMetrics(channel: RealtimeChannel, metrics: unknown) {
  channel.send({ type: 'broadcast', event: 'metrics:update', payload: { metrics } })
}

export function broadcastStatus(channel: RealtimeChannel, status: TabletStatus) {
  channel.send({ type: 'broadcast', event: 'status:update', payload: status })
}

export function subscribeToStrokes(
  channel: RealtimeChannel,
  onAdd: (stroke: unknown) => void,
  onErase: (indexes: number[]) => void
) {
  channel.on('broadcast', { event: 'stroke:add' }, ({ payload }) => onAdd(payload.stroke))
  channel.on('broadcast', { event: 'stroke:erase' }, ({ payload }) => onErase(payload.indexes))
}

export function subscribeToMetrics(channel: RealtimeChannel, callback: (metrics: unknown) => void) {
  channel.on('broadcast', { event: 'metrics:update' }, ({ payload }) => callback(payload.metrics))
}

export function subscribeToStatus(
  channel: RealtimeChannel,
  callback: (status: TabletStatus) => void
) {
  channel.on('broadcast', { event: 'status:update' }, ({ payload }) => callback(payload as TabletStatus))
}
