import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { DPMatrixData } from './types';

export const minCostClimbingStairs: AlgorithmDefinition<{ cost: number[] }, DPMatrixData> = {
  id: 'min-cost-climbing-stairs',
  name: 'Min Cost Climbing Stairs',
  category: 'dp',
  categoryName: 'Dynamic Programming',
  description: 'Find minimum cost to reach top when you can climb 1 or 2 steps.',
  difficulty: 'Easy',
  timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
  spaceComplexity: 'O(n)',
  defaultInput: { cost: [10, 15, 20] },
  inputConfig: { type: 'dp' },
  code: ['for i from 2 to n:', '  dp[i] = min(dp[i-1], dp[i-2]) + cost[i]', 'return min(dp[n-1], dp[n-2])'],
  generate: (input) => {
    const cost = (input?.cost ?? [10, 15, 20]).slice(0, 20);
    const n = cost.length;
    const table: (number | null)[][] = [Array(n + 1).fill(null)];
    const snapshots: Snapshot<DPMatrixData>[] = [];
    table[0][0] = 0;
    table[0][1] = 0;
    snapshots.push({ id: '0', step: 0, description: 'Base: dp[0]=0, dp[1]=0 (start from either).', data: { table: [table[0].map(v => v)], rowHeaders: ['Min Cost'], colHeaders: ['Start', ...cost.map((c, i) => `${i}:$${c}`)], phase: 'init', dpMode: 'sequence' as const }, currentLine: 0, variables: {} });
    for (let i = 2; i <= n; i++) {
      table[0][i] = Math.min(table[0][i - 1]!, table[0][i - 2]!) + (cost[i - 1] ?? 0);
      snapshots.push({ id: `${snapshots.length}`, step: snapshots.length, description: `Step ${i}: min(${table[0][i - 1]},${table[0][i - 2]})+${cost[i - 1] ?? 0}=${table[0][i]}.`, data: { table: [table[0].map(v => v)], rowHeaders: ['Min Cost'], colHeaders: ['Start', ...cost.map((c, idx) => `${idx}:$${c}`)], computingCell: [0, i], dependencyCells: [[0, i - 1], [0, i - 2]], phase: 'compute', dpMode: 'sequence' as const }, currentLine: 1, variables: {} });
    }
    const result = Math.min(table[0][n]!, table[0][n - 1]!);
    snapshots.push({ id: `${snapshots.length}`, step: snapshots.length, description: `Min cost to reach top: ${result}.`, data: { table: [table[0].map(v => v)], rowHeaders: ['Min Cost'], colHeaders: ['Start', ...cost.map((c, i) => `${i}:$${c}`)], phase: 'done', dpMode: 'sequence' as const }, currentLine: 2, variables: {} });
    return snapshots;
  },
};
