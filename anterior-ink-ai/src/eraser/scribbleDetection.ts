// Scribble gesture detection for implicit erasing
// Uses weighted scoring system for scribble gesture detection

import type { Stroke, Element, Offset, BoundingBox } from '../types';
import { getStrokeBoundingBox } from '../types';
import { getElementBounds } from '../elements/rendering/ElementRenderer';
import { lineSegmentIntersectionWithinBounds, type Line } from '../geometry';
import { boundingBoxesIntersect } from '../types/primitives';
import { debugLog } from '../debug/DebugLogger';

export interface ScribbleDetectionOptions {
  minSelfIntersections?: number; // Minimum self-intersections to classify as scribble (default: 3)
  skipNonAdjacentSegments?: number; // Skip this many segments when checking intersections to avoid false positives at corners (default: 2)
}

// Thresholds from scribble detection config
const SCRIBBLE_THRESHOLDS = {
  // Direction change ratio thresholds
  directionChangeStrong: 0.15,
  directionChangeModerate: 0.10,
  // Curvature thresholds
  curvatureStrong: 0.3,
  curvatureModerate: 0.2,
  // Bounding box compactness thresholds (min/max ratio)
  boundingBoxStrong: 0.4,
  boundingBoxModerate: 0.25,
  // Density thresholds
  densityStrong: 0.2,
  densityModerate: 0.05,
  // Self-intersection thresholds
  intersectionStrong: 2,
  intersectionModerate: 0,
};

// Hard requirements for scribble detection (must ALL be met)
const SCRIBBLE_HARD_REQUIREMENTS = {
  // Minimum bounding box dimension (width OR height must exceed this)
  minBoundingBoxSize: 40,
  // Minimum number of major direction reversals (back-and-forth motion)
  minDirectionReversals: 3,
  // Minimum total path length in pixels
  minPathLength: 100,
};

// Weights from scribble detection config (extended with reversal scoring)
const SCRIBBLE_WEIGHTS = {
  directionChangeStrong: 2,
  directionChangeModerate: 1,
  curvatureStrong: 2,
  curvatureModerate: 1,
  boundingBoxStrong: 2,
  boundingBoxModerate: 1,
  densityStrong: 2,
  densityModerate: 1,
  intersectionStrong: 3,
  intersectionModerate: 2,
  reversalStrong: 3,
  reversalModerate: 2,
};

// Reversal thresholds (back-and-forth motion count)
const REVERSAL_THRESHOLDS = {
  strong: 6,
  moderate: 4,
};

/**
 * Get direction (angle) from point p1 to point p2.
 */
function getDirection(p1: Offset, p2: Offset): number {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

/**
 * Calculate total path length of a stroke.
 */
export function calculatePathLength(points: Offset[]): number {
  if (points.length < 2) return 0;

  let totalLength = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    totalLength += Math.sqrt(dx * dx + dy * dy);
  }

  return totalLength;
}

/**
 * Get bounding box dimensions of points.
 */
