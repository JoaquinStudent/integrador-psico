// Polygon utilities

import type { Offset, Quad, BoundingBox } from '../types';

/**
 * Check if a point is inside a polygon using ray casting algorithm.
 */
export function pointInPolygon(point: Offset, polygon: Offset[]): boolean {
  if (polygon.length < 3) return false;

  let inside = false;
  const n = polygon.length;

  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;

    if (
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi
    ) {
      inside = !inside;
    }
  }

  return inside;
}

/**
 * Check if a point is inside a quad.
 */
export function pointInQuad(point: Offset, quad: Quad): boolean {
  const polygon = [quad.topLeft, quad.topRight, quad.bottomRight, quad.bottomLeft];
  return pointInPolygon(point, polygon);
}

/**
 * Check if a bounding box is completely inside a polygon.
 */
export function boundingBoxInPolygon(box: BoundingBox, polygon: Offset[]): boolean {
  const corners: Offset[] = [
    { x: box.left, y: box.top },
    { x: box.right, y: box.top },
    { x: box.right, y: box.bottom },
    { x: box.left, y: box.bottom },
  ];

  return corners.every((corner) => pointInPolygon(corner, polygon));
}

/**
 * Check if a bounding box intersects with a polygon (any overlap).
 */
export function boundingBoxIntersectsPolygon(
  box: BoundingBox,
  polygon: Offset[]
): boolean {
  // Check if any corner of the box is inside the polygon
  const corners: Offset[] = [
    { x: box.left, y: box.top },
    { x: box.right, y: box.top },
    { x: box.right, y: box.bottom },
    { x: box.left, y: box.bottom },
  ];

  if (corners.some((corner) => pointInPolygon(corner, polygon))) {
    return true;
  }

  // Check if any vertex of the polygon is inside the box
  if (
    polygon.some(
      (p) => p.x >= box.left && p.x <= box.right && p.y >= box.top && p.y <= box.bottom
    )
  ) {
    return true;
  }

  // Check if any edge of the polygon intersects any edge of the box
  // (handles cases where shapes overlap but no vertices are inside)
  const boxEdges = [
    [corners[0], corners[1]],
    [corners[1], corners[2]],
    [corners[2], corners[3]],
    [corners[3], corners[0]],
  ];

  for (let i = 0; i < polygon.length; i++) {
    const j = (i + 1) % polygon.length;
    const polyEdge = [polygon[i], polygon[j]];

    for (const boxEdge of boxEdges) {
      if (segmentsIntersect(polyEdge[0], polyEdge[1], boxEdge[0], boxEdge[1])) {
        return true;
      }
    }
  }

  return false;
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

  if (d1 === 0 && onSegment(p3, p4, p1)) return true;
  if (d2 === 0 && onSegment(p3, p4, p2)) return true;
  if (d3 === 0 && onSegment(p1, p2, p3)) return true;
  if (d4 === 0 && onSegment(p1, p2, p4)) return true;

  return false;
}

function direction(p1: Offset, p2: Offset, p3: Offset): number {
  return (p3.x - p1.x) * (p2.y - p1.y) - (p2.x - p1.x) * (p3.y - p1.y);
}

function onSegment(p1: Offset, p2: Offset, p: Offset): boolean {
  return (
    Math.min(p1.x, p2.x) <= p.x &&
    p.x <= Math.max(p1.x, p2.x) &&
    Math.min(p1.y, p2.y) <= p.y &&
    p.y <= Math.max(p1.y, p2.y)
  );
}

/**
 * Calculate the area of a polygon using the shoelace formula.
 */
export function polygonArea(polygon: Offset[]): number {
  if (polygon.length < 3) return 0;

  let area = 0;
  const n = polygon.length;

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += polygon[i].x * polygon[j].y;
    area -= polygon[j].x * polygon[i].y;
  }

  return Math.abs(area) / 2;
}

/**
 * Calculate the centroid (center of mass) of a polygon.
 */
export function polygonCentroid(polygon: Offset[]): Offset {
  if (polygon.length === 0) return { x: 0, y: 0 };
  if (polygon.length === 1) return polygon[0];
  if (polygon.length === 2) {
    return {
      x: (polygon[0].x + polygon[1].x) / 2,
      y: (polygon[0].y + polygon[1].y) / 2,
    };
  }

  let cx = 0;
  let cy = 0;
  let area = 0;
  const n = polygon.length;

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const cross = polygon[i].x * polygon[j].y - polygon[j].x * polygon[i].y;
    area += cross;
    cx += (polygon[i].x + polygon[j].x) * cross;
    cy += (polygon[i].y + polygon[j].y) * cross;
  }

  area /= 2;
  if (Math.abs(area) < 1e-10) {
    // Degenerate polygon, return average of points
    return {
      x: polygon.reduce((sum, p) => sum + p.x, 0) / n,
      y: polygon.reduce((sum, p) => sum + p.y, 0) / n,
    };
  }

  cx /= 6 * area;
  cy /= 6 * area;

  return { x: cx, y: cy };
}

/**
 * Get the bounding box of a polygon.
 */
export function polygonBoundingBox(polygon: Offset[]): BoundingBox | null {
  if (polygon.length === 0) return null;

  let left = polygon[0].x;
  let top = polygon[0].y;
  let right = polygon[0].x;
  let bottom = polygon[0].y;

  for (const p of polygon) {
    left = Math.min(left, p.x);
    top = Math.min(top, p.y);
    right = Math.max(right, p.x);
    bottom = Math.max(bottom, p.y);
  }

  return { left, top, right, bottom };
}

/**
 * Convert a quad to a polygon (array of points).
 */
export function quadToPolygon(quad: Quad): Offset[] {
  return [quad.topLeft, quad.topRight, quad.bottomRight, quad.bottomLeft];
}

/**
 * Get the center of a quad.
 */
export function quadCenter(quad: Quad): Offset {
  return {
    x: (quad.topLeft.x + quad.topRight.x + quad.bottomRight.x + quad.bottomLeft.x) / 4,
    y: (quad.topLeft.y + quad.topRight.y + quad.bottomRight.y + quad.bottomLeft.y) / 4,
  };
}

/**
 * Get the approximate width of a quad.
 */
export function quadWidth(quad: Quad): number {
  const topWidth = Math.sqrt(
    (quad.topRight.x - quad.topLeft.x) ** 2 + (quad.topRight.y - quad.topLeft.y) ** 2
  );
  const bottomWidth = Math.sqrt(
    (quad.bottomRight.x - quad.bottomLeft.x) ** 2 +
      (quad.bottomRight.y - quad.bottomLeft.y) ** 2
  );
  return (topWidth + bottomWidth) / 2;
}

/**
 * Get the approximate height of a quad.
 */
export function quadHeight(quad: Quad): number {
  const leftHeight = Math.sqrt(
    (quad.bottomLeft.x - quad.topLeft.x) ** 2 + (quad.bottomLeft.y - quad.topLeft.y) ** 2
  );
  const rightHeight = Math.sqrt(
    (quad.bottomRight.x - quad.topRight.x) ** 2 +
      (quad.bottomRight.y - quad.topRight.y) ** 2
  );
  return (leftHeight + rightHeight) / 2;
}
