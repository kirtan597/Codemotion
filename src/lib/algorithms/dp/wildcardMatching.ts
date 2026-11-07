import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { DPMatrixData } from './types';

export const wildcardMatching: AlgorithmDefinition<{ s: string; p: string }, DPMatrixData> = {
  id: 'wildcard-matching',
  name: 'Wildcard Matching',
  category: 'dp',
  categoryName: 'Dynamic Programming',
  description: 'Match string with pattern supporting ? (any char) and * (any sequence).',
  difficulty: 'Hard',
  timeComplexity: { best: 'O(m·n)', average: 'O(m·n)', worst: 'O(m·n)' },
  spaceComplexity: 'O(m·n)',
  defaultInput: { s: 'aa', p: 'a*' },
  inputConfig: { type: 'dp' },
  code: ['dp[0][0] = true', 'Handle * at pattern start', 'for i, j:', '  if p[j] == *: dp[i][j] = dp[i-1][j] OR dp[i][j-1]', '  else if match: dp[i][j] = dp[i-1][j-1]'],
  generate: (input) => {
    const s = (input?.s ?? 'aa').slice(0, 15);
    const p = (input?.p ?? 'a*').slice(0, 15);
    const m = s.length, n = p.length;
    const table: (number | null)[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    const snapshots: Snapshot<DPMatrixData>[] = [];
    table[0][0] = 1;
    for (let j = 1; j <= n; j++) if (p[j - 1] === '*') table[0][j] = table[0][j - 1]; else break;
    snapshots.push({ id: '0', step: 0, description: 'Base: empty matches empty, handle leading *.', data: { table: table.map(r => [...r]), rowHeaders: ['', ...s.split('')], colHeaders: ['', ...p.split('')], phase: 'init', dpMode: 'table' as const }, currentLine: 0, variables: {} });
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (p[j - 1] === '*') {
          table[i][j] = table[i - 1][j] || table[i][j - 1] ? 1 : 0;
        } else if (p[j - 1] === '?' || s[i - 1] === p[j - 1]) {
          table[i][j] = table[i - 1][j - 1];
        }
        snapshots.push({ id: `${snapshots.length}`, step: snapshots.length, description: `[${i},${j}]: s='${s[i - 1]}' p='${p[j - 1]}'. Match=${table[i][j] === 1 ? 'true' : 'false'}.`, data: { table: table.map(r => [...r]), rowHeaders: ['', ...s.split('')], colHeaders: ['', ...p.split('')], computingCell: [i, j], phase: 'compute', dpMode: 'table' as const }, currentLine: 3, variables: {} });
      }
    }
    snapshots.push({ id: `${snapshots.length}`, step: snapshots.length, description: `Wildcard match: ${table[m][n] === 1 ? 'TRUE' : 'FALSE'}.`, data: { table: table.map(r => [...r]), rowHeaders: ['', ...s.split('')], colHeaders: ['', ...p.split('')], phase: 'done', dpMode: 'table' as const }, currentLine: 4, variables: {} });
    return snapshots;
  },
};
