import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { DPMatrixData } from './types';

export const partitionEqualSubset: AlgorithmDefinition<{ nums: number[] }, DPMatrixData> = {
  id: 'partition-equal-subset',
  name: 'Partition Equal Subset Sum',
  category: 'dp',
  categoryName: 'Dynamic Programming',
  description: 'Determine if array can be partitioned into two subsets with equal sum.',
  difficulty: 'Medium',
  timeComplexity: { best: 'O(n · sum)', average: 'O(n · sum)', worst: 'O(n · sum)' },
  spaceComplexity: 'O(n · sum)',
  defaultInput: { nums: [1, 5, 11, 5] },
  inputConfig: { type: 'dp', supportsCustomInput: true },
  code: ['if sum is odd: return false', 'target = sum / 2', 'Run subset sum DP for target'],
  generate: (input) => {
    const nums = (input?.nums ?? [1, 5, 11, 5]).slice(0, 15);
    const sum = nums.reduce((a, b) => a + b, 0);
    if (sum % 2 !== 0) {
      return [{ id: '0', step: 0, description: `Total sum ${sum} is odd. Cannot partition into equal subsets.`, data: { table: [[null]], rowHeaders: [''], colHeaders: [''], phase: 'done', dpMode: 'table' as const }, currentLine: 0, variables: {} }];
    }
    const target = sum / 2;
    const n = nums.length;
    const table: (number | null)[][] = Array.from({ length: n + 1 }, () => Array(target + 1).fill(null));
    const snapshots: Snapshot<DPMatrixData>[] = [];
    for (let i = 0; i <= n; i++) table[i][0] = 1;
    snapshots.push({ id: '0', step: 0, description: `Total sum=${sum}. Target=${target}. Running subset sum DP.`, data: { table: table.map(r => [...r]), rowHeaders: ['Ø', ...nums.map(v => `{${v}}`)], colHeaders: Array.from({ length: target + 1 }, (_, i) => `${i}`), phase: 'init', dpMode: 'table' as const }, currentLine: 0, variables: {} });
    for (let i = 1; i <= n; i++) {
      const val = nums[i - 1];
      for (let s = 1; s <= target; s++) {
        table[i][s] = table[i - 1][s];
        if (s >= val && table[i - 1][s - val] === 1) table[i][s] = 1;
      }
    }
    snapshots.push({ id: `${snapshots.length}`, step: snapshots.length, description: `Partition ${table[n][target] === 1 ? 'POSSIBLE' : 'IMPOSSIBLE'}.`, data: { table: table.map(r => [...r]), rowHeaders: ['Ø', ...nums.map(v => `{${v}}`)], colHeaders: Array.from({ length: target + 1 }, (_, i) => `${i}`), phase: 'done', dpMode: 'table' as const }, currentLine: 2, variables: {} });
    return snapshots;
  },
};
