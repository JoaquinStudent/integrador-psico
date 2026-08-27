// Corner detection using Ramer-Douglas-Peucker simplification and curvature analysis

import type { Offset } from '../types/primitives';
import { offsetDistance } from '../types/primitives';

export interface Corner {
  point: Offset;
  angle: number; // Interior angle at corner in radians
  index: number; // Index in simplified points
}

export interface CornerDetectionOptions {
  epsilon?: number; // RDP simplification tolerance (default: 8)
  angleThreshold?: number; // Min angle change to count as corner (default: PI/4 = 45 degrees)
  mergeDistance?: number; // Merge corners closer than this (default: 15)
}

const DEFAULT_EPSILON = 8;
const DEFAULT_ANGLE_THRESHOLD = Math.PI / 4; // 45 degrees
const DEFAULT_MERGE_DISTANCE = 15;

/**
 * Find the perpendicular distance from a point to a line segment.
 */
function perpendicularDistance(point: Offset, lineStart: Offset, lineEnd: Offset): number {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;
  const lineLengthSquared = dx * dx + dy * dy;

  if (lineLengthSquared === 0) {
    return offsetDistance(point, lineStart);
  }

  // Project point onto line and clamp to segment
  const t = Math.max(0, Math.min(1, ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / lineLengthSquared));
  const projection: Offset = {
    x: lineStart.x + t * dx,
    y: lineStart.y + t * dy,
  };

  return offsetDistance(point, projection);
}

/**
 * Ramer-Douglas-Peucker algorithm for path simplification.
 * Reduces the number of points while preserving overall shape.
 */
export function rdpSimplify(points: Offset[], epsilon: number = DEFAULT_EPSILON): Offset[] {
  if (points.length < 3) return [...points];

  // Find the point with maximum distance from line between first and last
  let maxDistance = 0;
  let maxIndex = 0;

  const start = points[0];
  const end = points[points.length - 1];

  for (let i = 1; i < points.length - 1; i++) {
    const distance = perpendicularDistance(points[i], start, end);
    if (distance > maxDistance) {
      maxDistance = distance;
      maxIndex = i;
    }
  }

  // If max distance is greater than epsilon, recursively simplify
  if (maxDistance > epsilon) {
    const left = rdpSimplify(points.slice(0, maxIndex + 1), epsilon);
    const right = rdpSimplify(points.slice(maxIndex), epsilon);
    // Remove duplicate point at junction
    return [...left.slice(0, -1), ...right];
  }

  // Otherwise, return just the endpoints
  return [start, end];
}

/**
 * Calculate the angle at point B in the triangle ABC.
 * Returns the interior angle in radians (0 to PI).
 */
function angleAtPoint(a: Offset, b: Offset, c: Offset): number {
  const ba = { x: a.x - b.x, y: a.y - b.y };
  const bc = { x: c.x - b.x, y: c.y - b.y };

  const dot = ba.x * bc.x + ba.y * bc.y;
  const cross = ba.x * bc.y - ba.y * bc.x;

  return Math.abs(Math.atan2(cross, dot));
}

/**
 * Detect corners in a path by finding points where the angle changes significantly.
 */
