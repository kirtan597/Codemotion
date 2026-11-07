/**
 * src/lib/algorithms/linear/linkedList.ts
 *
 * Singly Linked List operation-based generator.
 * Signature: (initialValues: number[], ops: LinkedListOp[]) => LinearSnapshot[]
 *
 * The list is stored internally as an array (index 0 = head).
 * Each operation produces several step-snapshots to show the process.
 *
 * Supported operations:
 *   insertHead(value) — O(1)
 *   insertTail(value) — O(n)
 *   delete(value)     — O(n) first occurrence
 *   search(value)     — O(n)
 *   reverse()         — O(n) in-place
 */

import { AlgorithmDefinition } from '../../types/algorithm';
import { LinearSnapshot, ListNode, NodeState, LinkedListOp } from '../../types/linear';

let _uid = 0;
function uid(): string {
  return `ll-${_uid++}`;
}

function buildNodes(
  list: { id: string; value: number }[],
  highlights: Record<number, NodeState> = {},
  extraPointers: Record<number, string[]> = {}
): ListNode[] {
  const n = list.length;
  return list.map((item, idx) => {
    const ptrs: string[] = [];
    if (idx === 0) ptrs.push('head');
    if (idx === n - 1 && n > 0) ptrs.push('tail');
    if (extraPointers[idx]) ptrs.push(...extraPointers[idx]);
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
  list: { id: string; value: number }[],
  counter: { n: number },
  desc: string,
  line: number,
  highlights: Record<number, NodeState> = {},
  vars: Record<string, string | number | boolean | null> = {},
  extraPointers: Record<number, string[]> = {}
) {
  out.push({
    id: `ll-${counter.n++}`,
    step: out.length,
    description: desc,
    data: buildNodes(list, highlights, extraPointers),
    currentLine: line,
    variables: { size: list.length, ...vars },
  });
}

// Pseudocode (0-indexed):
// 0: insertHead(v): newNode → head; head = newNode
// 1: insertTail(v): traverse to tail; tail.next = newNode
// 2: delete(v):     find node; unlink it
// 3: search(v):     traverse until found
// 4: reverse():     prev←curr→next iteration

export function generateLinkedList(
  initialValues: number[],
  ops: LinkedListOp[]
): LinearSnapshot[] {
  const list: { id: string; value: number }[] = initialValues.map((v) => ({
    id: uid(),
    value: v,
  }));

  const out: LinearSnapshot[] = [];
  const counter = { n: 0 };

  snap(out, list, counter, `Linked list initialized with ${list.length} node(s).`, 0, {}, {
    operation: 'init',
  });

  for (const op of ops) {
    // ── insertHead ──────────────────────────────────────────────────────────
    if (op.type === 'insertHead') {
      snap(out, list, counter,
        `insertHead(${op.value}): Creating new node and pointing it to current head.`,
        0, {}, { operation: 'insertHead', value: op.value }
      );

      const newNode = { id: uid(), value: op.value };
      list.unshift(newNode);

      snap(out, list, counter,
        `insertHead(${op.value}): New node ${op.value} is now the head.`,
        0, { 0: 'active' }, { operation: 'insertHead', value: op.value, head: op.value }
      );
    }

    // ── insertTail ──────────────────────────────────────────────────────────
    else if (op.type === 'insertTail') {
      if (list.length === 0) {
        // Empty list: same as insertHead
        const newNode = { id: uid(), value: op.value };
        list.push(newNode);
        snap(out, list, counter,
          `insertTail(${op.value}): List was empty — node ${op.value} is now both head and tail.`,
          1, { 0: 'active' }, { operation: 'insertTail', value: op.value }
        );
        continue;
      }

      snap(out, list, counter,
        `insertTail(${op.value}): Traversing to tail to append new node.`,
        1, {}, { operation: 'insertTail', value: op.value }
      );

      // Show traversal step by step
      for (let i = 0; i < list.length; i++) {
        snap(out, list, counter,
          `insertTail: curr at index ${i} (${list[i].value})${i === list.length - 1 ? ' — tail reached.' : '.'}`,
          1,
          { [i]: 'searching' },
          { operation: 'insertTail', curr: i, value: op.value },
          { [i]: ['curr'] }
        );
      }

      const newNode = { id: uid(), value: op.value };
      list.push(newNode);

      snap(out, list, counter,
        `insertTail(${op.value}): Appended ${op.value} as new tail.`,
        1, { [list.length - 1]: 'active' },
        { operation: 'insertTail', value: op.value, tail: op.value }
      );
    }

    // ── delete ──────────────────────────────────────────────────────────────
    else if (op.type === 'delete') {
      if (list.length === 0) {
        snap(out, list, counter, `delete(${op.value}): List is empty — nothing to delete.`, 2, {}, {
          operation: 'delete', value: op.value, result: 'not found',
        });
        continue;
      }

      snap(out, list, counter,
        `delete(${op.value}): Searching for first occurrence of ${op.value}.`,
        2, {}, { operation: 'delete', value: op.value }
      );

      let found = false;
      for (let i = 0; i < list.length; i++) {
        snap(out, list, counter,
          `delete: checking index ${i} (${list[i].value}).`,
          2,
          { [i]: list[i].value === op.value ? 'removing' : 'searching' },
          { operation: 'delete', curr: i, value: op.value },
          { [i]: ['curr'] }
        );

        if (list[i].value === op.value) {
          found = true;
          snap(out, list, counter,
            `delete(${op.value}): Found at index ${i}. Unlinking node.`,
            2, { [i]: 'removing' }, { operation: 'delete', deleteAt: i, value: op.value }
          );
          list.splice(i, 1);
          snap(out, list, counter,
            `delete(${op.value}): Node removed. List now has ${list.length} node(s).`,
            2, {}, { operation: 'delete', value: op.value, result: 'deleted' }
          );
          break;
        }
      }

      if (!found) {
        snap(out, list, counter,
          `delete(${op.value}): Value ${op.value} not found in the list.`,
          2, {}, { operation: 'delete', value: op.value, result: 'not found' }
        );
      }
    }

    // ── search ──────────────────────────────────────────────────────────────
    else if (op.type === 'search') {
      snap(out, list, counter,
        `search(${op.value}): Traversing from head looking for ${op.value}.`,
        3, {}, { operation: 'search', value: op.value }
      );

      let found = false;
      for (let i = 0; i < list.length; i++) {
        const isMatch = list[i].value === op.value;
        snap(out, list, counter,
          `search: index ${i} = ${list[i].value}${isMatch ? ' ← MATCH!' : '.'}`,
          3,
          { [i]: isMatch ? 'found' : 'searching' },
          { operation: 'search', curr: i, value: op.value, match: isMatch },
          { [i]: ['curr'] }
        );

        if (isMatch) {
          found = true;
          break;
        }
      }

      if (!found) {
        snap(out, list, counter,
          `search(${op.value}): Value ${op.value} not found.`,
          3, {}, { operation: 'search', value: op.value, result: 'not found' }
        );
      }
    }

    // ── reverse ─────────────────────────────────────────────────────────────
    else if (op.type === 'reverse') {
      snap(out, list, counter,
        `reverse(): Starting in-place reversal. prev = null, curr = head.`,
        4, {}, { operation: 'reverse' }
      );

      let prev = -1; // index of prev (-1 = null)
      let curr = 0;

      const reversedSet = new Set<number>();

      while (curr < list.length) {
        snap(out, list, counter,
          `reverse: curr = ${curr} (${list[curr].value}). Reversing link direction.`,
          4,
          {
            [curr]: 'active',
            ...(prev >= 0 ? { [prev]: 'sorted' } : {}),
          },
          { operation: 'reverse', curr, prev: prev >= 0 ? list[prev].value : null },
          { [curr]: ['curr'], ...(prev >= 0 ? { [prev]: ['prev'] } : {}) }
        );
        reversedSet.add(curr);
        prev = curr;
        curr++;
      }

      // Perform the actual reversal
      list.reverse();

      snap(out, list, counter,
        `reverse(): Reversal complete. Head is now ${list[0]?.value ?? 'null'}.`,
        4,
        Object.fromEntries(list.map((_, i) => [i, 'sorted' as NodeState])),
        { operation: 'reverse', head: list[0]?.value ?? null }
      );
    }
  }

  snap(out, list, counter,
    `Operations complete. List has ${list.length} node(s).`,
    0, {}, { operation: 'done' }
  );

  return out;
}

// ─── AlgorithmDefinition wrapper ─────────────────────────────────────────────
import { ListNode as LN } from '../../types/linear';

export interface LinkedListInput {
  initial: number[];
  ops: LinkedListOp[];
}

export const linkedListAlgorithm: AlgorithmDefinition<LinkedListInput, LN[]> = {
  id: 'linked-list',
  name: 'Linked List',
  category: 'linear',
  categoryName: 'Linear Structures',
  description:
    'Singly linked list supporting insertHead, insertTail, delete, search, and reverse operations.',
  difficulty: 'Medium',
  timeComplexity: { best: 'O(1)', average: 'O(n)', worst: 'O(n)' },
  spaceComplexity: 'O(n)',
  code: [
    'insertHead(v): newNode → head; head = newNode',  // 0
    'insertTail(v): traverse → tail; tail.next = new', // 1
    'delete(v):     find node; unlink (prev.next = curr.next)', // 2
    'search(v):     traverse until match or end',      // 3
    'reverse():     prev←curr→next until curr == null', // 4
  ],
  defaultInput: {
    initial: [1, 2, 3, 4],
    ops: [
      { type: 'insertTail', value: 5 },
      { type: 'insertHead', value: 0 },
      { type: 'search', value: 3 },
      { type: 'delete', value: 2 },
      { type: 'reverse' },
    ],
  },
  inputConfig: { type: 'array' },
  generate: (input: LinkedListInput) => generateLinkedList(input.initial, input.ops),
};

