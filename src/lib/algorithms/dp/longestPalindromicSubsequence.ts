import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { DPMatrixData } from './types';

export const longestPalindromicSubsequence: AlgorithmDefinition<{ s: string }, DPMatrixData> = {
  id: 'longest-palindromic-subsequence',
  name: 'Longest Palindromic Subsequence',
  category: 'dp',
  categoryName: 'Dynamic Programming',
  description: 'Find length of longest palindromic subsequence in a string.',
  difficulty: 'Medium',
  timeComplexity: { best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)' },
  spaceComplexity: 'O(n²)',
  defaultInput: { s: 'BBABCBCAB' },
  inputConfig: { type: 'dp', supportsCustomInput: true },
  code: ['for len from 1 to n:', '  for i from 0 to n-len:', '    j = i + len - 1', '    if s[i] == s[j]: dp[i][j] = dp[i+1][j-1] + 2', '    else: dp[i][j] = max(dp[i+1][j], dp[i][j-1])'],
  generate: (input) => {
    const s = (input?.s ?? 'BBABCBCAB').slice(0, 15);
    const n = s.length;
    const table: (number | null)[][] = Array.from({ length: n }, () => Array(n).fill(null));
    const snapshots: Snapshot<DPMatrixData>[] = [];
    for (let i = 0; i < n; i++) table[i][i] = 1;
    snapshots.push({ id: '0', step: 0, description: 'Base: single character palindrome has length 1.', data: { table: table.map(r => [...r]), rowHeaders: s.split('').map((c, i) => `${i}:${c}`), colHeaders: s.split('').map((c, i) => `${i}:${c}`), phase: 'init', dpMode: 'table' as const }, currentLine: 0, variables: {} });
    for (let len = 2; len <= n; len++) {
      for (let i = 0; i <= n - len; i++) {
        const j = i + len - 1;
        if (s[i] === s[j]) {
          table[i][j] = (table[i + 1][j - 1] || 0) + 2;
        } else {
          table[i][j] = Math.max(table[i + 1][j] || 0, table[i][j - 1] || 0);
        }
        snapshots.push({ id: `${snapshots.length}`, step: snapshots.length, description: `Cell [${i}, ${j}]: s[${i}]='${s[i]}' ${s[i] === s[j] ? '==' : '!='} s[${j}]='${s[j]}'. LPS=${table[i][j]}.`, data: { table: table.map(r => [...r]), rowHeaders: s.split('').map((c, idx) => `${idx}:${c}`), colHeaders: s.split('').map((c, idx) => `${idx}:${c}`), computingCell: [i, j], phase: 'compute', dpMode: 'table' as const }, currentLine: 3, variables: {} });
      }
    }
    snapshots.push({ id: `${snapshots.length}`, step: snapshots.length, description: `Longest palindromic subsequence length: ${table[0][n - 1]}.`, data: { table: table.map(r => [...r]), rowHeaders: s.split('').map((c, i) => `${i}:${c}`), colHeaders: s.split('').map((c, i) => `${i}:${c}`), phase: 'done', dpMode: 'table' as const }, currentLine: 4, variables: {} });
    return snapshots;
  },
};