export function getBoundingBoxDimensions(points: Offset[]): { width: number; height: number } {
  if (points.length === 0) return { width: 0, height: 0 };

  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;

  for (const p of points) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }

  return {
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * Count major direction reversals (back-and-forth motion).
 * A reversal is when the stroke changes direction by more than 90 degrees.
 * This is different from direction changes - reversals specifically capture
 * the back-and-forth scribbling motion.
 */
export function countDirectionReversals(points: Offset[]): number {
  if (points.length < 3) return 0;

  let reversals = 0;
  let prevDirection = getDirection(points[0], points[1]);

  // Use a sliding window to smooth out minor jitter
  const windowSize = Math.max(1, Math.floor(points.length / 20));

  for (let i = windowSize; i < points.length - windowSize; i += windowSize) {
    const nextIdx = Math.min(i + windowSize, points.length - 1);
    const currentDirection = getDirection(points[i], points[nextIdx]);

    const angleDiff = Math.abs(currentDirection - prevDirection);
    const normalizedDiff = Math.min(angleDiff, 2 * Math.PI - angleDiff);

    // Count as reversal if direction change exceeds 90 degrees
    if (normalizedDiff > Math.PI / 2) {
      reversals++;
    }
    prevDirection = currentDirection;
  }

  return reversals;
}

/**
 * Count the number of significant direction changes in a stroke.
 * A direction change is counted when the angle difference exceeds 45 degrees.
 * Scribble detection heuristic
 */
export function countDirectionChanges(points: Offset[]): number {
  if (points.length < 3) return 0;

  let changes = 0;
  let prevDirection = getDirection(points[0], points[1]);

  for (let i = 1; i < points.length - 1; i++) {
    const currentDirection = getDirection(points[i], points[i + 1]);
    const angleDiff = Math.abs(currentDirection - prevDirection);
    const normalizedDiff = Math.min(angleDiff, 2 * Math.PI - angleDiff);

    if (normalizedDiff > Math.PI / 4) { // 45 degree threshold
      changes++;
    }
    prevDirection = currentDirection;
  }

  return changes;
}

/**
 * Calculate curvature at a point using three consecutive points.
 * Uses dot product to find the angle between vectors.
 */
function calculatePointCurvature(p1: Offset, p2: Offset, p3: Offset): number {
  const v1x = p2.x - p1.x;
  const v1y = p2.y - p1.y;
  const v2x = p3.x - p2.x;
  const v2y = p3.y - p2.y;

  const dot = v1x * v2x + v1y * v2y;
  const mag1 = Math.sqrt(v1x * v1x + v1y * v1y);
  const mag2 = Math.sqrt(v2x * v2x + v2y * v2y);

  if (mag1 === 0 || mag2 === 0) return 0;

  const cosAngle = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
  return Math.abs(Math.acos(cosAngle));
}

/**
 * Calculate average curvature across all points in a stroke.
 * Higher values indicate more curved/wavy strokes.
 * Scribble detection heuristic
 */
export function calculateAverageCurvature(points: Offset[]): number {
  if (points.length < 3) return 0;

  let totalCurvature = 0;
  let count = 0;

  for (let i = 1; i < points.length - 1; i++) {
    const curvature = calculatePointCurvature(points[i - 1], points[i], points[i + 1]);
    totalCurvature += curvature;
    count++;
  }

  return count > 0 ? totalCurvature / count : 0;
}

/**
 * Calculate bounding box compactness (min/max ratio).
 * Values closer to 1.0 indicate a square-ish shape.
 * Scribbles tend to have higher compactness (more square-ish).
 * Scribble detection heuristic
 */
export function calculateBoundingBoxCompactness(points: Offset[]): number {
  if (points.length === 0) return 0;

  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;

  for (const p of points) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }

  const width = maxX - minX;
  const height = maxY - minY;

  if (width === 0 || height === 0) return 0;

  return Math.min(width, height) / Math.max(width, height);
}

/**
 * Calculate stroke density (total stroke length / bounding box area).
 * Higher values indicate more ink packed into a small area.
 * Scribble detection heuristic
 */
export function calculateStrokeDensity(points: Offset[]): number {
  if (points.length < 2) return 0;

  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;

  for (const p of points) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }

  const area = (maxX - minX) * (maxY - minY);
  if (area === 0) return 0;

  let totalLength = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    totalLength += Math.sqrt(dx * dx + dy * dy);
  }

  return totalLength / area;
}

/**
 * Calculate scribble score using the weighted scoring system for scribble detection.
 * Returns the total score based on all 5 characteristics.
 */
