/**
 * src/lib/algorithms/heap/minHeap.ts
 *
 * Min Heap implementation with full visualization
 * Parent is always smaller than children
 * Array representation: parent at i, children at 2i+1 and 2i+2
 */

import { AlgorithmDefinition } from '../../types/algorithm';
import { HeapNode, HeapData, HeapOp, HeapSnapshot, HeapNodeState } from '../../types/heap';

let _uid = 0;
function uid(): string {
  return `heap-${_uid++}`;
}

function parent(i: number): number {
  return Math.floor((i - 1) / 2);
}

function leftChild(i: number): number {
  return 2 * i + 1;
}

function rightChild(i: number): number {
  return 2 * i + 2;
}

function buildHeapData(
  array: number[],
  highlights: Record<number, HeapNodeState> = {}
): HeapData {
  const tree: HeapNode[] = array.map((value, idx) => {
    const node: HeapNode = {
      id: `node-${idx}`,
      value,
      arrayIndex: idx,
      state: highlights[idx] ?? 'default',
    };

    if (idx > 0) {
      node.parent = parent(idx);
    }
    
    const left = leftChild(idx);
    const right = rightChild(idx);
    if (left < array.length) node.leftChild = left;
    if (right < array.length) node.rightChild = right;

    // Mark root
    if (idx === 0) {
      node.state = highlights[idx] ?? 'root';
    }

    return node;
  });

  return {
    tree,
    array: [...array],
    type: 'min',
    size: array.length,
  };
}

function snap(
  out: HeapSnapshot[],
  array: number[],
  counter: { n: number },
  desc: string,
  line: number,
  highlights: Record<number, HeapNodeState> = {},
  vars: Record<string, any> = {}
): void {
  out.push({
    id: `heap-${counter.n++}`,
    step: out.length,
    description: desc,
    data: buildHeapData(array, highlights),
    currentLine: line,
    variables: {
      size: array.length,
      height: Math.floor(Math.log2(array.length)) + 1,
      ...vars,
    },
  });
}

// Pseudocode (0-indexed):
// 0: insert(v): heap.push(v); bubbleUp(lastIndex)
// 1: extractMin(): swap(0, last); heap.pop(); bubbleDown(0)
// 2: peek(): return heap[0]
// 3: bubbleUp(i): while i > 0 and heap[i] < heap[parent(i)]: swap; i = parent(i)
// 4: bubbleDown(i): while hasChild(i): find smallest child; if heap[i] > child: swap; else break
// 5: heapify(array): for i from last parent down to 0: bubbleDown(i)

