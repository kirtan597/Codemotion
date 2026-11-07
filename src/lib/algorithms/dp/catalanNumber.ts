import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { DPMatrixData } from './types';

export const catalanNumber: AlgorithmDefinition<{ n: number }, DPMatrixData> = {
  id: 'catalan-number',
  name: 'Catalan Number',
  category: 'dp',
  categoryName: 'Dynamic Programming',
  description: 'Compute nth Catalan number using DP: C(n) = sum(C(i)*C(n-1-i)).',
  difficulty: 'Medium',
  timeComplexity: { best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)' },
  spaceComplexity: 'O(n)',
  defaultInput: { n: 10 },
  inputConfig: { type: 'dp' },
  code: ['dp[0] = 1', 'for i from 1 to n:', '  for j from 0 to i-1:', '    dp[i] += dp[j] * dp[i-1-j]', 'return dp[n]'],
  generate: (input) => {
    const n = Math.max(0, Math.min(15, input?.n ?? 10));
    const table: (number | null)[][] = [Array(n + 1).fill(null)];
    const snapshots: Snapshot<DPMatrixData>[] = [];
    table[0][0] = 1;
    snapshots.push({ id: '0', step: 0, description: 'Base: C(0)=1.', data: { table: [table[0].map(v => v)], rowHeaders: ['Catalan'], colHeaders: Array.from({ length: n + 1 }, (_, i) => `C(${i})`), phase: 'init', dpMode: 'sequence' as const }, currentLine: 0, variables: {} });
    for (let i = 1; i <= n; i++) {
      table[0][i] = 0;
      for (let j = 0; j < i; j++) {
        table[0][i]! += table[0][j]! * table[0][i - 1 - j]!;
      }
      snapshots.push({ id: `${snapshots.length}`, step: snapshots.length, description: `C(${i}) = sum(C(j)*C(${i - 1}-j)) = ${table[0][i]}.`, data: { table: [table[0].map(v => v)], rowHeaders: ['Catalan'], colHeaders: Array.from({ length: n + 1 }, (_, idx) => `C(${idx})`), computingCell: [0, i], phase: 'compute', dpMode: 'sequence' as const }, currentLine: 2, variables: {} });
    }
    snapshots.push({ id: `${snapshots.length}`, step: snapshots.length, description: `Catalan(${n}) = ${table[0][n]}.`, data: { table: [table[0].map(v => v)], rowHeaders: ['Catalan'], colHeaders: Array.from({ length: n + 1 }, (_, i) => `C(${i})`), phase: 'done', dpMode: 'sequence' as const }, currentLine: 4, variables: {} });
    return snapshots;
  },
};
