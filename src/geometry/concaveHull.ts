// Wrapper around concaveman for computing concave hulls

import concaveman from 'concaveman';
import type { Offset, BoundingBox } from '../types';
import { boundingBoxFromOffsets } from '../types';

export interface ConcaveHullOptions {
  concavity?: number; // Controls the "tightness" of the hull (default: 2, lower = tighter)
  lengthThreshold?: number; // Minimum segment length threshold (default: 0)
}

/**
 * Compute a concave hull from a set of points.
 * Returns an array of points forming the hull polygon, or null if not enough points.
 */
export function computeConcaveHull(
  points: Offset[],
  options: ConcaveHullOptions = {}
): Offset[] | null {
  // Need at least 3 points to form a hull
  if (points.length < 3) {
    return null;
  }

  // Convert Offset[] to number[][] format for concaveman
  const pointsArray: number[][] = points.map(p => [p.x, p.y]);

  const { concavity = 2, lengthThreshold = 0 } = options;

  try {
    const hullArray = concaveman(pointsArray, concavity, lengthThreshold);

    // Convert back to Offset[]
    const hull: Offset[] = hullArray.map(p => ({ x: p[0], y: p[1] }));

    // concaveman returns the first point repeated at the end - remove it if so
    if (hull.length > 1) {
      const first = hull[0];
      const last = hull[hull.length - 1];
      if (first.x === last.x && first.y === last.y) {
        hull.pop();
      }
    }

    return hull.length >= 3 ? hull : null;
  } catch {
    return null;
  }
}

/**
 * Get the bounding box of a concave hull.
 */
export function getHullBounds(hull: Offset[]): BoundingBox | null {
  return boundingBoxFromOffsets(hull);
}

/**
 * Simplify points before hull computation for very long strokes.
 * Uses Douglas-Peucker-like simplification based on distance threshold.
 */
export function simplifyPoints(points: Offset[], maxPoints: number = 500): Offset[] {
  if (points.length <= maxPoints) {
    return points;
  }

  // Simple sampling: take every nth point to reduce to maxPoints
  const step = Math.ceil(points.length / maxPoints);
  const simplified: Offset[] = [];

  for (let i = 0; i < points.length; i += step) {
    simplified.push(points[i]);
  }

  // Always include the last point
  if (simplified[simplified.length - 1] !== points[points.length - 1]) {
    simplified.push(points[points.length - 1]);
  }

  return simplified;
}
