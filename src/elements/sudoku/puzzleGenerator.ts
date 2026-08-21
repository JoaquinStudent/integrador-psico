// Sudoku puzzle generator

import type { SudokuGameState } from './gameState';
import { GRID_SIZE, TOTAL_CELLS, BOX_SIZE } from './gameState';

const TARGET_GIVENS = 28;

function isValidPlacement(grid: number[], cellIndex: number, digit: number): boolean {
  const row = Math.floor(cellIndex / GRID_SIZE);
  const col = cellIndex % GRID_SIZE;
  const boxStartRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
  const boxStartCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;

  for (let c = 0; c < GRID_SIZE; c++) {
    if (grid[row * GRID_SIZE + c] === digit) return false;
  }

  for (let r = 0; r < GRID_SIZE; r++) {
    if (grid[r * GRID_SIZE + col] === digit) return false;
  }

  for (let dr = 0; dr < BOX_SIZE; dr++) {
    for (let dc = 0; dc < BOX_SIZE; dc++) {
      if (grid[(boxStartRow + dr) * GRID_SIZE + (boxStartCol + dc)] === digit) {
        return false;
      }
    }
  }

  return true;
}

function fillGrid(grid: number[]): boolean {
  const emptyCell = grid.indexOf(0);
  if (emptyCell === -1) return true;

  const digits = Array.from({ length: GRID_SIZE }, (_, i) => i + 1);
  for (let i = digits.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [digits[i], digits[j]] = [digits[j], digits[i]];
  }

  for (const digit of digits) {
    if (isValidPlacement(grid, emptyCell, digit)) {
      grid[emptyCell] = digit;
      if (fillGrid(grid)) return true;
      grid[emptyCell] = 0;
    }
  }

  return false;
}

function countSolutions(grid: number[], count: number[], maxCount: number): void {
  if (count[0] >= maxCount) return;

  const emptyCell = grid.indexOf(0);
  if (emptyCell === -1) {
    count[0]++;
    return;
  }

  for (let digit = 1; digit <= GRID_SIZE; digit++) {
    if (count[0] >= maxCount) return;

    if (isValidPlacement(grid, emptyCell, digit)) {
      grid[emptyCell] = digit;
      countSolutions(grid, count, maxCount);
      grid[emptyCell] = 0;
    }
  }
}

function hasUniqueSolution(grid: number[]): boolean {
  const count = [0];
  countSolutions([...grid], count, 2);
  return count[0] === 1;
}

function removeCells(solvedGrid: number[], targetGivens: number): number[] {
  const puzzle = [...solvedGrid];

  const cellOrder = Array.from({ length: TOTAL_CELLS }, (_, i) => i);
  for (let i = cellOrder.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cellOrder[i], cellOrder[j]] = [cellOrder[j], cellOrder[i]];
  }

  let currentGivens = TOTAL_CELLS;

  for (const cellIndex of cellOrder) {
    if (currentGivens <= targetGivens) break;

    const savedValue = puzzle[cellIndex];
    puzzle[cellIndex] = 0;

    if (hasUniqueSolution(puzzle)) {
      currentGivens--;
    } else {
      puzzle[cellIndex] = savedValue;
    }
  }

  return puzzle;
}

export function generatePuzzle(): SudokuGameState {
  const solvedGrid = new Array(TOTAL_CELLS).fill(0);
  fillGrid(solvedGrid);
  const puzzle = removeCells(solvedGrid, TARGET_GIVENS);
  return { grid: [...puzzle], originalGrid: [...puzzle] };
}
