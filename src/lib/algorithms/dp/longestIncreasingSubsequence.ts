import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { DPMatrixData } from './types';

interface LISInput {
  array: number[];
}

const DEFAULT_INPUT: LISInput = {
  array: [10, 9, 2, 5, 3, 7, 101, 18],
};

export const longestIncreasingSubsequence: AlgorithmDefinition<LISInput, DPMatrixData> = {
  id: 'longest-increasing-subsequence',
  name: 'Longest Increasing Subsequence',
  category: 'dp',
  categoryName: 'Dynamic Programming',
  description:
    'Find length of longest strictly increasing subsequence using dynamic programming.',
  difficulty: 'Medium',
  timeComplexity: {
    best: 'O(n²)',
    average: 'O(n²)',
    worst: 'O(n²)',
  },
  spaceComplexity: 'O(n)',
  defaultInput: DEFAULT_INPUT,
  inputConfig: {
    type: 'dp',
    supportsCustomInput: true,
  },
  code: [
    'dp[i] = 1 for all i',
    'for i from 1 to n:',
    '  for j from 0 to i-1:',
    '    if arr[j] < arr[i]:',
    '      dp[i] = max(dp[i], dp[j] + 1)',
    'return max(dp)',
  ],
  generate: (input?: LISInput): Snapshot<DPMatrixData>[] => {
    const arr = (input?.array ?? DEFAULT_INPUT.array).slice(0, 20);
    const n = arr.length;

    const table: (number | null)[][] = [arr.map((val) => 1)];
    const rowHeaders = ['LIS length'];
    const colHeaders = arr.map((val, i) => `${i}:${val}`);
    const snapshots: Snapshot<DPMatrixData>[] = [];

    const pushSnap = (
      desc: string,
      line: number,
      computing: [number, number] | null,
      deps: Array<[number, number]>,
      phase: 'init' | 'compute' | 'done'
    ) => {
      snapshots.push({
        id: `lis-${snapshots.length}`,
        step: snapshots.length,
        description: desc,
        data: {
          table: [table[0].map((v) => v)],
          rowHeaders,
          colHeaders,
          computingCell: computing,
          dependencyCells: deps,
          phase,
          dpMode: 'sequence',
        },
        currentLine: line,
        variables: {},
      });
    };

    pushSnap('Initialized: LIS ending at each position is at least 1 (element itself).', 0, null, [], 'init');

    for (let i = 1; i < n; i++) {
      for (let j = 0; j < i; j++) {
        if (arr[j] < arr[i]) {
          const newLen = table[0][j]! + 1;
          if (newLen > table[0][i]!) {
            table[0][i] = newLen;
            pushSnap(
              `Position ${i} (val=${arr[i]}): arr[${j}] (${arr[j]}) < arr[${i}]. Extended LIS from ${j}. dp[${i}] = ${newLen}.`,
              4,
              [0, i],
              [[0, j]],
              'compute'
            );
          }
        }
      }
    }

    const maxLIS = Math.max(...table[0].filter((v): v is number => v !== null));
    pushSnap(
      `LIS complete! Longest increasing subsequence has length: ${maxLIS}.`,
      5,
      null,
      [],
      'done'
    );

    return snapshots;
  },
};
