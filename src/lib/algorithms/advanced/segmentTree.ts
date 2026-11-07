/**
 * Segment Tree
 * Range query and update data structure
 * Time: O(log n) per query/update
 * Space: O(n)
 */

import { AlgorithmDefinition } from '../../types/algorithm';
import { SegmentTreeInput, SegmentTreeData, AdvancedSnapshot, SegmentTreeNode } from '../../types/advanced';

let nodeIdCounter = 0;

function buildTree(arr: number[], start: number, end: number): SegmentTreeNode {
  const node: SegmentTreeNode = {
    id: `node-${nodeIdCounter++}`,
    start,
    end,
    value: 0,
    state: 'default',
  };

  if (start === end) {
    node.value = arr[start];
  } else {
    const mid = Math.floor((start + end) / 2);
    node.left = buildTree(arr, start, mid);
    node.right = buildTree(arr, mid + 1, end);
    node.value = node.left.value + node.right.value;
  }

  return node;
}

function rangeSum(node: SegmentTreeNode | undefined, left: number, right: number): number {
  if (!node) return 0;
  if (node.start > right || node.end < left) return 0;
  if (node.start >= left && node.end <= right) return node.value;

  const leftSum = rangeSum(node.left, left, right);
  const rightSum = rangeSum(node.right, left, right);
  return leftSum + rightSum;
}

function generateSegmentTree(input: SegmentTreeInput): AdvancedSnapshot<SegmentTreeData>[] {
  const { array, operation = 'build', left = 0, right = array.length - 1 } = input;
  const snapshots: AdvancedSnapshot<SegmentTreeData>[] = [];
  let step = 0;
  nodeIdCounter = 0;

  snapshots.push({
    id: `segtree-${step++}`,
    step: snapshots.length,
    description: `Building segment tree from array: [${array.join(', ')}]`,
    data: {
      array,
      operation: 'Building tree',
    },
    currentLine: 1,
    variables: { n: array.length },
  });

  const root = buildTree(array, 0, array.length - 1);

  snapshots.push({
    id: `segtree-${step++}`,
    step: snapshots.length,
    description: 'Segment tree built successfully',
    data: {
      root,
      array,
      operation: 'Tree built',
    },
    currentLine: 2,
    variables: { nodes: nodeIdCounter },
  });

  if (operation === 'query') {
    snapshots.push({
      id: `segtree-${step++}`,
      step: snapshots.length,
      description: `Querying range [${left}, ${right}]`,
      data: {
        root: { ...root },
        array,
        query: { left, right },
        operation: 'Querying',
      },
      currentLine: 3,
      variables: { left, right },
    });

    const result = rangeSum(root, left, right);

    snapshots.push({
      id: `segtree-${step++}`,
      step: snapshots.length,
      description: `Sum of range [${left}, ${right}] = ${result}`,
      data: {
        root: { ...root },
        array,
        query: { left, right, result },
        operation: 'Query complete',
      },
      currentLine: 4,
      variables: { left, right, sum: result },
      formula: `Sum[${left}..${right}] = ${result}`,
    });
  }

  return snapshots;
}

export const segmentTreeRangeSum: AlgorithmDefinition<SegmentTreeInput, SegmentTreeData> = {
  id: 'segment-tree-range-sum',
  name: 'Segment Tree',
  category: 'advanced',
  categoryName: 'Advanced Data Structures',
  description: 'Binary tree for efficient range queries and updates. Each node stores information about a segment of the array. Supports range sum queries in O(log n).',
  difficulty: 'Hard',
  timeComplexity: {
    best: 'O(log n)',
    average: 'O(log n)',
    worst: 'O(log n)',
  },
  spaceComplexity: 'O(n)',
  code: [
    'Build: O(n)',
    '  if start == end: leaf node',
    '  else: create left and right children',
    '  node.value = left.value + right.value',
    'Query: O(log n)',
    '  if range outside: return 0',
    '  if range fully inside: return node.value',
    '  else: recurse on children',
  ],
  defaultInput: {
    array: [1, 3, 5, 7, 9, 11],
    operation: 'query',
    left: 1,
    right: 4,
  },
  inputConfig: { type: 'array' },
  generate: generateSegmentTree,
};
