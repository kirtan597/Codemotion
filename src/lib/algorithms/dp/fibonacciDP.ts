import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { DPMatrixData } from './types';

export const fibonacciDP: AlgorithmDefinition<{ n: number }, DPMatrixData> = {
  id: 'fibonacci-dp',
  name: 'Fibonacci (DP)',
  category: 'dp',
  categoryName: 'Dynamic Programming',
  description: 'Compute nth Fibonacci number using dynamic programming (bottom-up).',
  difficulty: 'Easy',
  timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
  spaceComplexity: 'O(n)',
  defaultInput: { n: 10 },
  inputConfig: { type: 'dp' },
  code: ['dp[0] = 0, dp[1] = 1', 'for i from 2 to n:', '  dp[i] = dp[i-1] + dp[i-2]', 'return dp[n]'],
  generate: (input) => {
    const n = Math.max(2, Math.min(30, input?.n ?? 10));
    const table: (number | null)[][] = [Array(n + 1).fill(null)];
    const snapshots: Snapshot<DPMatrixData>[] = [];
    table[0][0] = 0;
    table[0][1] = 1;
    snapshots.push({ id: '0', step: 0, description: 'Base: F(0)=0, F(1)=1.', data: { table: [table[0].map(v => v)], rowHeaders: ['Fibonacci'], colHeaders: Array.from({ length: n + 1 }, (_, i) => `F(${i})`), phase: 'init', dpMode: 'sequence' as const }, currentLine: 0, variables: {} });
    for (let i = 2; i <= n; i++) {
      table[0][i] = table[0][i - 1]! + table[0][i - 2]!;
      snapshots.push({ id: `${snapshots.length}`, step: snapshots.length, description: `F(${i}) = F(${i - 1}) + F(${i - 2}) = ${table[0][i - 1]} + ${table[0][i - 2]} = ${table[0][i]}.`, data: { table: [table[0].map(v => v)], rowHeaders: ['Fibonacci'], colHeaders: Array.from({ length: n + 1 }, (_, idx) => `F(${idx})`), computingCell: [0, i], dependencyCells: [[0, i - 1], [0, i - 2]], phase: 'compute', dpMode: 'sequence' as const }, currentLine: 2, variables: {} });
    }
    snapshots.push({ id: `${snapshots.length}`, step: snapshots.length, description: `Fibonacci(${n}) = ${table[0][n]}.`, data: { table: [table[0].map(v => v)], rowHeaders: ['Fibonacci'], colHeaders: Array.from({ length: n + 1 }, (_, i) => `F(${i})`), phase: 'done', dpMode: 'sequence' as const }, currentLine: 3, variables: {} });
    return snapshots;
  },
};
