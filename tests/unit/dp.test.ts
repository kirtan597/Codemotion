import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { knapsack01 } from '@/lib/algorithms/dp/knapsack01';
import { lcs } from '@/lib/algorithms/dp/lcs';
import { KnapsackItem, DEFAULT_KNAPSACK_INPUT } from '@/lib/algorithms/dp/types';

// Brute-force subset enumeration for 0/1 Knapsack
function bruteForceKnapsack(items: KnapsackItem[], capacity: number): number {
  const n = items.length;
  let maxVal = 0;
  const totalSubsets = 1 << n;

  for (let mask = 0; mask < totalSubsets; mask++) {
    let currentWeight = 0;
    let currentValue = 0;

    for (let i = 0; i < n; i++) {
      if ((mask & (1 << i)) !== 0) {
        currentWeight += items[i].weight;
        currentValue += items[i].value;
      }
    }

    if (currentWeight <= capacity && currentValue > maxVal) {
      maxVal = currentValue;
    }
  }

  return maxVal;
}

// Reference LCS length function
function referenceLCS(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  return dp[m][n];
}

// Subsequence checker
function isSubsequence(sub: string, full: string): boolean {
  let subIdx = 0;
  for (let fullIdx = 0; fullIdx < full.length && subIdx < sub.length; fullIdx++) {
    if (full[fullIdx] === sub[subIdx]) {
      subIdx++;
    }
  }
  return subIdx === sub.length;
}

describe('Dynamic Programming Algorithms', () => {
  describe('0/1 Knapsack', () => {
    it('property test: knapsack equals brute-force subset enumeration for n <= 10', () => {
      fc.assert(
        fc.property(
          fc.record({
            capacity: fc.integer({ min: 1, max: 20 }),
            items: fc.array(
              fc.record({
                name: fc.stringMatching(/^[A-Z][a-z]?$/),
                weight: fc.integer({ min: 1, max: 10 }),
                value: fc.integer({ min: 1, max: 50 }),
              }),
              { minLength: 1, maxLength: 8 }
            ),
          }),
          ({ capacity, items }) => {
            const snapshots = knapsack01.generate({ items, capacity });
            const lastSnap = snapshots[snapshots.length - 1];
            const dpOptimal = lastSnap.variables?.bestValue;

            const bruteForceOptimal = bruteForceKnapsack(items, capacity);
            expect(dpOptimal).toBe(bruteForceOptimal);

            // Verify chosen items weight is <= capacity
            const chosen = lastSnap.variables?.chosenItems as KnapsackItem[];
            if (chosen) {
              const totalWeight = chosen.reduce((sum, it) => sum + it.weight, 0);
              const totalVal = chosen.reduce((sum, it) => sum + it.value, 0);
              expect(totalWeight).toBeLessThanOrEqual(capacity);
              expect(totalVal).toBe(bruteForceOptimal);
            }
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('emits backtrack phase and highlights dependency cells correctly', () => {
      const snaps = knapsack01.generate(DEFAULT_KNAPSACK_INPUT);
      expect(snaps.length).toBeGreaterThan(0);

      // Verify computing phase snapshots have dependency cells
      const computeSnaps = snaps.filter((s) => s.data.phase === 'compute');
      expect(computeSnaps.length).toBeGreaterThan(0);
      expect(computeSnaps[0].data.computingCell).toBeDefined();

      // Verify backtrack phase snapshots exist
      const backtrackSnaps = snaps.filter((s) => s.data.phase === 'backtrack');
      expect(backtrackSnaps.length).toBeGreaterThan(0);

      // Final snapshot
      const finalSnap = snaps[snaps.length - 1];
      expect(finalSnap.data.phase).toBe('done');
      expect(finalSnap.variables?.chosenItems?.length).toBeGreaterThan(0);
    });
  });

  describe('Longest Common Subsequence (LCS)', () => {
    it('property test: LCS length matches reference and reconstructed LCS is a valid subsequence of both strings', () => {
      const charArb = fc.constantFrom('A', 'B', 'C', 'D', 'E', 'F');
      const strArb = fc.array(charArb, { minLength: 1, maxLength: 10 }).map((arr) => arr.join(''));

      fc.assert(
        fc.property(strArb, strArb, (text1, text2) => {
          const snapshots = lcs.generate({ text1, text2 });
          const lastSnap = snapshots[snapshots.length - 1];

          const expectedLen = referenceLCS(text1, text2);
          const actualLen = lastSnap.variables?.bestValue;
          expect(actualLen).toBe(expectedLen);

          const reconstructed = lastSnap.variables?.reconstructedLCS as string;
          expect(reconstructed).toBeDefined();
          expect(reconstructed.length).toBe(expectedLen);

          // Subsequence check
          expect(isSubsequence(reconstructed, text1)).toBe(true);
          expect(isSubsequence(reconstructed, text2)).toBe(true);
          return true;
        }),
        { numRuns: 80 }
      );
    });

    it('handles identical strings and disjoint strings correctly', () => {
      // Identical
      const snapSame = lcs.generate({ text1: 'ALGO', text2: 'ALGO' });
      const lastSame = snapSame[snapSame.length - 1];
      expect(lastSame.variables?.reconstructedLCS).toBe('ALGO');

      // Disjoint
      const snapDisjoint = lcs.generate({ text1: 'ABC', text2: 'XYZ' });
      const lastDisjoint = snapDisjoint[snapDisjoint.length - 1];
      expect(lastDisjoint.variables?.reconstructedLCS).toBe('');
      expect(lastDisjoint.variables?.bestValue).toBe(0);
    });
  });
});

