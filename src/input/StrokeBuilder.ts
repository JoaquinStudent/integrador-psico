// StrokeBuilder - accumulates pointer events into strokes

import type { Stroke, StrokeInput, Brush } from '../types';
import { StockBrush, InkToolType } from '../types';

export interface StrokeBuilderOptions {
  brush: Brush;
  minPointDistance?: number; // Minimum distance between points to record (prevents duplicates)
}

export class StrokeBuilder {
  private inputs: StrokeInput[] = [];
  private brush: Brush;
  private toolType: InkToolType = InkToolType.MOUSE;
  private minPointDistance: number;
  private startTime: number = 0;

  constructor(options: StrokeBuilderOptions) {
    this.brush = options.brush;
    this.minPointDistance = options.minPointDistance ?? 1;
  }

  // Start a new stroke
  start(x: number, y: number, pressure?: number, pointerType?: string): void {
    this.inputs = [];
    this.startTime = Date.now();
    this.toolType = this.getToolType(pointerType);
    this.addPoint(x, y, pressure);
  }

  // Add a point to the current stroke
  addPoint(x: number, y: number, pressure?: number): void {
    const timeMillis = Date.now() - this.startTime;

    // Check minimum distance from last point
    if (this.inputs.length > 0) {
      const last = this.inputs[this.inputs.length - 1];
      const dx = x - last.x;
      const dy = y - last.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < this.minPointDistance) {
        return; // Skip point too close to previous
      }
    }

    const input: StrokeInput = {
      x,
      y,
      timeMillis,
    };

    if (pressure !== undefined && pressure > 0) {
      input.pressure = pressure;
    }

    this.inputs.push(input);
  }

  // Finish the stroke and return the result
  finish(): Stroke | null {
    if (this.inputs.length < 2) {
      // Need at least 2 points for a stroke
      return null;
    }

    return {
      inputs: {
        tool: this.toolType,
        inputs: [...this.inputs],
      },
      brush: { ...this.brush },
    };
  }

  // Get current stroke for preview rendering (during drawing)
  getCurrentStroke(): Stroke | null {
    if (this.inputs.length === 0) {
      return null;
    }

    return {
      inputs: {
        tool: this.toolType,
        inputs: [...this.inputs],
      },
      brush: { ...this.brush },
    };
  }

  // Check if currently building a stroke
  isActive(): boolean {
    return this.inputs.length > 0;
  }

  // Get the number of points in the current stroke
  getPointCount(): number {
    return this.inputs.length;
  }

  // Cancel the current stroke
  cancel(): void {
    this.inputs = [];
  }

  // Update brush settings
  setBrush(brush: Brush): void {
    this.brush = brush;
  }

  // Determine tool type from pointer event
  private getToolType(pointerType?: string): InkToolType {
    switch (pointerType) {
      case 'pen':
        return InkToolType.STYLUS;
      case 'touch':
        return InkToolType.TOUCH;
      case 'mouse':
        return InkToolType.MOUSE;
      default:
        return InkToolType.UNKNOWN;
    }
  }
}

// Helper function to create a default brush
export function createDefaultBrush(color: number = 0xff000000, size: number = 3): Brush {
  return {
    stockBrush: StockBrush.BALLPOINT,
    color,
    size,
  };
}

// Convert hex color string to ARGB number
export function hexToArgb(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return ((0xff << 24) | (r << 16) | (g << 8) | b) >>> 0;
}

// Convert ARGB number to hex color string
export function argbToHex(argb: number): string {
  const r = (argb >> 16) & 0xff;
  const g = (argb >> 8) & 0xff;
  const b = argb & 0xff;
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
