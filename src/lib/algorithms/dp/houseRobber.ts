import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { DPMatrixData } from './types';

export const houseRobber: AlgorithmDefinition<{ houses: number[] }, DPMatrixData> = {
  id: 'house-robber',
  name: 'House Robber',
  category: 'dp',
  categoryName: 'Dynamic Programming',
  description: 'Maximize money robbed from houses without robbing adjacent ones.',
  difficulty: 'Easy',
  timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
  spaceComplexity: 'O(n)',
  defaultInput: { houses: [2, 7, 9, 3, 1] },
  inputConfig: { type: 'dp', supportsCustomInput: true },
  code: ['dp[0] = houses[0]', 'dp[1] = max(houses[0], houses[1])', 'for i from 2 to n:', '  dp[i] = max(dp[i-1], dp[i-2] + houses[i])'],
  generate: (input) => {
    const houses = (input?.houses ?? [2, 7, 9, 3, 1]).filter(v => v >= 0).slice(0, 20);
    const n = houses.length;
    const table: (number | null)[][] = [Array(n).fill(null)];
    const snapshots: Snapshot<DPMatrixData>[] = [];
    table[0][0] = houses[0];
    if (n > 1) table[0][1] = Math.max(houses[0], houses[1]);
    snapshots.push({ id: '0', step: 0, description: `Base cases: dp[0]=${table[0][0]}, dp[1]=${table[0][1] ?? 'N/A'}.`, data: { table: [table[0].map(v => v)], rowHeaders: ['Max Money'], colHeaders: houses.map((v, i) => `H${i}:$${v}`), phase: 'init', dpMode: 'sequence' as const }, currentLine: 0, variables: {} });
    for (let i = 2; i < n; i++) {
      table[0][i] = Math.max(table[0][i - 1]!, table[0][i - 2]! + houses[i]);
      snapshots.push({ id: `${snapshots.length}`, step: snapshots.length, description: `House ${i} ($${houses[i]}): max(skip=${table[0][i - 1]}, rob=${table[0][i - 2]}+${houses[i]}=${table[0][i - 2]! + houses[i]}) = ${table[0][i]}.`, data: { table: [table[0].map(v => v)], rowHeaders: ['Max Money'], colHeaders: houses.map((v, idx) => `H${idx}:$${v}`), computingCell: [0, i], dependencyCells: [[0, i - 1], [0, i - 2]], phase: 'compute', dpMode: 'sequence' as const }, currentLine: 3, variables: {} });
    }
    snapshots.push({ id: `${snapshots.length}`, step: snapshots.length, description: `Max money robbed: $${table[0][n - 1]}.`, data: { table: [table[0].map(v => v)], rowHeaders: ['Max Money'], colHeaders: houses.map((v, i) => `H${i}:$${v}`), phase: 'done', dpMode: 'sequence' as const }, currentLine: 3, variables: {} });
    return snapshots;
  },
};