export function calculateScribbleScore(points: Offset[], selfIntersectionCount: number): number {
  let score = 0;

  // 1. Direction change ratio
  const directionChanges = countDirectionChanges(points);
  const directionChangeRatio = directionChanges / points.length;

  if (directionChangeRatio > SCRIBBLE_THRESHOLDS.directionChangeStrong) {
    score += SCRIBBLE_WEIGHTS.directionChangeStrong;
  } else if (directionChangeRatio > SCRIBBLE_THRESHOLDS.directionChangeModerate) {
    score += SCRIBBLE_WEIGHTS.directionChangeModerate;
  }

  // 2. Curvature
  const curvature = calculateAverageCurvature(points);

  if (curvature > SCRIBBLE_THRESHOLDS.curvatureStrong) {
    score += SCRIBBLE_WEIGHTS.curvatureStrong;
  } else if (curvature > SCRIBBLE_THRESHOLDS.curvatureModerate) {
    score += SCRIBBLE_WEIGHTS.curvatureModerate;
  }

  // 3. Bounding box compactness
  const compactness = calculateBoundingBoxCompactness(points);

  if (compactness > SCRIBBLE_THRESHOLDS.boundingBoxStrong) {
    score += SCRIBBLE_WEIGHTS.boundingBoxStrong;
  } else if (compactness > SCRIBBLE_THRESHOLDS.boundingBoxModerate) {
    score += SCRIBBLE_WEIGHTS.boundingBoxModerate;
  }

  // 4. Density
  const density = calculateStrokeDensity(points);

  if (density > SCRIBBLE_THRESHOLDS.densityStrong) {
    score += SCRIBBLE_WEIGHTS.densityStrong;
  } else if (density > SCRIBBLE_THRESHOLDS.densityModerate) {
    score += SCRIBBLE_WEIGHTS.densityModerate;
  }

  // 5. Self-intersections (highest weight)
  if (selfIntersectionCount > SCRIBBLE_THRESHOLDS.intersectionStrong) {
    score += SCRIBBLE_WEIGHTS.intersectionStrong;
  } else if (selfIntersectionCount > SCRIBBLE_THRESHOLDS.intersectionModerate) {
    score += SCRIBBLE_WEIGHTS.intersectionModerate;
  }

  // 6. Direction reversals (back-and-forth motion)
  const reversals = countDirectionReversals(points);
  if (reversals >= REVERSAL_THRESHOLDS.strong) {
    score += SCRIBBLE_WEIGHTS.reversalStrong;
  } else if (reversals >= REVERSAL_THRESHOLDS.moderate) {
    score += SCRIBBLE_WEIGHTS.reversalModerate;
  }

  return score;
}

/**
 * Score breakdown for debug logging
 */
export interface ScribbleScoreBreakdown {
  pointCount: number;
  // Hard requirements
  pathLength: number;
  boundingBoxWidth: number;
  boundingBoxHeight: number;
  directionReversals: number;
  meetsHardRequirements: boolean;
  failedRequirement: string | null;
  // Scoring factors
  directionChanges: number;
  directionChangeRatio: number;
  directionChangeScore: number;
  curvature: number;
  curvatureScore: number;
  compactness: number;
  compactnessScore: number;
  density: number;
  densityScore: number;
  selfIntersections: number;
  intersectionScore: number;
  reversalScore: number;
  totalScore: number;
  requiredScore: number;
  isScribble: boolean;
}

/**
 * Calculate detailed scribble score breakdown for debugging.
 */
