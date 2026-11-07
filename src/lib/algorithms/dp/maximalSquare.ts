import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { DPMatrixData } from './types';

export const maximalSquare: AlgorithmDefinition<{ matrix: string[][] }, DPMatrixData> = {
  id: 'maximal-square',
  name: 'Maximal Square',
  category: 'dp',
  categoryName: 'Dynamic Programming',
  description: 'Find largest square containing only 1s in binary matrix.',
  difficulty: 'Medium',
  timeComplexity: { best: 'O(m·n)', average: 'O(m·n)', worst: 'O(m·n)' },
  spaceComplexity: 'O(m·n)',
  defaultInput: { matrix: [['1', '0', '1', '0', '0'], ['1', '0', '1', '1', '1'], ['1', '1', '1', '1', '1'], ['1', '0', '0', '1', '0']] },
  inputConfig: { type: 'dp' },
  code: ['for i, j:', '  if matrix[i][j] == 1:', '    dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])', 'return max(dp)^2'],
  generate: (input) => {
    const matrix = (input?.matrix ?? [['1', '0', '1'], ['1', '1', '1'], ['0', '1', '1']]).slice(0, 10).map(r => r.slice(0, 10));
    const m = matrix.length, n = matrix[0]?.length ?? 0;
    if (m === 0 || n === 0) return [];
    const table: (number | null)[][] = Array.from({ length: m }, () => Array(n).fill(null));
    const snapshots: Snapshot<DPMatrixData>[] = [];
    let maxSide = 0;
    for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) table[i][j] = matrix[i][j] === '1' ? 1 : 0;
    snapshots.push({ id: '0', step: 0, description: 'Initialized with matrix values.', data: { table: table.map(r => [...r]), rowHeaders: Array.from({ length: m }, (_, i) => `${i}`), colHeaders: Array.from({ length: n }, (_, j) => `${j}`), phase: 'init', dpMode: 'table' as const }, currentLine: 0, variables: {} });
    for (let i = 1; i < m; i++) {
      for (let j = 1; j < n; j++) {
        if (matrix[i][j] === '1') {
          table[i][j] = 1 + Math.min(table[i - 1][j]!, table[i][j - 1]!, table[i - 1][j - 1]!);
          maxSide = Math.max(maxSide, table[i][j]!);
          snapshots.push({ id: `${snapshots.length}`, step: snapshots.length, description: `[${i},${j}]: side=${table[i][j]}. Max square area=${maxSide * maxSide}.`, data: { table: table.map(r => [...r]), rowHeaders: Array.from({ length: m }, (_, idx) => `${idx}`), colHeaders: Array.from({ length: n }, (_, idx) => `${idx}`), computingCell: [i, j], phase: 'compute', dpMode: 'table' as const }, currentLine: 2, variables: { maxSide, area: maxSide * maxSide } });
        }
      }
    }
    snapshots.push({ id: `${snapshots.length}`, step: snapshots.length, description: `Maximal square area: ${maxSide * maxSide}.`, data: { table: table.map(r => [...r]), rowHeaders: Array.from({ length: m }, (_, i) => `${i}`), colHeaders: Array.from({ length: n }, (_, j) => `${j}`), phase: 'done', dpMode: 'table' as const }, currentLine: 3, variables: {} });
    return snapshots;
  },
};
