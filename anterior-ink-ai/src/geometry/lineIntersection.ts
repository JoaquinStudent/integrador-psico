// Line intersection utilities

import type { Offset } from '../types';

export interface Line {
  start: Offset;
  end: Offset;
}

export interface IntersectionResult {
  point: Offset;
  t1: number; // Parameter along first line (0-1 means within segment)
  t2: number; // Parameter along second line (0-1 means within segment)
}

/**
 * Find intersection point of two line segments.
 * Returns null if lines are parallel or don't intersect.
 */
export function lineSegmentIntersection(
  line1: Line,
  line2: Line
): IntersectionResult | null {
  const { start: p1, end: p2 } = line1;
  const { start: p3, end: p4 } = line2;

  const d1x = p2.x - p1.x;
  const d1y = p2.y - p1.y;
  const d2x = p4.x - p3.x;
  const d2y = p4.y - p3.y;

  const denominator = d1x * d2y - d1y * d2x;

  // Lines are parallel
  if (Math.abs(denominator) < 1e-10) {
    return null;
  }

  const t1 = ((p3.x - p1.x) * d2y - (p3.y - p1.y) * d2x) / denominator;
  const t2 = ((p3.x - p1.x) * d1y - (p3.y - p1.y) * d1x) / denominator;

  return {
    point: {
      x: p1.x + t1 * d1x,
      y: p1.y + t1 * d1y,
    },
    t1,
    t2,
  };
}

/**
 * Find intersection point of two line segments, only if within both segments.
 */
export function lineSegmentIntersectionWithinBounds(
  line1: Line,
  line2: Line,
  tolerance: number = 0.1
): Offset | null {
  const result = lineSegmentIntersection(line1, line2);
  if (!result) return null;

  // Check if intersection is within both segments (with tolerance)
  if (
    result.t1 >= -tolerance &&
    result.t1 <= 1 + tolerance &&
    result.t2 >= -tolerance &&
    result.t2 <= 1 + tolerance
  ) {
    return result.point;
  }

  return null;
}

/**
 * Find intersection of two infinite lines (not limited to segments).
 */
export function lineIntersection(line1: Line, line2: Line): Offset | null {
  const result = lineSegmentIntersection(line1, line2);
  return result ? result.point : null;
}

/**
 * Calculate the distance from a point to a line segment.
 */
export function pointToLineSegmentDistance(point: Offset, line: Line): number {
  const { start, end } = line;
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared === 0) {
    // Line segment is a point
    return Math.sqrt((point.x - start.x) ** 2 + (point.y - start.y) ** 2);
  }

  // Project point onto line
  let t = ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared;
  t = Math.max(0, Math.min(1, t));

  const projX = start.x + t * dx;
  const projY = start.y + t * dy;

  return Math.sqrt((point.x - projX) ** 2 + (point.y - projY) ** 2);
}

/**
 * Calculate the length of a line segment.
 */
export function lineLength(line: Line): number {
  const dx = line.end.x - line.start.x;
  const dy = line.end.y - line.start.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate the angle of a line segment in radians.
 */
export function lineAngle(line: Line): number {
  return Math.atan2(line.end.y - line.start.y, line.end.x - line.start.x);
}

/**
 * Check if two line segments are approximately parallel.
 */
export function areLinesParallel(
  line1: Line,
  line2: Line,
  angleTolerance: number = 0.1 // radians, about 5.7 degrees
): boolean {
  const angle1 = lineAngle(line1);
  const angle2 = lineAngle(line2);

  // Normalize angles to [0, PI) since direction doesn't matter
  const normalizedAngle1 = ((angle1 % Math.PI) + Math.PI) % Math.PI;
  const normalizedAngle2 = ((angle2 % Math.PI) + Math.PI) % Math.PI;

  const diff = Math.abs(normalizedAngle1 - normalizedAngle2);
  return diff < angleTolerance || Math.abs(diff - Math.PI) < angleTolerance;
}

/**
 * Check if two line segments are approximately perpendicular.
 */
export function areLinesPerpendicular(
  line1: Line,
  line2: Line,
  angleTolerance: number = 0.1 // radians
): boolean {
  const angle1 = lineAngle(line1);
  const angle2 = lineAngle(line2);

  const diff = Math.abs(angle1 - angle2);
  const normalizedDiff = ((diff % Math.PI) + Math.PI) % Math.PI;

  return (
    Math.abs(normalizedDiff - Math.PI / 2) < angleTolerance ||
    Math.abs(normalizedDiff - Math.PI * 1.5) < angleTolerance
  );
}

/**
 * Get the midpoint of a line segment.
 */
export function lineMidpoint(line: Line): Offset {
  return {
    x: (line.start.x + line.end.x) / 2,
    y: (line.start.y + line.end.y) / 2,
  };
}

/**
 * Extend a line segment by a factor on both ends.
 */
export function extendLine(line: Line, factor: number): Line {
  const mid = lineMidpoint(line);
  const halfLength = lineLength(line) / 2;
  const newHalfLength = halfLength * factor;
  const angle = lineAngle(line);

  return {
    start: {
      x: mid.x - newHalfLength * Math.cos(angle),
      y: mid.y - newHalfLength * Math.sin(angle),
    },
    end: {
      x: mid.x + newHalfLength * Math.cos(angle),
      y: mid.y + newHalfLength * Math.sin(angle),
    },
  };
}
