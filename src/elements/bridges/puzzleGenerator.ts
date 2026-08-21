// Bridges puzzle generator
//
// Two-phase approach: place all islands first, then build bridges using
// the final adjacency graph. This avoids the bug where later islands
// invalidate earlier bridges by being placed between connected pairs.

import type { BridgesGameState, BridgesIsland, BridgeConnection } from './gameState';
import { wouldCross } from './gameState';

const DEFAULT_GRID_COLS = 7;
const DEFAULT_GRID_ROWS = 7;
const ISLAND_DENSITY = 0.27;
const MIN_ISLANDS = 6;
const MAX_PLACEMENT_ATTEMPTS = 500;

const DIRECTIONS = [
  { dr: 0, dc: 1 },
  { dr: 0, dc: -1 },
  { dr: 1, dc: 0 },
  { dr: -1, dc: 0 },
];

function posKey(row: number, col: number): string {
  return `${row},${col}`;
}

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Phase 1: Place islands using incremental growth for good spatial distribution.
 * Returns only island positions — no bridges are created here.
 */
function placeIslands(
  gridCols: number,
  gridRows: number,
): BridgesIsland[] {
  const targetIslands = Math.max(MIN_ISLANDS, Math.round(gridCols * gridRows * ISLAND_DENSITY));
  const occupied = new Set<string>();
  const islands: BridgesIsland[] = [];

  const startRow = Math.floor(Math.random() * (gridRows - 2)) + 1;
  const startCol = Math.floor(Math.random() * (gridCols - 2)) + 1;
  islands.push({ row: startRow, col: startCol, requiredBridges: 0 });
  occupied.add(posKey(startRow, startCol));

  let attempts = 0;

  while (islands.length < targetIslands && attempts < MAX_PLACEMENT_ATTEMPTS) {
    attempts++;

    const source = islands[Math.floor(Math.random() * islands.length)];
    const dir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
    const distance = 2 + Math.floor(Math.random() * 3);

    const newRow = source.row + dir.dr * distance;
    const newCol = source.col + dir.dc * distance;

    if (newRow < 0 || newRow >= gridRows || newCol < 0 || newCol >= gridCols) {
      continue;
    }
    if (occupied.has(posKey(newRow, newCol))) continue;

    islands.push({ row: newRow, col: newCol, requiredBridges: 0 });
    occupied.add(posKey(newRow, newCol));
  }

  return islands;
}

/**
 * Find all adjacent island pairs using the FINAL island positions.
 * Two islands are adjacent if they share a row or column with no
 * other island between them.
 */
function findAdjacentPairs(islands: BridgesIsland[]): [number, number][] {
  const pairs: [number, number][] = [];

  for (let i = 0; i < islands.length; i++) {
    for (let j = i + 1; j < islands.length; j++) {
      const a = islands[i];
      const b = islands[j];

      if (a.row !== b.row && a.col !== b.col) continue;

      if (a.row === b.row) {
        const minCol = Math.min(a.col, b.col);
        const maxCol = Math.max(a.col, b.col);
        const blocked = islands.some(
          (isl, idx) =>
            idx !== i &&
            idx !== j &&
            isl.row === a.row &&
            isl.col > minCol &&
            isl.col < maxCol,
        );
        if (!blocked) pairs.push([i, j]);
      } else {
        const minRow = Math.min(a.row, b.row);
        const maxRow = Math.max(a.row, b.row);
        const blocked = islands.some(
          (isl, idx) =>
            idx !== i &&
            idx !== j &&
            isl.col === a.col &&
            isl.row > minRow &&
            isl.row < maxRow,
        );
        if (!blocked) pairs.push([i, j]);
      }
    }
  }

  return pairs;
}

/**
 * Phase 2: Build a spanning tree over the adjacency graph using union-find.
 * Each edge is checked for crossings against previously added tree edges
 * so the resulting tree is planar (no bridges cross).
 * Returns the tree edges, or null if the graph can't be fully connected.
 */
