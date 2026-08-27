// Lasso selection detection utilities
// Lasso selection detection

import type { Offset, BoundingBox } from '../types';
import { boundingBoxFromOffsets, offsetDistance } from '../types';
import { debugLog } from '../debug/DebugLogger';

// Minimum points required for a valid lasso path
const MIN_LASSO_POINTS = 10;

// Quality threshold for a valid lasso selection
const QUALITY_THRESHOLD = 0.3;

// Maximum self-intersections allowed
const MAX_INTERSECTIONS = 4;

// Maximum sharp direction changes allowed
const MAX_DIRECTION_NOISE = 2;

// Angle threshold for sharp turns (radians, ~60 degrees)
const SHARP_TURN_ANGLE = Math.PI / 3;

// Length-to-bounds ratio threshold
const MAX_LENGTH_TO_BOUNDS_RATIO = 15;

/**
 * Assess the quality of a path as a lasso selection gesture.
 * Returns a score from 0 to 1, where higher is better.
 * A score >= 0.3 indicates a valid lasso gesture.
 */
export function assessLassoQuality(points: Offset[]): number {
  if (points.length < 5) {
    debugLog.info('Lasso quality: too few points', { count: points.length, min: 5 });
    return 0;
  }

  const bounds = boundingBoxFromOffsets(points);
  if (!bounds) {
    debugLog.info('Lasso quality: no bounds');
    return 0;
  }

  // Count self-intersections
  const intersectionCount = countSelfIntersections(points);
  if (intersectionCount > MAX_INTERSECTIONS) {
    debugLog.info('Lasso quality: too many intersections', { count: intersectionCount, max: MAX_INTERSECTIONS });
    return 0;
  }

  // Count sharp direction changes
  const directionNoise = countSharpTurns(points, SHARP_TURN_ANGLE);
  if (directionNoise > MAX_DIRECTION_NOISE) {
    debugLog.info('Lasso quality: too much direction noise', { count: directionNoise, max: MAX_DIRECTION_NOISE });
    return 0;
  }

  // Calculate path length
  const pathLength = calculatePathLength(points);
  const maxDimension = Math.max(
    bounds.right - bounds.left,
    bounds.bottom - bounds.top
  );

  // Check extreme length-to-bounds ratio
  if (maxDimension > 0 && pathLength / maxDimension > MAX_LENGTH_TO_BOUNDS_RATIO) {
    debugLog.info('Lasso quality: path too long for bounds', {
      ratio: (pathLength / maxDimension).toFixed(2),
      max: MAX_LENGTH_TO_BOUNDS_RATIO
    });
    return 0;
  }

  // Calculate component scores
  const areaScore = calculateAreaScore(bounds);
  const aspectRatioScore = calculateAspectRatioScore(bounds);
  const closureScore = calculateClosureScore(points, bounds);
  const coverageScore = calculateCoverageScore(points, bounds);

  // Multiply all scores together
  const finalScore = areaScore * aspectRatioScore * closureScore * coverageScore;

  debugLog.info('Lasso quality scores', {
    area: areaScore.toFixed(2),
    aspect: aspectRatioScore.toFixed(2),
    closure: closureScore.toFixed(2),
    coverage: coverageScore.toFixed(2),
    final: finalScore.toFixed(3),
    threshold: QUALITY_THRESHOLD,
  });

  return finalScore;
}

/**
 * Calculate path length (sum of distances between consecutive points).
 */
function calculatePathLength(points: Offset[]): number {
  let length = 0;
  for (let i = 1; i < points.length; i++) {
    length += offsetDistance(points[i - 1], points[i]);
  }
  return length;
}

/**
 * Count self-intersections in the path.
 */
function countSelfIntersections(points: Offset[]): number {
  let count = 0;
  // Only check every 4th segment pair for performance
  for (let i = 0; i < points.length - 3; i += 4) {
    for (let j = i + 2; j < points.length - 1; j += 4) {
      if (segmentsIntersect(points[i], points[i + 1], points[j], points[j + 1])) {
        count++;
        if (count > MAX_INTERSECTIONS) return count;
      }
    }
  }
  return count;
}

/**
 * Count sharp turns (direction changes where angle < threshold).
 * A sharp turn occurs when the angle at a point is small (vectors pointing
 * in similar directions), indicating a corner or reversal.
 */
function countSharpTurns(points: Offset[], threshold: number): number {
  if (points.length < 3) return 0;

  let count = 0;
  // Sample every 5th point for performance
  const step = 5;

  for (let i = step; i < points.length - step; i += step) {
    const angle = calculateAngle(points[i - step], points[i], points[i + step]);
    // A sharp turn has a SMALL angle (vectors pointing similar direction)
    // For smooth curves, angle is close to π (180°)
    if (angle < threshold) {
      count++;
    }
  }
  return count;
}

/**
 * Calculate angle at point b between segments a-b and b-c.
 */
