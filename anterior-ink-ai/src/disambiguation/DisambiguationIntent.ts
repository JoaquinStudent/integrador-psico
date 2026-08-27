// Disambiguation intent types and helpers
// Used when multiple element types are viable candidates for the same strokes

import type { Offset, BoundingBox } from '../types/primitives';
import type { Stroke } from '../types/brush';
import type { ShapeType } from '../geometry/shapeRecognition';
import { boundingBoxFromOffsets } from '../types/primitives';

/**
 * A candidate element type that could be created from the strokes.
 */
export interface DisambiguationCandidate {
  label: string;          // Human-readable name: "Circle", "Hexagon", "Text: Hello", etc.
  elementType: string;    // 'shape' | 'inktext' | 'tictactoe'
  shapeType?: ShapeType;  // Only used when elementType is 'shape'
  confidence: number;     // Confidence score (0-1)
  icon: string;           // Icon identifier (ShapeType for shapes, 'inktext'/'tictactoe' for others)
}

/**
 * The intent to show a disambiguation menu for the user to choose
 * between multiple viable element types.
 */
export interface DisambiguationIntent {
  candidates: DisambiguationCandidate[];
  pendingStrokes: Stroke[];
  anchorPoint: Offset;   // Top-center of stroke bounds for menu positioning
  createdAt: number;     // Timestamp for timeout handling
}

/**
 * Actions the user can take on the disambiguation menu.
 */
export type DisambiguationAction = 'select' | 'dismiss';

/**
 * Confidence threshold: if the gap between best and second-best candidates
 * is less than this value, show the disambiguation menu.
 */
export const DISAMBIGUATION_THRESHOLD = 0.10;

/**
 * Minimum confidence for a candidate to be shown in the menu.
 */
export const MIN_CANDIDATE_CONFIDENCE = 0.60;

/**
 * Compute the anchor point for the disambiguation menu from stroke bounds.
 * Returns the top-center point of the strokes' bounding box.
 */
export function computeAnchorPoint(strokes: Stroke[]): Offset {
  const allPoints: Offset[] = [];
  for (const stroke of strokes) {
    for (const input of stroke.inputs.inputs) {
      allPoints.push({ x: input.x, y: input.y });
    }
  }

  const bounds = boundingBoxFromOffsets(allPoints);
  if (!bounds) {
    // Fallback to first point if no bounds can be computed
    if (allPoints.length > 0) {
      return allPoints[0];
    }
    return { x: 0, y: 0 };
  }

  // Return top-center of bounds
  return {
    x: (bounds.left + bounds.right) / 2,
    y: bounds.top,
  };
}

/**
 * Get the bounding box of the strokes.
 */
export function getStrokesBounds(strokes: Stroke[]): BoundingBox | null {
  const allPoints: Offset[] = [];
  for (const stroke of strokes) {
    for (const input of stroke.inputs.inputs) {
      allPoints.push({ x: input.x, y: input.y });
    }
  }
  return boundingBoxFromOffsets(allPoints);
}

/**
 * Create a disambiguation intent from candidates and strokes.
 */
export function createDisambiguationIntent(
  candidates: DisambiguationCandidate[],
  strokes: Stroke[]
): DisambiguationIntent {
  return {
    candidates,
    pendingStrokes: strokes,
    anchorPoint: computeAnchorPoint(strokes),
    createdAt: Date.now(),
  };
}

/**
 * Check if candidates need disambiguation (i.e., multiple viable options with close confidence).
 * Returns true if there are 2+ candidates and the confidence gap is below the threshold.
 */
export function needsDisambiguation(candidates: DisambiguationCandidate[]): boolean {
  if (candidates.length < 2) {
    return false;
  }

  // Sort by confidence descending
  const sorted = [...candidates].sort((a, b) => b.confidence - a.confidence);

  // Check if the gap between best and second-best is below threshold
  const gap = sorted[0].confidence - sorted[1].confidence;
  return gap < DISAMBIGUATION_THRESHOLD;
}

/**
 * Get the shape label for display.
 */
export function getShapeLabel(shapeType: ShapeType): string {
  switch (shapeType) {
    case 'circle': return 'Circle';
    case 'rectangle': return 'Rectangle';
    case 'triangle': return 'Triangle';
    case 'pentagon': return 'Pentagon';
    case 'hexagon': return 'Hexagon';
    case 'octagon': return 'Octagon';
    default: return shapeType;
  }
}
