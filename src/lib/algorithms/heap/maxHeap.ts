/**
 * src/lib/algorithms/heap/maxHeap.ts
 *
 * Max Heap implementation with full visualization
 * Parent is always larger than children
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

    if (idx === 0) {
      node.state = highlights[idx] ?? 'root';
    }

    return node;
  });

  return {
    tree,
    array: [...array],
    type: 'max',
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

export function generateMaxHeap(
  initialValues: number[],
  ops: HeapOp[]
): HeapSnapshot[] {
  const heap: number[] = [...initialValues];
  const out: HeapSnapshot[] = [];
  const counter = { n: 0 };
  let comparisons = 0;
  let swaps = 0;

  if (heap.length > 0) {
    snap(out, heap, counter, `Max Heap initialized with ${heap.length} element(s). Building heap...`, 5, {}, {
      operation: 'init',
      comparisons,
      swaps,
    });

    for (let i = parent(heap.length - 1); i >= 0; i--) {
      bubbleDown(heap, i, out, counter, { comparisons, swaps });
    }

    snap(out, heap, counter, `Heap construction complete. Root (max) = ${heap[0]}.`, 5, { 0: 'root' }, {
      operation: 'heapify',
      comparisons,
      swaps,
    });
  } else {
    snap(out, heap, counter, `Max Heap initialized (empty).`, 0, {}, {
      operation: 'init',
      comparisons,
      swaps,
    });
  }

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
    } else if (op.type === 'extractMax') {
      if (heap.length === 0) {
        snap(out, heap, counter, `extractMax(): Heap is empty!`, 1, {}, {
          operation: 'extractMax',
          result: 'empty',
          comparisons,
          swaps,
        });
        continue;
      }

      const maxVal = heap[0];
      snap(out, heap, counter, `extractMax(): Removing maximum element ${maxVal} from root.`, 1,
        { 0: 'extracting' },
        { operation: 'extractMax', maxValue: maxVal, comparisons, swaps }
      );

      if (heap.length === 1) {
        heap.pop();
        snap(out, heap, counter, `extractMax(): Heap is now empty.`, 1, {}, {
          operation: 'extractMax',
          result: maxVal,
          comparisons,
          swaps,
        });
        continue;
      }

      const lastIdx = heap.length - 1;
      snap(out, heap, counter, `extractMax: Swapping root with last element (${heap[lastIdx]}).`, 1,
        { 0: 'extracting', [lastIdx]: 'swapping' },
        { operation: 'extractMax', maxValue: maxVal, comparisons, swaps }
      );

      [heap[0], heap[lastIdx]] = [heap[lastIdx], heap[0]];
      swaps++;
      
      snap(out, heap, counter, `extractMax: Swapped. Removing last element.`, 1,
        { 0: 'active', [lastIdx]: 'extracting' },
        { operation: 'extractMax', maxValue: maxVal, comparisons, swaps }
      );

      heap.pop();

      snap(out, heap, counter, `extractMax: Removed ${maxVal}. Bubbling down from root...`, 1,
        { 0: 'active' },
        { operation: 'extractMax', result: maxVal, comparisons, swaps }
      );

      bubbleDown(heap, 0, out, counter, { comparisons, swaps });

      snap(out, heap, counter, `extractMax(): Complete. Returned ${maxVal}. New max = ${heap[0] ?? 'none'}.`, 1,
        { 0: 'root' },
        { operation: 'extractMax', result: maxVal, comparisons, swaps }
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

      const maxVal = heap[0];
      snap(out, heap, counter, `peek(): Maximum element is ${maxVal} (no removal).`, 2,
        { 0: 'found' },
        { operation: 'peek', result: maxVal, comparisons, swaps }
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

    if (heap[i] > heap[p]) { // MAX HEAP: parent must be larger
      snap(out, heap, counter, `bubbleUp: ${heap[i]} > ${heap[p]}, swapping...`, 3,
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
      snap(out, heap, counter, `bubbleUp: ${heap[i]} <= ${heap[p]}, heap property satisfied.`, 3,
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
    let largest = i;

    if (left < n) {
      metrics.comparisons++;
      snap(out, heap, counter, `bubbleDown: Comparing ${heap[i]} with left child ${heap[left]} (index ${left}).`, 4,
        { [i]: 'bubbling-down', [left]: 'comparing' },
        { operation: 'bubbleDown', current: i, left, comparisons: metrics.comparisons, swaps: metrics.swaps }
      );

      if (heap[left] > heap[largest]) { // MAX HEAP
        largest = left;
      }
    }

    if (right < n) {
      metrics.comparisons++;
      snap(out, heap, counter, `bubbleDown: Comparing ${heap[largest]} with right child ${heap[right]} (index ${right}).`, 4,
        { [i]: 'bubbling-down', [largest]: 'comparing', [right]: 'comparing' },
        { operation: 'bubbleDown', current: i, right, comparisons: metrics.comparisons, swaps: metrics.swaps }
      );

      if (heap[right] > heap[largest]) { // MAX HEAP
        largest = right;
      }
    }

    if (largest !== i) {
      snap(out, heap, counter, `bubbleDown: ${heap[largest]} > ${heap[i]}, swapping indices ${i} and ${largest}...`, 4,
        { [i]: 'swapping', [largest]: 'swapping' },
        { operation: 'bubbleDown', current: i, largest, comparisons: metrics.comparisons, swaps: metrics.swaps }
      );

      [heap[i], heap[largest]] = [heap[largest], heap[i]];
      metrics.swaps++;

      snap(out, heap, counter, `bubbleDown: Swapped. Continuing from index ${largest}...`, 4,
        { [largest]: 'bubbling-down' },
        { operation: 'bubbleDown', current: largest, comparisons: metrics.comparisons, swaps: metrics.swaps }
      );

      i = largest;
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
export interface MaxHeapInput {
  initial: number[];
  ops: HeapOp[];
}

export const maxHeap: AlgorithmDefinition<MaxHeapInput, HeapData> = {
  id: 'max-heap',
  name: 'Max Heap',
  category: 'heap',
  categoryName: 'Heaps',
  description:
    'Complete binary tree where each parent is larger than its children. Supports O(log n) insert and O(log n) extract-max operations.',
  difficulty: 'Medium',
  timeComplexity: {
    best: 'O(log n)',
    average: 'O(log n)',
    worst: 'O(log n)',
  },
  spaceComplexity: 'O(n)',
  code: [
    'insert(v): heap.push(v); bubbleUp(lastIndex)',  // 0
    'extractMax(): swap(0, last); heap.pop(); bubbleDown(0)', // 1
    'peek(): return heap[0]  // O(1)',                // 2
    'bubbleUp(i): while i > 0 and heap[i] > heap[parent]: swap', // 3
    'bubbleDown(i): while hasChild: swap with largest child if needed', // 4
    'heapify(array): for i from lastParent down to 0: bubbleDown(i)', // 5
  ],
  defaultInput: {
    initial: [10, 20, 15, 30, 40],
    ops: [
      { type: 'insert', value: 50 },
      { type: 'peek' },
      { type: 'extractMax' },
      { type: 'insert', value: 35 },
      { type: 'extractMax' },
    ],
  },
  inputConfig: { type: 'heap' },
  generate: (input: MaxHeapInput) => generateMaxHeap(input.initial, input.ops),
};
