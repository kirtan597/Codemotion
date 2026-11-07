/**
 * Levenshtein Distance (Edit Distance)
 * 
 * Minimum number of single-character edits (insertions, deletions, substitutions)
 * required to change one string into another.
 * Time: O(mn)
 * Space: O(mn)
 */

import { AlgorithmDefinition } from '../../types/algorithm';
import { 
  DistanceInput, 
  DistanceMatrixData, 
  StringSnapshot,
  DistanceCell 
} from '../../types/string';

function generateLevenshtein(input: DistanceInput): StringSnapshot<DistanceMatrixData>[] {
  const { text1, text2 } = input;
  const m = text1.length;
  const n = text2.length;
  const snapshots: StringSnapshot<DistanceMatrixData>[] = [];
  let step = 0;

  // Initialize matrix
  const matrix: DistanceCell[][] = Array.from({ length: m + 1 }, () =>
    Array.from({ length: n + 1 }, () => ({ value: 0, state: 'default' as const }))
  );

  snapshots.push({
    id: `lev-${step++}`,
    step: snapshots.length,
    description: `Computing Levenshtein distance between "${text1}" and "${text2}"`,
    data: {
      text1,
      text2,
      matrix,
      currentRow: 0,
      currentCol: 0,
      distance: 0,
      operations: [],
    },
    currentLine: 1,
    variables: { m, n },
  });

  // Initialize first row and column
  for (let i = 0; i <= m; i++) {
    matrix[i][0].value = i;
    matrix[i][0].operation = 'delete';
  }
  for (let j = 0; j <= n; j++) {
    matrix[0][j].value = j;
    matrix[0][j].operation = 'insert';
  }
  matrix[0][0].operation = 'match';

  snapshots.push({
    id: `lev-${step++}`,
    step: snapshots.length,
    description: `Initialized base cases: row 0 = insertions, column 0 = deletions`,
    data: {
      text1,
      text2,
      matrix: matrix.map(row => row.map(cell => ({ ...cell }))),
      currentRow: 0,
      currentCol: 0,
      distance: 0,
      operations: [],
    },
    currentLine: 2,
    variables: { m, n },
  });

  // Fill matrix
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = text1[i - 1] === text2[j - 1] ? 0 : 1;
      
      const matrixCopy = matrix.map(row => row.map(cell => ({ ...cell })));
      matrixCopy[i][j].state = 'active';
      matrixCopy[i - 1][j].state = 'comparing';
      matrixCopy[i][j - 1].state = 'comparing';
      matrixCopy[i - 1][j - 1].state = 'comparing';

      const deleteOp = matrix[i - 1][j].value + 1;
      const insertOp = matrix[i][j - 1].value + 1;
      const replaceOp = matrix[i - 1][j - 1].value + cost;

      const minVal = Math.min(deleteOp, insertOp, replaceOp);
      matrix[i][j].value = minVal;

      if (minVal === replaceOp && cost === 0) {
        matrix[i][j].operation = 'match';
      } else if (minVal === replaceOp) {
        matrix[i][j].operation = 'replace';
      } else if (minVal === insertOp) {
        matrix[i][j].operation = 'insert';
      } else {
        matrix[i][j].operation = 'delete';
      }

      const charMatch = text1[i - 1] === text2[j - 1];
      
      snapshots.push({
        id: `lev-${step++}`,
        step: snapshots.length,
        description: `[${i},${j}]: '${text1[i-1]}' vs '${text2[j-1]}' ${charMatch ? '(match)' : '(diff)'}. Min(del=${deleteOp}, ins=${insertOp}, ${cost === 0 ? 'match' : 'repl'}=${replaceOp}) = ${minVal}`,
        data: {
          text1,
          text2,
          matrix: matrixCopy,
          currentRow: i,
          currentCol: j,
          distance: minVal,
          operations: [],
        },
        currentLine: 3,
        variables: { i, j, cost, minVal, deleteOp, insertOp, replaceOp },
      });

      matrix[i][j].state = 'computed';
    }
  }

  // Backtrack to find operations
  const operations: any[] = [];
  let i = m, j = n;
  
  while (i > 0 || j > 0) {
    const matrixCopy = matrix.map(row => row.map(cell => ({ ...cell })));
    matrixCopy[i][j].state = 'path';
    
    if (i > 0 && j > 0 && matrix[i][j].operation === 'match') {
      operations.unshift({ type: 'match', position: i - 1, char: text1[i - 1] });
      i--;
      j--;
    } else if (i > 0 && j > 0 && matrix[i][j].operation === 'replace') {
      operations.unshift({ type: 'replace', position: i - 1, char: text2[j - 1] });
      i--;
      j--;
    } else if (j > 0 && matrix[i][j].operation === 'insert') {
      operations.unshift({ type: 'insert', position: i, char: text2[j - 1] });
      j--;
    } else {
      operations.unshift({ type: 'delete', position: i - 1 });
      i--;
    }
  }

  // Mark path
  i = m;
  j = n;
  while (i > 0 || j > 0) {
    matrix[i][j].state = 'path';
    
    if (i > 0 && j > 0 && text1[i - 1] === text2[j - 1]) {
      i--;
      j--;
    } else if (i > 0 && j > 0 && matrix[i][j].operation === 'replace') {
      i--;
      j--;
    } else if (j > 0 && matrix[i][j].operation === 'insert') {
      j--;
    } else {
      i--;
    }
  }
  matrix[0][0].state = 'path';

  snapshots.push({
    id: `lev-${step++}`,
    step: snapshots.length,
    description: `Levenshtein distance = ${matrix[m][n].value}. Required operations: ${operations.length}`,
    data: {
      text1,
      text2,
      matrix: matrix.map(row => row.map(cell => ({ ...cell }))),
      currentRow: m,
      currentCol: n,
      distance: matrix[m][n].value,
      operations,
    },
    currentLine: 4,
    variables: { distance: matrix[m][n].value, operations: operations.length },
  });

  return snapshots;
}

export const levenshteinDistance: AlgorithmDefinition<DistanceInput, DistanceMatrixData> = {
  id: 'levenshtein-distance',
  name: 'Levenshtein Distance',
  category: 'string',
  categoryName: 'String Algorithms',
  description: 'Compute the minimum number of single-character edits (insertions, deletions, substitutions) required to change one string into another. Used in spell checking and DNA analysis.',
  difficulty: 'Medium',
  timeComplexity: {
    best: 'O(mn)',
    average: 'O(mn)',
    worst: 'O(mn)',
  },
  spaceComplexity: 'O(mn)',
  code: [
    'for i = 0 to m:',
    '  dp[i][0] = i',
    'for j = 0 to n:',
    '  dp[0][j] = j',
    'for i = 1 to m:',
    '  for j = 1 to n:',
    '    cost = (text1[i-1] != text2[j-1]) ? 1 : 0',
    '    dp[i][j] = min(dp[i-1][j]+1, dp[i][j-1]+1, dp[i-1][j-1]+cost)',
  ],
  defaultInput: {
    text1: 'KITTEN',
    text2: 'SITTING',
  },
  inputConfig: {
    type: 'array',
  },
  generate: generateLevenshtein,
};
