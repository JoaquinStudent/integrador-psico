// Arrow detection algorithms for CoordinatePlane element creation
//
// Detects arrow strokes and matches them to form a coordinate plane

import type { Stroke, Offset } from '../../types';
import { debugLog } from '../../debug/DebugLogger';

// Arrow detection thresholds
const MIN_ARROW_LENGTH = 80;
const MAX_ARROW_LENGTH = 600;
const MIN_POINTS_PER_STROKE = 10;

// Arrowhead detection parameters
const ARROWHEAD_PORTION = 0.20; // Look at last 20% of points for arrowhead
const MIN_ARROWHEAD_POINTS = 3;
const ARROWHEAD_ANGLE_THRESHOLD = Math.PI / 6; // 30 degrees divergence from main direction

// Direction classification (30 degrees from axis)
const DIRECTION_THRESHOLD = Math.PI / 6;

// Arrow matching thresholds
const TAIL_PROXIMITY_THRESHOLD = 30; // pixels
const CENTER_INTERSECTION_LENGTH_TOLERANCE = 0.15; // 15% length difference allowed
const CENTER_INTERSECTION_POSITION_TOLERANCE = 0.40; // Must intersect within middle 40% of each arrow

export type ArrowDirection = 'right' | 'left' | 'up' | 'down';
export type ArrowOrientation = 'horizontal' | 'vertical';

export interface DetectedArrow {
  stroke: Stroke;
  tail: Offset;        // Starting point (no arrowhead)
  head: Offset;        // Ending point (with arrowhead)
  direction: ArrowDirection;
  orientation: ArrowOrientation;
  length: number;
  confidence: number;
}

export interface ArrowMatchResult {
  horizontalArrow: DetectedArrow;
  verticalArrow: DetectedArrow;
  origin: Offset;
  confidence: number;
  method: 'tail_proximity' | 'center_intersection';
}

/**
 * Simplify points using Ramer-Douglas-Peucker algorithm.
 */
function rdpSimplify(points: Offset[], epsilon: number): Offset[] {
  if (points.length < 3) return points;

  // Find the point with the maximum distance from the line between first and last
  let maxDist = 0;
  let maxIndex = 0;

  const start = points[0];
  const end = points[points.length - 1];

  for (let i = 1; i < points.length - 1; i++) {
    const dist = perpendicularDistance(points[i], start, end);
    if (dist > maxDist) {
      maxDist = dist;
      maxIndex = i;
    }
  }

  // If max distance is greater than epsilon, recursively simplify
  if (maxDist > epsilon) {
    const left = rdpSimplify(points.slice(0, maxIndex + 1), epsilon);
    const right = rdpSimplify(points.slice(maxIndex), epsilon);
    return [...left.slice(0, -1), ...right];
  } else {
    return [start, end];
  }
}

/**
 * Calculate perpendicular distance from point to line.
 */
function perpendicularDistance(point: Offset, lineStart: Offset, lineEnd: Offset): number {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared === 0) {
    return distance(point, lineStart);
  }

  const t = Math.max(0, Math.min(1,
    ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / lengthSquared
  ));

  const projX = lineStart.x + t * dx;
  const projY = lineStart.y + t * dy;

  return distance(point, { x: projX, y: projY });
}

/**
 * Calculate distance between two points.
 */
function distance(p1: Offset, p2: Offset): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate angle from p1 to p2 in radians.
 */
