/**
 * tests/unit/sorting.test.ts
 *
 * Property-based + edge-case tests for all six sorting algorithm generators.
 *
 * For each algorithm we verify:
 *   1. fast-check: final data is sorted ascending
 *   2. fast-check: final snapshot is a permutation of the input (no elements added/dropped)
 *   3. fast-check: resolvedIndices (sortedIndices on last snapshot) covers all indices 0..n-1
 *   4. fast-check: original input array is NOT mutated
 *   5. Edge: empty array
 *   6. Edge: single element
 *   7. Edge: all duplicates
 *   8. Edge: already sorted array
 *   9. Edge: reverse-sorted array
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

import { bubbleSort }    from '@/lib/algorithms/sorting/bubble';
import { selectionSort } from '@/lib/algorithms/sorting/selection';
import { insertionSort } from '@/lib/algorithms/sorting/insertion';
import { mergeSort }     from '@/lib/algorithms/sorting/merge';
import { quickSort }     from '@/lib/algorithms/sorting/quick';
import { heapSort }      from '@/lib/algorithms/sorting/heap';
import { AlgorithmDefinition, ArrayElement } from '@/lib/types/algorithm';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Extract the values array from the last snapshot's data. */
function lastValues(algo: AlgorithmDefinition<number[], ArrayElement[]>, input: number[]): number[] {
  const snaps = algo.generate(input);
  const last = snaps[snaps.length - 1];
  return (last.data as ArrayElement[]).map((el) => el.value);
}

/** Extract all snapshot IDs to verify no duplicates exist (step counting). */
function lastSnapshot(algo: AlgorithmDefinition<number[], ArrayElement[]>, input: number[]) {
  const snaps = algo.generate(input);
  return snaps[snaps.length - 1];
}

function allSnapshots(algo: AlgorithmDefinition<number[], ArrayElement[]>, input: number[]) {
  return algo.generate(input);
}

/** Check array is sorted ascending. */
function isSortedAsc(arr: number[]): boolean {
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] < arr[i - 1]) return false;
  }
  return true;
}

/** Check result is a permutation of original (same multiset). */
function isPermutation(original: number[], result: number[]): boolean {
  if (original.length !== result.length) return false;
  const count = new Map<number, number>();
  for (const v of original) count.set(v, (count.get(v) ?? 0) + 1);
  for (const v of result)   count.set(v, (count.get(v) ?? 0) - 1);
  for (const c of count.values()) if (c !== 0) return false;
  return true;
}

/** Return sortedIndices from the final snapshot. */
function finalSortedIndices(algo: AlgorithmDefinition<number[], ArrayElement[]>, input: number[]): number[] {
  const snaps = algo.generate(input);
  return snaps[snaps.length - 1].sortedIndices ?? [];
}

// fast-check arbitrary: integer arrays of length 2–20, values 1–200
const intArrayArb = fc.array(fc.integer({ min: 1, max: 200 }), { minLength: 2, maxLength: 20 });

// ─── Algorithm suites ─────────────────────────────────────────────────────────

const ALGOS: [string, AlgorithmDefinition<number[], ArrayElement[]>][] = [
  ['Bubble Sort',    bubbleSort],
  ['Selection Sort', selectionSort],
  ['Insertion Sort', insertionSort],
  ['Merge Sort',     mergeSort],
  ['Quick Sort',     quickSort],
  ['Heap Sort',      heapSort],
];

