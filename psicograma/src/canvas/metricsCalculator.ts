import type { Stroke } from './types'
import { getStrokesBounds } from './StrokeRenderer'

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

  let pauseCount = 0
  const PAUSE_THRESHOLD = 3000
  for (let i = 1; i < strokes.length; i++) {
    const prevEnd = strokes[i - 1].inputs.inputs
    const curStart = strokes[i].inputs.inputs
    if (prevEnd.length && curStart.length) {
      const gap = curStart[0].timeMillis - prevEnd[prevEnd.length - 1].timeMillis
      // ponytail: gap is relative within each stroke — use absolute timestamps broadcast alongside
      // for now approximate: if gap in timeMillis of current stroke's first point is large, count as pause
      if (gap > PAUSE_THRESHOLD) pauseCount++
    }
  }

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
  const totalSec = Math.floor(ms / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}
