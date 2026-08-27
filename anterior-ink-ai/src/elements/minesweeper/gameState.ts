// Minesweeper game state logic

export interface MinesweeperCell {
  hasMine: boolean;
  revealed: boolean;
  flagged: boolean;
  adjacentMines: number;
}

export interface MinesweeperGameState {
  rows: number;
  cols: number;
  cells: MinesweeperCell[];
  gameOver: boolean;
  won: boolean;
  minesPlaced: boolean;
  mineCount: number;
}

export function cellIndex(cols: number, row: number, col: number): number {
  return row * cols + col;
}

export function rowOf(cols: number, index: number): number {
  return Math.floor(index / cols);
}

export function colOf(cols: number, index: number): number {
  return index % cols;
}

function neighbors(rows: number, cols: number, index: number): number[] {
  const r = rowOf(cols, index);
  const c = colOf(cols, index);
  const result: number[] = [];

  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        result.push(cellIndex(cols, nr, nc));
      }
    }
  }

  return result;
}

export function createEmptyState(rows: number, cols: number, mineCount: number): MinesweeperGameState {
  const cells: MinesweeperCell[] = Array.from({ length: rows * cols }, () => ({
    hasMine: false,
    revealed: false,
    flagged: false,
    adjacentMines: 0,
  }));

  return {
    rows,
    cols,
    cells,
    gameOver: false,
    won: false,
    minesPlaced: false,
    mineCount,
  };
}

export function placeMines(state: MinesweeperGameState, safeIndex: number): MinesweeperGameState {
  const { rows, cols, mineCount } = state;
  const totalCells = rows * cols;
  const cells = state.cells.map((c) => ({ ...c }));

  const safeSet = new Set([safeIndex, ...neighbors(rows, cols, safeIndex)]);

  const candidates: number[] = [];
  for (let i = 0; i < totalCells; i++) {
    if (!safeSet.has(i)) candidates.push(i);
  }

  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  const mineIndices = candidates.slice(0, mineCount);
  for (const idx of mineIndices) {
    cells[idx].hasMine = true;
  }

  for (let i = 0; i < totalCells; i++) {
    if (cells[i].hasMine) continue;
    let count = 0;
    for (const n of neighbors(rows, cols, i)) {
      if (cells[n].hasMine) count++;
    }
    cells[i].adjacentMines = count;
  }

  return { ...state, cells, minesPlaced: true };
}

export function revealCell(state: MinesweeperGameState, index: number): MinesweeperGameState {
  if (state.gameOver || state.won) return state;

  let current = state;
  if (!current.minesPlaced) {
    current = placeMines(current, index);
  }

  const cell = current.cells[index];
  if (cell.revealed || cell.flagged) return current;

  const cells = current.cells.map((c) => ({ ...c }));
  cells[index].revealed = true;

  if (cells[index].hasMine) {
    return { ...current, cells, gameOver: true };
  }

  if (cells[index].adjacentMines === 0) {
    const queue = [index];
    const visited = new Set([index]);

    while (queue.length > 0) {
      const cur = queue.shift()!;
      for (const n of neighbors(current.rows, current.cols, cur)) {
        if (visited.has(n)) continue;
        visited.add(n);

        if (cells[n].hasMine || cells[n].flagged) continue;
        cells[n].revealed = true;

        if (cells[n].adjacentMines === 0) {
          queue.push(n);
        }
      }
    }
  }

  const won = cells.every((c) => c.hasMine || c.revealed);

  return { ...current, cells, won };
}

export function toggleFlag(state: MinesweeperGameState, index: number): MinesweeperGameState {
  if (state.gameOver || state.won) return state;

  const cell = state.cells[index];
  if (cell.revealed) return state;

  const cells = state.cells.map((c) => ({ ...c }));
  cells[index].flagged = !cells[index].flagged;

  return { ...state, cells };
}

export function chordReveal(state: MinesweeperGameState, index: number): MinesweeperGameState {
  if (state.gameOver || state.won) return state;

  const cell = state.cells[index];
  if (!cell.revealed || cell.adjacentMines === 0) return state;

  const { rows, cols } = state;
  const nbrs = neighbors(rows, cols, index);

  let flagCount = 0;
  for (const n of nbrs) {
    if (state.cells[n].flagged) flagCount++;
  }

  if (flagCount !== cell.adjacentMines) return state;

  let current = state;
  for (const n of nbrs) {
    if (!current.cells[n].revealed && !current.cells[n].flagged) {
      current = revealCell(current, n);
      if (current.gameOver) return current;
    }
  }

  return current;
}

export function isGameActive(state: MinesweeperGameState): boolean {
  return !state.gameOver && !state.won;
}
