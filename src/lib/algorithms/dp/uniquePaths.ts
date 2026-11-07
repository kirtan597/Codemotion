import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { DPMatrixData } from './types';

export const uniquePaths: AlgorithmDefinition<{ m: number; n: number }, DPMatrixData> = {
  id: 'unique-paths',
  name: 'Unique Paths (Grid)',
  category: 'dp',
  categoryName: 'Dynamic Programming',
  description: 'Count unique paths from top-left to bottom-right in m×n grid (only right/down moves).',
  difficulty: 'Medium',
  timeComplexity: { best: 'O(m·n)', average: 'O(m·n)', worst: 'O(m·n)' },
  spaceComplexity: 'O(m·n)',
  defaultInput: { m: 3, n: 7 },
  inputConfig: { type: 'dp' },
  code: ['dp[0][0] = 1', 'for i, j:', '  dp[i][j] = dp[i-1][j] + dp[i][j-1]'],
  generate: (input) => {
    const m = Math.max(1, Math.min(15, input?.m ?? 3));
    const n = Math.max(1, Math.min(15, input?.n ?? 7));
    const table: (number | null)[][] = Array.from({ length: m }, () => Array(n).fill(null));
    const snapshots: Snapshot<DPMatrixData>[] = [];
    for (let i = 0; i < m; i++) table[i][0] = 1;
    for (let j = 0; j < n; j++) table[0][j] = 1;
    snapshots.push({ id: '0', step: 0, description: 'Base: first row/col have 1 path.', data: { table: table.map(r => [...r]), rowHeaders: Array.from({ length: m }, (_, i) => `${i}`), colHeaders: Array.from({ length: n }, (_, j) => `${j}`), phase: 'init', dpMode: 'table' as const }, currentLine: 0, variables: {} });
    for (let i = 1; i < m; i++) {
      for (let j = 1; j < n; j++) {
        table[i][j] = table[i - 1][j]! + table[i][j - 1]!;
        snapshots.push({ id: `${snapshots.length}`, step: snapshots.length, description: `Cell [${i},${j}]: ${table[i - 1][j]}+${table[i][j - 1]}=${table[i][j]} paths.`, data: { table: table.map(r => [...r]), rowHeaders: Array.from({ length: m }, (_, idx) => `${idx}`), colHeaders: Array.from({ length: n }, (_, idx) => `${idx}`), computingCell: [i, j], dependencyCells: [[i - 1, j], [i, j - 1]], phase: 'compute', dpMode: 'table' as const }, currentLine: 2, variables: {} });
      }
    }
    snapshots.push({ id: `${snapshots.length}`, step: snapshots.length, description: `Unique paths: ${table[m - 1][n - 1]}.`, data: { table: table.map(r => [...r]), rowHeaders: Array.from({ length: m }, (_, i) => `${i}`), colHeaders: Array.from({ length: n }, (_, j) => `${j}`), phase: 'done', dpMode: 'table' as const }, currentLine: 2, variables: {} });
    return snapshots;
  },
};
