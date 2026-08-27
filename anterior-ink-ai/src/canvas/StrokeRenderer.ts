// Stroke rendering to Canvas 2D context

import type { Stroke } from '../types/brush';
import { StockBrush, colorToCSSRGBA, colorToRGBA } from '../types/brush';
import type { Offset } from '../types/primitives';

export interface StrokeRenderOptions {
  // Override stroke color (for selection highlighting, etc.)
  colorOverride?: string;
  // Override stroke opacity (0-1)
  opacityOverride?: number;
  // Draw debug points
  showPoints?: boolean;
  // Multiply stroke size by this factor (for animations)
  sizeMultiplier?: number;
}

// Render a single stroke
export function renderStroke(
  ctx: CanvasRenderingContext2D,
  stroke: Stroke,
  options: StrokeRenderOptions = {}
): void {
  const inputs = stroke.inputs.inputs;
  if (inputs.length === 0) return;

  const brush = stroke.brush;
  const color = options.colorOverride ?? colorToCSSRGBA(brush.color);

  // Apply opacity override if specified
  if (options.opacityOverride !== undefined) {
    const { r, g, b } = colorToRGBA(brush.color);
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${options.opacityOverride})`;
  } else {
    ctx.strokeStyle = color;
  }

  const sizeMultiplier = options.sizeMultiplier ?? 1;
  ctx.lineWidth = brush.size * sizeMultiplier;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Apply brush-specific rendering
  switch (brush.stockBrush) {
    case StockBrush.HIGHLIGHTER:
      ctx.globalCompositeOperation = 'multiply';
      ctx.lineWidth = brush.size * sizeMultiplier;
      break;
    case StockBrush.PENCIL:
      // Pencil has slightly rough edges - simulate with smaller line width
      ctx.lineWidth = brush.size * 0.8 * sizeMultiplier;
      break;
    case StockBrush.MARKER:
    case StockBrush.BALLPOINT:
    default:
      ctx.globalCompositeOperation = 'source-over';
      break;
  }

  // Check if we have pressure data for variable-width strokes
  const hasPressure = inputs.some((input) => input.pressure !== undefined);

  if (hasPressure) {
    renderVariableWidthStroke(ctx, stroke, options, sizeMultiplier);
  } else {
    renderSimpleStroke(ctx, inputs, options);
  }

  // Reset composite operation
  ctx.globalCompositeOperation = 'source-over';

  // Draw debug points if requested
  if (options.showPoints) {
    renderDebugPoints(ctx, inputs);
  }
}

// Simple stroke rendering (constant width)
function renderSimpleStroke(
  ctx: CanvasRenderingContext2D,
  inputs: Array<{ x: number; y: number }>,
  _options: StrokeRenderOptions
): void {
  if (inputs.length === 0) return;

  ctx.beginPath();

  if (inputs.length === 1) {
    // Single point - draw a dot
    const p = inputs[0];
    ctx.arc(p.x, p.y, ctx.lineWidth / 2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  // Use quadratic curves for smooth strokes
  ctx.moveTo(inputs[0].x, inputs[0].y);

  if (inputs.length === 2) {
    // Two points - simple line
    ctx.lineTo(inputs[1].x, inputs[1].y);
  } else {
    // Multiple points - use midpoints for smooth curves
    for (let i = 1; i < inputs.length - 1; i++) {
      const current = inputs[i];
      const next = inputs[i + 1];
      const midX = (current.x + next.x) / 2;
      const midY = (current.y + next.y) / 2;
      ctx.quadraticCurveTo(current.x, current.y, midX, midY);
    }

    // Connect to last point
    const last = inputs[inputs.length - 1];
    const secondLast = inputs[inputs.length - 2];
    ctx.quadraticCurveTo(secondLast.x, secondLast.y, last.x, last.y);
  }

  ctx.stroke();
}

// Variable width stroke rendering (pressure-sensitive)
function renderVariableWidthStroke(
  ctx: CanvasRenderingContext2D,
  stroke: Stroke,
  _options: StrokeRenderOptions,
  sizeMultiplier: number = 1
): void {
  const inputs = stroke.inputs.inputs;
  const baseWidth = stroke.brush.size * sizeMultiplier;

  if (inputs.length < 2) {
    // Single point
    const p = inputs[0];
    const pressure = p.pressure ?? 1.0;
    const radius = (baseWidth * pressure) / 2;
    ctx.beginPath();
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  // Draw stroke segments with varying width
  for (let i = 0; i < inputs.length - 1; i++) {
    const p1 = inputs[i];
    const p2 = inputs[i + 1];
    const pressure1 = p1.pressure ?? 1.0;
    const pressure2 = p2.pressure ?? 1.0;
    const avgPressure = (pressure1 + pressure2) / 2;

    ctx.lineWidth = baseWidth * avgPressure;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }

  // Draw circles at each point for smooth joints
  ctx.fillStyle = ctx.strokeStyle;
  for (const p of inputs) {
    const pressure = p.pressure ?? 1.0;
    const radius = (baseWidth * pressure) / 2;
    ctx.beginPath();
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Render debug points
function renderDebugPoints(
  ctx: CanvasRenderingContext2D,
  inputs: Array<{ x: number; y: number }>
): void {
  ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
  for (const p of inputs) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Render multiple strokes
export function renderStrokes(
  ctx: CanvasRenderingContext2D,
  strokes: Stroke[],
  options: StrokeRenderOptions = {}
): void {
  for (const stroke of strokes) {
    renderStroke(ctx, stroke, options);
  }
}

// Calculate stroke bounds
export function getStrokeBounds(
  stroke: Stroke
): { left: number; top: number; right: number; bottom: number } | null {
  const inputs = stroke.inputs.inputs;
  if (inputs.length === 0) return null;

  let left = inputs[0].x;
  let top = inputs[0].y;
  let right = inputs[0].x;
  let bottom = inputs[0].y;

  for (const input of inputs) {
    left = Math.min(left, input.x);
    top = Math.min(top, input.y);
    right = Math.max(right, input.x);
    bottom = Math.max(bottom, input.y);
  }

  const halfSize = stroke.brush.size / 2;
  return {
    left: left - halfSize,
    top: top - halfSize,
    right: right + halfSize,
    bottom: bottom + halfSize,
  };
}

// Calculate combined bounds for multiple strokes
export function getStrokesBounds(
  strokes: Stroke[]
): { left: number; top: number; right: number; bottom: number } | null {
  if (strokes.length === 0) return null;

  let left = Infinity;
  let top = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;

  for (const stroke of strokes) {
    const bounds = getStrokeBounds(stroke);
    if (bounds) {
      left = Math.min(left, bounds.left);
      top = Math.min(top, bounds.top);
      right = Math.max(right, bounds.right);
      bottom = Math.max(bottom, bounds.bottom);
    }
  }

  if (!isFinite(left)) return null;

  return { left, top, right, bottom };
}

// Check if a point is near a stroke
export function isPointNearStroke(
  point: Offset,
  stroke: Stroke,
  tolerance: number = 10
): boolean {
  const inputs = stroke.inputs.inputs;
  const effectiveTolerance = tolerance + stroke.brush.size / 2;

  for (let i = 0; i < inputs.length - 1; i++) {
    const p1 = inputs[i];
    const p2 = inputs[i + 1];
    const dist = pointToSegmentDistance(point, { x: p1.x, y: p1.y }, { x: p2.x, y: p2.y });
    if (dist <= effectiveTolerance) {
      return true;
    }
  }

  // Also check if near any single point
  for (const p of inputs) {
    const dist = Math.sqrt((point.x - p.x) ** 2 + (point.y - p.y) ** 2);
    if (dist <= effectiveTolerance) {
      return true;
    }
  }

  return false;
}

// Calculate distance from point to line segment
function pointToSegmentDistance(point: Offset, segStart: Offset, segEnd: Offset): number {
  const dx = segEnd.x - segStart.x;
  const dy = segEnd.y - segStart.y;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared === 0) {
    // Segment is a point
    return Math.sqrt((point.x - segStart.x) ** 2 + (point.y - segStart.y) ** 2);
  }

  // Project point onto line
  let t = ((point.x - segStart.x) * dx + (point.y - segStart.y) * dy) / lengthSquared;
  t = Math.max(0, Math.min(1, t));

  const projX = segStart.x + t * dx;
  const projY = segStart.y + t * dy;

  return Math.sqrt((point.x - projX) ** 2 + (point.y - projY) ** 2);
}
