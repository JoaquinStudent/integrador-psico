// Palette intent types
//
// Represents a pending palette menu triggered by rectangle+X gesture.

import type { Offset, BoundingBox } from '../types/primitives';
import type { Stroke } from '../types/brush';
import type { PaletteEntry } from './PaletteRegistry';
import { getPaletteEntries } from './PaletteRegistry';
import type { RectangleXResult } from '../geometry/rectangleXDetection';

export interface PaletteIntent {
  entries: PaletteEntry[];
  rectangleBounds: BoundingBox;
  anchorPoint: Offset;
  pendingStrokes: Stroke[];
  createdAt: number;
}

export type PaletteAction = 'select' | 'dismiss';

export function createPaletteIntent(result: RectangleXResult): PaletteIntent {
  return {
    entries: getPaletteEntries(),
    rectangleBounds: result.rectangleBounds,
    anchorPoint: result.anchorPoint,
    pendingStrokes: [...result.allStrokes],
    createdAt: Date.now(),
  };
}
