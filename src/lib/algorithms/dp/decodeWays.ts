import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { DPMatrixData } from './types';

export const decodeWays: AlgorithmDefinition<{ s: string }, DPMatrixData> = {
  id: 'decode-ways',
  name: 'Decode Ways',
  category: 'dp',
  categoryName: 'Dynamic Programming',
  description: 'Count ways to decode string where A=1, B=2, ..., Z=26.',
  difficulty: 'Medium',
  timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
  spaceComplexity: 'O(n)',
  defaultInput: { s: '226' },
  inputConfig: { type: 'dp' },
  code: ['dp[0] = 1', 'for i from 1 to n:', '  if s[i] valid: dp[i] += dp[i-1]', '  if s[i-1:i] valid: dp[i] += dp[i-2]'],
  generate: (input) => {
    const s = (input?.s ?? '226').slice(0, 20);
    const n = s.length;
    const table: (number | null)[][] = [Array(n + 1).fill(null)];
    const snapshots: Snapshot<DPMatrixData>[] = [];
    table[0][0] = 1;
    snapshots.push({ id: '0', step: 0, description: 'Base: dp[0]=1 (empty has 1 way).', data: { table: [table[0].map(v => v)], rowHeaders: ['Ways'], colHeaders: ['', ...s.split('')], phase: 'init', dpMode: 'sequence' as const }, currentLine: 0, variables: {} });
    for (let i = 1; i <= n; i++) {
      table[0][i] = 0;
      const one = s[i - 1];
      if (one >= '1' && one <= '9') table[0][i]! += table[0][i - 1]!;
      if (i > 1) {
        const two = s.slice(i - 2, i);
        const num = parseInt(two);
        if (num >= 10 && num <= 26) table[0][i]! += table[0][i - 2]!;
      }
      snapshots.push({ id: `${snapshots.length}`, step: snapshots.length, description: `Position ${i} (char='${s[i - 1]}'): dp[${i}]=${table[0][i]}.`, data: { table: [table[0].map(v => v)], rowHeaders: ['Ways'], colHeaders: ['', ...s.split('')], computingCell: [0, i], phase: 'compute', dpMode: 'sequence' as const }, currentLine: 2, variables: {} });
    }
    snapshots.push({ id: `${snapshots.length}`, step: snapshots.length, description: `Total decode ways: ${table[0][n]}.`, data: { table: [table[0].map(v => v)], rowHeaders: ['Ways'], colHeaders: ['', ...s.split('')], phase: 'done', dpMode: 'sequence' as const }, currentLine: 3, variables: {} });
    return snapshots;
  },
};
