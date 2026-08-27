// Bridges game state logic

export interface BridgesIsland {
  row: number;
  col: number;
  requiredBridges: number;
}

export interface BridgeConnection {
  island1: number;
  island2: number;
  count: number;
}

export interface BridgesGameState {
  gridCols: number;
  gridRows: number;
  islands: BridgesIsland[];
  bridges: BridgeConnection[];
}

export function areAdjacent(
  islands: BridgesIsland[],
  i1: number,
  i2: number,
): boolean {
  const a = islands[i1];
  const b = islands[i2];

  if (a.row === b.row) {
    const minCol = Math.min(a.col, b.col);
    const maxCol = Math.max(a.col, b.col);
    return !islands.some(
      (island, idx) =>
        idx !== i1 &&
        idx !== i2 &&
        island.row === a.row &&
        island.col > minCol &&
        island.col < maxCol,
    );
  }

  if (a.col === b.col) {
    const minRow = Math.min(a.row, b.row);
    const maxRow = Math.max(a.row, b.row);
    return !islands.some(
      (island, idx) =>
        idx !== i1 &&
        idx !== i2 &&
        island.col === a.col &&
        island.row > minRow &&
        island.row < maxRow,
    );
  }

  return false;
}

export function wouldCross(
  islands: BridgesIsland[],
  bridges: BridgeConnection[],
  newI1: number,
  newI2: number,
): boolean {
  const a = islands[newI1];
  const b = islands[newI2];

  const newHorizontal = a.row === b.row;
  const newVertical = a.col === b.col;

  if (!newHorizontal && !newVertical) return true;

  for (const bridge of bridges) {
    if (bridge.count === 0) continue;

    const c = islands[bridge.island1];
    const d = islands[bridge.island2];

    const bridgeHorizontal = c.row === d.row;
    const bridgeVertical = c.col === d.col;

    if (newHorizontal && bridgeVertical) {
      const minCol = Math.min(a.col, b.col);
      const maxCol = Math.max(a.col, b.col);
      const minRow = Math.min(c.row, d.row);
      const maxRow = Math.max(c.row, d.row);

      if (c.col > minCol && c.col < maxCol && a.row > minRow && a.row < maxRow) {
        return true;
      }
    } else if (newVertical && bridgeHorizontal) {
      const minRow = Math.min(a.row, b.row);
      const maxRow = Math.max(a.row, b.row);
      const minCol = Math.min(c.col, d.col);
      const maxCol = Math.max(c.col, d.col);

      if (a.col > minCol && a.col < maxCol && c.row > minRow && c.row < maxRow) {
        return true;
      }
    }
  }

  return false;
}

export function getBridgeCount(state: BridgesGameState, islandIndex: number): number {
  let count = 0;
  for (const bridge of state.bridges) {
    if (bridge.island1 === islandIndex || bridge.island2 === islandIndex) {
      count += bridge.count;
    }
  }
  return count;
}

function isConnected(state: BridgesGameState): boolean {
  if (state.islands.length <= 1) return true;

  const visited = new Set<number>();
  const queue = [0];
  visited.add(0);

  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const bridge of state.bridges) {
      if (bridge.count === 0) continue;

      let neighbor = -1;
      if (bridge.island1 === current) neighbor = bridge.island2;
      if (bridge.island2 === current) neighbor = bridge.island1;

      if (neighbor >= 0 && !visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  return visited.size === state.islands.length;
}

export function isComplete(state: BridgesGameState): boolean {
  for (let i = 0; i < state.islands.length; i++) {
    if (getBridgeCount(state, i) !== state.islands[i].requiredBridges) {
      return false;
    }
  }
  return isConnected(state);
}

export function findBridge(
  state: BridgesGameState,
  i1: number,
  i2: number,
): number {
  const [a, b] = i1 < i2 ? [i1, i2] : [i2, i1];
  return state.bridges.findIndex(
    (br) => br.island1 === a && br.island2 === b,
  );
}

export function toggleBridge(
  state: BridgesGameState,
  island1: number,
  island2: number,
): BridgesGameState {
  const [i1, i2] = island1 < island2 ? [island1, island2] : [island2, island1];

  if (!areAdjacent(state.islands, i1, i2)) return state;

  const existingIdx = findBridge(state, i1, i2);

  if (existingIdx >= 0) {
    const existing = state.bridges[existingIdx];

    if (existing.count >= 2) {
      return {
        ...state,
        bridges: state.bridges.filter((_, idx) => idx !== existingIdx),
      };
    }

    const newBridges = [...state.bridges];
    newBridges[existingIdx] = { ...existing, count: 2 };
    return { ...state, bridges: newBridges };
  }

  if (wouldCross(state.islands, state.bridges, i1, i2)) {
    return state;
  }

  return {
    ...state,
    bridges: [...state.bridges, { island1: i1, island2: i2, count: 1 }],
  };
}
