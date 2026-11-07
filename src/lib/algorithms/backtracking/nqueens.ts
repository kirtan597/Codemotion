
import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { BacktrackingData, BoardCell, CellState, NQueensInput } from '@/lib/types/backtracking';

function makeBoard(n: number, queens: number[], tryRow = -1, tryCol = -1, back = false): BoardCell[][] {
  return Array.from({ length: n }, (_, r) =>
    Array.from({ length: n }, (_, c) => {
      let state: CellState = 'empty';
      if (r === tryRow && c === tryCol) state = back ? 'backtrack' : 'trying';
      else if (queens[r] === c) state = 'placed';
      return { row: r, col: c, value: queens[r] === c ? 'Q' : null, state };
    })
  );
}

function isConflict(queens: number[], row: number, col: number): boolean {
  for (let r = 0; r < row; r++) {
    if (queens[r] === col || Math.abs(queens[r] - col) === Math.abs(r - row)) return true;
  }
  return false;
}

function markConflicts(board: BoardCell[][], n: number): BoardCell[][] {
  const copy = board.map((row) => row.map((c) => ({ ...c })));
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (copy[r][c].state === 'trying') {
        // check same col, diag
        for (let pr = 0; pr < r; pr++) {
          if (copy[pr][c]?.state === 'placed') {
            copy[r][c].state = 'conflict';
          }
          if (copy[pr][c + (r - pr)]?.state === 'placed' || copy[pr][c - (r - pr)]?.state === 'placed') {
            copy[r][c].state = 'conflict';
          }
        }
      }
    }
  }
  return copy;
}

export const nqueens: AlgorithmDefinition<NQueensInput, BacktrackingData> = {
  id: 'n-queens',
  name: 'N-Queens',
  category: 'backtracking',
  categoryName: 'Backtracking',
  description:
    'Place N queens on an N×N board so no two queens share a row, column, or diagonal. Classic backtracking problem — explore column choices per row, backtrack on conflict.',
  difficulty: 'Hard',
  timeComplexity: { best: 'O(n!)', average: 'O(n!)', worst: 'O(n!)' },
  spaceComplexity: 'O(n)',
  defaultInput: { n: 6 },
  inputConfig: { type: 'array', supportsCustomInput: true },
  code: [
    'function solve(row):',
    '  if row == n: record solution',
    '  for col in 0..n-1:',
    '    if isSafe(row, col):     // no conflicts',
    '      place queen at (row, col)',
    '      solve(row + 1)         // recurse to next row',
    '      remove queen (backtrack)',
  ],
  generate: (input: NQueensInput): Snapshot<BacktrackingData>[] => {
    const n = Math.max(4, Math.min(8, Math.round(input.n ?? 6)));
    const out: Snapshot<BacktrackingData>[] = [];
    const queens: number[] = new Array(n).fill(-1); // queens[r] = col where queen placed in row r
    let backtracks = 0;
    let checks = 0;
    const solutions: string[] = [];

    const MAX_SNAPS = 3000;

    function snap(board: BoardCell[][], desc: string, line: number, phase: BacktrackingData['phase']): void {
      if (out.length >= MAX_SNAPS) return;
      out.push({
        id: `nq-${out.length}`,
        step: out.length,
        description: desc,
        data: { board, current: `Row ${queens.filter((q) => q >= 0).length}`, solutions: [...solutions], backtracks, checks, phase },
        currentLine: line,
        variables: { n, placed: queens.filter((q) => q >= 0).length, backtracks, checks, solutions: solutions.length },
      });
    }

    snap(makeBoard(n, queens), `N-Queens (${n}×${n}): Find all valid queen placements.`, 0, 'placing');

    function solve(row: number): void {
      if (out.length >= MAX_SNAPS) return;
      if (row === n) {
        const sol = queens.map((c) => c + 1).join(',');
        solutions.push(`[${sol}]`);
        // Mark solution
        const solutionBoard = Array.from({ length: n }, (_, r) =>
          Array.from({ length: n }, (_, c) => ({
            row: r, col: c,
            value: queens[r] === c ? 'Q' : null,
            state: (queens[r] === c ? 'solution' : 'empty') as CellState,
          }))
        );
        snap(solutionBoard, `✓ Solution #${solutions.length} found: columns [${queens.map((c) => c + 1).join(', ')}]`, 1, 'solution');
        return;
      }

      for (let col = 0; col < n; col++) {
        if (out.length >= MAX_SNAPS) return;
        checks++;
        const conflict = isConflict(queens, row, col);

        let board = makeBoard(n, queens, row, col, false);
        if (conflict) {
          board[row][col].state = 'conflict';
        }
        snap(board, `Row ${row + 1}, Col ${col + 1}: ${conflict ? 'conflict ✗ — skip' : 'safe ✓ — placing queen'}`, conflict ? 3 : 4, conflict ? 'checking' : 'placing');

        if (!conflict) {
          queens[row] = col;
          snap(makeBoard(n, queens), `Placed queen at (${row + 1}, ${col + 1}). Recurse to row ${row + 2}.`, 5, 'placing');
          solve(row + 1);

          // Backtrack
          queens[row] = -1;
          backtracks++;
          snap(makeBoard(n, queens, row, col, true), `Backtrack from row ${row + 1} — trying next column.`, 6, 'backtracking');
        }
      }
    }

    solve(0);

    const finalBoard = makeBoard(n, queens);
    snap(finalBoard, `N-Queens complete. Found ${solutions.length} solution(s). Backtracks: ${backtracks}, Checks: ${checks}.`, 1, 'done');
    return out;
  },
};
