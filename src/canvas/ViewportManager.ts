// Viewport management for pan/zoom

import type { Offset, Matrix } from '../types';
import { createTranslationMatrix, createScaleMatrix, multiplyMatrices } from '../types';

export interface Viewport {
  // Current pan offset (in screen pixels)
  panX: number;
  panY: number;
  // Current zoom level (1.0 = 100%)
  zoom: number;
}

export const DEFAULT_VIEWPORT: Viewport = {
  panX: 0,
  panY: 0,
  zoom: 1.0,
};

export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 10.0;
export const ZOOM_SENSITIVITY = 0.001;

// Convert screen coordinates to canvas coordinates
export function screenToCanvas(viewport: Viewport, screenPoint: Offset): Offset {
  return {
    x: (screenPoint.x - viewport.panX) / viewport.zoom,
    y: (screenPoint.y - viewport.panY) / viewport.zoom,
  };
}

// Convert canvas coordinates to screen coordinates
export function canvasToScreen(viewport: Viewport, canvasPoint: Offset): Offset {
  return {
    x: canvasPoint.x * viewport.zoom + viewport.panX,
    y: canvasPoint.y * viewport.zoom + viewport.panY,
  };
}

// Get the transformation matrix for rendering
export function getViewportMatrix(viewport: Viewport): Matrix {
  const translate = createTranslationMatrix(viewport.panX, viewport.panY);
  const scale = createScaleMatrix(viewport.zoom, viewport.zoom);
  return multiplyMatrices(translate, scale);
}

// Apply viewport transform to canvas context
export function applyViewportToContext(
  ctx: CanvasRenderingContext2D,
  viewport: Viewport
): void {
  ctx.setTransform(viewport.zoom, 0, 0, viewport.zoom, viewport.panX, viewport.panY);
}

// Reset canvas context transform
export function resetContextTransform(ctx: CanvasRenderingContext2D): void {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

// Pan the viewport
export function panViewport(viewport: Viewport, deltaX: number, deltaY: number): Viewport {
  return {
    ...viewport,
    panX: viewport.panX + deltaX,
    panY: viewport.panY + deltaY,
  };
}

// Zoom the viewport around a point (in screen coordinates)
export function zoomViewport(
  viewport: Viewport,
  zoomDelta: number,
  centerX: number,
  centerY: number
): Viewport {
  const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, viewport.zoom * (1 + zoomDelta)));

  // Adjust pan to keep the zoom center point stationary
  const zoomRatio = newZoom / viewport.zoom;
  const newPanX = centerX - (centerX - viewport.panX) * zoomRatio;
  const newPanY = centerY - (centerY - viewport.panY) * zoomRatio;

  return {
    panX: newPanX,
    panY: newPanY,
    zoom: newZoom,
  };
}

// Set zoom level around a point
export function setZoomLevel(
  viewport: Viewport,
  newZoom: number,
  centerX: number,
  centerY: number
): Viewport {
  const clampedZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));
  const zoomRatio = clampedZoom / viewport.zoom;
  const newPanX = centerX - (centerX - viewport.panX) * zoomRatio;
  const newPanY = centerY - (centerY - viewport.panY) * zoomRatio;

  return {
    panX: newPanX,
    panY: newPanY,
    zoom: clampedZoom,
  };
}

// Fit content bounds to viewport
export function fitToContent(
  viewport: Viewport,
  contentBounds: { left: number; top: number; right: number; bottom: number },
  canvasWidth: number,
  canvasHeight: number,
  padding: number = 50
): Viewport {
  const contentWidth = contentBounds.right - contentBounds.left;
  const contentHeight = contentBounds.bottom - contentBounds.top;

  if (contentWidth <= 0 || contentHeight <= 0) {
    return viewport;
  }

  const availableWidth = canvasWidth - padding * 2;
  const availableHeight = canvasHeight - padding * 2;

  const scaleX = availableWidth / contentWidth;
  const scaleY = availableHeight / contentHeight;
  const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Math.min(scaleX, scaleY)));

  const contentCenterX = (contentBounds.left + contentBounds.right) / 2;
  const contentCenterY = (contentBounds.top + contentBounds.bottom) / 2;

  const newPanX = canvasWidth / 2 - contentCenterX * newZoom;
  const newPanY = canvasHeight / 2 - contentCenterY * newZoom;

  return {
    panX: newPanX,
    panY: newPanY,
    zoom: newZoom,
  };
}

// Get visible bounds in canvas coordinates
export function getVisibleBounds(
  viewport: Viewport,
  canvasWidth: number,
  canvasHeight: number
): { left: number; top: number; right: number; bottom: number } {
  const topLeft = screenToCanvas(viewport, { x: 0, y: 0 });
  const bottomRight = screenToCanvas(viewport, { x: canvasWidth, y: canvasHeight });

  return {
    left: topLeft.x,
    top: topLeft.y,
    right: bottomRight.x,
    bottom: bottomRight.y,
  };
}
