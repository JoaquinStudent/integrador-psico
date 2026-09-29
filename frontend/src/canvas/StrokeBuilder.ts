import type { Stroke, StrokeInput, Brush } from './types'
import { DEFAULT_BRUSH } from './types'

export class StrokeBuilder {
  private inputs: StrokeInput[] = []
  private brush: Brush
  private toolType = 'MOUSE'
  private minPointDistance: number
  private startTime = 0

  constructor(brush: Brush = DEFAULT_BRUSH, minPointDistance = 1) {
    this.brush = brush
    this.minPointDistance = minPointDistance
  }

  start(x: number, y: number, pressure?: number, pointerType?: string): void {
    this.inputs = []
    this.startTime = Date.now()
    this.toolType = pointerType === 'pen' ? 'STYLUS' : pointerType === 'touch' ? 'TOUCH' : 'MOUSE'
    this.addPoint(x, y, pressure)
  }

  addPoint(x: number, y: number, pressure?: number): void {
    const timeMillis = Date.now() - this.startTime
    if (this.inputs.length > 0) {
      const last = this.inputs[this.inputs.length - 1]
      const dx = x - last.x
      const dy = y - last.y
      if (Math.sqrt(dx * dx + dy * dy) < this.minPointDistance) return
    }
    const input: StrokeInput = { x, y, timeMillis }
    if (pressure !== undefined && pressure > 0) input.pressure = pressure
    this.inputs.push(input)
  }

  finish(): Stroke | null {
    if (this.inputs.length < 2) return null
    return { inputs: { tool: this.toolType, inputs: [...this.inputs] }, brush: { ...this.brush } }
  }

  getCurrentStroke(): Stroke | null {
    if (this.inputs.length === 0) return null
    return { inputs: { tool: this.toolType, inputs: [...this.inputs] }, brush: { ...this.brush } }
  }

  getStartTime(): number { return this.startTime }
  isActive(): boolean { return this.inputs.length > 0 }
  cancel(): void { this.inputs = [] }
}
