/**
 * Graph Coloring — assign colors to vertices so no two adjacent vertices share a color.
 * Board is visualized as a flat list of vertices with their assigned color (1–m).
 */
import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { BacktrackingData, BoardCell, CellState, GraphColoringInput } from '@/lib/types/backtracking';

const COLOR_LABELS = ['', 'R', 'G', 'B', 'Y', 'P', 'O'];

function makeBoard(n: number, coloring: number[], tryV = -1, backV = -1): BoardCell[][] {
  return [Array.from({ length: n }, (_, v) => {
    let state: CellState = coloring[v] === 0 ? 'empty' : 'placed';
    if (v === tryV) state = 'trying';
    if (v === backV) state = 'backtrack';
    return { row: 0, col: v, value: coloring[v] !== 0 ? COLOR_LABELS[coloring[v]] ?? coloring[v] : v + 1, state };
  })];
}

function isSafe(coloring: number[], edges: [number, number][], v: number, color: number): boolean {
  for (const [a, b] of edges) {
    if ((a === v && coloring[b] === color) || (b === v && coloring[a] === color)) return false;
  }
  return true;
}

export const graphColoring: AlgorithmDefinition<GraphColoringInput, BacktrackingData> = {
  id: 'graph-coloring',
  name: 'Graph Coloring (M-Coloring)',
  category: 'backtracking',
  categoryName: 'Backtracking',
  description:
    'Assign at most M colors to graph vertices so no two adjacent vertices share a color. Classic constraint-satisfaction via backtracking.',
  difficulty: 'Hard',
  timeComplexity: { best: 'O(m^n)', average: 'O(m^n)', worst: 'O(m^n)' },
  spaceComplexity: 'O(n)',
  defaultInput: { n: 5, edges: [[0,1],[0,2],[1,2],[1,3],[2,4],[3,4]], colors: 3 },
  inputConfig: { type: 'array', supportsCustomInput: true },
  code: [
    'function colorGraph(v):',
    '  if v == n: record solution',
    '  for color in 1..m:',
    '    if isSafe(v, color):',
    '      coloring[v] = color',
    '      colorGraph(v + 1)',
    '      coloring[v] = 0  // backtrack',
  ],
  generate: (input: GraphColoringInput): Snapshot<BacktrackingData>[] => {
    const { n, edges, colors: m } = {
      n: input.n ?? 5,
      edges: (input.edges ?? [[0,1],[0,2],[1,2],[1,3],[2,4],[3,4]]) as [number,number][],
      colors: input.colors ?? 3,
    };
    const coloring: number[] = new Array(n).fill(0);
    const out: Snapshot<BacktrackingData>[] = [];
    let backtracks = 0, checks = 0;
    const solutions: string[] = [];
    const MAX_SNAPS = 2000;

    function snap(desc: string, line: number, phase: BacktrackingData['phase'], tryV = -1, backV = -1): void {
      if (out.length >= MAX_SNAPS) return;
      out.push({
        id: `gc-${out.length}`, step: out.length, description: desc,
        data: { board: makeBoard(n, coloring, tryV, backV), solutions: [...solutions], backtracks, checks, phase },
        currentLine: line,
        variables: { n, m, solutions: solutions.length, backtracks, checks },
      });
    }

    snap(`Graph Coloring: ${n} vertices, ${edges.length} edges, ${m} colors.`, 0, 'placing');

    function solve(v: number): void {
      if (out.length >= MAX_SNAPS) return;
      if (v === n) {
        solutions.push(coloring.map((c, i) => `V${i+1}:${COLOR_LABELS[c]}`).join(' '));
        snap(`✓ Solution #${solutions.length}: [${coloring.map((c, i) => `V${i+1}=${COLOR_LABELS[c]}`).join(', ')}]`, 1, 'solution');
        return;
      }

      for (let color = 1; color <= m; color++) {
        checks++;
        const safe = isSafe(coloring, edges, v, color);
        snap(`V${v+1} try color ${COLOR_LABELS[color]}: ${safe ? 'safe ✓' : 'conflict ✗'}`, safe ? 4 : 3, safe ? 'placing' : 'checking', v);
        if (safe) {
          coloring[v] = color;
          snap(`Assign V${v+1} = ${COLOR_LABELS[color]}. Recurse to V${v+2}.`, 4, 'placing', v);
          solve(v + 1);
          coloring[v] = 0;
          backtracks++;
          snap(`Backtrack V${v+1} from ${COLOR_LABELS[color]}.`, 6, 'backtracking', -1, v);
        }
      }
    }

    solve(0);

    snap(`Graph Coloring done. Found ${solutions.length} coloring(s). Backtracks: ${backtracks}.`, 1, 'done');
    return out;
  },
};