function angle(p1: Offset, p2: Offset): number {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

/**
 * Get the main direction of a stroke (from first to last point).
 */
function getMainDirection(points: Offset[]): number {
  if (points.length < 2) return 0;
  return angle(points[0], points[points.length - 1]);
}

/**
 * Check if there's an arrowhead at the end of the stroke.
 * Arrowhead is detected by looking for V-pattern (diverging from main direction).
 */
function detectArrowhead(points: Offset[]): { hasArrowhead: boolean; confidence: number } {
  if (points.length < 5) return { hasArrowhead: false, confidence: 0 };

  const mainDir = getMainDirection(points);
  const numArrowheadPoints = Math.max(MIN_ARROWHEAD_POINTS, Math.floor(points.length * ARROWHEAD_PORTION));
  const arrowheadStartIndex = points.length - numArrowheadPoints;

  // Look for direction changes in the last portion
  let divergenceCount = 0;
  let totalDivergence = 0;

  for (let i = arrowheadStartIndex; i < points.length - 1; i++) {
    const segmentDir = angle(points[i], points[i + 1]);
    const angleDiff = Math.abs(normalizeAngle(segmentDir - mainDir));

    if (angleDiff > ARROWHEAD_ANGLE_THRESHOLD) {
      divergenceCount++;
      totalDivergence += angleDiff;
    }
  }

  // Need some divergence in the arrowhead region
  const hasArrowhead = divergenceCount >= 2;
  const confidence = hasArrowhead ? Math.min(1, totalDivergence / (Math.PI / 2)) : 0;

  return { hasArrowhead, confidence };
}

/**
 * Normalize angle to [-PI, PI].
 */
function normalizeAngle(angle: number): number {
  while (angle > Math.PI) angle -= 2 * Math.PI;
  while (angle < -Math.PI) angle += 2 * Math.PI;
  return angle;
}

/**
 * Classify direction based on angle.
 */
function classifyDirection(angleRad: number): { direction: ArrowDirection; orientation: ArrowOrientation } | null {
  const normalized = normalizeAngle(angleRad);

  // Right: angle close to 0
  if (Math.abs(normalized) < DIRECTION_THRESHOLD) {
    return { direction: 'right', orientation: 'horizontal' };
  }
  // Left: angle close to PI or -PI
  if (Math.abs(Math.abs(normalized) - Math.PI) < DIRECTION_THRESHOLD) {
    return { direction: 'left', orientation: 'horizontal' };
  }
  // Down: angle close to PI/2
  if (Math.abs(normalized - Math.PI / 2) < DIRECTION_THRESHOLD) {
    return { direction: 'down', orientation: 'vertical' };
  }
  // Up: angle close to -PI/2
  if (Math.abs(normalized + Math.PI / 2) < DIRECTION_THRESHOLD) {
    return { direction: 'up', orientation: 'vertical' };
  }

  return null;
}

/**
 * Detect if a stroke is an arrow and extract its properties.
 */
export function detectArrow(stroke: Stroke, strokeIndex: number = 0): DetectedArrow | null {
  const inputs = stroke.inputs.inputs;

  debugLog.info(`[CoordPlane] Analyzing stroke ${strokeIndex}`, {
    pointCount: inputs.length,
    minRequired: MIN_POINTS_PER_STROKE,
  });

  if (inputs.length < MIN_POINTS_PER_STROKE) {
    debugLog.info(`[CoordPlane] Stroke ${strokeIndex}: REJECTED - not enough points`, {
      count: inputs.length,
      required: MIN_POINTS_PER_STROKE
    });
    return null;
  }

  const points: Offset[] = inputs.map(input => ({ x: input.x, y: input.y }));

  // Simplify the stroke to remove noise (used for better direction detection)
  const _simplified = rdpSimplify(points, 3);
  void _simplified; // Reserved for future use in improved direction detection

  // Calculate stroke length
  const strokeStart = points[0];
  const strokeEnd = points[points.length - 1];
  const strokeLength = distance(strokeStart, strokeEnd);

  debugLog.info(`[CoordPlane] Stroke ${strokeIndex}: geometry`, {
    start: `(${strokeStart.x.toFixed(0)}, ${strokeStart.y.toFixed(0)})`,
    end: `(${strokeEnd.x.toFixed(0)}, ${strokeEnd.y.toFixed(0)})`,
    length: strokeLength.toFixed(0),
    minLength: MIN_ARROW_LENGTH,
    maxLength: MAX_ARROW_LENGTH,
  });

  if (strokeLength < MIN_ARROW_LENGTH || strokeLength > MAX_ARROW_LENGTH) {
    debugLog.info(`[CoordPlane] Stroke ${strokeIndex}: REJECTED - invalid length`, {
      length: strokeLength.toFixed(0),
      min: MIN_ARROW_LENGTH,
      max: MAX_ARROW_LENGTH
    });
    return null;
  }

  // Get main direction
  const mainDir = getMainDirection(points);
  const mainDirDegrees = mainDir * 180 / Math.PI;
  const thresholdDegrees = DIRECTION_THRESHOLD * 180 / Math.PI;

  debugLog.info(`[CoordPlane] Stroke ${strokeIndex}: direction analysis`, {
    angleDegrees: mainDirDegrees.toFixed(1),
    angleRadians: mainDir.toFixed(3),
    thresholdDegrees: thresholdDegrees.toFixed(1),
    note: 'Right=0°, Up=-90°, Left=±180°, Down=90°',
  });

  const directionInfo = classifyDirection(mainDir);

  if (!directionInfo) {
    debugLog.info(`[CoordPlane] Stroke ${strokeIndex}: REJECTED - not aligned to axis`, {
      angleDegrees: mainDirDegrees.toFixed(1),
      threshold: thresholdDegrees.toFixed(1),
      hint: `Need within ${thresholdDegrees.toFixed(0)}° of 0° (right), -90° (up), ±180° (left), or 90° (down)`,
    });
    return null;
  }

  // Detect arrowhead
  const arrowheadResult = detectArrowhead(points);

  // For now, be lenient about arrowhead detection since users might draw
  // arrows without a clear arrowhead. Use direction of stroke to determine head/tail.
  // Arrow points in the direction from first to last point
  const tail: Offset = strokeStart;
  const head: Offset = strokeEnd;

  const confidence = arrowheadResult.hasArrowhead ? 0.9 : 0.7;

  debugLog.info(`[CoordPlane] Stroke ${strokeIndex}: ACCEPTED as arrow`, {
    direction: directionInfo.direction,
    orientation: directionInfo.orientation,
    length: strokeLength.toFixed(0),
    tail: `(${tail.x.toFixed(0)}, ${tail.y.toFixed(0)})`,
    head: `(${head.x.toFixed(0)}, ${head.y.toFixed(0)})`,
    hasArrowhead: arrowheadResult.hasArrowhead,
    confidence: confidence.toFixed(2),
  });

  return {
    stroke,
    tail,
    head,
    direction: directionInfo.direction,
    orientation: directionInfo.orientation,
    length: strokeLength,
    confidence,
  };
}

/**
 * Try to match two arrows using tail proximity method.
 * Arrows should have tails close together, forming the origin.
 */
function matchByTailProximity(
  horizontalArrow: DetectedArrow,
  verticalArrow: DetectedArrow
): ArrowMatchResult | null {
  const tailDistance = distance(horizontalArrow.tail, verticalArrow.tail);

  debugLog.info('[CoordPlane] Trying tail proximity match', {
    hTail: `(${horizontalArrow.tail.x.toFixed(0)}, ${horizontalArrow.tail.y.toFixed(0)})`,
    vTail: `(${verticalArrow.tail.x.toFixed(0)}, ${verticalArrow.tail.y.toFixed(0)})`,
    tailDistance: tailDistance.toFixed(0),
    threshold: TAIL_PROXIMITY_THRESHOLD,
    pass: tailDistance <= TAIL_PROXIMITY_THRESHOLD,
  });

  if (tailDistance > TAIL_PROXIMITY_THRESHOLD) {
    return null;
  }

  // Origin is midpoint of tails
  const origin: Offset = {
    x: (horizontalArrow.tail.x + verticalArrow.tail.x) / 2,
    y: (horizontalArrow.tail.y + verticalArrow.tail.y) / 2,
  };

  return {
    horizontalArrow,
    verticalArrow,
    origin,
    confidence: 0.95,
    method: 'tail_proximity',
  };
}

/**
 * Find intersection point of two lines.
 */
function lineIntersection(
  p1: Offset, p2: Offset,
  p3: Offset, p4: Offset
): Offset | null {
  const d1x = p2.x - p1.x;
  const d1y = p2.y - p1.y;
  const d2x = p4.x - p3.x;
  const d2y = p4.y - p3.y;

  const denominator = d1x * d2y - d1y * d2x;

  if (Math.abs(denominator) < 1e-10) {
    return null; // Parallel
  }

  const t1 = ((p3.x - p1.x) * d2y - (p3.y - p1.y) * d2x) / denominator;
  const t2 = ((p3.x - p1.x) * d1y - (p3.y - p1.y) * d1x) / denominator;

  // Check if intersection is within both segments (with tolerance for middle portion)
  const minT = (1 - CENTER_INTERSECTION_POSITION_TOLERANCE) / 2;
  const maxT = 1 - minT;

  if (t1 >= minT && t1 <= maxT && t2 >= minT && t2 <= maxT) {
    return {
      x: p1.x + t1 * d1x,
      y: p1.y + t1 * d1y,
    };
  }

  return null;
}

/**
 * Try to match two arrows using center intersection method.
 * Arrows should cross near their centers with similar lengths.
 */
function matchByCenterIntersection(
  horizontalArrow: DetectedArrow,
  verticalArrow: DetectedArrow
): ArrowMatchResult | null {
  // Check length similarity
  const lengthRatio = Math.min(horizontalArrow.length, verticalArrow.length) /
    Math.max(horizontalArrow.length, verticalArrow.length);

  debugLog.info('[CoordPlane] Trying center intersection match', {
    hLength: horizontalArrow.length.toFixed(0),
    vLength: verticalArrow.length.toFixed(0),
    lengthRatio: lengthRatio.toFixed(2),
    minRatio: (1 - CENTER_INTERSECTION_LENGTH_TOLERANCE).toFixed(2),
    lengthPass: lengthRatio >= 1 - CENTER_INTERSECTION_LENGTH_TOLERANCE,
  });

  if (lengthRatio < 1 - CENTER_INTERSECTION_LENGTH_TOLERANCE) {
    debugLog.info('[CoordPlane] Center intersection: FAILED - length ratio too different');
    return null;
  }

  // Find intersection
  const intersection = lineIntersection(
    horizontalArrow.tail, horizontalArrow.head,
    verticalArrow.tail, verticalArrow.head
  );

  if (!intersection) {
    debugLog.info('[CoordPlane] Center intersection: FAILED - no intersection in middle portion');
    return null;
  }

  debugLog.info('[CoordPlane] Center intersection: SUCCESS', {
    intersection: `(${intersection.x.toFixed(0)}, ${intersection.y.toFixed(0)})`,
  });

  return {
    horizontalArrow,
    verticalArrow,
    origin: intersection,
    confidence: 0.90,
    method: 'center_intersection',
  };
}

/**
 * Try to match two arrows to form a coordinate plane.
 * Requires one horizontal arrow pointing right and one vertical arrow pointing up.
 */
export function matchArrows(arrows: DetectedArrow[]): ArrowMatchResult | null {
  // Find horizontal arrows pointing right
  const rightArrows = arrows.filter(a => a.direction === 'right');
  // Find vertical arrows pointing up
  const upArrows = arrows.filter(a => a.direction === 'up');

  // Log all detected arrows for debugging
  debugLog.info('[CoordPlane] Detected arrows summary', {
    total: arrows.length,
    directions: arrows.map(a => a.direction).join(', '),
  });

  debugLog.info('[CoordPlane] Arrow filtering for coordinate plane', {
    rightArrows: rightArrows.length,
    upArrows: upArrows.length,
    requirement: 'Need 1 right-pointing AND 1 up-pointing arrow',
  });

  if (rightArrows.length === 0 || upArrows.length === 0) {
    const missing = [];
    if (rightArrows.length === 0) missing.push('right-pointing (X axis)');
    if (upArrows.length === 0) missing.push('up-pointing (Y axis)');
    debugLog.info('[CoordPlane] FAILED - missing required arrows', {
      missing: missing.join(' and '),
      detected: arrows.map(a => `${a.direction} (${a.orientation})`).join(', ') || 'none',
    });
    return null;
  }

  // Try all combinations of right and up arrows
  for (const hArrow of rightArrows) {
    for (const vArrow of upArrows) {
      debugLog.info('[CoordPlane] Attempting to match arrows');

      // Try tail proximity first (higher confidence)
      const tailMatch = matchByTailProximity(hArrow, vArrow);
      if (tailMatch) {
        debugLog.info('[CoordPlane] SUCCESS - matched via tail proximity');
        return tailMatch;
      }

      // Try center intersection
      const centerMatch = matchByCenterIntersection(hArrow, vArrow);
      if (centerMatch) {
        debugLog.info('[CoordPlane] SUCCESS - matched via center intersection');
        return centerMatch;
      }
    }
  }

  debugLog.info('[CoordPlane] FAILED - arrows detected but no valid spatial match found');
  return null;
}

/**
 * Detect arrows in strokes and try to match them for coordinate plane creation.
 */
export function detectAndMatchArrows(strokes: Stroke[]): ArrowMatchResult | null {
  debugLog.info('[CoordPlane] ========== Starting arrow detection ==========');
  debugLog.info('[CoordPlane] Input strokes', { count: strokes.length });

  if (strokes.length !== 2) {
    debugLog.info('[CoordPlane] REJECTED - need exactly 2 strokes', { count: strokes.length });
    return null;
  }

  const arrows: DetectedArrow[] = [];

  for (let i = 0; i < strokes.length; i++) {
    const arrow = detectArrow(strokes[i], i);
    if (arrow) {
      arrows.push(arrow);
    }
  }

  debugLog.info('[CoordPlane] Arrow detection complete', {
    inputStrokes: strokes.length,
    detectedArrows: arrows.length,
  });

  if (arrows.length !== 2) {
    debugLog.info('[CoordPlane] REJECTED - could not detect 2 arrows from strokes', {
      detected: arrows.length,
      required: 2
    });
    return null;
  }

  return matchArrows(arrows);
}
