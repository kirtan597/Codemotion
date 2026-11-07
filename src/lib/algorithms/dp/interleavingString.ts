import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { DPMatrixData } from './types';

export const interleavingString: AlgorithmDefinition<{ s1: string; s2: string; s3: string }, DPMatrixData> = {
  id: 'interleaving-string',
  name: 'Interleaving String',
  category: 'dp',
  categoryName: 'Dynamic Programming',
  description: 'Determine if s3 is formed by interleaving s1 and s2.',
  difficulty: 'Hard',
  timeComplexity: { best: 'O(m·n)', average: 'O(m·n)', worst: 'O(m·n)' },
  spaceComplexity: 'O(m·n)',
  defaultInput: { s1: 'aabcc', s2: 'dbbca', s3: 'aadbbcbcac' },
  inputConfig: { type: 'dp' },
  code: ['dp[0][0] = true', 'for i, j:', '  dp[i][j] = (s1[i-1]==s3[i+j-1] AND dp[i-1][j]) OR (s2[j-1]==s3[i+j-1] AND dp[i][j-1])'],
  generate: (input) => {
    const s1 = (input?.s1 ?? 'aabcc').slice(0, 12);
    const s2 = (input?.s2 ?? 'dbbca').slice(0, 12);
    const s3 = (input?.s3 ?? 'aadbbcbcac').slice(0, 24);
    if (s1.length + s2.length !== s3.length) {
      return [{ id: '0', step: 0, description: 'Length mismatch. Not interleaving.', data: { table: [[0]], rowHeaders: [''], colHeaders: [''], phase: 'done', dpMode: 'table' as const }, currentLine: 0, variables: {} }];
    }
    const m = s1.length, n = s2.length;
    const table: (number | null)[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    const snapshots: Snapshot<DPMatrixData>[] = [];
    table[0][0] = 1;
    for (let i = 1; i <= m; i++) if (s1[i - 1] === s3[i - 1]) table[i][0] = table[i - 1][0]; else break;
    for (let j = 1; j <= n; j++) if (s2[j - 1] === s3[j - 1]) table[0][j] = table[0][j - 1]; else break;
    snapshots.push({ id: '0', step: 0, description: 'Base: check prefix matches.', data: { table: table.map(r => [...r]), rowHeaders: ['', ...s1.split('')], colHeaders: ['', ...s2.split('')], phase: 'init', dpMode: 'table' as const }, currentLine: 0, variables: {} });
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const k = i + j - 1;
        if (s1[i - 1] === s3[k] && table[i - 1][j]) table[i][j] = 1;
        if (s2[j - 1] === s3[k] && table[i][j - 1]) table[i][j] = 1;
        snapshots.push({ id: `${snapshots.length}`, step: snapshots.length, description: `[${i},${j}]: s3[${k}]='${s3[k]}'. Interleave=${table[i][j] === 1 ? 'true' : 'false'}.`, data: { table: table.map(r => [...r]), rowHeaders: ['', ...s1.split('')], colHeaders: ['', ...s2.split('')], computingCell: [i, j], phase: 'compute', dpMode: 'table' as const }, currentLine: 2, variables: {} });
      }
    }
    snapshots.push({ id: `${snapshots.length}`, step: snapshots.length, description: `Interleaving: ${table[m][n] === 1 ? 'POSSIBLE' : 'IMPOSSIBLE'}.`, data: { table: table.map(r => [...r]), rowHeaders: ['', ...s1.split('')], colHeaders: ['', ...s2.split('')], phase: 'done', dpMode: 'table' as const }, currentLine: 2, variables: {} });
    return snapshots;
  },
};
