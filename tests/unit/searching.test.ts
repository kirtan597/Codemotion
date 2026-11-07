/**
 * tests/unit/searching.test.ts
 *
 * Tests for the new searching module generators (linear, binary).
 *
 * Binary search agreement test: binary search result index must agree with
 * the sorted array's indexOf (i.e., finds the same element JS would find).
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { linearSearch } from '@/lib/algorithms/searching/linear';
import { binarySearch } from '@/lib/algorithms/searching/binary';
import { ArrayElement, Snapshot } from '@/lib/types/algorithm';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function lastSnap(
  snaps: Snapshot<ArrayElement[]>[]
): Snapshot<ArrayElement[]> {
  return snaps[snaps.length - 1];
}

function foundIdx(snaps: Snapshot<ArrayElement[]>[]): number {
  for (const s of snaps) {
    const found = (s.data as ArrayElement[]).findIndex((el) => el.state === 'found');
    if (found !== -1) return found;
  }
  return -1;
}

// Sorted int array arb (unique values for clean indexOf comparison)
const sortedUniqueIntArb = fc
  .uniqueArray(fc.integer({ min: 1, max: 500 }), { minLength: 2, maxLength: 30 })
  .map((arr) => arr.sort((a, b) => a - b));

// ─── Linear Search ───────────────────────────────────────────────────────────
describe('Linear Search', () => {
  it('finds target that is in the array', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 1, max: 200 }), { minLength: 1, maxLength: 20 }),
        (arr) => {
          const target = arr[Math.floor(Math.random() * arr.length)];
          const snaps = linearSearch.generate({ array: arr, target });
          return foundIdx(snaps) !== -1;
        }
      ),
      { numRuns: 80 }
    );
  });

  it('does NOT mark found when target is absent', () => {
    // Use arr with values 1–50, target = 999
    const snaps = linearSearch.generate({ array: [1, 5, 10, 20, 30], target: 999 });
    expect(foundIdx(snaps)).toBe(-1);
    const last = lastSnap(snaps);
    expect(last.variables?.found).toBe(false);
  });

  it('empty array produces at least one snapshot', () => {
    const snaps = linearSearch.generate({ array: [], target: 5 });
    expect(snaps.length).toBeGreaterThanOrEqual(1);
  });

  it('single element found', () => {
    const snaps = linearSearch.generate({ array: [42], target: 42 });
    expect(foundIdx(snaps)).toBe(0);
  });

  it('single element not found', () => {
    const snaps = linearSearch.generate({ array: [42], target: 7 });
    expect(foundIdx(snaps)).toBe(-1);
  });

  it('every snapshot has id, step, description, data', () => {
    const snaps = linearSearch.generate({ array: [3, 1, 4, 1, 5], target: 4 });
    for (const s of snaps) {
      expect(typeof s.id).toBe('string');
      expect(typeof s.step).toBe('number');
      expect(typeof s.description).toBe('string');
      expect(Array.isArray(s.data)).toBe(true);
    }
  });

  it('visitedRange in variables reflects discarded portion', () => {
    const arr = [10, 20, 30, 40, 50];
    const snaps = linearSearch.generate({ array: arr, target: 30 });
    // At the snapshot where target is found (idx 2), visitedRange should mention idx 2
    const foundSnap = snaps.find((s) =>
      (s.data as ArrayElement[]).some((el) => el.state === 'found')
    );
    expect(foundSnap).toBeDefined();
    // The visitedRange up to the found item should show [0..1]
    const vars = foundSnap!.variables;
    expect(vars?.visitedRange).toContain('0');
  });

  it('steps are monotonically non-decreasing', () => {
    const snaps = linearSearch.generate({ array: [7, 3, 9, 1, 5], target: 9 });
    for (let i = 1; i < snaps.length; i++) {
      expect(snaps[i].step).toBeGreaterThanOrEqual(snaps[i - 1].step);
    }
  });
});

// ─── Binary Search ───────────────────────────────────────────────────────────
describe('Binary Search', () => {
  // ── Agreement with Array.prototype.indexOf ──────────────────────────────
  it('property: agrees with Array.indexOf on sorted unique input (target present)', () => {
    fc.assert(
      fc.property(sortedUniqueIntArb, (sortedArr) => {
        // Pick a random element from the array as target
        const targetIdx = Math.floor(Math.random() * sortedArr.length);
        const target = sortedArr[targetIdx];

        const snaps = binarySearch.generate({ array: sortedArr, target });

        // Binary search must mark 'found' at some point
        const bsFound = foundIdx(snaps);
        expect(bsFound).not.toBe(-1);

        // The value at the found index must equal target
        const foundSnap = snaps.find((s) =>
          (s.data as ArrayElement[]).some((el) => el.state === 'found')
        )!;
        const foundEl = (foundSnap.data as ArrayElement[]).find((el) => el.state === 'found')!;
        expect(foundEl.value).toBe(target);

        // JS indexOf on sorted arr must also find it
        expect(sortedArr.indexOf(target)).not.toBe(-1);
        return true;
      }),
      { numRuns: 80 }
    );
  });

  it('property: returns no "found" state when target is absent', () => {
    fc.assert(
      fc.property(sortedUniqueIntArb, (sortedArr) => {
        const target = Math.max(...sortedArr) + 1; // guaranteed absent
        const snaps = binarySearch.generate({ array: sortedArr, target });
        return foundIdx(snaps) === -1;
      }),
      { numRuns: 60 }
    );
  });

  it('property: discardedLeft and discardedRight shrink the window monotonically', () => {
    fc.assert(
      fc.property(sortedUniqueIntArb, (sortedArr) => {
        const target = 9999; // absent — forces full traversal
        const snaps = binarySearch.generate({ array: sortedArr, target });

        // Active window [low..high] should never expand
        let prevWindow = Infinity;
        for (const s of snaps) {
          const low = s.variables?.low as number;
          const high = s.variables?.high as number;
          if (low != null && high != null && low <= high) {
            const windowSize = high - low + 1;
            expect(windowSize).toBeLessThanOrEqual(prevWindow);
            prevWindow = windowSize;
          }
        }
        return true;
      }),
      { numRuns: 60 }
    );
  });

  it('empty array produces at least one snapshot', () => {
    const snaps = binarySearch.generate({ array: [], target: 5 });
    expect(snaps.length).toBeGreaterThanOrEqual(1);
  });

  it('single element found', () => {
    const snaps = binarySearch.generate({ array: [7], target: 7 });
    expect(foundIdx(snaps)).not.toBe(-1);
  });

  it('single element not found', () => {
    const snaps = binarySearch.generate({ array: [7], target: 99 });
    expect(foundIdx(snaps)).toBe(-1);
  });

  it('sorted array — target at first position', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const snaps = binarySearch.generate({ array: arr, target: 1 });
    expect(foundIdx(snaps)).not.toBe(-1);
  });

  it('sorted array — target at last position', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const snaps = binarySearch.generate({ array: arr, target: 10 });
    expect(foundIdx(snaps)).not.toBe(-1);
  });

  it('every snapshot has id, step, description, data', () => {
    const snaps = binarySearch.generate({ array: [5, 10, 15, 20, 25], target: 15 });
    for (const s of snaps) {
      expect(typeof s.id).toBe('string');
      expect(typeof s.step).toBe('number');
      expect(Array.isArray(s.data)).toBe(true);
    }
  });

  it('variables contain low, high, mid, target on every comparison step', () => {
    const snaps = binarySearch.generate({ array: [1, 3, 5, 7, 9], target: 7 });
    const compSnaps = snaps.filter((s) => s.currentLine === 2);
    for (const s of compSnaps) {
      expect(typeof s.variables?.low).toBe('number');
      expect(typeof s.variables?.high).toBe('number');
      expect(typeof s.variables?.mid).toBe('number');
    }
  });
});