export function calculateScribbleScoreBreakdown(points: Offset[], selfIntersectionCount: number): ScribbleScoreBreakdown {
  // Calculate hard requirements first
  const pathLength = calculatePathLength(points);
  const { width: boundingBoxWidth, height: boundingBoxHeight } = getBoundingBoxDimensions(points);
  const directionReversals = countDirectionReversals(points);

  // Check hard requirements
  let meetsHardRequirements = true;
  let failedRequirement: string | null = null;

  const maxBoundingBoxDim = Math.max(boundingBoxWidth, boundingBoxHeight);
  if (maxBoundingBoxDim < SCRIBBLE_HARD_REQUIREMENTS.minBoundingBoxSize) {
    meetsHardRequirements = false;
    failedRequirement = `bbox ${maxBoundingBoxDim.toFixed(0)}px < ${SCRIBBLE_HARD_REQUIREMENTS.minBoundingBoxSize}px`;
  } else if (directionReversals < SCRIBBLE_HARD_REQUIREMENTS.minDirectionReversals) {
    meetsHardRequirements = false;
    failedRequirement = `reversals ${directionReversals} < ${SCRIBBLE_HARD_REQUIREMENTS.minDirectionReversals}`;
  } else if (pathLength < SCRIBBLE_HARD_REQUIREMENTS.minPathLength) {
    meetsHardRequirements = false;
    failedRequirement = `pathLen ${pathLength.toFixed(0)}px < ${SCRIBBLE_HARD_REQUIREMENTS.minPathLength}px`;
  }

  // 1. Direction change ratio
  const directionChanges = countDirectionChanges(points);
  const directionChangeRatio = points.length > 0 ? directionChanges / points.length : 0;
  let directionChangeScore = 0;
  if (directionChangeRatio > SCRIBBLE_THRESHOLDS.directionChangeStrong) {
    directionChangeScore = SCRIBBLE_WEIGHTS.directionChangeStrong;
  } else if (directionChangeRatio > SCRIBBLE_THRESHOLDS.directionChangeModerate) {
    directionChangeScore = SCRIBBLE_WEIGHTS.directionChangeModerate;
  }

  // 2. Curvature
  const curvature = calculateAverageCurvature(points);
  let curvatureScore = 0;
  if (curvature > SCRIBBLE_THRESHOLDS.curvatureStrong) {
    curvatureScore = SCRIBBLE_WEIGHTS.curvatureStrong;
  } else if (curvature > SCRIBBLE_THRESHOLDS.curvatureModerate) {
    curvatureScore = SCRIBBLE_WEIGHTS.curvatureModerate;
  }

  // 3. Bounding box compactness
  const compactness = calculateBoundingBoxCompactness(points);
  let compactnessScore = 0;
  if (compactness > SCRIBBLE_THRESHOLDS.boundingBoxStrong) {
    compactnessScore = SCRIBBLE_WEIGHTS.boundingBoxStrong;
  } else if (compactness > SCRIBBLE_THRESHOLDS.boundingBoxModerate) {
    compactnessScore = SCRIBBLE_WEIGHTS.boundingBoxModerate;
  }

  // 4. Density
  const density = calculateStrokeDensity(points);
  let densityScore = 0;
  if (density > SCRIBBLE_THRESHOLDS.densityStrong) {
    densityScore = SCRIBBLE_WEIGHTS.densityStrong;
  } else if (density > SCRIBBLE_THRESHOLDS.densityModerate) {
    densityScore = SCRIBBLE_WEIGHTS.densityModerate;
  }

  // 5. Self-intersections (highest weight)
  let intersectionScore = 0;
  if (selfIntersectionCount > SCRIBBLE_THRESHOLDS.intersectionStrong) {
    intersectionScore = SCRIBBLE_WEIGHTS.intersectionStrong;
  } else if (selfIntersectionCount > SCRIBBLE_THRESHOLDS.intersectionModerate) {
    intersectionScore = SCRIBBLE_WEIGHTS.intersectionModerate;
  }

  // 6. Direction reversals (back-and-forth motion)
  let reversalScore = 0;
  if (directionReversals >= REVERSAL_THRESHOLDS.strong) {
    reversalScore = SCRIBBLE_WEIGHTS.reversalStrong;
  } else if (directionReversals >= REVERSAL_THRESHOLDS.moderate) {
    reversalScore = SCRIBBLE_WEIGHTS.reversalModerate;
  }

  const totalScore = directionChangeScore + curvatureScore + compactnessScore + densityScore + intersectionScore + reversalScore;
  const requiredScore = points.length < 20 ? 4 : 6;

  // Must meet hard requirements AND score threshold
  const isScribble = points.length >= 10 && meetsHardRequirements && totalScore >= requiredScore;

  return {
    pointCount: points.length,
    // Hard requirements
    pathLength,
    boundingBoxWidth,
    boundingBoxHeight,
    directionReversals,
    meetsHardRequirements,
    failedRequirement,
    // Scoring factors
    directionChanges,
    directionChangeRatio,
    directionChangeScore,
    curvature,
    curvatureScore,
    compactness,
    compactnessScore,
    density,
    densityScore,
    selfIntersections: selfIntersectionCount,
    intersectionScore,
    reversalScore,
    totalScore,
    requiredScore,
    isScribble,
  };
}

