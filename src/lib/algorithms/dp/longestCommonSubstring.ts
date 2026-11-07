import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { DPMatrixData } from './types';

export const longestCommonSubstring: AlgorithmDefinition<{ s1: string; s2: string }, DPMatrixData> = {
  id: 'longest-common-substring',
  name: 'Longest Common Substring',
  category: 'dp',
  categoryName: 'Dynamic Programming',
  description: 'Find longest common substring (contiguous) between two strings.',
  difficulty: 'Medium',
  timeComplexity: { best: 'O(m·n)', average: 'O(m·n)', worst: 'O(m·n)' },
  spaceComplexity: 'O(m·n)',
  defaultInput: { s1: 'ABCDGH', s2: 'ACDGHR' },
  inputConfig: { type: 'dp' },
  code: ['for i, j:', '  if s1[i] == s2[j]: dp[i][j] = dp[i-1][j-1] + 1', '  else: dp[i][j] = 0', 'return max(dp)'],
  generate: (input) => {
    const s1 = (input?.s1 ?? 'ABCDGH').slice(0, 15);
    const s2 = (input?.s2 ?? 'ACDGHR').slice(0, 15);
    const m = s1.length, n = s2.length;
    const table: (number | null)[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    const snapshots: Snapshot<DPMatrixData>[] = [];
    let maxLen = 0;
    snapshots.push({ id: '0', step: 0, description: 'Longest common substring.', data: { table: table.map(r => [...r]), rowHeaders: ['', ...s1.split('')], colHeaders: ['', ...s2.split('')], phase: 'init', dpMode: 'table' as const }, currentLine: 0, variables: {} });
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (s1[i - 1] === s2[j - 1]) {
          table[i][j] = table[i - 1][j - 1]! + 1;
          maxLen = Math.max(maxLen, table[i][j]!);
        } else {
          table[i][j] = 0;
        }
        snapshots.push({ id: `${snapshots.length}`, step: snapshots.length, description: `[${i},${j}]: s1[${i - 1}]='${s1[i - 1]}' ${s1[i - 1] === s2[j - 1] ? '==' : '!='} s2[${j - 1}]='${s2[j - 1]}'. LCS=${table[i][j]}.`, data: { table: table.map(r => [...r]), rowHeaders: ['', ...s1.split('')], colHeaders: ['', ...s2.split('')], computingCell: [i, j], phase: 'compute', dpMode: 'table' as const }, currentLine: 1, variables: {} });
      }
    }
    snapshots.push({ id: `${snapshots.length}`, step: snapshots.length, description: `Longest common substring length: ${maxLen}.`, data: { table: table.map(r => [...r]), rowHeaders: ['', ...s1.split('')], colHeaders: ['', ...s2.split('')], phase: 'done', dpMode: 'table' as const }, currentLine: 3, variables: {} });
    return snapshots;
  },
};
