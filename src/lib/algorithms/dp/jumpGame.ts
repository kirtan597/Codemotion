import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { DPMatrixData } from './types';

export const jumpGame: AlgorithmDefinition<{ nums: number[] }, DPMatrixData> = {
  id: 'jump-game',
  name: 'Jump Game (Min Jumps)',
  category: 'dp',
  categoryName: 'Dynamic Programming',
  description: 'Find minimum jumps to reach end of array.',
  difficulty: 'Medium',
  timeComplexity: { best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)' },
  spaceComplexity: 'O(n)',
  defaultInput: { nums: [2, 3, 1, 1, 4] },
  inputConfig: { type: 'dp' },
  code: ['dp[0] = 0', 'for i:', '  for j < i:', '    if j + nums[j] >= i: dp[i] = min(dp[i], dp[j] + 1)'],
  generate: (input) => {
    const nums = (input?.nums ?? [2, 3, 1, 1, 4]).slice(0, 20);
    const n = nums.length;
    const table: (number | null)[][] = [Array(n).fill(Infinity)];
    const snapshots: Snapshot<DPMatrixData>[] = [];
    table[0][0] = 0;
    snapshots.push({ id: '0', step: 0, description: 'Base: dp[0]=0 (start position).', data: { table: [table[0].map(v => v === Infinity ? null : v)], rowHeaders: ['Min Jumps'], colHeaders: nums.map((v, i) => `${i}:${v}`), phase: 'init', dpMode: 'sequence' as const }, currentLine: 0, variables: {} });
    for (let i = 1; i < n; i++) {
      for (let j = 0; j < i; j++) {
        if (j + nums[j] >= i) {
          table[0][i] = Math.min(table[0][i]!, (table[0][j] as number) + 1);
        }
      }
      snapshots.push({ id: `${snapshots.length}`, step: snapshots.length, description: `Position ${i}: min jumps = ${table[0][i] === Infinity ? '∞' : table[0][i]}.`, data: { table: [table[0].map(v => v === Infinity ? null : v)], rowHeaders: ['Min Jumps'], colHeaders: nums.map((v, idx) => `${idx}:${v}`), computingCell: [0, i], phase: 'compute', dpMode: 'sequence' as const }, currentLine: 2, variables: {} });
    }
    snapshots.push({ id: `${snapshots.length}`, step: snapshots.length, description: `Min jumps to reach end: ${table[0][n - 1]}.`, data: { table: [table[0].map(v => v === Infinity ? null : v)], rowHeaders: ['Min Jumps'], colHeaders: nums.map((v, i) => `${i}:${v}`), phase: 'done', dpMode: 'sequence' as const }, currentLine: 2, variables: {} });
    return snapshots;
  },
};
