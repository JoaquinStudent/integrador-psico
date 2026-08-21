// Selection Intent types for lasso selection
// Represents a pending selection that the user can accept or dismiss

import type { Offset, BoundingBox, Stroke, Element } from '../types';

/**
 * Represents a lasso selection intent - a potential selection
 * that the user can confirm or dismiss via the overlay menu.
 */
export interface SelectionIntent {
  /** The lasso stroke(s) that created this intent */
  lassoStrokes: Stroke[];

  /** The ID of the stroke element created from the lasso strokes */
  lassoElementId: string;

  /** Points forming the lasso polygon (in canvas coordinates) */
  lassoPolygon: Offset[];

  /** Elements that are selected by the lasso */
  selectedElements: Element[];

  /** Bounding box of the lasso polygon */
  lassoBounds: BoundingBox;

  /** Timestamp when the intent was created */
  createdAt: number;
}

/**
 * Actions that can be performed on a selection intent.
 */
export type SelectionIntentAction = 'select' | 'delete' | 'dismiss';

/**
 * Create a selection intent from lasso data.
 */
export function createSelectionIntent(
  lassoStrokes: Stroke[],
  lassoElementId: string,
  lassoPolygon: Offset[],
  selectedElements: Element[],
  lassoBounds: BoundingBox
): SelectionIntent {
  return {
    lassoStrokes,
    lassoElementId,
    lassoPolygon,
    selectedElements,
    lassoBounds,
    createdAt: Date.now(),
  };
}

/**
 * Get the anchor point for the selection menu (top center of lasso bounds).
 */
export function getMenuAnchorPoint(intent: SelectionIntent): Offset {
  return {
    x: (intent.lassoBounds.left + intent.lassoBounds.right) / 2,
    y: intent.lassoBounds.top,
  };
}
