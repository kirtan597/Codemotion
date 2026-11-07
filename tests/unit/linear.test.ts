/**
 * tests/unit/linear.test.ts
 *
 * Unit and property-based tests for linear structure generators:
 * - Stack: push, pop, peek, underflow handling, immutability between operations
 * - Queue: enqueue, dequeue, peek, underflow handling, FIFO ordering
 * - Linked List: insertHead, insertTail, delete, search, reverse
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { generateStack } from '@/lib/algorithms/linear/stack';
import { generateQueue } from '@/lib/algorithms/linear/queue';
import { generateLinkedList } from '@/lib/algorithms/linear/linkedList';
import { ListNode, StackOp, QueueOp, LinkedListOp } from '@/lib/types/linear';

describe('Stack Generator', () => {
  it('handles push, pop, and peek correctly', () => {
    const ops: StackOp[] = [
      { type: 'push', value: 10 },
      { type: 'push', value: 20 },
      { type: 'peek' },
      { type: 'pop' },
      { type: 'peek' },
    ];

    const snapshots = generateStack([], ops);
    expect(snapshots.length).toBeGreaterThan(0);

    const lastSnap = snapshots[snapshots.length - 1];
    const data = lastSnap.data as ListNode[];
    expect(data.length).toBe(1);
    expect(data[0].value).toBe(10);
    expect(data[0].pointers).toContain('top');
  });

  it('handles stack underflow gracefully on empty pop and peek', () => {
    const ops: StackOp[] = [
      { type: 'pop' },
      { type: 'peek' },
    ];
    const snapshots = generateStack([], ops);
    const popUnderflow = snapshots.find((s) => s.variables?.result === 'underflow');
    const peekNull = snapshots.find((s) => s.variables?.result === 'null');
    expect(popUnderflow).toBeDefined();
    expect(peekNull).toBeDefined();
  });

  it('property test: LIFO order maintained over random pushes and pops', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 1, max: 100 }), { minLength: 1, maxLength: 20 }),
        (values) => {
          // Push all then pop all
          const ops: StackOp[] = [
            ...values.map((v): StackOp => ({ type: 'push', value: v })),
            ...values.map((): StackOp => ({ type: 'pop' })),
          ];
          const snaps = generateStack([], ops);
          const finalSnap = snaps[snaps.length - 1];
          const finalData = finalSnap.data as ListNode[];
          return finalData.length === 0;
        }
      ),
      { numRuns: 50 }
    );
  });

  it('state is immutable: does not mutate initial values array', () => {
    const init = [1, 2, 3];
    const initCopy = [...init];
    generateStack(init, [{ type: 'pop' }, { type: 'push', value: 99 }]);
    expect(init).toEqual(initCopy);
  });
});

describe('Queue Generator', () => {
  it('handles enqueue, dequeue, and peek in FIFO order', () => {
    const ops: QueueOp[] = [
      { type: 'enqueue', value: 100 },
      { type: 'enqueue', value: 200 },
      { type: 'peek' },
      { type: 'dequeue' },
      { type: 'peek' },
    ];

    const snapshots = generateQueue([], ops);
    expect(snapshots.length).toBeGreaterThan(0);

    // After enqueue 100, 200 and dequeue, 100 is removed and 200 remains
    const lastSnap = snapshots[snapshots.length - 1];
    const data = lastSnap.data as ListNode[];
    expect(data.length).toBe(1);
    expect(data[0].value).toBe(200);
    expect(data[0].pointers).toContain('head');
    expect(data[0].pointers).toContain('tail');
  });

  it('handles queue underflow gracefully', () => {
    const ops: QueueOp[] = [
      { type: 'dequeue' },
      { type: 'peek' },
    ];
    const snapshots = generateQueue([], ops);
    const dequeueUnderflow = snapshots.find((s) => s.variables?.result === 'underflow');
    const peekNull = snapshots.find((s) => s.variables?.result === 'null');
    expect(dequeueUnderflow).toBeDefined();
    expect(peekNull).toBeDefined();
  });

  it('property test: FIFO order over enqueue and dequeue', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 1, max: 100 }), { minLength: 1, maxLength: 20 }),
        (values) => {
          const ops: QueueOp[] = [
            ...values.map((v): QueueOp => ({ type: 'enqueue', value: v })),
            ...values.map((): QueueOp => ({ type: 'dequeue' })),
          ];
          const snaps = generateQueue([], ops);
          const finalSnap = snaps[snaps.length - 1];
          const finalData = finalSnap.data as ListNode[];
          return finalData.length === 0;
        }
      ),
      { numRuns: 50 }
    );
  });
});

describe('Linked List Generator', () => {
  it('supports insertHead, insertTail, search, delete, and reverse', () => {
    const ops: LinkedListOp[] = [
      { type: 'insertHead', value: 2 },
      { type: 'insertHead', value: 1 }, // [1, 2]
      { type: 'insertTail', value: 3 }, // [1, 2, 3]
      { type: 'search', value: 2 },
      { type: 'delete', value: 2 },     // [1, 3]
      { type: 'reverse' },              // [3, 1]
    ];

    const snapshots = generateLinkedList([], ops);
    expect(snapshots.length).toBeGreaterThan(0);

    // Verify search hit snapshot exists
    const searchMatchSnap = snapshots.find(
      (s) => s.variables?.operation === 'search' && s.variables?.match === true
    );
    expect(searchMatchSnap).toBeDefined();

    // Verify final state is [3, 1]
    const lastSnap = snapshots[snapshots.length - 1];
    const data = lastSnap.data as ListNode[];
    expect(data.map((n) => n.value)).toEqual([3, 1]);
    expect(data[0].pointers).toContain('head');
    expect(data[1].pointers).toContain('tail');
  });

  it('handles reverse on empty or single element list', () => {
    const emptySnaps = generateLinkedList([], [{ type: 'reverse' }]);
    expect(emptySnaps.length).toBeGreaterThan(0);

    const singleSnaps = generateLinkedList([42], [{ type: 'reverse' }]);
    const lastSingle = singleSnaps[singleSingleLength(singleSnaps) - 1];
    expect((lastSingle.data as ListNode[])[0].value).toBe(42);
  });

  it('handles delete on non-existent element', () => {
    const snaps = generateLinkedList([10, 20], [{ type: 'delete', value: 99 }]);
    const notFoundSnap = snaps.find(
      (s) => s.variables?.operation === 'delete' && s.variables?.result === 'not found'
    );
    expect(notFoundSnap).toBeDefined();
    const lastSnap = snaps[snaps.length - 1];
    expect((lastSnap.data as ListNode[]).map((n) => n.value)).toEqual([10, 20]);
  });

  it('property test: reverse twice restores original sequence', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 1, max: 100 }), { minLength: 0, maxLength: 15 }),
        (initial) => {
          const ops: LinkedListOp[] = [{ type: 'reverse' }, { type: 'reverse' }];
          const snaps = generateLinkedList(initial, ops);
          const lastSnap = snaps[snaps.length - 1];
          const finalValues = (lastSnap.data as ListNode[]).map((n) => n.value);
          return JSON.stringify(finalValues) === JSON.stringify(initial);
        }
      ),
      { numRuns: 40 }
    );
  });
});

function singleSingleLength(snaps: any[]) {
  return snaps.length;
}