/**
 * Log scribble detection score breakdown
 */
export function logScribbleScoreBreakdown(breakdown: ScribbleScoreBreakdown, reason?: string): void {
  const { totalScore, requiredScore, isScribble, meetsHardRequirements, failedRequirement } = breakdown;
  const status = isScribble ? '✓ SCRIBBLE' : '✗ NOT SCRIBBLE';

  // Hard requirements summary
  const hardReqs = [
    `PathLen: ${breakdown.pathLength.toFixed(0)}px (need ≥${SCRIBBLE_HARD_REQUIREMENTS.minPathLength})`,
    `BBox: ${Math.max(breakdown.boundingBoxWidth, breakdown.boundingBoxHeight).toFixed(0)}px (need ≥${SCRIBBLE_HARD_REQUIREMENTS.minBoundingBoxSize})`,
    `Reversals: ${breakdown.directionReversals} (need ≥${SCRIBBLE_HARD_REQUIREMENTS.minDirectionReversals})`,
  ].join(' | ');

  // Scoring factors
  const details = [
    `Points: ${breakdown.pointCount}`,
    `DirChg: ${breakdown.directionChangeRatio.toFixed(2)} → ${breakdown.directionChangeScore}pts`,
    `Curve: ${breakdown.curvature.toFixed(2)} → ${breakdown.curvatureScore}pts`,
    `Compact: ${breakdown.compactness.toFixed(2)} → ${breakdown.compactnessScore}pts`,
    `Density: ${breakdown.density.toFixed(3)} → ${breakdown.densityScore}pts`,
    `Intersect: ${breakdown.selfIntersections} → ${breakdown.intersectionScore}pts`,
    `Reversals: ${breakdown.directionReversals} → ${breakdown.reversalScore}pts`,
  ].join(' | ');

  let message: string;
  if (reason) {
    message = `Scribble: ${status} (${reason})`;
  } else if (!meetsHardRequirements && failedRequirement) {
    message = `Scribble: ${status} (failed: ${failedRequirement})`;
  } else {
    message = `Scribble: ${status} [${totalScore}/${requiredScore}]`;
  }

  debugLog.info(message, `HardReqs: ${meetsHardRequirements ? 'PASS' : 'FAIL'} | ${hardReqs}`);
  debugLog.info(`  Scoring: ${details}`);
}

/**
 * Determine if points form a scribble pattern using the weighted scoring system.
 * Scribble detection heuristic isScribble()
 *
 * Now includes hard requirements that must ALL be met:
 * 1. Minimum bounding box size (to avoid triggering on small dots)
 * 2. Minimum direction reversals (to ensure back-and-forth motion)
 * 3. Minimum path length (to ensure substantial ink)
 */
export function isScribblePattern(points: Offset[], selfIntersectionCount: number): boolean {
  if (points.length < 10) return false; // Too few points to classify

  const breakdown = calculateScribbleScoreBreakdown(points, selfIntersectionCount);
  return breakdown.isScribble;
}

/**
 * Count the number of times a stroke crosses over itself.
 * Uses line segment intersection detection between non-adjacent segments.
 */
