import { supabase } from './supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

export function createSessionChannel(sessionId: string): RealtimeChannel {
  return supabase.channel(`session:${sessionId}`)
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

export function broadcastStatus(channel: RealtimeChannel, status: Record<string, unknown>) {
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

export function subscribeToStatus(channel: RealtimeChannel, callback: (status: Record<string, unknown>) => void) {
  channel.on('broadcast', { event: 'status:update' }, ({ payload }) => callback(payload))
}
