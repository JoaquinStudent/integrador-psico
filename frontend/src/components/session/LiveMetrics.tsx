import type { LiveMetrics as Metrics } from '../../canvas/metricsCalculator'
import { formatTime } from '../../canvas/metricsCalculator'

interface Props {
  metrics: Metrics
}

export function LiveMetrics({ metrics }: Props) {
  const pressurePct = Math.round(metrics.pressureAvg * 100)
  const areaPct = Math.round(metrics.areaPct * 100)

  return (
    <div className="live-metrics">
      <h3 className="session-panel-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>
        Métricas en vivo
      </h3>
      <div className="metrics-list">
        <MetricRow label="Tiempo transcurrido" value={formatTime(metrics.elapsedMs)} />
        <MetricRow label="Latencia de inicio" value={metrics.latencyMs > 0 ? `${Math.round(metrics.latencyMs / 1000)}s` : '—'} />
        <MetricRow label="Número de trazos" value={String(metrics.strokeCount)} />
        <div className="metric-row">
          <span className="metric-label">Presión promedio</span>
          <span className="metric-value">{pressurePct}%</span>
          <div className="metric-bar"><div className="metric-bar-fill" style={{ width: `${pressurePct}%` }} /></div>
        </div>
        <MetricRow label="Pausas registradas" value={String(metrics.pauseCount)} />
        <MetricRow label="Borrados" value={String(metrics.eraseCount)} />
        <div className="metric-row">
          <span className="metric-label">Área ocupada</span>
          <span className="metric-value">{areaPct}%</span>
          <div className="metric-bar"><div className="metric-bar-fill" style={{ width: `${areaPct}%` }} /></div>
        </div>
      </div>
    </div>
  )
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric-row">
      <span className="metric-label">{label}</span>
      <span className="metric-value">{value}</span>
    </div>
  )
}
