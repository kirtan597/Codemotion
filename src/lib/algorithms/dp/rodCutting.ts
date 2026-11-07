import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { DPMatrixData } from './types';

interface RodCuttingInput {
  length: number;
  prices: number[];
}

const DEFAULT_INPUT: RodCuttingInput = {
  length: 8,
  prices: [1, 5, 8, 9, 10, 17, 17, 20],
};

export const rodCutting: AlgorithmDefinition<RodCuttingInput, DPMatrixData> = {
  id: 'rod-cutting',
  name: 'Rod Cutting',
  category: 'dp',
  categoryName: 'Dynamic Programming',
  description:
    'Find maximum revenue obtainable by cutting rod into pieces and selling them.',
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
    'dp[0] = 0',
    'for i from 1 to n:',
    '  for j from 1 to i:',
    '    dp[i] = max(dp[i], prices[j] + dp[i-j])',
    'return dp[n]',
  ],
  generate: (input?: RodCuttingInput): Snapshot<DPMatrixData>[] => {
    const n = Math.max(1, Math.min(20, input?.length ?? DEFAULT_INPUT.length));
    const prices = [0, ...(input?.prices ?? DEFAULT_INPUT.prices).slice(0, n)];

    const table: (number | null)[][] = [Array(n + 1).fill(null)];
    const rowHeaders = ['Max Revenue'];
    const colHeaders = Array.from({ length: n + 1 }, (_, i) => `Len ${i}`);
    const snapshots: Snapshot<DPMatrixData>[] = [];

    const pushSnap = (
      desc: string,
      line: number,
      computing: [number, number] | null,
      deps: Array<[number, number]>,
      phase: 'init' | 'compute' | 'done'
    ) => {
      snapshots.push({
        id: `rc-${snapshots.length}`,
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

    table[0][0] = 0;
    pushSnap('Base case: rod of length 0 has revenue 0.', 0, null, [], 'init');

    for (let i = 1; i <= n; i++) {
      table[0][i] = 0;
      for (let j = 1; j <= i; j++) {
        const val = prices[j] + table[0][i - j]!;
        if (val > table[0][i]!) {
          table[0][i] = val;
          pushSnap(
            `Length ${i}: cut piece of length ${j} (price=${prices[j]}) + dp[${i - j}] = ${prices[j]} + ${table[0][i - j]} = ${val}.`,
            3,
            [0, i],
            [[0, i - j]],
            'compute'
          );
        }
      }
    }

    pushSnap(
      `Rod cutting complete! Maximum revenue for length ${n}: ${table[0][n]}.`,
      4,
      null,
      [],
      'done'
    );

    return snapshots;
  },
};
