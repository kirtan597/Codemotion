/**
 * Fenwick Tree (Binary Indexed Tree)
 * Efficient prefix sum and point update
 * Time: O(log n) per operation
 * Space: O(n)
 */

import { AlgorithmDefinition } from '../../types/algorithm';
import { FenwickTreeInput, FenwickTreeData, AdvancedSnapshot } from '../../types/advanced';

function lowbit(x: number): number {
  return x & (-x);
}

function generateFenwickTree(input: FenwickTreeInput): AdvancedSnapshot<FenwickTreeData>[] {
  const { array, operation = 'build', index = 0 } = input;
  const snapshots: AdvancedSnapshot<FenwickTreeData>[] = [];
  let step = 0;
  const n = array.length;
  const tree = new Array(n + 1).fill(0);

  snapshots.push({
    id: `fenwick-${step++}`,
    step: snapshots.length,
    description: `Building Fenwick Tree from array: [${array.join(', ')}]`,
    data: {
      tree: [...tree],
      originalArray: [...array],
      operation: 'Building',
    },
    currentLine: 1,
    variables: { n },
  });

  // Build tree
  for (let i = 0; i < n; i++) {
    let idx = i + 1;
    tree[idx] += array[i];
    
    snapshots.push({
      id: `fenwick-${step++}`,
      step: snapshots.length,
      description: `Adding ${array[i]} at index ${idx}`,
      data: {
        tree: [...tree],
        originalArray: [...array],
        index: idx,
        operation: 'Building',
      },
      currentLine: 2,
      variables: { i, idx, value: array[i] },
    });
    
    const parent = idx + lowbit(idx);
    if (parent <= n) {
      tree[parent] += tree[idx];
      
      snapshots.push({
        id: `fenwick-${step++}`,
        step: snapshots.length,
        description: `Propagating to parent index ${parent}`,
        data: {
          tree: [...tree],
          originalArray: [...array],
          index: parent,
          operation: 'Building',
        },
        currentLine: 3,
        variables: { idx, parent, lowbit: lowbit(idx) },
      });
    }
  }

  snapshots.push({
    id: `fenwick-${step++}`,
    step: snapshots.length,
    description: 'Fenwick Tree built successfully',
    data: {
      tree: [...tree],
      originalArray: [...array],
      operation: 'Built',
    },
    currentLine: 4,
    variables: { n },
  });

  // Query if requested
  if (operation === 'query') {
    let sum = 0;
    let idx = index + 1;
    
    snapshots.push({
      id: `fenwick-${step++}`,
      step: snapshots.length,
      description: `Querying prefix sum up to index ${index}`,
      data: {
        tree: [...tree],
        originalArray: [...array],
        index: idx,
        operation: 'Querying',
      },
      currentLine: 5,
      variables: { index, idx },
    });
    
    while (idx > 0) {
      sum += tree[idx];
      
      snapshots.push({
        id: `fenwick-${step++}`,
        step: snapshots.length,
        description: `Adding tree[${idx}] = ${tree[idx]}, sum = ${sum}`,
        data: {
          tree: [...tree],
          originalArray: [...array],
          index: idx,
          sum,
          operation: 'Querying',
        },
        currentLine: 6,
        variables: { idx, value: tree[idx], sum },
      });
      
      idx -= lowbit(idx);
    }
    
    snapshots.push({
      id: `fenwick-${step++}`,
      step: snapshots.length,
      description: `Prefix sum[0..${index}] = ${sum}`,
      data: {
        tree: [...tree],
        originalArray: [...array],
        sum,
        operation: 'Query complete',
      },
      currentLine: 7,
      variables: { index, sum },
      formula: `Sum[0..${index}] = ${sum}`,
    });
  }

  return snapshots;
}

export const fenwickTreeBIT: AlgorithmDefinition<FenwickTreeInput, FenwickTreeData> = {
  id: 'fenwick-tree-bit',
  name: 'Fenwick Tree (BIT)',
  category: 'advanced',
  categoryName: 'Advanced Data Structures',
  description: 'Binary Indexed Tree for efficient prefix sum queries and point updates. Uses clever bit manipulation with lowbit(x) = x & (-x) to navigate parent/child relationships.',
  difficulty: 'Hard',
  timeComplexity: {
    best: 'O(log n)',
    average: 'O(log n)',
    worst: 'O(log n)',
  },
  spaceComplexity: 'O(n)',
  code: [
    'lowbit(x) = x & (-x)',
    'Update(i, val):',
    '  while i ≤ n:',
    '    tree[i] += val',
    '    i += lowbit(i)',
    'Query(i):',
    '  sum = 0',
    '  while i > 0:',
    '    sum += tree[i]',
    '    i -= lowbit(i)',
  ],
  defaultInput: {
    array: [1, 3, 5, 7, 9, 11, 13, 15],
    operation: 'query',
    index: 5,
  },
  inputConfig: { type: 'array' },
  generate: generateFenwickTree,
};
