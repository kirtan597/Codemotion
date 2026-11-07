/**
 * Rat in a Maze — find all paths from (0,0) to (n-1,n-1) on a grid.
 * Walls = false cells. Shows path exploration and backtracking visually.
 */
import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { BacktrackingData, BoardCell, CellState, MazeInput } from '@/lib/types/backtracking';

const DEFAULT_MAZE: boolean[][] = [
  [true, true, false, false],
  [true, true, true, false],
  [false, true, false, true],
  [false, true, true, true],
];

const MOVES = [
  { dr: 0, dc: 1, label: 'R' },
  { dr: 1, dc: 0, label: 'D' },
  { dr: 0, dc: -1, label: 'L' },
  { dr: -1, dc: 0, label: 'U' },
];

function makeBoard(grid: boolean[][], path: Set<string>, tryR: number, tryC: number, backR: number, backC: number): BoardCell[][] {
  return grid.map((row, r) =>
    row.map((open, c) => {
      const key = `${r},${c}`;
      let state: CellState = open ? 'empty' : 'blocked';
      if (r === tryR && c === tryC && open) state = 'trying';
      else if (r === backR && c === backC) state = 'backtrack';
      else if (path.has(key)) state = 'path';
      return { row: r, col: c, value: null, state };
    })
  );
}

export const ratInMaze: AlgorithmDefinition<MazeInput, BacktrackingData> = {
  id: 'rat-in-maze',
  name: 'Rat in a Maze',
  category: 'backtracking',
  categoryName: 'Backtracking',
  description:
    'Find all paths from the top-left to the bottom-right of a grid maze. Uses backtracking — move in four directions, mark visited cells, backtrack when stuck.',
  difficulty: 'Medium',
  timeComplexity: { best: 'O(4^(n²))', average: 'O(4^(n²))', worst: 'O(4^(n²))' },
  spaceComplexity: 'O(n²)',
  defaultInput: { grid: DEFAULT_MAZE, startRow: 0, startCol: 0, endRow: 3, endCol: 3 },
  inputConfig: { type: 'array', supportsCustomInput: false },
  code: [
    'function solve(r, c, path):',
    '  if (r, c) == destination: record path; return',
    '  mark (r, c) as visited',
    '  for each direction (R, D, L, U):',
    '    if next cell is valid and open:',
    '      solve(next_r, next_c, path + dir)',
    '  unmark (r, c)  // backtrack',
  ],
  generate: (input: MazeInput): Snapshot<BacktrackingData>[] => {
    const grid = input.grid ?? DEFAULT_MAZE;
    const rows = grid.length, cols = grid[0].length;
    const endR = input.endRow ?? rows - 1;
    const endC = input.endCol ?? cols - 1;
    const out: Snapshot<BacktrackingData>[] = [];
    const pathSet = new Set<string>();
    const visited = Array.from({ length: rows }, () => new Array(cols).fill(false));
    let backtracks = 0, checks = 0;
    const solutions: string[] = [];
    const MAX_SNAPS = 2000;

    function snap(desc: string, line: number, phase: BacktrackingData['phase'], tr = -1, tc = -1, br = -1, bc = -1): void {
      if (out.length >= MAX_SNAPS) return;
      out.push({
        id: `rim-${out.length}`, step: out.length, description: desc,
        data: { board: makeBoard(grid, pathSet, tr, tc, br, bc), solutions: [...solutions], backtracks, checks, phase },
        currentLine: line,
        variables: { solutions: solutions.length, backtracks, checks, pathLength: pathSet.size },
      });
    }

    snap(`Rat in a Maze: ${rows}×${cols} grid. Navigate from (0,0) to (${endR},${endC}).`, 0, 'placing');

    function solve(r: number, c: number, pathStr: string): void {
      if (out.length >= MAX_SNAPS) return;
      if (r === endR && c === endC) {
        pathSet.add(`${r},${c}`);
        solutions.push(pathStr);
        snap(`✓ Path found: "${pathStr}"`, 1, 'solution', r, c);
        pathSet.delete(`${r},${c}`);
        return;
      }

      visited[r][c] = true;
      pathSet.add(`${r},${c}`);
      checks++;
      snap(`At (${r},${c}). Exploring neighbors.`, 2, 'placing', r, c);

      for (const { dr, dc, label } of MOVES) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] && !visited[nr][nc]) {
          snap(`Try moving ${label} to (${nr},${nc}).`, 4, 'checking', nr, nc);
          solve(nr, nc, pathStr + label);
        }
      }

      // Backtrack
      visited[r][c] = false;
      pathSet.delete(`${r},${c}`);
      backtracks++;
      snap(`Backtrack from (${r},${c}). No valid moves left.`, 6, 'backtracking', -1, -1, r, c);
    }

    if (grid[0][0]) solve(0, 0, '');

    snap(`Rat in a Maze complete. Found ${solutions.length} path(s). Backtracks: ${backtracks}.`, 1, 'done');
    return out;
  },
};
