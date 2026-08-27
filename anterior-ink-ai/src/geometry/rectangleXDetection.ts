// Rectangle+X gesture detection
//
// Detects a rectangle (1-4 strokes) followed by an X (2 strokes) drawn inside it.
// Returns detection result with bounds and anchor point for palette menu positioning.

import type { Stroke } from '../types/brush';
import type { Offset, BoundingBox } from '../types/primitives';
import { boundingBoxFromOffsets } from '../types/primitives';
import { extractFeatures, classifyShapeWithAlternatives } from './shapeRecognition';
import { lineSegmentIntersectionWithinBounds, lineLength } from './lineIntersection';
import type { Line } from './lineIntersection';
import { getStrokeEndTime, getStrokeStartTime } from '../types/brush';
import { rdpSimplify, pathLength } from './cornerDetection';
import { debugLog } from '../debug/DebugLogger';

export interface RectangleXResult {
  rectangleStrokes: Stroke[];
  xStrokes: Stroke[];
  rectangleBounds: BoundingBox;
  allStrokes: Stroke[];
  anchorPoint: Offset;
}

/**
 * Maximum time gap between the two X strokes (milliseconds).
 */
const X_TEMPORAL_THRESHOLD_MS = 3000;

/**
 * Minimum span of each X stroke relative to the rectangle's shorter dimension.
 */
const MIN_X_SPAN_RATIO = 0.30;

/**
 * Minimum confidence for rectangle classification.
 */
const MIN_RECT_CONFIDENCE = 0.70;

/**
 * Maximum straightness deviation for X strokes.
 * Ratio of path length to endpoint distance — closer to 1.0 means straighter.
 */
const MIN_STRAIGHTNESS = 0.85;

/**
 * Last rejection reason from detectRectangleX (for debugging).
 */
export let lastRectXRejection = '';

function reject(reason: string): null {
  lastRectXRejection = reason;
  return null;
}

/**
 * Check if a stroke is roughly straight (ratio of endpoint distance to path length).
 */
function isStraightStroke(stroke: Stroke): boolean {
  const points = stroke.inputs.inputs.map(i => ({ x: i.x, y: i.y }));
  if (points.length < 2) return false;

  const simplified = rdpSimplify(points, 3);
  const totalLength = pathLength(simplified);
  if (totalLength < 5) return false;

  const endpointDist = Math.sqrt(
    (points[0].x - points[points.length - 1].x) ** 2 +
    (points[0].y - points[points.length - 1].y) ** 2
  );

  return (endpointDist / totalLength) >= MIN_STRAIGHTNESS;
}

/**
 * Convert a stroke to a line segment (start → end).
 */
function strokeToLine(stroke: Stroke): Line {
  const inputs = stroke.inputs.inputs;
  return {
    start: { x: inputs[0].x, y: inputs[0].y },
    end: { x: inputs[inputs.length - 1].x, y: inputs[inputs.length - 1].y },
  };
}

/**
 * Compute bounding box from strokes.
 */
function computeStrokeBounds(strokes: Stroke[]): BoundingBox | null {
  const points: Offset[] = [];
  for (const stroke of strokes) {
    for (const input of stroke.inputs.inputs) {
      points.push({ x: input.x, y: input.y });
    }
  }
  return boundingBoxFromOffsets(points);
}

/**
 * Check if a point is inside a bounding box (with tolerance).
 */
function isInsideBounds(point: Offset, bounds: BoundingBox, tolerance: number = 0): boolean {
  return (
    point.x >= bounds.left - tolerance &&
    point.x <= bounds.right + tolerance &&
    point.y >= bounds.top - tolerance &&
    point.y <= bounds.bottom + tolerance
  );
}

/**
 * Detect rectangle+X gesture from an array of strokes.
 *
 * Algorithm:
 * 1. Need 3-6 strokes total. Last 2 are candidate X diagonals; preceding 1-4 are candidate rectangle.
 * 2. Rectangle validation: classify as rectangle with confidence >= 0.70.
 * 3. X validation: both strokes straight, intersect each other, intersection inside rectangle,
 *    each stroke spans >= 30% of rectangle's shorter dimension.
 * 4. Temporal check: X strokes within 3 seconds of each other.
 */
