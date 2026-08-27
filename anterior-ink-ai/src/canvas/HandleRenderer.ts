// Handle Renderer - draws element handles on the canvas
//
// Renders handles with configurable appearance (shape, size, colors).
// Used by InkCanvas to draw handles on the overlay canvas.

import type { HandleDescriptor, HandleAppearance } from '../elements/registry/ElementPlugin';

/**
 * Default appearance for handles when not specified.
 */
const DEFAULT_APPEARANCE: Required<HandleAppearance> = {
  shape: 'circle',
  size: 8,
  fillColor: '#ffffff',
  strokeColor: '#333333',
  strokeWidth: 1,
  activeFillColor: '#0066ff',
};

/**
 * Render handles to a canvas context.
 *
 * @param ctx - Canvas 2D rendering context (should have viewport transform applied)
 * @param handles - Array of handle descriptors to render
 * @param activeHandleId - ID of the currently active (being dragged) handle, if any
 */
export function renderHandles(
  ctx: CanvasRenderingContext2D,
  handles: HandleDescriptor[],
  activeHandleId?: string
): void {
  for (const handle of handles) {
    const appearance = { ...DEFAULT_APPEARANCE, ...handle.appearance };
    const isActive = handle.id === activeHandleId;

    ctx.fillStyle = isActive ? appearance.activeFillColor : appearance.fillColor;
    ctx.strokeStyle = appearance.strokeColor;
    ctx.lineWidth = appearance.strokeWidth;

    const { x, y } = handle.position;
    const halfSize = appearance.size / 2;

    switch (appearance.shape) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(x, y, halfSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        break;

      case 'square':
        ctx.fillRect(x - halfSize, y - halfSize, appearance.size, appearance.size);
        ctx.strokeRect(x - halfSize, y - halfSize, appearance.size, appearance.size);
        break;

      case 'diamond':
        ctx.beginPath();
        ctx.moveTo(x, y - halfSize);
        ctx.lineTo(x + halfSize, y);
        ctx.lineTo(x, y + halfSize);
        ctx.lineTo(x - halfSize, y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
    }
  }
}
