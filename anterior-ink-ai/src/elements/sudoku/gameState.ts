// Sudoku game state logic

export const GRID_SIZE = 9;
export const TOTAL_CELLS = 81;
export const BOX_SIZE = 3;

export interface SudokuGameState {
  grid: number[];
  originalGrid: number[];
}

export type MoveResult =
  | { type: 'placed'; state: SudokuGameState; cellIndex: number; digit: number }
  | { type: 'conflict'; state: SudokuGameState; cellIndex: number; digit: number; conflictingCells: Set<number> }
  | { type: 'cellOccupied'; state: SudokuGameState; cellIndex: number }
  | { type: 'cleared'; state: SudokuGameState; cellIndex: number }
  | { type: 'completed'; state: SudokuGameState }
  | { type: 'gameAlreadyOver'; state: SudokuGameState };

export function rowOf(cellIndex: number): number {
  return Math.floor(cellIndex / GRID_SIZE);
}

export function colOf(cellIndex: number): number {
  return cellIndex % GRID_SIZE;
}

export function boxOf(cellIndex: number): number {
  const row = rowOf(cellIndex);
  const col = colOf(cellIndex);
  return Math.floor(row / BOX_SIZE) * BOX_SIZE + Math.floor(col / BOX_SIZE);
}

export function cellsInRow(row: number): number[] {
  return Array.from({ length: GRID_SIZE }, (_, col) => row * GRID_SIZE + col);
}

export function cellsInColumn(col: number): number[] {
  return Array.from({ length: GRID_SIZE }, (_, row) => row * GRID_SIZE + col);
}

export function cellsInBox(box: number): number[] {
  const startRow = Math.floor(box / BOX_SIZE) * BOX_SIZE;
  const startCol = (box % BOX_SIZE) * BOX_SIZE;
  const cells: number[] = [];
  for (let dr = 0; dr < BOX_SIZE; dr++) {
    for (let dc = 0; dc < BOX_SIZE; dc++) {
      cells.push((startRow + dr) * GRID_SIZE + (startCol + dc));
    }
  }
  return cells;
}

function isGroupValid(values: number[]): boolean {
  const nonZero = values.filter(v => v !== 0);
  return nonZero.length === new Set(nonZero).size;
}

export function isValid(state: SudokuGameState): boolean {
  for (let i = 0; i < GRID_SIZE; i++) {
    if (!isGroupValid(cellsInRow(i).map(c => state.grid[c]))) return false;
    if (!isGroupValid(cellsInColumn(i).map(c => state.grid[c]))) return false;
    if (!isGroupValid(cellsInBox(i).map(c => state.grid[c]))) return false;
  }
  return true;
}

export function isComplete(state: SudokuGameState): boolean {
  return state.grid.every(v => v !== 0) && isValid(state);
}

export function conflictsFor(state: SudokuGameState, cellIndex: number, digit: number): Set<number> {
  const row = rowOf(cellIndex);
  const col = colOf(cellIndex);
  const box = boxOf(cellIndex);

  const peerCells = new Set([
    ...cellsInRow(row),
    ...cellsInColumn(col),
    ...cellsInBox(box),
  ]);
  peerCells.delete(cellIndex);

  const conflicts = new Set<number>();
  for (const peer of peerCells) {
    if (state.grid[peer] === digit) {
      conflicts.add(peer);
    }
  }
  return conflicts;
}

export function computeErrorCells(
  state: SudokuGameState,
  playerDigitStrokes: Record<number, unknown>,
): Set<number> {
  const errors = new Set<number>();

  for (let cellIndex = 0; cellIndex < TOTAL_CELLS; cellIndex++) {
    const digit = state.grid[cellIndex];
    const isUserCell = state.originalGrid[cellIndex] === 0;

    if (isUserCell && digit !== 0 && conflictsFor(state, cellIndex, digit).size > 0) {
      errors.add(cellIndex);
    }

    if (isUserCell && digit === 0 && cellIndex in playerDigitStrokes) {
      errors.add(cellIndex);
    }
  }

  return errors;
}

export function placeDigit(state: SudokuGameState, cellIndex: number, digit: number): MoveResult {
  if (isComplete(state)) {
    return { type: 'gameAlreadyOver', state };
  }

  if (state.originalGrid[cellIndex] !== 0) {
    return { type: 'cellOccupied', state, cellIndex };
  }

  const newGrid = [...state.grid];
  newGrid[cellIndex] = digit;
  const newState: SudokuGameState = { grid: newGrid, originalGrid: state.originalGrid };

  const conflicts = conflictsFor(newState, cellIndex, digit);

  if (isComplete(newState)) {
    return { type: 'completed', state: newState };
  }

  if (conflicts.size > 0) {
    return { type: 'conflict', state: newState, cellIndex, digit, conflictingCells: conflicts };
  }

  return { type: 'placed', state: newState, cellIndex, digit };
}

export function clearCell(state: SudokuGameState, cellIndex: number): MoveResult {
  if (state.originalGrid[cellIndex] !== 0) {
    return { type: 'cellOccupied', state, cellIndex };
  }

  if (state.grid[cellIndex] === 0) {
    return { type: 'cleared', state, cellIndex };
  }

  const newGrid = [...state.grid];
  newGrid[cellIndex] = 0;

  return { type: 'cleared', state: { grid: newGrid, originalGrid: state.originalGrid }, cellIndex };
}