export function detectRectangleX(strokes: Stroke[]): RectangleXResult | null {
  debugLog.info('[RectX] detectRectangleX called', { strokeCount: strokes.length });
  lastRectXRejection = '';

  if (strokes.length < 3 || strokes.length > 6) {
    debugLog.info('[RectX] REJECTED - stroke count out of range', { count: strokes.length, required: '3-6' });
    return reject(`stroke count ${strokes.length} out of range 3-6`);
  }

  const xStroke1 = strokes[strokes.length - 2];
  const xStroke2 = strokes[strokes.length - 1];
  const rectStrokes = strokes.slice(0, strokes.length - 2);

  if (rectStrokes.length < 1 || rectStrokes.length > 4) {
    debugLog.info('[RectX] REJECTED - rect stroke count out of range', { count: rectStrokes.length, required: '1-4' });
    return reject(`rect stroke count ${rectStrokes.length} out of range 1-4`);
  }

  /* Temporal check: X strokes must be recent relative to each other */
  const x1End = getStrokeEndTime(xStroke1);
  const x2Start = getStrokeStartTime(xStroke2);
  const xTemporalGap = x2Start - x1End;
  if (xTemporalGap > X_TEMPORAL_THRESHOLD_MS) {
    debugLog.info('[RectX] REJECTED - X strokes too far apart', { gapMs: xTemporalGap, maxMs: X_TEMPORAL_THRESHOLD_MS });
    return reject(`X temporal gap ${xTemporalGap}ms > ${X_TEMPORAL_THRESHOLD_MS}ms`);
  }

  /* Validate X strokes are straight */
  const x1Straight = isStraightStroke(xStroke1);
  const x2Straight = isStraightStroke(xStroke2);
  if (!x1Straight || !x2Straight) {
    debugLog.info('[RectX] REJECTED - X strokes not straight', { x1Straight, x2Straight });
    return reject(`X strokes not straight (x1=${x1Straight}, x2=${x2Straight})`);
  }

  /* Validate rectangle */
  const features = extractFeatures(rectStrokes);
  if (!features) {
    debugLog.info('[RectX] REJECTED - could not extract features from rect strokes');
    return reject('could not extract features from rect strokes');
  }

  const candidates = classifyShapeWithAlternatives(features);
  const rectCandidate = candidates.find(c => c.shape === 'rectangle');
  const bestShape = candidates[0]?.shape ?? 'none';
  const bestConf = candidates[0]?.confidence?.toFixed(2) ?? 'N/A';
  debugLog.info('[RectX] Rectangle classification', {
    bestShape,
    bestConfidence: bestConf,
    rectConfidence: rectCandidate?.confidence?.toFixed(2) ?? 'N/A',
    corners: features.corners.length,
    isClosed: features.isClosed,
    closureGapRatio: features.closureGapRatio.toFixed(3),
    requiredShape: 'rectangle',
    requiredConfidence: MIN_RECT_CONFIDENCE,
    allCandidates: candidates.map(c => `${c.shape}(${c.confidence.toFixed(2)})`),
  });
  if (!rectCandidate || rectCandidate.confidence < MIN_RECT_CONFIDENCE) {
    debugLog.info('[RectX] REJECTED - rectangle not viable among candidates');
    return reject(`classified as ${bestShape}(${bestConf}), rectConf=${rectCandidate?.confidence?.toFixed(2) ?? 'none'}, corners=${features.corners.length}, closed=${features.isClosed}, gapRatio=${features.closureGapRatio.toFixed(3)}`);
  }

  const rectBounds = computeStrokeBounds(rectStrokes);
  if (!rectBounds) {
    debugLog.info('[RectX] REJECTED - could not compute rect bounds');
    return reject('could not compute rect bounds');
  }

  /* X intersection check */
  const line1 = strokeToLine(xStroke1);
  const line2 = strokeToLine(xStroke2);

  const intersection = lineSegmentIntersectionWithinBounds(line1, line2, 0.2);
  if (!intersection) {
    debugLog.info('[RectX] REJECTED - X strokes do not intersect');
    return reject('X strokes do not intersect');
  }

  /* Intersection must be inside rectangle bounds (with some tolerance) */
  const tolerance = Math.min(
    rectBounds.right - rectBounds.left,
    rectBounds.bottom - rectBounds.top
  ) * 0.15;

  if (!isInsideBounds(intersection, rectBounds, tolerance)) {
    debugLog.info('[RectX] REJECTED - X intersection outside rect bounds', {
      intersection,
      rectBounds,
      tolerance: tolerance.toFixed(1),
    });
    return reject('X intersection outside rect bounds');
  }

  /* Each X stroke must span >= 30% of rectangle's shorter dimension */
  const rectWidth = rectBounds.right - rectBounds.left;
  const rectHeight = rectBounds.bottom - rectBounds.top;
  const shorterDim = Math.min(rectWidth, rectHeight);

  const line1Length = lineLength(line1);
  const line2Length = lineLength(line2);

  if (line1Length < shorterDim * MIN_X_SPAN_RATIO || line2Length < shorterDim * MIN_X_SPAN_RATIO) {
    debugLog.info('[RectX] REJECTED - X strokes too short', {
      line1Length: line1Length.toFixed(1),
      line2Length: line2Length.toFixed(1),
      minRequired: (shorterDim * MIN_X_SPAN_RATIO).toFixed(1),
      shorterDim: shorterDim.toFixed(1),
    });
    return reject(`X strokes too short (${line1Length.toFixed(0)}, ${line2Length.toFixed(0)} < ${(shorterDim * MIN_X_SPAN_RATIO).toFixed(0)})`);
  }

  debugLog.info('[RectX] SUCCESS - rectangle+X detected', {
    rectStrokes: rectStrokes.length,
    rectBounds,
  });

  const allStrokes = [...rectStrokes, xStroke1, xStroke2];
  const anchorPoint: Offset = {
    x: (rectBounds.left + rectBounds.right) / 2,
    y: rectBounds.top,
  };

  return {
    rectangleStrokes: rectStrokes,
    xStrokes: [xStroke1, xStroke2],
    rectangleBounds: rectBounds,
    allStrokes,
    anchorPoint,
  };
}
