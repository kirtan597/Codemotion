import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { DPMatrixData } from './types';

interface MatrixChainInput {
  dimensions: number[];
}

const DEFAULT_INPUT: MatrixChainInput = {
  dimensions: [30, 35, 15, 5, 10, 20, 25],
};

export const matrixChainMultiplication: AlgorithmDefinition<MatrixChainInput, DPMatrixData> = {
  id: 'matrix-chain-multiplication',
  name: 'Matrix Chain Multiplication',
  category: 'dp',
  categoryName: 'Dynamic Programming',
  description:
    'Find minimum scalar multiplications needed to multiply chain of matrices.',
  difficulty: 'Hard',
  timeComplexity: {
    best: 'O(n³)',
    average: 'O(n³)',
    worst: 'O(n³)',
  },
  spaceComplexity: 'O(n²)',
  defaultInput: DEFAULT_INPUT,
  inputConfig: {
    type: 'dp',
    supportsCustomInput: true,
  },
  code: [
    'for len from 2 to n:',
    '  for i from 1 to n-len+1:',
    '    j = i + len - 1',
    '    for k from i to j-1:',
    '      cost = dp[i][k] + dp[k+1][j] + p[i-1]*p[k]*p[j]',
    '      dp[i][j] = min(dp[i][j], cost)',
  ],
  generate: (input?: MatrixChainInput): Snapshot<DPMatrixData>[] => {
    const p = (input?.dimensions ?? DEFAULT_INPUT.dimensions).slice(0, 10);
    const n = p.length - 1;

    const table: (number | null)[][] = Array.from({ length: n + 1 }, () =>
      Array(n + 1).fill(null)
    );

    const rowHeaders = ['', ...Array.from({ length: n }, (_, i) => `M${i + 1}`)];
    const colHeaders = ['', ...Array.from({ length: n }, (_, i) => `M${i + 1}`)];
    const snapshots: Snapshot<DPMatrixData>[] = [];

    const pushSnap = (
      desc: string,
      line: number,
      computing: [number, number] | null,
      deps: Array<[number, number]>,
      phase: 'init' | 'compute' | 'done'
    ) => {
      snapshots.push({
        id: `mcm-${snapshots.length}`,
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

    for (let i = 1; i <= n; i++) table[i][i] = 0;
    pushSnap('Base case: single matrix multiplication cost = 0.', 0, null, [], 'init');

    for (let len = 2; len <= n; len++) {
      for (let i = 1; i <= n - len + 1; i++) {
        const j = i + len - 1;
        table[i][j] = Infinity;

        for (let k = i; k < j; k++) {
          const cost = table[i][k]! + table[k + 1][j]! + p[i - 1] * p[k] * p[j];
          if (cost < table[i][j]!) {
            table[i][j] = cost;
            pushSnap(
              `Cell [${i}, ${j}]: split at k=${k}. Cost = ${table[i][k]} + ${table[k + 1][j]} + ${p[i - 1]}*${p[k]}*${p[j]} = ${cost}.`,
              4,
              [i, j],
              [[i, k], [k + 1, j]],
              'compute'
            );
          }
        }
      }
    }

    pushSnap(
      `Matrix chain multiplication complete! Minimum cost: ${table[1][n]}.`,
      5,
      null,
      [],
      'done'
    );

    return snapshots;
  },
};
