import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { DPMatrixData } from './types';

interface ClimbingStairsInput {
  n: number;
}

const DEFAULT_INPUT: ClimbingStairsInput = {
  n: 10,
};

export const climbingStairs: AlgorithmDefinition<ClimbingStairsInput, DPMatrixData> = {
  id: 'climbing-stairs',
  name: 'Climbing Stairs',
  category: 'dp',
  categoryName: 'Dynamic Programming',
  description:
    'Count ways to climb n stairs when you can take 1 or 2 steps at a time.',
  difficulty: 'Easy',
  timeComplexity: {
    best: 'O(n)',
    average: 'O(n)',
    worst: 'O(n)',
  },
  spaceComplexity: 'O(n)',
  defaultInput: DEFAULT_INPUT,
  inputConfig: {
    type: 'dp',
    supportsCustomInput: true,
  },
  code: [
    'dp[0] = 1, dp[1] = 1',
    'for i from 2 to n:',
    '  dp[i] = dp[i-1] + dp[i-2]',
    'return dp[n]',
  ],
  generate: (input?: ClimbingStairsInput): Snapshot<DPMatrixData>[] => {
    const n = Math.max(1, Math.min(30, input?.n ?? DEFAULT_INPUT.n));

    const table: (number | null)[][] = [Array(n + 1).fill(null)];
    const rowHeaders = ['Ways'];
    const colHeaders = Array.from({ length: n + 1 }, (_, i) => `Step ${i}`);
    const snapshots: Snapshot<DPMatrixData>[] = [];

    const pushSnap = (
      desc: string,
      line: number,
      computing: [number, number] | null,
      deps: Array<[number, number]>,
      phase: 'init' | 'compute' | 'done'
    ) => {
      snapshots.push({
        id: `cs-${snapshots.length}`,
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

    table[0][0] = 1;
    table[0][1] = 1;
    pushSnap('Base cases: dp[0] = 1, dp[1] = 1.', 0, null, [], 'init');

    for (let i = 2; i <= n; i++) {
      table[0][i] = table[0][i - 1]! + table[0][i - 2]!;
      pushSnap(
        `Step ${i}: dp[${i}] = dp[${i - 1}] + dp[${i - 2}] = ${table[0][i - 1]} + ${table[0][i - 2]} = ${table[0][i]}.`,
        2,
        [0, i],
        [[0, i - 1], [0, i - 2]],
        'compute'
      );
    }

    pushSnap(
      `Climbing stairs complete! Ways to climb ${n} stairs: ${table[0][n]}.`,
      3,
      null,
      [],
      'done'
    );

    return snapshots;
  },
};
