import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { DPMatrixData } from './types';

export const minPathSum: AlgorithmDefinition<{ grid: number[][] }, DPMatrixData> = {
  id: 'min-path-sum',
  name: 'Minimum Path Sum',
  category: 'dp',
  categoryName: 'Dynamic Programming',
  description: 'Find path from top-left to bottom-right with minimum sum.',
  difficulty: 'Medium',
  timeComplexity: { best: 'O(m·n)', average: 'O(m·n)', worst: 'O(m·n)' },
  spaceComplexity: 'O(m·n)',
  defaultInput: { grid: [[1, 3, 1], [1, 5, 1], [4, 2, 1]] },
  inputConfig: { type: 'dp' },
  code: ['dp[0][0] = grid[0][0]', 'for i, j:', '  dp[i][j] = grid[i][j] + min(dp[i-1][j], dp[i][j-1])'],
  generate: (input) => {
    const grid = (input?.grid ?? [[1, 3, 1], [1, 5, 1], [4, 2, 1]]).slice(0, 10).map(r => r.slice(0, 10));
    const m = grid.length;
    const n = grid[0]?.length ?? 0;
    if (m === 0 || n === 0) return [];
    const table: (number | null)[][] = Array.from({ length: m }, () => Array(n).fill(null));
    const snapshots: Snapshot<DPMatrixData>[] = [];
    table[0][0] = grid[0][0];
    for (let i = 1; i < m; i++) table[i][0] = table[i - 1][0]! + grid[i][0];
    for (let j = 1; j < n; j++) table[0][j] = table[0][j - 1]! + grid[0][j];
    snapshots.push({ id: '0', step: 0, description: 'Base: first row/col cumulative sums.', data: { table: table.map(r => [...r]), rowHeaders: grid.map((_, i) => `${i}`), colHeaders: grid[0].map((_, j) => `${j}`), phase: 'init', dpMode: 'table' as const }, currentLine: 0, variables: {} });
    for (let i = 1; i < m; i++) {
      for (let j = 1; j < n; j++) {
        table[i][j] = grid[i][j] + Math.min(table[i - 1][j]!, table[i][j - 1]!);
        snapshots.push({ id: `${snapshots.length}`, step: snapshots.length, description: `[${i},${j}]: ${grid[i][j]}+min(${table[i - 1][j]},${table[i][j - 1]})=${table[i][j]}.`, data: { table: table.map(r => [...r]), rowHeaders: grid.map((_, idx) => `${idx}`), colHeaders: grid[0].map((_, idx) => `${idx}`), computingCell: [i, j], dependencyCells: [[i - 1, j], [i, j - 1]], phase: 'compute', dpMode: 'table' as const }, currentLine: 2, variables: {} });
      }
    }
    snapshots.push({ id: `${snapshots.length}`, step: snapshots.length, description: `Min path sum: ${table[m - 1][n - 1]}.`, data: { table: table.map(r => [...r]), rowHeaders: grid.map((_, i) => `${i}`), colHeaders: grid[0].map((_, j) => `${j}`), phase: 'done', dpMode: 'table' as const }, currentLine: 2, variables: {} });
    return snapshots;
  },
};
