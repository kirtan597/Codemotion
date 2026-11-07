import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { DPMatrixData } from './types';

interface SubsetSumInput {
  set: number[];
  target: number;
}

const DEFAULT_INPUT: SubsetSumInput = {
  set: [3, 34, 4, 12, 5, 2],
  target: 9,
};

export const subsetSumDP: AlgorithmDefinition<SubsetSumInput, DPMatrixData> = {
  id: 'subset-sum-dp',
  name: 'Subset Sum (DP)',
  category: 'dp',
  categoryName: 'Dynamic Programming',
  description:
    'Determine if there exists a subset with given sum using dynamic programming.',
  difficulty: 'Medium',
  timeComplexity: {
    best: 'O(n · sum)',
    average: 'O(n · sum)',
    worst: 'O(n · sum)',
  },
  spaceComplexity: 'O(n · sum)',
  defaultInput: DEFAULT_INPUT,
  inputConfig: {
    type: 'dp',
    supportsCustomInput: true,
  },
  code: [
    'dp[0][0] = true',
    'for i from 1 to n:',
    '  for s from 0 to sum:',
    '    dp[i][s] = dp[i-1][s]',
    '    if s >= set[i-1]:',
    '      dp[i][s] |= dp[i-1][s - set[i-1]]',
  ],
  generate: (input?: SubsetSumInput): Snapshot<DPMatrixData>[] => {
    const set = (input?.set ?? DEFAULT_INPUT.set).filter((v) => v > 0).slice(0, 15);
    const target = Math.max(0, Math.min(100, input?.target ?? DEFAULT_INPUT.target));
    const n = set.length;

    const table: (number | null)[][] = Array.from({ length: n + 1 }, () =>
      Array(target + 1).fill(null)
    );

    const rowHeaders = ['Ø', ...set.map((v, i) => `{${v}}`)];
    const colHeaders = Array.from({ length: target + 1 }, (_, i) => `${i}`);
    const snapshots: Snapshot<DPMatrixData>[] = [];

    const pushSnap = (
      desc: string,
      line: number,
      computing: [number, number] | null,
      deps: Array<[number, number]>,
      phase: 'init' | 'compute' | 'done'
    ) => {
      snapshots.push({
        id: `ss-${snapshots.length}`,
        step: snapshots.length,
        description: desc,
        data: {
          table: table.map((r) => [...r]),
          rowHeaders,
          colHeaders,
          computingCell: computing,
          dependencyCells: deps,
          phase,
          dpMode: 'table',
        },
        currentLine: line,
        variables: {},
      });
    };

    for (let i = 0; i <= n; i++) table[i][0] = 1; // true
    pushSnap('Base case: sum 0 is always achievable (empty subset).', 0, null, [], 'init');

    for (let i = 1; i <= n; i++) {
      const val = set[i - 1];
      for (let s = 1; s <= target; s++) {
        table[i][s] = table[i - 1][s];
        if (s >= val && table[i - 1][s - val] === 1) {
          table[i][s] = 1;
          pushSnap(
            `Cell [${i}, ${s}]: Include ${val}. dp[${i - 1}][${s - val}] = true, so dp[${i}][${s}] = true.`,
            4,
            [i, s],
            [[i - 1, s - val]],
            'compute'
          );
        } else {
          table[i][s] = table[i][s] || 0;
          pushSnap(
            `Cell [${i}, ${s}]: Cannot use ${val}. dp[${i}][${s}] = ${table[i][s] === 1 ? 'true' : 'false'}.`,
            2,
            [i, s],
            [[i - 1, s]],
            'compute'
          );
        }
      }
    }

    pushSnap(
      `Subset sum complete! Subset with sum ${target} ${table[n][target] === 1 ? 'EXISTS' : 'DOES NOT EXIST'}.`,
      5,
      null,
      [],
      'done'
    );

    return snapshots;
  },
};
