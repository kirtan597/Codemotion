import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import {
  DPMatrixData,
  LCSInput,
  DEFAULT_LCS_INPUT,
} from './types';

export const lcs: AlgorithmDefinition<LCSInput | any, DPMatrixData> = {
  id: 'lcs',
  name: 'Longest Common Subsequence (LCS)',
  category: 'dp',
  categoryName: 'Dynamic Programming',
  description:
    'Finds the longest subsequence present in both strings in the same relative order using a 2D dynamic programming table and backtracks the result.',
  difficulty: 'Medium',
  timeComplexity: {
    best: 'O(m · n)',
    average: 'O(m · n)',
    worst: 'O(m · n)',
  },
  spaceComplexity: 'O(m · n)',
  defaultInput: DEFAULT_LCS_INPUT,
  inputConfig: {
    type: 'dp',
    supportsCustomInput: true,
  },
  code: [
    'for i from 1 to m:',
    '  for j from 1 to n:',
    '    if text1[i-1] == text2[j-1]:',
    '      dp[i][j] = dp[i-1][j-1] + 1',
    '    else:',
    '      dp[i][j] = max(dp[i-1][j], dp[i][j-1])',
    'backtrack from dp[m][n] to reconstruct LCS string',
  ],
  generate: (input?: LCSInput): Snapshot<DPMatrixData>[] => {
    const rawText1 = input?.text1 ?? DEFAULT_LCS_INPUT.text1;
    const rawText2 = input?.text2 ?? DEFAULT_LCS_INPUT.text2;

    const text1 = (rawText1 || 'STONE').slice(0, 15);
    const text2 = (rawText2 || 'LONGEST').slice(0, 15);

    const m = text1.length;
    const n = text2.length;

    // Table dimensions: (m + 1) rows, (n + 1) columns
    const table: (number | null)[][] = Array.from({ length: m + 1 }, () =>
      Array.from({ length: n + 1 }, () => null)
    );

    const rowHeaders = ['Ø', ...text1.split('').map((char, i) => `${i + 1} (${char})`)];
    const colHeaders = ['Ø', ...text2.split('').map((char, j) => `${j + 1} (${char})`)];

    const snapshots: Snapshot<DPMatrixData>[] = [];

    const copyTable = (): (number | null)[][] => {
      return table.map((row) => [...row]);
    };

    const pushSnapshot = (
      desc: string,
      line: number,
      computingCell: [number, number] | null,
      dependencies: Array<[number, number]>,
      backtrackCells: Array<[number, number]> = [],
      phase: DPMatrixData['phase'] = 'compute',
      vars: Record<string, any> = {}
    ) => {
      snapshots.push({
        id: `lcs-${snapshots.length}`,
        step: snapshots.length,
        description: desc,
        data: {
          table: copyTable(),
          rowHeaders,
          colHeaders,
          computingCell,
          dependencyCells: dependencies,
          backtrackCells,
          phase,
        },
        currentLine: line,
        variables: {
          ...vars,
        },
      });
    };

    // 1. Initialize base row (i = 0) and base col (j = 0) with 0
    for (let j = 0; j <= n; j++) table[0][j] = 0;
    for (let i = 0; i <= m; i++) table[i][0] = 0;

    pushSnapshot(
      `Initialized LCS base cases with 0. Empty prefix of either string yields an LCS of length 0.`,
      0,
      null,
      [],
      [],
      'init',
      {
        formula: 'dp[0][j] = 0, dp[i][0] = 0',
        decision: 'init',
      }
    );

    // 2. Main DP loop
    for (let i = 1; i <= m; i++) {
      const char1 = text1[i - 1];

      for (let j = 1; j <= n; j++) {
        const char2 = text2[j - 1];
        const isMatch = char1 === char2;

        let chosenVal: number;
        let deps: Array<[number, number]>;
        let decision: 'match' | 'top' | 'left';
        let formulaStr: string;
        let substitutedStr: string;

        if (isMatch) {
          const diag = table[i - 1][j - 1]!;
          chosenVal = diag + 1;
          deps = [[i - 1, j - 1]];
          decision = 'match';
          formulaStr = `dp[${i}][${j}] = dp[${i - 1}][${j - 1}] + 1`;
          substitutedStr = `'${char1}' == '${char2}' → ${diag} + 1 = ${chosenVal}`;
        } else {
          const top = table[i - 1][j]!;
          const left = table[i][j - 1]!;
          chosenVal = Math.max(top, left);
          deps = [
            [i - 1, j],
            [i, j - 1],
          ];
          decision = top >= left ? 'top' : 'left';
          formulaStr = `dp[${i}][${j}] = max(dp[${i - 1}][${j}], dp[${i}][${j - 1}])`;
          substitutedStr = `'${char1}' ≠ '${char2}' → max(top: ${top}, left: ${left}) = ${chosenVal}`;
        }

        table[i][j] = chosenVal;

        pushSnapshot(
          `Cell [${i}, ${j}] comparing "${char1}" (text1[${i - 1}]) and "${char2}" (text2[${j - 1}]): ${
            isMatch
              ? `Characters MATCH! Extend diagonal LCS by 1 → ${chosenVal}.`
              : `Mismatch. Take max of top (${table[i - 1][j]}) and left (${table[i][j - 1]}) → ${chosenVal}.`
          }`,
          isMatch ? 3 : 5,
          [i, j],
          deps,
          [],
          'compute',
          {
            formula: formulaStr,
            substitutedFormula: substitutedStr,
            decision,
            bestValue: chosenVal,
            currentPair: { char1, char2, i, j },
          }
        );
      }
    }

    // 3. Backtrack Phase
    const backtrackPath: Array<[number, number]> = [];
    const lcsChars: string[] = [];
    let r = m;
    let c = n;

    pushSnapshot(
      `Table filling complete! Longest Common Subsequence length is ${table[m][n]}. Starting backtrack from cell [${m}, ${n}] to reconstruct the sequence.`,
      6,
      [m, n],
      [],
      [[m, n]],
      'backtrack',
      {
        formula: 'Backtracking from dp[m][n]',
        decision: 'backtrack',
        bestValue: table[m][n]!,
        lcsString: '',
      }
    );

    while (r > 0 && c > 0) {
      backtrackPath.push([r, c]);
      const char1 = text1[r - 1];
      const char2 = text2[c - 1];

      if (char1 === char2) {
        lcsChars.unshift(char1);
        const currentLCS = lcsChars.join('');
        const prevR = r;
        const prevC = c;
        r--;
        c--;

        pushSnapshot(
          `At cell [${prevR}, ${prevC}]: text1[${prevR - 1}] ('${char1}') == text2[${prevC - 1}] ('${char2}'). MATCH! Added '${char1}' to LCS. Moving diagonally to [${r}, ${c}].`,
          6,
          [prevR, prevC],
          [[r, c]],
          [...backtrackPath],
          'backtrack',
          {
            formula: `Match found: '${char1}'`,
            decision: 'match',
            lcsString: currentLCS,
            bestValue: table[m][n]!,
          }
        );
      } else if (table[r - 1][c]! >= table[r][c - 1]!) {
        const prevR = r;
        r--;
        pushSnapshot(
          `At cell [${prevR}, ${c}]: top cell [${r}, ${c}] (${table[r][c]}) >= left cell [${prevR}, ${c - 1}] (${table[prevR][c - 1]}). Moving up.`,
          6,
          [prevR, c],
          [[r, c]],
          [...backtrackPath],
          'backtrack',
          {
            formula: 'Moving up (top >= left)',
            decision: 'top',
            lcsString: lcsChars.join(''),
            bestValue: table[m][n]!,
          }
        );
      } else {
        const prevC = c;
        c--;
        pushSnapshot(
          `At cell [${r}, ${prevC}]: left cell [${r}, ${c}] (${table[r][c]}) > top cell [${r - 1}, ${prevC}] (${table[r - 1][prevC]}). Moving left.`,
          6,
          [r, prevC],
          [[r, c]],
          [...backtrackPath],
          'backtrack',
          {
            formula: 'Moving left (left > top)',
            decision: 'left',
            lcsString: lcsChars.join(''),
            bestValue: table[m][n]!,
          }
        );
      }
    }

    backtrackPath.push([r, c]);
    const finalLCS = lcsChars.join('');

    // Final Snapshot
    pushSnapshot(
      `LCS Complete! Reconstructed Longest Common Subsequence is "${finalLCS}" (length ${finalLCS.length}).`,
      6,
      null,
      [],
      [...backtrackPath],
      'done',
      {
        formula: `Final LCS: "${finalLCS}"`,
        decision: 'done',
        bestValue: table[m][n]!,
        lcsString: finalLCS,
        reconstructedLCS: finalLCS,
      }
    );

    return snapshots;
  },
};

