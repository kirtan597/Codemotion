/**
 * src/lib/algorithms/linear/stack.ts
 *
 * Stack operation-based generator.
 * Signature: (initialState: number[], ops: StackOp[]) => LinearSnapshot[]
 *
 * The generator is pure — given the same (state, ops), it always produces the
 * same snapshots.  State is immutable between operations: each op produces a
 * slice of snapshots that start from the state left by the previous op.
 *
 * Supported operations: push(value), pop, peek
 *
 * Stack = top-of-stack is at index 0 (displayed left-to-right, newest first).
 */

import { LinearSnapshot, ListNode, NodeState, StackOp } from '../../types/linear';

let _uid = 0;
function uid(): string {
  return `stk-${_uid++}`;
}

function buildNodes(
  stack: { id: string; value: number }[],
  highlights: Record<number, NodeState> = {}
): ListNode[] {
  return stack.map((item, idx) => ({
    id: item.id,
    value: item.value,
    state: highlights[idx] ?? 'default',
    pointers: idx === 0 ? ['top'] : [],
  }));
}

function push(
  out: LinearSnapshot[],
  stack: { id: string; value: number }[],
  counter: { n: number },
  desc: string,
  line: number,
  highlights: Record<number, NodeState> = {},
  vars: Record<string, string | number | boolean | null> = {}
) {
  out.push({
    id: `stk-${counter.n++}`,
    step: out.length,
    description: desc,
    data: buildNodes(stack, highlights),
    currentLine: line,
    variables: { size: stack.length, ...vars },
  });
}

// Pseudocode lines (0-indexed)
// 0: push(value):  stack.push(value)
// 1: pop():        if empty: error; else return stack.pop()
// 2: peek():       if empty: null; else return stack[top]

/**
 * Main generator — pure function.
 *
 * @param initialValues  Starting stack contents (index 0 = top). Pass [] for empty.
 * @param ops            Operations to replay in order.
 * @returns              Flat array of snapshots across all operations.
 */
export function generateStack(
  initialValues: number[],
  ops: StackOp[]
): LinearSnapshot[] {
  // Internal stack: array where index 0 = top
  const stack: { id: string; value: number }[] = initialValues.map((v) => ({
    id: uid(),
    value: v,
  }));

  const out: LinearSnapshot[] = [];
  const counter = { n: 0 };

  // Initial state snapshot
  push(out, stack, counter, `Stack initialized with ${stack.length} element(s).`, 0, {}, {
    operation: 'init',
  });

  for (const op of ops) {
    if (op.type === 'push') {
      // Snapshot: about to push
      push(out, stack, counter, `push(${op.value}): inserting ${op.value} at the top.`, 0, {}, {
        operation: 'push',
        value: op.value,
      });

      const newNode = { id: uid(), value: op.value };
      stack.unshift(newNode); // insert at top (index 0)

      // Snapshot: pushed (highlight new top)
      push(out, stack, counter, `push(${op.value}): ${op.value} is now the top of the stack.`, 0, { 0: 'active' }, {
        operation: 'push',
        value: op.value,
        result: `top = ${op.value}`,
      });
    } else if (op.type === 'pop') {
      if (stack.length === 0) {
        push(out, stack, counter, `pop(): Stack is empty — underflow!`, 1, {}, {
          operation: 'pop',
          result: 'underflow',
        });
        continue;
      }

      const topVal = stack[0].value;
      // Highlight the element about to be removed
      push(out, stack, counter, `pop(): Removing top element (${topVal}).`, 1, { 0: 'removing' }, {
        operation: 'pop',
        topValue: topVal,
      });

      stack.shift();

      push(
        out,
        stack,
        counter,
        `pop(): Removed ${topVal}. New top is ${stack.length > 0 ? stack[0].value : 'none'}.`,
        1,
        stack.length > 0 ? { 0: 'active' } : {},
        { operation: 'pop', removed: topVal, result: String(topVal) }
      );
    } else if (op.type === 'peek') {
      if (stack.length === 0) {
        push(out, stack, counter, `peek(): Stack is empty — returns null.`, 2, {}, {
          operation: 'peek',
          result: 'null',
        });
        continue;
      }

      const topVal = stack[0].value;
      push(out, stack, counter, `peek(): Top of stack is ${topVal} (no removal).`, 2, { 0: 'found' }, {
        operation: 'peek',
        result: String(topVal),
      });

      // Return to normal
      push(out, stack, counter, `peek(): Stack unchanged.`, 2, {}, {
        operation: 'peek',
        result: String(topVal),
      });
    }
  }

  // Final state
  push(out, stack, counter, `Operations complete. Stack has ${stack.length} element(s).`, 0, {}, {
    operation: 'done',
  });

  return out;
}

// ─── AlgorithmDefinition wrapper for registry / visualizer integration ────────
// Input type: { initial: number[]; ops: StackOp[] }
import { AlgorithmDefinition } from '../../types/algorithm';
import { ListNode as LN } from '../../types/linear';

export interface StackInput {
  initial: number[];
  ops: StackOp[];
}

export const stackAlgorithm: AlgorithmDefinition<StackInput, LN[]> = {
  id: 'stack',
  name: 'Stack',
  category: 'linear',
  categoryName: 'Linear Structures',
  description:
    'Last-In First-Out (LIFO) data structure supporting push, pop, and peek operations.',
  difficulty: 'Easy',
  timeComplexity: { best: 'O(1)', average: 'O(1)', worst: 'O(1)' },
  spaceComplexity: 'O(n)',
  code: [
    'push(value):  stack.unshift(value)',        // 0
    'pop():        stack.shift()  // O(1)',       // 1
    'peek():       return stack[0]  // no remove', // 2
  ],
  defaultInput: {
    initial: [3, 7, 1],
    ops: [
      { type: 'push', value: 9 },
      { type: 'peek' },
      { type: 'pop' },
      { type: 'push', value: 4 },
    ],
  },
  inputConfig: { type: 'array' },
  generate: (input: StackInput) => generateStack(input.initial, input.ops),
};

