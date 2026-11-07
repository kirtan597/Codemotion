import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { DPMatrixData } from './types';

export const wordBreak: AlgorithmDefinition<{ s: string; wordDict: string[] }, DPMatrixData> = {
  id: 'word-break',
  name: 'Word Break',
  category: 'dp',
  categoryName: 'Dynamic Programming',
  description: 'Determine if string can be segmented into dictionary words.',
  difficulty: 'Medium',
  timeComplexity: { best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)' },
  spaceComplexity: 'O(n)',
  defaultInput: { s: 'leetcode', wordDict: ['leet', 'code'] },
  inputConfig: { type: 'dp' },
  code: ['dp[0] = true', 'for i from 1 to n:', '  for j from 0 to i:', '    if dp[j] and s[j:i] in dict: dp[i] = true'],
  generate: (input) => {
    const s = (input?.s ?? 'leetcode').slice(0, 30);
    const dict = new Set(input?.wordDict ?? ['leet', 'code']);
    const n = s.length;
    const table: (number | null)[][] = [Array(n + 1).fill(null)];
    const snapshots: Snapshot<DPMatrixData>[] = [];
    table[0][0] = 1;
    snapshots.push({ id: '0', step: 0, description: 'Base: dp[0]=true (empty string).', data: { table: [table[0].map(v => v)], rowHeaders: ['Can Break'], colHeaders: ['', ...s.split('')], phase: 'init', dpMode: 'sequence' as const }, currentLine: 0, variables: {} });
    for (let i = 1; i <= n; i++) {
      table[0][i] = 0;
      for (let j = 0; j < i; j++) {
        if (table[0][j] === 1 && dict.has(s.slice(j, i))) {
          table[0][i] = 1;
          snapshots.push({ id: `${snapshots.length}`, step: snapshots.length, description: `Position ${i}: dp[${j}]=true and "${s.slice(j, i)}" in dict. dp[${i}]=true.`, data: { table: [table[0].map(v => v)], rowHeaders: ['Can Break'], colHeaders: ['', ...s.split('')], computingCell: [0, i], phase: 'compute', dpMode: 'sequence' as const }, currentLine: 3, variables: {} });
          break;
        }
      }
    }
    snapshots.push({ id: `${snapshots.length}`, step: snapshots.length, description: `Word break: ${table[0][n] === 1 ? 'POSSIBLE' : 'IMPOSSIBLE'}.`, data: { table: [table[0].map(v => v)], rowHeaders: ['Can Break'], colHeaders: ['', ...s.split('')], phase: 'done', dpMode: 'sequence' as const }, currentLine: 3, variables: {} });
    return snapshots;
  },
};
