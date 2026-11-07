/**
 * Pascal's Triangle & Combinatorics
 * Generate Pascal's triangle for computing binomial coefficients
 * Time: O(n²)
 * Space: O(n²)
 */

import { AlgorithmDefinition } from '../../types/algorithm';
import { PascalInput, PascalTriangleData, MathSnapshot, PascalRow, PascalCell } from '../../types/math';

function generatePascal(input: PascalInput): MathSnapshot<PascalTriangleData>[] {
  const { n } = input;
  const snapshots: MathSnapshot<PascalTriangleData>[] = [];
  let step = 0;
  const rows: PascalRow[] = [];

  snapshots.push({
    id: `pascal-${step++}`,
    step: snapshots.length,
    description: `Generating Pascal's Triangle with ${n + 1} rows`,
    data: {
      rows: [],
      currentRow: 0,
    },
    currentLine: 1,
    variables: { n },
    formula: "C(n,r) = C(n-1,r-1) + C(n-1,r)",
  });

  for (let rowNum = 0; rowNum <= n; rowNum++) {
    const row: PascalRow = {
      rowNumber: rowNum,
      values: [],
    };

    snapshots.push({
      id: `pascal-${step++}`,
      step: snapshots.length,
      description: `Computing row ${rowNum}`,
      data: {
        rows: rows.map(r => ({ ...r, values: r.values.map(v => ({ ...v })) })),
        currentRow: rowNum,
      },
      currentLine: 2,
      variables: { rowNum, n },
    });

    for (let col = 0; col <= rowNum; col++) {
      let value: number;
      const cell: PascalCell = {
        value: 0,
        state: 'computing',
        parents: [],
      };

      if (col === 0 || col === rowNum) {
        // Edges are always 1
        value = 1;
        cell.value = value;
        cell.state = 'complete';
        
        snapshots.push({
          id: `pascal-${step++}`,
          step: snapshots.length,
          description: `Row ${rowNum}, Col ${col}: Edge = 1`,
          data: {
            rows: [...rows, { ...row, values: [...row.values, cell] }],
            currentRow: rowNum,
            highlightedCells: [[rowNum, col]],
          },
          currentLine: 3,
          variables: { rowNum, col, value: 1 },
        });
      } else {
        // Sum of two values above
        const left = rows[rowNum - 1].values[col - 1].value;
        const right = rows[rowNum - 1].values[col].value;
        value = left + right;
        cell.value = value;
        cell.parents = [[rowNum - 1, col - 1], [rowNum - 1, col]];
        cell.state = 'complete';

        snapshots.push({
          id: `pascal-${step++}`,
          step: snapshots.length,
          description: `Row ${rowNum}, Col ${col}: ${left} + ${right} = ${value}`,
          data: {
            rows: [...rows, { ...row, values: [...row.values, cell] }],
            currentRow: rowNum,
            highlightedCells: [[rowNum - 1, col - 1], [rowNum - 1, col], [rowNum, col]],
          },
          currentLine: 4,
          variables: { rowNum, col, left, right, value },
          formula: `C(${rowNum},${col}) = C(${rowNum-1},${col-1}) + C(${rowNum-1},${col}) = ${left} + ${right} = ${value}`,
        });
      }

      row.values.push(cell);
    }

    rows.push(row);
  }

  snapshots.push({
    id: `pascal-${step++}`,
    step: snapshots.length,
    description: `Pascal's Triangle complete (${n + 1} rows)`,
    data: {
      rows: rows.map(r => ({ ...r, values: r.values.map(v => ({ ...v, state: 'complete' as const })) })),
      currentRow: n,
    },
    currentLine: 5,
    variables: { n, totalCells: ((n + 1) * (n + 2)) / 2 },
  });

  return snapshots;
}

export const pascalTriangle: AlgorithmDefinition<PascalInput, PascalTriangleData> = {
  id: 'pascal-triangle',
  name: "Pascal's Triangle",
  category: 'math',
  categoryName: 'Mathematical Algorithms',
  description: 'Generate Pascal\'s triangle where each number is the sum of the two numbers above it. Used for computing binomial coefficients C(n,r).',
  difficulty: 'Easy',
  timeComplexity: {
    best: 'O(n²)',
    average: 'O(n²)',
    worst: 'O(n²)',
  },
  spaceComplexity: 'O(n²)',
  code: [
    'for row = 0 to n:',
    '  for col = 0 to row:',
    '    if col == 0 or col == row:',
    '      C[row][col] = 1',
    '    else:',
    '      C[row][col] = C[row-1][col-1] + C[row-1][col]',
  ],
  defaultInput: { n: 6 },
  inputConfig: { type: 'array', minSize: 1, maxSize: 15, defaultSize: 6 },
  generate: generatePascal,
};