function calculateAngle(a: Offset, b: Offset, c: Offset): number {
  const v1x = a.x - b.x;
  const v1y = a.y - b.y;
  const v2x = c.x - b.x;
  const v2y = c.y - b.y;

  const dot = v1x * v2x + v1y * v2y;
  const mag1 = Math.sqrt(v1x * v1x + v1y * v1y);
  const mag2 = Math.sqrt(v2x * v2x + v2y * v2y);

  if (mag1 === 0 || mag2 === 0) return 0;

  const cos = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
  return Math.acos(cos);
}

/**
 * Area score based on enclosed area size.
 */
function calculateAreaScore(bounds: BoundingBox): number {
  const area = (bounds.right - bounds.left) * (bounds.bottom - bounds.top);

  if (area < 2000) return 0.1;        // Too small
  if (area < 7000) return 0.4;        // Small
  if (area <= 2500000) return 1.0;    // Good size
  return 0.4;                          // Too large
}

/**
 * Aspect ratio score - penalize very elongated shapes.
 */
function calculateAspectRatioScore(bounds: BoundingBox): number {
  const width = bounds.right - bounds.left;
  const height = bounds.bottom - bounds.top;

  if (width === 0 || height === 0) return 0.2;

  const aspectRatio = Math.max(width, height) / Math.min(width, height);

  if (aspectRatio > 12) return 0.2;   // Very elongated
  if (aspectRatio > 8) return 0.5;    // Elongated
  return 1.0;                          // Good ratio
}

/**
 * Closure score - how well the path closes (start near end).
 */
function calculateClosureScore(points: Offset[], bounds: BoundingBox): number {
  if (points.length < 2) return 0;

  const start = points[0];
  const end = points[points.length - 1];
  const distance = offsetDistance(start, end);

  const maxDimension = Math.max(
    bounds.right - bounds.left,
    bounds.bottom - bounds.top
  );

  if (maxDimension === 0) return 0;

  const relativeDistance = distance / maxDimension;

  if (relativeDistance < 0.25) return 1.0;   // Very close
  if (relativeDistance < 0.5) return 0.7;    // Close
  if (relativeDistance < 0.7) return 0.4;    // Moderate
  return 0.2;                                 // Not closed
}

/**
 * Coverage score - path length relative to expected perimeter.
 */
function calculateCoverageScore(points: Offset[], bounds: BoundingBox): number {
  const pathLength = calculatePathLength(points);
  const perimeter = 2 * (bounds.right - bounds.left + bounds.bottom - bounds.top);

  if (perimeter === 0) return 0;

  const ratio = pathLength / perimeter;

  if (ratio < 0.2) return 0.3;        // Too short
  if (ratio <= 2.0) return 1.0;       // Good coverage
  return 0.4;                          // Too long (scribbled)
}

/**
 * Check if two line segments intersect.
 */
function segmentsIntersect(p1: Offset, p2: Offset, p3: Offset, p4: Offset): boolean {
  const d1 = direction(p3, p4, p1);
  const d2 = direction(p3, p4, p2);
  const d3 = direction(p1, p2, p3);
  const d4 = direction(p1, p2, p4);

  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
      ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) {
    return true;
  }

  return false;
}

function direction(p1: Offset, p2: Offset, p3: Offset): number {
  return (p3.x - p1.x) * (p2.y - p1.y) - (p2.x - p1.x) * (p3.y - p1.y);
}

/**
 * Check if a lasso path meets the minimum quality threshold.
 */
export function isValidLasso(points: Offset[]): boolean {
  debugLog.info('Lasso validation starting', { pointCount: points.length, minRequired: MIN_LASSO_POINTS });

  if (points.length < MIN_LASSO_POINTS) {
    debugLog.info('Lasso invalid: insufficient points', { count: points.length, min: MIN_LASSO_POINTS });
    return false;
  }

  const quality = assessLassoQuality(points);
  const isValid = quality >= QUALITY_THRESHOLD;

  debugLog.info('Lasso validation result', {
    isValid,
    quality: quality.toFixed(3),
    threshold: QUALITY_THRESHOLD
  });

  return isValid;
}

/**
 * Find the self-intersection point in a path (if any).
 * Used to create a closed polygon from an open path.
 * Returns the indices of the intersection segments, or null if none found.
 */
export function findSelfIntersection(
  points: Offset[]
): { i: number; j: number } | null {
  // Start from the end to find the most recent intersection
  for (let i = points.length - 2; i >= 1; i--) {
    for (let j = i - 2; j >= 0; j--) {
      if (segmentsIntersect(points[i], points[i + 1], points[j], points[j + 1])) {
        return { i: j, j: i + 1 };
      }
    }
  }
  return null;
}

/**
 * Create a closed polygon from lasso points.
 * If the path self-intersects, uses the intersection to close the polygon.
 * Otherwise, closes from start to end.
 */
export function createClosedPolygon(points: Offset[]): Offset[] {
  if (points.length < 3) return points;

  // Check for self-intersection
  const intersection = findSelfIntersection(points);
  if (intersection) {
    // Truncate to the closed portion
    return points.slice(intersection.i, intersection.j + 1);
  }

  // No intersection - just return as is (closing is implicit)
  return points;
}
