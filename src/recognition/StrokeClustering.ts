// Stroke clustering - group strokes spatially and temporally

import type { Stroke, BoundingBox } from '../types';
import { getStrokeBoundingBox, getStrokeEndTime, getStrokeStartTime } from '../types/brush';

export interface StrokeCluster {
  strokes: Stroke[];
  bounds: BoundingBox;
  startTime: number;
  endTime: number;
}

export interface ClusteringOptions {
  spatialThreshold?: number; // Max distance between stroke bounds to cluster (default: 120)
  temporalThreshold?: number; // Max time gap between strokes to cluster in ms (default: 5000)
  minStrokes?: number; // Minimum strokes to form a cluster (default: 1)
}

const DEFAULT_OPTIONS: Required<ClusteringOptions> = {
  spatialThreshold: 120,
  temporalThreshold: 5000,
  minStrokes: 1,
};

/**
 * Cluster strokes based on spatial proximity and temporal proximity.
 * Strokes are clustered if they are both:
 * - Within spatialThreshold distance of each other
 * - Within temporalThreshold time of each other
 */
export function clusterStrokes(
  strokes: Stroke[],
  options: ClusteringOptions = {}
): StrokeCluster[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  if (strokes.length === 0) return [];

  // Sort strokes by start time
  const sortedStrokes = [...strokes].sort(
    (a, b) => getStrokeStartTime(a) - getStrokeStartTime(b)
  );

  const clusters: StrokeCluster[] = [];
  const assigned = new Set<number>();

  for (let i = 0; i < sortedStrokes.length; i++) {
    if (assigned.has(i)) continue;

    // Start a new cluster with this stroke
    const cluster: Stroke[] = [sortedStrokes[i]];
    assigned.add(i);

    // Find all strokes that belong to this cluster
    let changed = true;
    while (changed) {
      changed = false;
      for (let j = 0; j < sortedStrokes.length; j++) {
        if (assigned.has(j)) continue;

        // Check if this stroke should be added to the cluster
        if (shouldCluster(cluster, sortedStrokes[j], opts)) {
          cluster.push(sortedStrokes[j]);
          assigned.add(j);
          changed = true;
        }
      }
    }

    // Only add cluster if it meets minimum stroke requirement
    if (cluster.length >= opts.minStrokes) {
      clusters.push(createClusterFromStrokes(cluster));
    }
  }

  return clusters;
}

/**
 * Check if a stroke should be added to an existing cluster.
 */
function shouldCluster(
  cluster: Stroke[],
  stroke: Stroke,
  opts: Required<ClusteringOptions>
): boolean {
  const strokeBounds = getStrokeBoundingBox(stroke);
  const strokeStartTime = getStrokeStartTime(stroke);
  const strokeEndTime = getStrokeEndTime(stroke);

  if (!strokeBounds) return false;

  for (const clusterStroke of cluster) {
    const clusterBounds = getStrokeBoundingBox(clusterStroke);
    if (!clusterBounds) continue;

    // Check spatial proximity
    const spatialDistance = boundingBoxDistance(strokeBounds, clusterBounds);
    if (spatialDistance > opts.spatialThreshold) continue;

    // Check temporal proximity
    const clusterStartTime = getStrokeStartTime(clusterStroke);
    const clusterEndTime = getStrokeEndTime(clusterStroke);

    const temporalDistance = Math.min(
      Math.abs(strokeStartTime - clusterEndTime),
      Math.abs(strokeEndTime - clusterStartTime),
      Math.abs(strokeStartTime - clusterStartTime),
      Math.abs(strokeEndTime - clusterEndTime)
    );

    if (temporalDistance <= opts.temporalThreshold) {
      return true;
    }
  }

  return false;
}

/**
 * Calculate the distance between two bounding boxes.
 * Returns 0 if they overlap.
 */
function boundingBoxDistance(a: BoundingBox, b: BoundingBox): number {
  // Calculate horizontal distance
  let dx = 0;
  if (a.right < b.left) {
    dx = b.left - a.right;
  } else if (b.right < a.left) {
    dx = a.left - b.right;
  }

  // Calculate vertical distance
  let dy = 0;
  if (a.bottom < b.top) {
    dy = b.top - a.bottom;
  } else if (b.bottom < a.top) {
    dy = a.top - b.bottom;
  }

  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Create a cluster object from a list of strokes.
 */
function createClusterFromStrokes(strokes: Stroke[]): StrokeCluster {
  let left = Infinity;
  let top = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;
  let startTime = Infinity;
  let endTime = -Infinity;

  for (const stroke of strokes) {
    const bounds = getStrokeBoundingBox(stroke);
    if (bounds) {
      left = Math.min(left, bounds.left);
      top = Math.min(top, bounds.top);
      right = Math.max(right, bounds.right);
      bottom = Math.max(bottom, bounds.bottom);
    }

    startTime = Math.min(startTime, getStrokeStartTime(stroke));
    endTime = Math.max(endTime, getStrokeEndTime(stroke));
  }

  return {
    strokes,
    bounds: { left, top, right, bottom },
    startTime,
    endTime,
  };
}

/**
 * Get the most recent cluster of strokes.
 * Useful for determining what strokes to process for recognition.
 */
export function getMostRecentCluster(
  strokes: Stroke[],
  options: ClusteringOptions = {}
): StrokeCluster | null {
  const clusters = clusterStrokes(strokes, options);
  if (clusters.length === 0) return null;

  // Return the cluster with the most recent end time
  return clusters.reduce((latest, cluster) =>
    cluster.endTime > latest.endTime ? cluster : latest
  );
}

/**
 * Find clusters that contain a specific number of strokes.
 */
export function findClustersWithStrokeCount(
  strokes: Stroke[],
  count: number,
  options: ClusteringOptions = {}
): StrokeCluster[] {
  const clusters = clusterStrokes(strokes, options);
  return clusters.filter((c) => c.strokes.length === count);
}

/**
 * Get cluster bounds dimensions.
 */
export function getClusterDimensions(cluster: StrokeCluster): {
  width: number;
  height: number;
  aspectRatio: number;
} {
  const width = cluster.bounds.right - cluster.bounds.left;
  const height = cluster.bounds.bottom - cluster.bounds.top;
  return {
    width,
    height,
    aspectRatio: height > 0 ? width / height : 0,
  };
}
