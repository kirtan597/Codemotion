import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { MinHeap } from '@/lib/utils/minHeap';

describe('MinHeap', () => {
  it('correctly tracks min element with push and pop', () => {
    const heap = new MinHeap<number>();
    heap.push(5);
    heap.push(3);
    heap.push(8);
    heap.push(1);
    heap.push(2);

    expect(heap.size).toBe(5);
    expect(heap.peek()).toBe(1);
    expect(heap.pop()).toBe(1);
    expect(heap.pop()).toBe(2);
    expect(heap.pop()).toBe(3);
    expect(heap.pop()).toBe(5);
    expect(heap.pop()).toBe(8);
    expect(heap.pop()).toBeUndefined();
    expect(heap.isEmpty()).toBe(true);
  });

  it('works with custom comparator for objects', () => {
    interface Item {
      id: string;
      dist: number;
    }
    const heap = new MinHeap<Item>((a, b) => a.dist - b.dist);
    heap.push({ id: 'B', dist: 10 });
    heap.push({ id: 'A', dist: 3 });
    heap.push({ id: 'C', dist: 7 });

    expect(heap.peek()?.id).toBe('A');
    expect(heap.pop()?.id).toBe('A');
    expect(heap.pop()?.id).toBe('C');
    expect(heap.pop()?.id).toBe('B');
  });

  it('property test: always extracts elements in ascending order', () => {
    fc.assert(
      fc.property(fc.array(fc.integer({ min: -1000, max: 1000 }), { minLength: 0, maxLength: 100 }), (arr) => {
        const heap = new MinHeap<number>();
        for (const num of arr) {
          heap.push(num);
        }
        expect(heap.size).toBe(arr.length);

        const extracted: number[] = [];
        while (!heap.isEmpty()) {
          extracted.push(heap.pop()!);
        }

        const sorted = [...arr].sort((a, b) => a - b);
        expect(extracted).toEqual(sorted);
      }),
      { numRuns: 100 }
    );
  });
});