export function generateMinHeap(
  initialValues: number[],
  ops: HeapOp[]
): HeapSnapshot[] {
  const heap: number[] = [...initialValues];
  const out: HeapSnapshot[] = [];
  const counter = { n: 0 };
  let comparisons = 0;
  let swaps = 0;

  // Build heap from initial values if provided
  if (heap.length > 0) {
    snap(out, heap, counter, `Min Heap initialized with ${heap.length} element(s). Building heap...`, 5, {}, {
      operation: 'init',
      comparisons,
      swaps,
    });

    // Heapify: bubble down from last parent to root
    for (let i = parent(heap.length - 1); i >= 0; i--) {
      bubbleDown(heap, i, out, counter, { comparisons, swaps });
    }

    snap(out, heap, counter, `Heap construction complete. Root (min) = ${heap[0]}.`, 5, { 0: 'root' }, {
      operation: 'heapify',
      comparisons,
      swaps,
    });
  } else {
    snap(out, heap, counter, `Min Heap initialized (empty).`, 0, {}, {
      operation: 'init',
      comparisons,
      swaps,
    });
  }

  // Process operations
  for (const op of ops) {
    if (op.type === 'insert') {
      snap(out, heap, counter, `insert(${op.value}): Adding ${op.value} to the end of the heap.`, 0, {}, {
        operation: 'insert',
        value: op.value,
        comparisons,
        swaps,
      });

      heap.push(op.value);
      const insertIdx = heap.length - 1;

      snap(out, heap, counter, `insert: ${op.value} added at index ${insertIdx}. Bubbling up...`, 0,
        { [insertIdx]: 'inserting' },
        { operation: 'insert', value: op.value, comparisons, swaps }
      );

      bubbleUp(heap, insertIdx, out, counter, { comparisons, swaps });

      snap(out, heap, counter, `insert(${op.value}): Complete. Heap size = ${heap.length}.`, 0,
        { 0: 'root' },
        { operation: 'insert', value: op.value, comparisons, swaps }
      );
    } else if (op.type === 'extractMin') {
      if (heap.length === 0) {
        snap(out, heap, counter, `extractMin(): Heap is empty!`, 1, {}, {
          operation: 'extractMin',
          result: 'empty',
          comparisons,
          swaps,
        });
        continue;
      }

      const minVal = heap[0];
      snap(out, heap, counter, `extractMin(): Removing minimum element ${minVal} from root.`, 1,
        { 0: 'extracting' },
        { operation: 'extractMin', minValue: minVal, comparisons, swaps }
      );

      if (heap.length === 1) {
        heap.pop();
        snap(out, heap, counter, `extractMin(): Heap is now empty.`, 1, {}, {
          operation: 'extractMin',
          result: minVal,
          comparisons,
          swaps,
        });
        continue;
      }

      // Swap root with last element
      const lastIdx = heap.length - 1;
      snap(out, heap, counter, `extractMin: Swapping root with last element (${heap[lastIdx]}).`, 1,
        { 0: 'extracting', [lastIdx]: 'swapping' },
        { operation: 'extractMin', minValue: minVal, comparisons, swaps }
      );

      [heap[0], heap[lastIdx]] = [heap[lastIdx], heap[0]];
      swaps++;
      
      snap(out, heap, counter, `extractMin: Swapped. Removing last element.`, 1,
        { 0: 'active', [lastIdx]: 'extracting' },
        { operation: 'extractMin', minValue: minVal, comparisons, swaps }
      );

      heap.pop();

      snap(out, heap, counter, `extractMin: Removed ${minVal}. Bubbling down from root...`, 1,
        { 0: 'active' },
        { operation: 'extractMin', result: minVal, comparisons, swaps }
      );

      bubbleDown(heap, 0, out, counter, { comparisons, swaps });

      snap(out, heap, counter, `extractMin(): Complete. Returned ${minVal}. New min = ${heap[0] ?? 'none'}.`, 1,
        { 0: 'root' },
        { operation: 'extractMin', result: minVal, comparisons, swaps }
      );
    } else if (op.type === 'peek') {
      if (heap.length === 0) {
        snap(out, heap, counter, `peek(): Heap is empty — returns null.`, 2, {}, {
          operation: 'peek',
          result: 'null',
          comparisons,
          swaps,
        });
        continue;
      }

      const minVal = heap[0];
      snap(out, heap, counter, `peek(): Minimum element is ${minVal} (no removal).`, 2,
        { 0: 'found' },
        { operation: 'peek', result: minVal, comparisons, swaps }
      );
    }
  }

  snap(out, heap, counter, `Operations complete. Heap size = ${heap.length}.`, 0, { 0: 'root' }, {
    operation: 'done',
    comparisons,
    swaps,
  });

  return out;
}

function bubbleUp(
  heap: number[],
  index: number,
  out: HeapSnapshot[],
  counter: { n: number },
  metrics: { comparisons: number; swaps: number }
): void {
  let i = index;

  while (i > 0) {
    const p = parent(i);
    metrics.comparisons++;

    snap(out, heap, counter, `bubbleUp: Comparing ${heap[i]} (index ${i}) with parent ${heap[p]} (index ${p}).`, 3,
      { [i]: 'bubbling-up', [p]: 'comparing' },
      { operation: 'bubbleUp', current: i, parent: p, comparisons: metrics.comparisons, swaps: metrics.swaps }
    );

    if (heap[i] < heap[p]) {
      snap(out, heap, counter, `bubbleUp: ${heap[i]} < ${heap[p]}, swapping...`, 3,
        { [i]: 'swapping', [p]: 'swapping' },
        { operation: 'bubbleUp', current: i, parent: p, comparisons: metrics.comparisons, swaps: metrics.swaps }
      );

      [heap[i], heap[p]] = [heap[p], heap[i]];
      metrics.swaps++;

      snap(out, heap, counter, `bubbleUp: Swapped. Continuing from index ${p}...`, 3,
        { [p]: 'bubbling-up' },
        { operation: 'bubbleUp', current: p, comparisons: metrics.comparisons, swaps: metrics.swaps }
      );

      i = p;
    } else {
      snap(out, heap, counter, `bubbleUp: ${heap[i]} >= ${heap[p]}, heap property satisfied.`, 3,
        { [i]: 'active' },
        { operation: 'bubbleUp', result: 'done', comparisons: metrics.comparisons, swaps: metrics.swaps }
      );
      break;
    }
  }
}

