import type { LiveMetrics } from '../canvas/metricsCalculator'
import type { PbllIndicator } from '../data/pbll-indicators'
import { PBLL_INDICATORS } from '../data/pbll-indicators'

export interface DetectedIndicator {
  indicator: PbllIndicator
  confidence: 'high' | 'medium' | 'low'
  value: string // human-readable measurement that triggered it
}

interface Bounds {
  left: number
  top: number
  right: number
  bottom: number
}

interface ObjectiveMeasurementInput {
  metrics: LiveMetrics
  canvasWidth: number
  canvasHeight: number
  bounds: Bounds | null // from getStrokesBounds
}

function get(code: string): PbllIndicator {
  return PBLL_INDICATORS.find(i => i.code === code)!
}

// ponytail: thresholds are calibration knobs — tune with real session data
const THRESHOLDS = {
  areaPctSmall: 0.08,
  areaPctLarge: 0.45,
  areaPctVeryLarge: 0.70,
  pressureWeak: 0.3,
  pressureStrong: 0.7,
  pressureVeryStrong: 0.85,
  latencyHighMs: 15_000,
  totalTimeLowMs: 60_000,
  totalTimeHighMs: 600_000,
  totalTimeVeryHighMs: 900_000,
  pauseCountHigh: 3,
  eraseCountHigh: 5,
  strokeSpeedFast: 0.15, // strokes per second (high = fast execution)
  strokeSpeedSlow: 0.03,
} as const

export function detectObjectiveIndicators(input: ObjectiveMeasurementInput): DetectedIndicator[] {
  const { metrics, canvasWidth, canvasHeight, bounds } = input
  const results: DetectedIndicator[] = []

  function add(code: string, confidence: DetectedIndicator['confidence'], value: string) {
    results.push({ indicator: get(code), confidence, value })
  }

  // === A-1 Dimensiones (DIM-*) ===
  if (metrics.areaPct <= THRESHOLDS.areaPctSmall) {
    add('DIM-01', 'high', `Area: ${(metrics.areaPct * 100).toFixed(1)}% de la hoja`)
  } else if (metrics.areaPct >= THRESHOLDS.areaPctVeryLarge) {
    add('DIM-03', 'high', `Area: ${(metrics.areaPct * 100).toFixed(1)}% de la hoja`)
  } else if (metrics.areaPct >= THRESHOLDS.areaPctLarge) {
    add('DIM-02', 'medium', `Area: ${(metrics.areaPct * 100).toFixed(1)}% de la hoja`)
  } else {
    add('DIM-04', 'high', `Area: ${(metrics.areaPct * 100).toFixed(1)}% de la hoja`)
  }

  // === A-2 Emplazamiento (UBI-*) ===
  if (bounds) {
    const cx = (bounds.left + bounds.right) / 2
    const cy = (bounds.top + bounds.bottom) / 2
    const relX = cx / canvasWidth
    const relY = cy / canvasHeight

    if (relX > 0.65) {
      add('UBI-01', 'high', `Centro X: ${(relX * 100).toFixed(0)}% (derecha)`)
    } else if (relX < 0.35) {
      add('UBI-02', 'high', `Centro X: ${(relX * 100).toFixed(0)}% (izquierda)`)
    }

    if (relY < 0.33) {
      add('UBI-03', 'high', `Centro Y: ${(relY * 100).toFixed(0)}% (superior)`)
    } else if (relY > 0.67) {
      add('UBI-04', 'high', `Centro Y: ${(relY * 100).toFixed(0)}% (inferior)`)
    }

    if (relX >= 0.35 && relX <= 0.65 && relY >= 0.33 && relY <= 0.67) {
      add('UBI-05', 'high', `Centro: ${(relX * 100).toFixed(0)}%, ${(relY * 100).toFixed(0)}% (centrado)`)
    }
  }

  // === A-4 Presion (PRE-*) ===
  const p = metrics.pressureAvg
  if (p > 0) {
    const elapsedSec = metrics.elapsedMs / 1000
    const strokesPerSec = elapsedSec > 0 ? metrics.strokeCount / elapsedSec : 0

    if (p < THRESHOLDS.pressureWeak && strokesPerSec > THRESHOLDS.strokeSpeedFast) {
      add('PRE-02', 'medium', `Presion: ${p.toFixed(2)}, velocidad: ${strokesPerSec.toFixed(2)} trazos/s`)
    } else if (p < THRESHOLDS.pressureWeak) {
      add('PRE-03', 'medium', `Presion: ${p.toFixed(2)} (debil)`)
    } else if (p >= THRESHOLDS.pressureVeryStrong) {
      add('PRE-06', 'high', `Presion: ${p.toFixed(2)} (muy fuerte)`)
    } else if (p >= THRESHOLDS.pressureStrong) {
      add('PRE-04', 'medium', `Presion: ${p.toFixed(2)} (fuerte)`)
    } else {
      add('PRE-01', 'high', `Presion: ${p.toFixed(2)} (normal)`)
    }
  }

  // === A-5 Tiempo (TMP-*) ===
  if (metrics.latencyMs > THRESHOLDS.latencyHighMs) {
    add('TMP-01', 'high', `Latencia: ${(metrics.latencyMs / 1000).toFixed(1)}s antes de primer trazo`)
  }

  if (metrics.pauseCount >= THRESHOLDS.pauseCountHigh) {
    add('TMP-03', 'medium', `${metrics.pauseCount} pausas detectadas`)
  }

  const elapsedSec = metrics.elapsedMs / 1000
  const strokesPerSec = elapsedSec > 0 ? metrics.strokeCount / elapsedSec : 0

  if (metrics.elapsedMs < THRESHOLDS.totalTimeLowMs && metrics.strokeCount > 5) {
    add('TMP-07', 'medium', `Ejecucion precipitada: ${elapsedSec.toFixed(0)}s, ${metrics.strokeCount} trazos`)
  } else if (strokesPerSec > THRESHOLDS.strokeSpeedFast) {
    add('TMP-06', 'medium', `Ejecucion rapida: ${strokesPerSec.toFixed(2)} trazos/s`)
  } else if (strokesPerSec < THRESHOLDS.strokeSpeedSlow && metrics.elapsedMs > THRESHOLDS.totalTimeHighMs) {
    add('TMP-05', 'medium', `Ejecucion lenta: ${(elapsedSec / 60).toFixed(1)} min, ${strokesPerSec.toFixed(3)} trazos/s`)
  } else if (metrics.elapsedMs > 0) {
    add('TMP-04', 'low', `Velocidad normal: ${elapsedSec.toFixed(0)}s`)
  }

  if (metrics.elapsedMs > THRESHOLDS.totalTimeVeryHighMs) {
    add('TMP-02', 'medium', `Tiempo total: ${(elapsedSec / 60).toFixed(1)} min (dificultad para concluir)`)
  }

  // === B-3 Borrados (BOR-*) ===
  if (metrics.eraseCount >= THRESHOLDS.eraseCountHigh) {
    add('BOR-01', 'high', `${metrics.eraseCount} borrados`)
  }

  return results
}