export function countSelfIntersections(
  stroke: Stroke,
  skipSegments: number = 2
): number {
  const inputs = stroke.inputs.inputs;
  if (inputs.length < 4) {
    return 0;
  }

  let intersectionCount = 0;
  const segments: Line[] = [];

  // Build segments from stroke inputs
  for (let i = 0; i < inputs.length - 1; i++) {
    segments.push({
      start: { x: inputs[i].x, y: inputs[i].y },
      end: { x: inputs[i + 1].x, y: inputs[i + 1].y },
    });
  }

  // Check all pairs of non-adjacent segments
  for (let i = 0; i < segments.length; i++) {
    // Start checking from segments that are far enough away to not be adjacent
    for (let j = i + skipSegments + 1; j < segments.length; j++) {
      const intersection = lineSegmentIntersectionWithinBounds(
        segments[i],
        segments[j],
        0.01 // Tighter tolerance for self-intersection
      );

      if (intersection) {
        intersectionCount++;
      }
    }
  }

  return intersectionCount;
}

/**
 * Get the bounding box of a stroke's points.
 */
export function getStrokePointsBounds(stroke: Stroke): BoundingBox | null {
  return getStrokeBoundingBox(stroke);
}

/**
 * Check if a stroke's bounding box overlaps with any element's bounding box.
 */
export function strokeOverlapsElements(
  stroke: Stroke,
  elements: Element[]
): boolean {
  const strokeBounds = getStrokePointsBounds(stroke);
  if (!strokeBounds) {
    return false;
  }

  for (const element of elements) {
    const elementBounds = getElementBounds(element);
    if (elementBounds && boundingBoxesIntersect(strokeBounds, elementBounds)) {
      return true;
    }
  }

  return false;
}

/**
 * Determine if a stroke is a scribble-erase gesture.
 * Uses the weighted scoring system from scribble detection config.kt
 * that considers:
 * 1. Direction change ratio
 * 2. Curvature
 * 3. Bounding box compactness
 * 4. Stroke density
 * 5. Self-intersections
 * 6. Direction reversals
 */
export function isScribbleEraseGesture(
  stroke: Stroke,
  elements: Element[],
  options: ScribbleDetectionOptions = {}
): boolean {
  const {
    skipNonAdjacentSegments = 2,
  } = options;

  const points = getStrokePoints(stroke);

  // Must have enough points to classify (minimum point threshold)
  if (points.length < 10) {
    debugLog.info(`Scribble: ✗ NOT SCRIBBLE (only ${points.length} points, need 10+)`);
    return false;
  }

  // Check if stroke overlaps any elements first (fast check)
  if (!strokeOverlapsElements(stroke, elements)) {
    debugLog.info(`Scribble: ✗ NOT SCRIBBLE (no overlap with elements)`);
    return false;
  }

  // Count self-intersections
  const selfIntersections = countSelfIntersections(stroke, skipNonAdjacentSegments);

  // Calculate and log detailed score breakdown
  const breakdown = calculateScribbleScoreBreakdown(points, selfIntersections);
  logScribbleScoreBreakdown(breakdown);

  return breakdown.isScribble;
}

/**
 * Get the points from a stroke as Offset array.
 */
export function getStrokePoints(stroke: Stroke): Offset[] {
  return stroke.inputs.inputs.map(input => ({
    x: input.x,
    y: input.y,
  }));
}

/**
 * Get the combined points from multiple strokes as Offset array.
 */
export function getMultiStrokePoints(strokes: Stroke[]): Offset[] {
  return strokes.flatMap(stroke => getStrokePoints(stroke));
}

/**
 * Count self-intersections across multiple strokes.
 * This treats each stroke's segments individually but checks intersections
 * between all non-adjacent segments across all strokes.
 */