export function detectCorners(points: Offset[], options?: CornerDetectionOptions): Corner[] {
  const epsilon = options?.epsilon ?? DEFAULT_EPSILON;
  const angleThreshold = options?.angleThreshold ?? DEFAULT_ANGLE_THRESHOLD;
  const mergeDistance = options?.mergeDistance ?? DEFAULT_MERGE_DISTANCE;

  // First, simplify the path
  const simplified = rdpSimplify(points, epsilon);

  if (simplified.length < 3) return [];

  const corners: Corner[] = [];

  // Check each interior point for significant angle change
  for (let i = 1; i < simplified.length - 1; i++) {
    const prev = simplified[i - 1];
    const curr = simplified[i];
    const next = simplified[i + 1];

    const angle = angleAtPoint(prev, curr, next);
    const angleChange = Math.PI - angle; // Deviation from straight line

    if (angleChange > angleThreshold) {
      corners.push({
        point: curr,
        angle: angle,
        index: i,
      });
    }
  }

  // For closed paths, also check the first point as a potential corner
  // Use the second-to-last simplified point and second simplified point as neighbors
  const gap = offsetDistance(simplified[0], simplified[simplified.length - 1]);
  const perimeter = pathLength(simplified);
  const isClosed = perimeter > 0 && (gap / perimeter) < 0.15;

  if (isClosed && simplified.length >= 3) {
    // Check angle at the start/end region
    // Use second-to-last point (before closing) and second point (after start)
    const prev = simplified[simplified.length - 2];
    const curr = simplified[0];
    const next = simplified[1];

    const angle = angleAtPoint(prev, curr, next);
    const angleChange = Math.PI - angle;

    if (angleChange > angleThreshold) {
      corners.unshift({
        point: curr,
        angle: angle,
        index: 0,
      });
    }
  }

  // Merge nearby corners (debounce jitter)
  return mergeNearbyCorners(corners, mergeDistance);
}

/**
 * Merge corners that are closer than the merge distance.
 * Keeps the corner with the sharpest angle.
 */
function mergeNearbyCorners(corners: Corner[], mergeDistance: number): Corner[] {
  if (corners.length < 2) return corners;

  const merged: Corner[] = [];
  let currentGroup: Corner[] = [corners[0]];

  for (let i = 1; i < corners.length; i++) {
    const corner = corners[i];
    const prevCorner = currentGroup[currentGroup.length - 1];

    if (offsetDistance(corner.point, prevCorner.point) < mergeDistance) {
      currentGroup.push(corner);
    } else {
      // Finalize current group - keep sharpest corner (smallest angle)
      const sharpest = currentGroup.reduce((a, b) => (a.angle < b.angle ? a : b));
      merged.push(sharpest);
      currentGroup = [corner];
    }
  }

  // Don't forget the last group
  if (currentGroup.length > 0) {
    const sharpest = currentGroup.reduce((a, b) => (a.angle < b.angle ? a : b));
    merged.push(sharpest);
  }

  return merged;
}

/**
 * Estimate per-point noise (jitter) in a stroke by measuring perpendicular
 * deviation from local chords. For each interior point p[i], computes
 * distance from the chord p[i-k]→p[i+k] (window k=3). Returns the 75th
 * percentile of deviations — robust to corner outliers while capturing
 * bursty stylus jitter.
 *
 * Returns 0 for strokes with fewer than 2*k+1 points, which causes
 * downstream clamp() calls to fall back to their floor values.
 */
export function estimateStrokeNoise(points: Offset[]): number {
  const k = 3;
  if (points.length < 2 * k + 1) return 0;

  const deviations: number[] = [];
  for (let i = k; i < points.length - k; i++) {
    const d = perpendicularDistance(points[i], points[i - k], points[i + k]);
    deviations.push(d);
  }

  if (deviations.length === 0) return 0;

  deviations.sort((a, b) => a - b);
  const p75Index = Math.floor(deviations.length * 0.75);
  return deviations[Math.min(p75Index, deviations.length - 1)];
}

/**
 * Get the total path length of a series of points.
 */
export function pathLength(points: Offset[]): number {
  if (points.length < 2) return 0;

  let length = 0;
  for (let i = 1; i < points.length; i++) {
    length += offsetDistance(points[i - 1], points[i]);
  }
  return length;
}

/**
 * Check if a path is closed (start and end points are close together).
 */
export function isPathClosed(points: Offset[], closureThreshold?: number): boolean {
  if (points.length < 3) return false;

  const perimeter = pathLength(points);
  const threshold = closureThreshold ?? perimeter * 0.15; // 15% of perimeter
  const gap = offsetDistance(points[0], points[points.length - 1]);

  return gap < threshold;
}

/**
 * Get the closure gap as a ratio of perimeter.
 */
export function closureGapRatio(points: Offset[]): number {
  if (points.length < 2) return 1;

  const perimeter = pathLength(points);
  if (perimeter === 0) return 1;

  const gap = offsetDistance(points[0], points[points.length - 1]);
  return gap / perimeter;
}
