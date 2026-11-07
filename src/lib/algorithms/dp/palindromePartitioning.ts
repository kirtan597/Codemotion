import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { DPMatrixData } from './types';

export const palindromePartitioning: AlgorithmDefinition<{ s: string }, DPMatrixData> = {
  id: 'palindrome-partitioning',
  name: 'Palindrome Partitioning (Min Cuts)',
  category: 'dp',
  categoryName: 'Dynamic Programming',
  description: 'Find minimum cuts to partition string into palindromes.',
  difficulty: 'Hard',
  timeComplexity: { best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)' },
  spaceComplexity: 'O(n²)',
  defaultInput: { s: 'aab' },
  inputConfig: { type: 'dp' },
  code: ['Precompute palindrome table', 'dp[i] = min cuts for s[0..i]', 'for i:', '  for j <= i:', '    if s[j..i] palindrome: dp[i] = min(dp[i], dp[j-1] + 1)'],
  generate: (input) => {
    const s = (input?.s ?? 'aab').slice(0, 15);
    const n = s.length;
    const table: (number | null)[][] = [Array(n).fill(null)];
    const snapshots: Snapshot<DPMatrixData>[] = [];
    const isPalin = (i: number, j: number) => { let l = i, r = j; while (l < r) if (s[l++] !== s[r--]) return false; return true; };
    snapshots.push({ id: '0', step: 0, description: 'Min cuts for palindrome partitioning.', data: { table: [table[0].map(v => v)], rowHeaders: ['Min Cuts'], colHeaders: s.split('').map((c, i) => `${i}:${c}`), phase: 'init', dpMode: 'sequence' as const }, currentLine: 0, variables: {} });
    for (let i = 0; i < n; i++) {
      table[0][i] = i;
      for (let j = 0; j <= i; j++) {
        if (isPalin(j, i)) {
          table[0][i] = j === 0 ? 0 : Math.min(table[0][i]!, table[0][j - 1]! + 1);
        }
      }
      snapshots.push({ id: `${snapshots.length}`, step: snapshots.length, description: `Position ${i}: min cuts = ${table[0][i]}.`, data: { table: [table[0].map(v => v)], rowHeaders: ['Min Cuts'], colHeaders: s.split('').map((c, idx) => `${idx}:${c}`), computingCell: [0, i], phase: 'compute', dpMode: 'sequence' as const }, currentLine: 2, variables: {} });
    }
    snapshots.push({ id: `${snapshots.length}`, step: snapshots.length, description: `Min cuts: ${table[0][n - 1]}.`, data: { table: [table[0].map(v => v)], rowHeaders: ['Min Cuts'], colHeaders: s.split('').map((c, i) => `${i}:${c}`), phase: 'done', dpMode: 'sequence' as const }, currentLine: 3, variables: {} });
    return snapshots;
  },
};
