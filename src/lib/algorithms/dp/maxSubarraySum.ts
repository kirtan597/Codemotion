import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { DPMatrixData } from './types';

interface MaxSubarraySumInput {
  array: number[];
}

const DEFAULT_INPUT: MaxSubarraySumInput = {
  array: [-2, 1, -3, 4, -1, 2, 1, -5, 4],
};

export const maxSubarraySum: AlgorithmDefinition<MaxSubarraySumInput, DPMatrixData> = {
  id: 'max-subarray-sum',
  name: 'Maximum Subarray Sum (Kadane)',
  category: 'dp',
  categoryName: 'Dynamic Programming',
  description:
    'Find contiguous subarray with largest sum using Kadane\'s algorithm (DP approach).',
  difficulty: 'Medium',
  timeComplexity: {
    best: 'O(n)',
    average: 'O(n)',
    worst: 'O(n)',
  },
  spaceComplexity: 'O(1)',
  defaultInput: DEFAULT_INPUT,
  inputConfig: {
    type: 'dp',
    supportsCustomInput: true,
  },
  code: [
    'maxEndingHere = 0, maxSoFar = -∞',
    'for each element:',
    '  maxEndingHere = max(element, maxEndingHere + element)',
    '  maxSoFar = max(maxSoFar, maxEndingHere)',
    'return maxSoFar',
  ],
  generate: (input?: MaxSubarraySumInput): Snapshot<DPMatrixData>[] => {
    const arr = (input?.array ?? DEFAULT_INPUT.array).slice(0, 20);
    const n = arr.length;

    const table: (number | null)[][] = [Array(n).fill(null), Array(n).fill(null)];
    const rowHeaders = ['maxEndingHere', 'maxSoFar'];
    const colHeaders = arr.map((val, i) => `${i}:${val}`);
    const snapshots: Snapshot<DPMatrixData>[] = [];

    let maxEndingHere = 0;
    let maxSoFar = -Infinity;

    const pushSnap = (
      desc: string,
      line: number,
      computing: [number, number] | null,
      phase: 'init' | 'compute' | 'done'
    ) => {
      snapshots.push({
        id: `mss-${snapshots.length}`,
        step: snapshots.length,
        description: desc,
        data: {
          table: table.map((r) => [...r]),
          rowHeaders,
          colHeaders,
          computingCell: computing,
          dependencyCells: [],
          phase,
          dpMode: 'sequence',
        },
        currentLine: line,
        variables: { maxEndingHere, maxSoFar },
      });
    };

    pushSnap('Kadane\'s Algorithm: Find maximum subarray sum.', 0, null, 'init');

    for (let i = 0; i < n; i++) {
      maxEndingHere = Math.max(arr[i], maxEndingHere + arr[i]);
      maxSoFar = Math.max(maxSoFar, maxEndingHere);

      table[0][i] = maxEndingHere;
      table[1][i] = maxSoFar;

      pushSnap(
        `Index ${i} (val=${arr[i]}): maxEndingHere = max(${arr[i]}, ${maxEndingHere - arr[i]} + ${arr[i]}) = ${maxEndingHere}. maxSoFar = ${maxSoFar}.`,
        2,
        [0, i],
        'compute'
      );
    }

    pushSnap(
      `Maximum subarray sum: ${maxSoFar}.`,
      4,
      null,
      'done'
    );

    return snapshots;
  },
};
