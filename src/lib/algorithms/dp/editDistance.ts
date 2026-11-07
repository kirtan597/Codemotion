import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { DPMatrixData } from './types';

interface EditDistanceInput {
  word1: string;
  word2: string;
}

const DEFAULT_INPUT: EditDistanceInput = {
  word1: 'HORSE',
  word2: 'ROS',
};

export const editDistance: AlgorithmDefinition<EditDistanceInput, DPMatrixData> = {
  id: 'edit-distance',
  name: 'Edit Distance (Levenshtein)',
  category: 'dp',
  categoryName: 'Dynamic Programming',
  description:
    'Find minimum edit operations (insert, delete, replace) to convert word1 to word2 using DP.',
  difficulty: 'Hard',
  timeComplexity: {
    best: 'O(m · n)',
    average: 'O(m · n)',
    worst: 'O(m · n)',
  },
  spaceComplexity: 'O(m · n)',
  defaultInput: DEFAULT_INPUT,
  inputConfig: {
    type: 'dp',
    supportsCustomInput: true,
  },
  code: [
    'for i from 0 to m:',
    '  for j from 0 to n:',
    '    if i == 0: dp[i][j] = j',
    '    elif j == 0: dp[i][j] = i',
    '    elif word1[i-1] == word2[j-1]: dp[i][j] = dp[i-1][j-1]',
    '    else: dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])',
  ],
  generate: (input?: EditDistanceInput): Snapshot<DPMatrixData>[] => {
    const word1 = (input?.word1 ?? DEFAULT_INPUT.word1).slice(0, 15);
    const word2 = (input?.word2 ?? DEFAULT_INPUT.word2).slice(0, 15);
    const m = word1.length;
    const n = word2.length;

    const table: (number | null)[][] = Array.from({ length: m + 1 }, () =>
      Array.from({ length: n + 1 }, () => null)
    );

    const rowHeaders = ['Ø', ...word1.split('').map((c, i) => `${i + 1}:${c}`)];
    const colHeaders = ['Ø', ...word2.split('').map((c, j) => `${j + 1}:${c}`)];
    const snapshots: Snapshot<DPMatrixData>[] = [];

    const pushSnap = (
      desc: string,
      line: number,
      computing: [number, number] | null,
      deps: Array<[number, number]>,
      phase: 'init' | 'compute' | 'done'
    ) => {
      snapshots.push({
        id: `ed-${snapshots.length}`,
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

    // Base cases
    for (let i = 0; i <= m; i++) table[i][0] = i;
    for (let j = 0; j <= n; j++) table[0][j] = j;
    pushSnap('Base cases: empty string requires i deletions or j insertions.', 0, null, [], 'init');

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const char1 = word1[i - 1];
        const char2 = word2[j - 1];

        if (char1 === char2) {
          table[i][j] = table[i - 1][j - 1]!;
          pushSnap(
            `Cell [${i}, ${j}]: '${char1}' == '${char2}'. No operation needed. dp[${i}][${j}] = dp[${i - 1}][${j - 1}] = ${table[i][j]}.`,
            4,
            [i, j],
            [[i - 1, j - 1]],
            'compute'
          );
        } else {
          const replace = table[i - 1][j - 1]! + 1;
          const remove = table[i - 1][j]! + 1;
          const insert = table[i][j - 1]! + 1;
          table[i][j] = Math.min(replace, remove, insert);

          pushSnap(
            `Cell [${i}, ${j}]: '${char1}' ≠ '${char2}'. Replace=${replace}, Delete=${remove}, Insert=${insert}. Min=${table[i][j]}.`,
            5,
            [i, j],
            [[i - 1, j - 1], [i - 1, j], [i, j - 1]],
            'compute'
          );
        }
      }
    }

    pushSnap(
      `Edit distance complete! Minimum operations to convert "${word1}" to "${word2}": ${table[m][n]}.`,
      5,
      null,
      [],
      'done'
    );

    return snapshots;
  },
};