function buildSpanningTree(
  islands: BridgesIsland[],
  edges: [number, number][],
): [number, number][] | null {
  const islandCount = islands.length;
  const parent = Array.from({ length: islandCount }, (_, i) => i);
  const rank = new Array(islandCount).fill(0);

  function find(x: number): number {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  }

  function union(a: number, b: number): boolean {
    const ra = find(a);
    const rb = find(b);
    if (ra === rb) return false;
    if (rank[ra] < rank[rb]) {
      parent[ra] = rb;
    } else if (rank[ra] > rank[rb]) {
      parent[rb] = ra;
    } else {
      parent[rb] = ra;
      rank[ra]++;
    }
    return true;
  }

  const shuffled = shuffle(edges);
  const tree: [number, number][] = [];
  const treeBridges: BridgeConnection[] = [];

  for (const [a, b] of shuffled) {
    if (find(a) === find(b)) continue;
    if (wouldCross(islands, treeBridges, a, b)) continue;

    union(a, b);
    tree.push([a, b]);
    treeBridges.push({ island1: a, island2: b, count: 1 });

    if (tree.length === islandCount - 1) break;
  }

  if (tree.length < islandCount - 1) return null;
  return tree;
}

/**
 * Phase 3: Create solution bridges from spanning tree + extra edges.
 * Each bridge gets a random count of 1 or 2.
 */
function buildSolutionBridges(
  islands: BridgesIsland[],
  treeEdges: [number, number][],
  allEdges: [number, number][],
): BridgeConnection[] {
  const bridges: BridgeConnection[] = [];
  const edgeSet = new Set<string>();

  for (const [i1, i2] of treeEdges) {
    const key = `${i1},${i2}`;
    edgeSet.add(key);
    bridges.push({
      island1: i1,
      island2: i2,
      count: 1 + Math.floor(Math.random() * 2),
    });
  }

  const extras = shuffle(
    allEdges.filter(([i, j]) => !edgeSet.has(`${i},${j}`)),
  );

  const maxExtras = Math.max(2, Math.round(islands.length * 0.3));
  let added = 0;
  for (const [i1, i2] of extras) {
    if (added >= maxExtras) break;

    if (!wouldCross(islands, bridges, i1, i2)) {
      bridges.push({
        island1: i1,
        island2: i2,
        count: 1 + Math.floor(Math.random() * 2),
      });
      added++;
    }
  }

  return bridges;
}

function calculateIslandNumbers(
  islands: BridgesIsland[],
  solutionBridges: BridgeConnection[],
): void {
  for (let i = 0; i < islands.length; i++) {
    let total = 0;
    for (const bridge of solutionBridges) {
      if (bridge.island1 === i || bridge.island2 === i) {
        total += bridge.count;
      }
    }
    islands[i].requiredBridges = total;
  }
}

export function generatePuzzle(
  gridCols = DEFAULT_GRID_COLS,
  gridRows = DEFAULT_GRID_ROWS,
): BridgesGameState {
  for (let attempt = 0; attempt < 100; attempt++) {
    const islands = placeIslands(gridCols, gridRows);
    if (islands.length < 6) continue;

    const edges = findAdjacentPairs(islands);
    const tree = buildSpanningTree(islands, edges);
    if (!tree) continue;

    const solutionBridges = buildSolutionBridges(islands, tree, edges);
    calculateIslandNumbers(islands, solutionBridges);

    const allValid = islands.every(
      (isl) => isl.requiredBridges >= 1 && isl.requiredBridges <= 8,
    );
    if (!allValid) continue;

    return {
      gridCols,
      gridRows,
      islands,
      bridges: [],
    };
  }

  console.warn('[Bridges] puzzle generation failed after 100 attempts, using fallback');
  const fallbackIslands: BridgesIsland[] = [
    { row: 1, col: 1, requiredBridges: 2 },
    { row: 1, col: 5, requiredBridges: 2 },
    { row: 5, col: 1, requiredBridges: 2 },
    { row: 5, col: 5, requiredBridges: 2 },
    { row: 3, col: 3, requiredBridges: 4 },
  ];
  return {
    gridCols,
    gridRows,
    islands: fallbackIslands,
    bridges: [],
  };
}
