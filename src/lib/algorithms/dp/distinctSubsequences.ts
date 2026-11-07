import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { DPMatrixData } from './types';

export const distinctSubsequences: AlgorithmDefinition<{ s: string; t: string }, DPMatrixData> = {
  id: 'distinct-subsequences',
  name: 'Distinct Subsequences',
  category: 'dp',
  categoryName: 'Dynamic Programming',
  description: 'Count distinct subsequences of s that equal t.',
  difficulty: 'Hard',
  timeComplexity: { best: 'O(m·n)', average: 'O(m·n)', worst: 'O(m·n)' },
  spaceComplexity: 'O(m·n)',
  defaultInput: { s: 'rabbbit', t: 'rabbit' },
  inputConfig: { type: 'dp' },
  code: ['dp[0][0] = 1', 'for i, j:', '  if s[i-1] == t[j-1]: dp[i][j] = dp[i-1][j-1] + dp[i-1][j]', '  else: dp[i][j] = dp[i-1][j]'],
  generate: (input) => {
    const s = (input?.s ?? 'rabbbit').slice(0, 15);
    const t = (input?.t ?? 'rabbit').slice(0, 15);
    const m = s.length, n = t.length;
    const table: (number | null)[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    const snapshots: Snapshot<DPMatrixData>[] = [];
    for (let i = 0; i <= m; i++) table[i][0] = 1;
    snapshots.push({ id: '0', step: 0, description: 'Base: empty t has 1 subsequence.', data: { table: table.map(r => [...r]), rowHeaders: ['', ...s.split('')], colHeaders: ['', ...t.split('')], phase: 'init', dpMode: 'table' as const }, currentLine: 0, variables: {} });
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        table[i][j] = table[i - 1][j]!;
        if (s[i - 1] === t[j - 1]) table[i][j]! += table[i - 1][j - 1]!;
        snapshots.push({ id: `${snapshots.length}`, step: snapshots.length, description: `[${i},${j}]: s[${i - 1}]='${s[i - 1]}' ${s[i - 1] === t[j - 1] ? '==' : '!='} t[${j - 1}]='${t[j - 1]}'. Count=${table[i][j]}.`, data: { table: table.map(r => [...r]), rowHeaders: ['', ...s.split('')], colHeaders: ['', ...t.split('')], computingCell: [i, j], phase: 'compute', dpMode: 'table' as const }, currentLine: 1, variables: {} });
      }
    }
    snapshots.push({ id: `${snapshots.length}`, step: snapshots.length, description: `Distinct subsequences count: ${table[m][n]}.`, data: { table: table.map(r => [...r]), rowHeaders: ['', ...s.split('')], colHeaders: ['', ...t.split('')], phase: 'done', dpMode: 'table' as const }, currentLine: 2, variables: {} });
    return snapshots;
  },
};