function bubbleDown(
  heap: number[],
  index: number,
  out: HeapSnapshot[],
  counter: { n: number },
  metrics: { comparisons: number; swaps: number }
): void {
  let i = index;
  const n = heap.length;

  while (true) {
    const left = leftChild(i);
    const right = rightChild(i);
    let smallest = i;

    if (left < n) {
      metrics.comparisons++;
      snap(out, heap, counter, `bubbleDown: Comparing ${heap[i]} with left child ${heap[left]} (index ${left}).`, 4,
        { [i]: 'bubbling-down', [left]: 'comparing' },
        { operation: 'bubbleDown', current: i, left, comparisons: metrics.comparisons, swaps: metrics.swaps }
      );

      if (heap[left] < heap[smallest]) {
        smallest = left;
      }
    }

    if (right < n) {
      metrics.comparisons++;
      snap(out, heap, counter, `bubbleDown: Comparing ${heap[smallest]} with right child ${heap[right]} (index ${right}).`, 4,
        { [i]: 'bubbling-down', [smallest]: 'comparing', [right]: 'comparing' },
        { operation: 'bubbleDown', current: i, right, comparisons: metrics.comparisons, swaps: metrics.swaps }
      );

      if (heap[right] < heap[smallest]) {
        smallest = right;
      }
    }

    if (smallest !== i) {
      snap(out, heap, counter, `bubbleDown: ${heap[smallest]} < ${heap[i]}, swapping indices ${i} and ${smallest}...`, 4,
        { [i]: 'swapping', [smallest]: 'swapping' },
        { operation: 'bubbleDown', current: i, smallest, comparisons: metrics.comparisons, swaps: metrics.swaps }
      );

      [heap[i], heap[smallest]] = [heap[smallest], heap[i]];
      metrics.swaps++;

      snap(out, heap, counter, `bubbleDown: Swapped. Continuing from index ${smallest}...`, 4,
        { [smallest]: 'bubbling-down' },
        { operation: 'bubbleDown', current: smallest, comparisons: metrics.comparisons, swaps: metrics.swaps }
      );

      i = smallest;
    } else {
      snap(out, heap, counter, `bubbleDown: Heap property satisfied at index ${i}.`, 4,
        { [i]: 'active' },
        { operation: 'bubbleDown', result: 'done', comparisons: metrics.comparisons, swaps: metrics.swaps }
      );
      break;
    }
  }
}

// ─── AlgorithmDefinition wrapper ─────────────────────────────────────────────
export interface MinHeapInput {
  initial: number[];
  ops: HeapOp[];
}

export const minHeap: AlgorithmDefinition<MinHeapInput, HeapData> = {
  id: 'min-heap',
  name: 'Min Heap',
  category: 'heap',
  categoryName: 'Heaps',
  description:
    'Complete binary tree where each parent is smaller than its children. Supports O(log n) insert and O(log n) extract-min operations.',
  difficulty: 'Medium',
  timeComplexity: {
    best: 'O(log n)',
    average: 'O(log n)',
    worst: 'O(log n)',
  },
  spaceComplexity: 'O(n)',
  code: [
    'insert(v): heap.push(v); bubbleUp(lastIndex)',  // 0
    'extractMin(): swap(0, last); heap.pop(); bubbleDown(0)', // 1
    'peek(): return heap[0]  // O(1)',                // 2
    'bubbleUp(i): while i > 0 and heap[i] < heap[parent]: swap', // 3
    'bubbleDown(i): while hasChild: swap with smallest child if needed', // 4
    'heapify(array): for i from lastParent down to 0: bubbleDown(i)', // 5
  ],
  defaultInput: {
    initial: [10, 20, 15, 30, 40],
    ops: [
      { type: 'insert', value: 5 },
      { type: 'peek' },
      { type: 'extractMin' },
      { type: 'insert', value: 12 },
      { type: 'extractMin' },
    ],
  },
  inputConfig: { type: 'heap' },
  generate: (input: MinHeapInput) => generateMinHeap(input.initial, input.ops),
};