export function countMultiStrokeSelfIntersections(
  strokes: Stroke[],
  skipSegments: number = 2
): number {
  // Collect all segments from all strokes, tracking stroke boundaries
  const allSegments: { line: Line; strokeIndex: number; segmentIndex: number }[] = [];

  for (let strokeIdx = 0; strokeIdx < strokes.length; strokeIdx++) {
    const inputs = strokes[strokeIdx].inputs.inputs;
    for (let i = 0; i < inputs.length - 1; i++) {
      allSegments.push({
        line: {
          start: { x: inputs[i].x, y: inputs[i].y },
          end: { x: inputs[i + 1].x, y: inputs[i + 1].y },
        },
        strokeIndex: strokeIdx,
        segmentIndex: i,
      });
    }
  }

  let intersectionCount = 0;

  // Check all pairs of segments
  for (let i = 0; i < allSegments.length; i++) {
    for (let j = i + 1; j < allSegments.length; j++) {
      const segA = allSegments[i];
      const segB = allSegments[j];

      // Skip adjacent segments within the same stroke
      if (segA.strokeIndex === segB.strokeIndex) {
        if (Math.abs(segA.segmentIndex - segB.segmentIndex) <= skipSegments) {
          continue;
        }
      }

      const intersection = lineSegmentIntersectionWithinBounds(
        segA.line,
        segB.line,
        0.01 // Tighter tolerance for self-intersection
      );

      if (intersection) {
        intersectionCount++;
      }
    }
  }

  return intersectionCount;
}

/**
 * Check if multiple strokes' combined bounding box overlaps with any element.
 */
export function multiStrokeOverlapsElements(
  strokes: Stroke[],
  elements: Element[]
): boolean {
  // Compute combined bounding box of all strokes
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  let hasPoints = false;

  for (const stroke of strokes) {
    for (const input of stroke.inputs.inputs) {
      hasPoints = true;
      minX = Math.min(minX, input.x);
      minY = Math.min(minY, input.y);
      maxX = Math.max(maxX, input.x);
      maxY = Math.max(maxY, input.y);
    }
  }

  if (!hasPoints) {
    return false;
  }

  const combinedBounds: BoundingBox = {
    left: minX,
    top: minY,
    right: maxX,
    bottom: maxY,
  };

  for (const element of elements) {
    const elementBounds = getElementBounds(element);
    if (elementBounds && boundingBoxesIntersect(combinedBounds, elementBounds)) {
      return true;
    }
  }

  return false;
}

/**
 * Determine if multiple strokes together form a scribble-erase gesture.
 * This allows a scribble gesture to be detected even if the user briefly
 * lifts the stylus during the scribble motion.
 * Uses the weighted scoring system from scribble detection config.kt
 */
export function isMultiStrokeScribbleEraseGesture(
  strokes: Stroke[],
  elements: Element[],
  options: ScribbleDetectionOptions = {}
): boolean {
  const {
    skipNonAdjacentSegments = 2,
  } = options;

  if (strokes.length === 0) {
    debugLog.info('Scribble: ✗ NOT SCRIBBLE (no strokes)');
    return false;
  }

  // Combine all points from all strokes
  const allPoints = getMultiStrokePoints(strokes);

  // Must have enough points to classify (minimum point threshold)
  if (allPoints.length < 10) {
    debugLog.info(`Scribble: ✗ NOT SCRIBBLE (only ${allPoints.length} points, need 10+)`);
    return false;
  }

  // Check if combined strokes overlap any elements first (fast check)
  if (!multiStrokeOverlapsElements(strokes, elements)) {
    debugLog.info(`Scribble: ✗ NOT SCRIBBLE (no overlap with elements)`);
    return false;
  }

  // Count self-intersections across all strokes
  const selfIntersections = countMultiStrokeSelfIntersections(strokes, skipNonAdjacentSegments);

  // Calculate and log detailed score breakdown
  const breakdown = calculateScribbleScoreBreakdown(allPoints, selfIntersections);
  logScribbleScoreBreakdown(breakdown);

  return breakdown.isScribble;
}
