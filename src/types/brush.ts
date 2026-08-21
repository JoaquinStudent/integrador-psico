// Brush and stroke types

export const StockBrush = {
  MARKER: 'MARKER',
  BALLPOINT: 'BALLPOINT',
  HIGHLIGHTER: 'HIGHLIGHTER',
  PENCIL: 'PENCIL',
} as const;
export type StockBrush = (typeof StockBrush)[keyof typeof StockBrush];

export const InkToolType = {
  UNKNOWN: 'UNKNOWN',
  PEN: 'PEN',
  TOUCH: 'TOUCH',
  MOUSE: 'MOUSE',
  STYLUS: 'STYLUS',
} as const;
export type InkToolType = (typeof InkToolType)[keyof typeof InkToolType];

export interface Brush {
  stockBrush: StockBrush;
  color: number; // ARGB packed integer
  size: number; // Brush size in dp
}

export interface StrokeInput {
  x: number;
  y: number;
  timeMillis: number;
  pressure?: number; // 0-1, optional
  tiltX?: number; // Stylus tilt X
  tiltY?: number; // Stylus tilt Y
}

export interface StrokeInputBatch {
  tool: InkToolType;
  inputs: StrokeInput[];
}

export interface Stroke {
  inputs: StrokeInputBatch;
  brush: Brush;
}

// Color utilities
export function colorToRGBA(color: number): { r: number; g: number; b: number; a: number } {
  return {
    a: ((color >> 24) & 0xff) / 255,
    r: (color >> 16) & 0xff,
    g: (color >> 8) & 0xff,
    b: color & 0xff,
  };
}

export function rgbaToColor(r: number, g: number, b: number, a: number = 1): number {
  const alpha = Math.round(a * 255);
  return ((alpha << 24) | (r << 16) | (g << 8) | b) >>> 0;
}

export function colorToCSSRGBA(color: number): string {
  const { r, g, b, a } = colorToRGBA(color);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export function colorToHex(color: number): string {
  const { r, g, b } = colorToRGBA(color);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Default brushes
export const DEFAULT_PEN_BRUSH: Brush = {
  stockBrush: StockBrush.BALLPOINT,
  color: 0xff000000, // Black
  size: 3,
};

export const DEFAULT_HIGHLIGHTER_BRUSH: Brush = {
  stockBrush: StockBrush.HIGHLIGHTER,
  color: 0x80ffff00, // Semi-transparent yellow
  size: 20,
};

export const DEFAULT_PENCIL_BRUSH: Brush = {
  stockBrush: StockBrush.PENCIL,
  color: 0xff444444, // Dark gray
  size: 2,
};

// Stroke utilities
export function getStrokeBoundingBox(stroke: Stroke): {
  left: number;
  top: number;
  right: number;
  bottom: number;
} | null {
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

  // Expand by brush size
  const halfSize = stroke.brush.size / 2;
  return {
    left: left - halfSize,
    top: top - halfSize,
    right: right + halfSize,
    bottom: bottom + halfSize,
  };
}

export function getStrokeDuration(stroke: Stroke): number {
  const inputs = stroke.inputs.inputs;
  if (inputs.length < 2) return 0;
  return inputs[inputs.length - 1].timeMillis - inputs[0].timeMillis;
}

export function getStrokeStartTime(stroke: Stroke): number {
  const inputs = stroke.inputs.inputs;
  if (inputs.length === 0) return 0;
  return inputs[0].timeMillis;
}

export function getStrokeEndTime(stroke: Stroke): number {
  const inputs = stroke.inputs.inputs;
  if (inputs.length === 0) return 0;
  return inputs[inputs.length - 1].timeMillis;
}