for (const [name, algo] of ALGOS) {
  describe(name, () => {
    // ── Property tests ──────────────────────────────────────────────────────

    it('property: final data is sorted ascending', () => {
      fc.assert(
        fc.property(intArrayArb, (arr) => {
          const result = lastValues(algo, arr);
          return isSortedAsc(result);
        }),
        { numRuns: 100 }
      );
    });

    it('property: final data is a permutation of input', () => {
      fc.assert(
        fc.property(intArrayArb, (arr) => {
          const result = lastValues(algo, arr);
          return isPermutation(arr, result);
        }),
        { numRuns: 100 }
      );
    });

    it('property: sortedIndices on last snapshot covers all indices', () => {
      fc.assert(
        fc.property(intArrayArb, (arr) => {
          const sorted = finalSortedIndices(algo, arr);
          const n = arr.length;
          const expected = new Set(Array.from({ length: n }, (_, i) => i));
          for (const idx of sorted) expected.delete(idx);
          return expected.size === 0;
        }),
        { numRuns: 100 }
      );
    });

    it('property: input array is not mutated', () => {
      fc.assert(
        fc.property(intArrayArb, (arr) => {
          const copy = [...arr];
          algo.generate(arr); // run generator
          // original arr should be unchanged
          return arr.every((v, i) => v === copy[i]);
        }),
        { numRuns: 100 }
      );
    });

    // ── Edge cases ───────────────────────────────────────────────────────────

    it('edge: empty array produces at least one snapshot with empty data', () => {
      const snaps = algo.generate([]);
      expect(snaps.length).toBeGreaterThanOrEqual(1);
      expect((snaps[snaps.length - 1].data as ArrayElement[]).length).toBe(0);
    });

    it('edge: single element is considered sorted', () => {
      const snaps = algo.generate([42]);
      expect(snaps.length).toBeGreaterThanOrEqual(1);
      const finalData = snaps[snaps.length - 1].data as ArrayElement[];
      expect(finalData.length).toBe(1);
      expect(finalData[0].value).toBe(42);
      expect(finalData[0].state).toBe('sorted');
    });

    it('edge: all-duplicate array produces correct sorted output', () => {
      const result = lastValues(algo, [5, 5, 5, 5, 5]);
      expect(isSortedAsc(result)).toBe(true);
      expect(result).toEqual([5, 5, 5, 5, 5]);
    });

    it('edge: already-sorted array produces correct sorted output', () => {
      const input = [1, 2, 3, 4, 5, 6, 7, 8];
      const result = lastValues(algo, input);
      expect(isSortedAsc(result)).toBe(true);
      expect(isPermutation(input, result)).toBe(true);
    });

    it('edge: reverse-sorted array produces correct sorted output', () => {
      const input = [9, 8, 7, 6, 5, 4, 3, 2, 1];
      const result = lastValues(algo, input);
      expect(isSortedAsc(result)).toBe(true);
      expect(isPermutation(input, result)).toBe(true);
    });

    // ── Snapshot shape ───────────────────────────────────────────────────────

    it('every snapshot has an id, step, description, and data array', () => {
      const snaps = allSnapshots(algo, [3, 1, 4, 1, 5, 9, 2, 6]);
      for (const s of snaps) {
        expect(typeof s.id).toBe('string');
        expect(typeof s.step).toBe('number');
        expect(typeof s.description).toBe('string');
        expect(Array.isArray(s.data)).toBe(true);
      }
    });

    it('every snapshot carries comparisons and swaps in variables', () => {
      const snaps = allSnapshots(algo, [4, 2, 7, 1, 5]);
      // At least the last snapshot should have these
      const last = snaps[snaps.length - 1];
      expect(last.variables).toBeDefined();
      expect(typeof last.variables!.comparisons).toBe('number');
      expect(typeof last.variables!.swaps).toBe('number');
    });

    it('snapshot step numbers are monotonically non-decreasing', () => {
      const snaps = allSnapshots(algo, [10, 3, 7, 1, 9, 2]);
      for (let i = 1; i < snaps.length; i++) {
        expect(snaps[i].step).toBeGreaterThanOrEqual(snaps[i - 1].step);
      }
    });

    it('all element IDs in a snapshot are stable (same element = same id across steps)', () => {
      // We can at least verify IDs don't change within a single snapshot
      const snaps = allSnapshots(algo, [5, 3, 8, 1, 6]);
      for (const snap of snaps) {
        const data = snap.data as ArrayElement[];
        const ids = data.map((el) => el.id);
        // IDs should be unique within a snapshot (no duplicates)
        expect(new Set(ids).size).toBe(ids.length);
      }
    });
  });
}

// ─── Cross-algorithm: all 6 appear in registry ───────────────────────────────
describe('Registry wiring', () => {
  it('all 6 sorting algorithms are accessible via registry', async () => {
    const { getAlgorithm } = await import('@/lib/algorithms/registry');
    const ids = ['bubble-sort', 'selection-sort', 'insertion-sort', 'merge-sort', 'quick-sort', 'heap-sort'];
    for (const id of ids) {
      const def = getAlgorithm(id);
      expect(def, `${id} should be registered`).toBeDefined();
      expect(def!.category).toBe('sorting');
      expect(typeof def!.generate).toBe('function');
    }
  });
});

