import type { Stroke } from './types'
import { getStrokesBounds } from './StrokeRenderer'
import { pausasEntreTrazos } from './timing'

export interface LiveMetrics {
  elapsedMs: number
  latencyMs: number
  strokeCount: number
  pressureAvg: number
  pauseCount: number
  eraseCount: number
  areaPct: number
}

export function calculateMetrics(
  strokes: Stroke[],
  sessionStartTime: number,
  eraseCount: number,
  canvasWidth: number,
  canvasHeight: number,
  firstStrokeAbsoluteTime: number | null
): LiveMetrics {
  const now = Date.now()
  const elapsedMs = now - sessionStartTime
  const latencyMs = firstStrokeAbsoluteTime ? firstStrokeAbsoluteTime - sessionStartTime : 0

  let pressureSum = 0, pressureCount = 0
  for (const s of strokes) {
    for (const p of s.inputs.inputs) {
      pressureSum += p.pressure ?? 0.5
      pressureCount++
    }
  }

  // Pausa = hueco entre el fin de un trazo y el inicio del siguiente. El `timeMillis`
  // de un punto es relativo a su trazo, asi que se usa `t0` (pen-down absoluto).
  const PAUSE_THRESHOLD = 3000
  const pauseCount = pausasEntreTrazos(
    strokes.flatMap(s => {
      const pts = s.inputs.inputs
      if (s.t0 === undefined || pts.length === 0) return []
      return [{ inicio: s.t0, fin: s.t0 + pts[pts.length - 1].timeMillis }]
    }),
    PAUSE_THRESHOLD,
  )

  let areaPct = 0
  const bounds = getStrokesBounds(strokes)
  if (bounds) {
    const bw = bounds.right - bounds.left
    const bh = bounds.bottom - bounds.top
    areaPct = (bw * bh) / (canvasWidth * canvasHeight)
  }

  return {
    elapsedMs,
    latencyMs,
    strokeCount: strokes.length,
    pressureAvg: pressureCount > 0 ? pressureSum / pressureCount : 0,
    pauseCount,
    eraseCount,
    areaPct: Math.min(areaPct, 1),
  }
}

export function formatTime(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000))
  const sec = totalSec % 60
  const min = Math.floor(totalSec / 60) % 60
  const hrs = Math.floor(totalSec / 3600)
  const mmss = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  // Las horas solo aparecen si las hay, para que una toma de 20 min siga leyendose
  // "20:00". Sin esto, una sesion que quedo abierta de un dia para otro mostraba
  // los minutos acumulados: "790:23" en vez de "13:10:23".
  return hrs > 0 ? `${hrs}:${mmss}` : mmss
}
