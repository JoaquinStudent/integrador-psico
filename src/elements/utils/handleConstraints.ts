// Handle Constraints - utility functions for constraining handle positions
//
// Plugins can import these utilities to apply common constraints
// like grid snapping, bounds clamping, and axis constraints.

import type { Offset } from '../../types';

/**
 * Snap a point to a grid.
 *
 * @param point - The point to snap
 * @param gridSpacing - The spacing between grid lines
 * @param origin - The origin of the grid (default: { x: 0, y: 0 })
 * @returns The snapped point
 */
export function snapToGrid(point: Offset, gridSpacing: number, origin: Offset = { x: 0, y: 0 }): Offset {
  return {
    x: origin.x + Math.round((point.x - origin.x) / gridSpacing) * gridSpacing,
    y: origin.y + Math.round((point.y - origin.y) / gridSpacing) * gridSpacing,
  };
}

/**
 * Clamp a value to bounds.
 *
 * @param value - The value to clamp
 * @param bounds - The min/max bounds (both optional)
 * @returns The clamped value
 */
export function clampToBounds(value: number, bounds: { min?: number; max?: number }): number {
  let result = value;
  if (bounds.min !== undefined) result = Math.max(bounds.min, result);
  if (bounds.max !== undefined) result = Math.min(bounds.max, result);
  return result;
}

/**
 * Clamp a point to a rectangular bounds.
 *
 * @param point - The point to clamp
 * @param bounds - The rectangular bounds
 * @returns The clamped point
 */
export function clampPointToBounds(
  point: Offset,
  bounds: { left: number; top: number; right: number; bottom: number }
): Offset {
  return {
    x: clampToBounds(point.x, { min: bounds.left, max: bounds.right }),
    y: clampToBounds(point.y, { min: bounds.top, max: bounds.bottom }),
  };
}

/**
 * Constrain a point to move only along a single axis.
 *
 * @param current - The current pointer position
 * @param start - The starting position of the drag
 * @param axis - The axis to constrain to ('x' or 'y')
 * @returns The constrained point
 */
export function constrainToAxis(current: Offset, start: Offset, axis: 'x' | 'y'): Offset {
  return axis === 'x' ? { x: current.x, y: start.y } : { x: start.x, y: current.y };
}

/**
 * Calculate the Euclidean distance between two points.
 *
 * @param p1 - First point
 * @param p2 - Second point
 * @returns The distance between the points
 */
export function distance(p1: Offset, p2: Offset): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}
