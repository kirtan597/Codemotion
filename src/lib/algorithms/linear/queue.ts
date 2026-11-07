/**
 * src/lib/algorithms/linear/queue.ts
 *
 * Queue operation-based generator.
 * Signature: (initialState: number[], ops: QueueOp[]) => LinearSnapshot[]
 *
 * Queue = FIFO: enqueue appends to the tail (right), dequeue removes from the
 * head (left).  Nodes are displayed left→right: head on the left, tail on right.
 *
 * Supported operations: enqueue(value), dequeue, peek
 */

import { AlgorithmDefinition } from '../../types/algorithm';
import { LinearSnapshot, ListNode, NodeState, QueueOp } from '../../types/linear';

let _uid = 0;
function uid(): string {
  return `que-${_uid++}`;
}

function buildNodes(
  queue: { id: string; value: number }[],
  highlights: Record<number, NodeState> = {}
): ListNode[] {
  const n = queue.length;
  return queue.map((item, idx) => {
    const ptrs: string[] = [];
    if (idx === 0) ptrs.push('head');
    if (idx === n - 1 && n > 0) ptrs.push('tail');
    return {
      id: item.id,
      value: item.value,
      state: highlights[idx] ?? 'default',
      pointers: ptrs,
    };
  });
}

function snap(
  out: LinearSnapshot[],
  queue: { id: string; value: number }[],
  counter: { n: number },
  desc: string,
  line: number,
  highlights: Record<number, NodeState> = {},
  vars: Record<string, string | number | boolean | null> = {}
) {
  out.push({
    id: `que-${counter.n++}`,
    step: out.length,
    description: desc,
    data: buildNodes(queue, highlights),
    currentLine: line,
    variables: { size: queue.length, ...vars },
  });
}

// Pseudocode (0-indexed):
// 0: enqueue(v): queue.push(v)       // O(1)
// 1: dequeue():  queue.shift()        // O(1)
// 2: peek():     return queue[0]      // no removal

/**
 * Pure generator — produces all snapshots for a sequence of queue operations.
 */
export function generateQueue(
  initialValues: number[],
  ops: QueueOp[]
): LinearSnapshot[] {
  const queue: { id: string; value: number }[] = initialValues.map((v) => ({
    id: uid(),
    value: v,
  }));

  const out: LinearSnapshot[] = [];
  const counter = { n: 0 };

  snap(out, queue, counter, `Queue initialized with ${queue.length} element(s).`, 0, {}, {
    operation: 'init',
    head: queue.length > 0 ? queue[0].value : null,
    tail: queue.length > 0 ? queue[queue.length - 1].value : null,
  });

  for (const op of ops) {
    if (op.type === 'enqueue') {
      const tailIdx = queue.length; // will be at this index after insert
      snap(out, queue, counter, `enqueue(${op.value}): Adding ${op.value} to the tail.`, 0, {}, {
        operation: 'enqueue',
        value: op.value,
      });

      queue.push({ id: uid(), value: op.value });

      snap(out, queue, counter, `enqueue(${op.value}): ${op.value} is now the tail.`, 0,
        { [queue.length - 1]: 'active' },
        {
          operation: 'enqueue',
          value: op.value,
          tail: op.value,
          head: queue[0]?.value ?? null,
        }
      );
    } else if (op.type === 'dequeue') {
      if (queue.length === 0) {
        snap(out, queue, counter, `dequeue(): Queue is empty — underflow!`, 1, {}, {
          operation: 'dequeue',
          result: 'underflow',
        });
        continue;
      }

      const headVal = queue[0].value;
      snap(out, queue, counter, `dequeue(): Removing head element (${headVal}).`, 1,
        { 0: 'removing' },
        { operation: 'dequeue', headValue: headVal }
      );

      queue.shift();

      snap(out, queue, counter,
        `dequeue(): Removed ${headVal}. New head is ${queue.length > 0 ? queue[0].value : 'none'}.`,
        1,
        queue.length > 0 ? { 0: 'active' } : {},
        {
          operation: 'dequeue',
          removed: headVal,
          result: String(headVal),
          head: queue[0]?.value ?? null,
        }
      );
    } else if (op.type === 'peek') {
      if (queue.length === 0) {
        snap(out, queue, counter, `peek(): Queue is empty — returns null.`, 2, {}, {
          operation: 'peek',
          result: 'null',
        });
        continue;
      }

      const headVal = queue[0].value;
      snap(out, queue, counter, `peek(): Head element is ${headVal} (no removal).`, 2,
        { 0: 'found' },
        { operation: 'peek', result: String(headVal) }
      );

      snap(out, queue, counter, `peek(): Queue unchanged.`, 2, {}, {
        operation: 'peek',
        result: String(headVal),
      });
    }
  }

  snap(out, queue, counter, `Operations complete. Queue has ${queue.length} element(s).`, 0, {}, {
    operation: 'done',
    head: queue[0]?.value ?? null,
    tail: queue[queue.length - 1]?.value ?? null,
  });

  return out;
}

// ─── AlgorithmDefinition wrapper ─────────────────────────────────────────────
import { ListNode as LN } from '../../types/linear';

export interface QueueInput {
  initial: number[];
  ops: QueueOp[];
}

export const queueAlgorithm: AlgorithmDefinition<QueueInput, LN[]> = {
  id: 'queue',
  name: 'Queue',
  category: 'linear',
  categoryName: 'Linear Structures',
  description:
    'First-In First-Out (FIFO) data structure supporting enqueue, dequeue, and peek operations.',
  difficulty: 'Easy',
  timeComplexity: { best: 'O(1)', average: 'O(1)', worst: 'O(1)' },
  spaceComplexity: 'O(n)',
  code: [
    'enqueue(v): queue.push(v)   // add to tail',   // 0
    'dequeue():  queue.shift()   // remove from head', // 1
    'peek():     return queue[0] // no removal',      // 2
  ],
  defaultInput: {
    initial: [5, 2, 8],
    ops: [
      { type: 'enqueue', value: 6 },
      { type: 'peek' },
      { type: 'dequeue' },
      { type: 'enqueue', value: 11 },
    ],
  },
  inputConfig: { type: 'array' },
  generate: (input: QueueInput) => generateQueue(input.initial, input.ops),
};

