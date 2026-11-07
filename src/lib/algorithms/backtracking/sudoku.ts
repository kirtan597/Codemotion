/**
 * Sudoku Solver — fills a partially-completed 9×9 grid via backtracking.
 * Accepts custom puzzles (0 = empty cell).
 */
import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { BacktrackingData, BoardCell, CellState, SudokuInput } from '@/lib/types/backtracking';

const DEFAULT_PUZZLE = [
  5,3,0, 0,7,0, 0,0,0,
  6,0,0, 1,9,5, 0,0,0,
  0,9,8, 0,0,0, 0,6,0,
  8,0,0, 0,6,0, 0,0,3,
  4,0,0, 8,0,3, 0,0,1,
  7,0,0, 0,2,0, 0,0,6,
  0,6,0, 0,0,0, 2,8,0,
  0,0,0, 4,1,9, 0,0,5,
  0,0,0, 0,8,0, 0,7,9,
];

function toBoard(grid: number[], given: Set<number>, tryIdx = -1, conflictIdx = -1, backIdx = -1): BoardCell[][] {
  const board: BoardCell[][] = Array.from({ length: 9 }, (_, r) =>
    Array.from({ length: 9 }, (_, c) => {
      const idx = r * 9 + c;
      const val = grid[idx];
      let state: CellState = val !== 0 ? (given.has(idx) ? 'blocked' : 'placed') : 'empty';
      if (idx === tryIdx) state = 'trying';
      if (idx === conflictIdx) state = 'conflict';
      if (idx === backIdx) state = 'backtrack';
      return { row: r, col: c, value: val !== 0 ? val : null, state };
    })
  );
  return board;
}

function isValid(grid: number[], idx: number, val: number): boolean {
  const row = Math.floor(idx / 9), col = idx % 9;
  for (let c = 0; c < 9; c++) if (c !== col && grid[row * 9 + c] === val) return false;
  for (let r = 0; r < 9; r++) if (r !== row && grid[r * 9 + col] === val) return false;
  const br = Math.floor(row / 3) * 3, bc = Math.floor(col / 3) * 3;
  for (let dr = 0; dr < 3; dr++) for (let dc = 0; dc < 3; dc++) {
    const ni = (br + dr) * 9 + bc + dc;
    if (ni !== idx && grid[ni] === val) return false;
  }
  return true;
}

export const sudokuSolver: AlgorithmDefinition<SudokuInput, BacktrackingData> = {
  id: 'sudoku-solver',
  name: 'Sudoku Solver',
  category: 'backtracking',
  categoryName: 'Backtracking',
  description:
    'Fill a 9×9 Sudoku grid using backtracking — try digits 1–9 in empty cells, check row/column/box constraints, backtrack on failure. Accepts custom puzzles (0 = empty).',
  difficulty: 'Hard',
  timeComplexity: { best: 'O(9^m)', average: 'O(9^m)', worst: 'O(9^m)' },
  spaceComplexity: 'O(m)',
  defaultInput: { board: DEFAULT_PUZZLE },
  inputConfig: { type: 'array', supportsCustomInput: true },
  code: [
    'function solve(grid):',
    '  idx = findEmpty(grid)',
    '  if idx == -1: return true  // solved!',
    '  for val in 1..9:',
    '    if isValid(grid, idx, val):',
    '      grid[idx] = val',
    '      if solve(grid): return true',
    '      grid[idx] = 0  // backtrack',
    '  return false',
  ],
  generate: (input: SudokuInput): Snapshot<BacktrackingData>[] => {
    const raw = input.board && input.board.length === 81 ? [...input.board] : [...DEFAULT_PUZZLE];
    const grid = [...raw];
    const givenIndices = new Set<number>(
      grid.map((v, i) => (v !== 0 ? i : -1)).filter((i) => i >= 0)
    );
    const out: Snapshot<BacktrackingData>[] = [];
    let backtracks = 0, checks = 0;
    const solutions: string[] = [];
    const MAX_SNAPS = 2000;

    function snap(board: BoardCell[][], desc: string, line: number, phase: BacktrackingData['phase']): void {
      if (out.length >= MAX_SNAPS) return;
      out.push({
        id: `sdk-${out.length}`, step: out.length, description: desc,
        data: { board, solutions: [...solutions], backtracks, checks, phase },
        currentLine: line,
        variables: { backtracks, checks, filled: grid.filter((v) => v !== 0).length },
      });
    }

    snap(toBoard(grid, givenIndices), `Sudoku Solver: ${givenIndices.size} given cells. Solving…`, 0, 'placing');

    function solve(): boolean {
      if (out.length >= MAX_SNAPS) return true;
      const idx = grid.indexOf(0);
      if (idx === -1) return true; // solved

      const r = Math.floor(idx / 9), c = idx % 9;
      snap(toBoard(grid, givenIndices, idx), `Empty cell found at (${r + 1}, ${c + 1}). Trying digits 1–9.`, 2, 'placing');

      for (let val = 1; val <= 9; val++) {
        checks++;
        if (isValid(grid, idx, val)) {
          grid[idx] = val;
          snap(toBoard(grid, givenIndices, idx), `(${r+1},${c+1}) = ${val} ✓ valid. Recurse.`, 5, 'placing');
          if (solve()) {
            if (solutions.length === 0) solutions.push('Solved!');
            return true;
          }
          // backtrack
          grid[idx] = 0;
          backtracks++;
          snap(toBoard(grid, givenIndices, -1, -1, idx), `(${r+1},${c+1}) led to contradiction — backtrack, clear ${val}.`, 7, 'backtracking');
        } else {
          snap(toBoard(grid, givenIndices, -1, idx), `(${r+1},${c+1}) = ${val} ✗ invalid (row/col/box conflict).`, 4, 'checking');
        }
      }
      return false;
    }

    const solved = solve();

    if (solved) {
      const solvedBoard = toBoard(grid, givenIndices);
      // mark non-given cells as solution
      for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) {
        const i = r * 9 + c;
        if (!givenIndices.has(i)) solvedBoard[r][c].state = 'solution';
      }
      if (solutions.length === 0) solutions.push('Solved!');
      snap(solvedBoard, `✓ Sudoku solved! Backtracks: ${backtracks}, Checks: ${checks}.`, 2, 'solution');
    } else {
      snap(toBoard(grid, givenIndices), `No solution found. Puzzle may be invalid. Checks: ${checks}.`, 8, 'done');
    }

    return out;
  },
};
