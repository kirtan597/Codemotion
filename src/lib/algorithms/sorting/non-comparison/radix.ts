/**
 * Radix Sort - Non-comparison sorting algorithm
 * Sorts by processing individual digits from least significant to most significant
 * 
 * Time Complexity: O(d * (n + k)) where d is number of digits, k is base
 * Space Complexity: O(n + k)
 * Stable: Yes
 * In-place: No
 */

import { AlgorithmDefinition, Snapshot, ArrayElement, ElementState } from '../../../types/algorithm';

function assignIds(arr: number[]): { id: string; value: number }[] {
  return arr.map((v, i) => ({ id: `rdx-${i}-${v}`, value: v }));
}

function toElements(
  items: { id: string; value: number }[],
  states: Record<number, ElementState>
): ArrayElement[] {
  return items.map((item, idx) => ({
    id: item.id,
    value: item.value,
    state: states[idx] ?? 'default',
  }));
}

function getDigit(num: number, place: number, base: number = 10): number {
  return Math.floor(num / Math.pow(base, place)) % base;
}

function getMaxDigits(arr: { value: number }[], base: number = 10): number {
  let max = 0;
  for (const item of arr) {
    const digits = item.value === 0 ? 1 : Math.floor(Math.log(Math.abs(item.value)) / Math.log(base)) + 1;
    if (digits > max) max = digits;
  }
  return max;
}

// Pseudocode:
// 0: Find maximum number to determine digit count
// 1: for digit from 0 to maxDigits - 1:
// 2:   Create 10 buckets (0-9)
// 3:   for each element: place in bucket based on current digit
// 4:   Collect elements from buckets in order
// 5: Array is now sorted

export const radixSort: AlgorithmDefinition<number[], ArrayElement[]> = {
  id: 'radix-sort',
  name: 'Radix Sort (LSD)',
  category: 'sorting',
  categoryName: 'Sorting',
  description:
    'Non-comparison sort that processes integers digit by digit from least significant (LSD) to most significant. Uses counting sort as subroutine.',
  difficulty: 'Medium',
  timeComplexity: { best: 'O(d*(n+k))', average: 'O(d*(n+k))', worst: 'O(d*(n+k))' },
  spaceComplexity: 'O(n+k)',
  code: [
    'Find max to determine digit count (d)',       // 0
    'for digit from 0 to d-1 (LSD to MSD):',      // 1
    '  Create 10 buckets (base 10)',               // 2
    '  Distribute elements by current digit',      // 3
    '  Collect elements from buckets in order',    // 4
    'Array is sorted',                             // 5
  ],
  defaultInput: [170, 45, 75, 90, 802, 24, 2, 66],
  inputConfig: {
    type: 'array',
    minSize: 2,
    maxSize: 40,
    defaultSize: 12,
    supportsCustomInput: true,
  },
  generate: (input: number[]) => {
    const snapshots: Snapshot<ArrayElement[]>[] = [];
    let step = 0;
    let arrayAccesses = 0;
    const base = 10;

    let items = assignIds(input);
    const n = items.length;

    // Initial state
    snapshots.push({
      id: `rdx-${step++}`,
      step: snapshots.length,
      description: 'Starting Radix Sort (LSD - Least Significant Digit first)',
      data: toElements(items, {}),
      currentLine: 0,
      variables: { arrayAccesses, phase: 'init', base },
    });

    if (n === 0 || n === 1) {
      snapshots.push({
        id: `rdx-${step++}`,
        step: snapshots.length,
        description: n === 0 ? 'Array is empty.' : 'Single element - already sorted.',
        data: toElements(items, n === 1 ? { 0: 'sorted' } : {}),
        currentLine: 0,
        variables: { arrayAccesses, phase: 'done' },
      });
      return snapshots;
    }

    // Find max digits
    const maxDigits = getMaxDigits(items, base);
    
    snapshots.push({
      id: `rdx-${step++}`,
      step: snapshots.length,
      description: `Maximum number has ${maxDigits} digit(s). Will sort ${maxDigits} times.`,
      data: toElements(items, {}),
      currentLine: 0,
      variables: { arrayAccesses, phase: 'find-max', maxDigits, base },
    });

    // Process each digit position
    for (let digitPos = 0; digitPos < maxDigits; digitPos++) {
      snapshots.push({
        id: `rdx-${step++}`,
        step: snapshots.length,
        description: `Pass ${digitPos + 1}/${maxDigits}: Sorting by digit at position ${digitPos} (${digitPos === 0 ? 'ones' : digitPos === 1 ? 'tens' : digitPos === 2 ? 'hundreds' : 'place'})`,
        data: toElements(items, {}),
        currentLine: 1,
        variables: { arrayAccesses, phase: 'digit-pass', digitPos, maxDigits, base },
      });

      // Create buckets
      const buckets: { id: string; value: number }[][] = Array.from({ length: base }, () => []);

      // Distribute into buckets
      for (let i = 0; i < n; i++) {
        const digit = getDigit(items[i].value, digitPos, base);
        buckets[digit].push(items[i]);
        arrayAccesses++;

        if (i % 3 === 0 || i === n - 1) {
          snapshots.push({
            id: `rdx-${step++}`,
            step: snapshots.length,
            description: `Element ${items[i].value} → digit ${digit} → bucket ${digit}`,
            data: toElements(items, { [i]: 'radix' }),
            currentLine: 3,
            variables: { 
              arrayAccesses, 
              phase: 'distribute', 
              digitPos, 
              currentElement: items[i].value, 
              currentDigit: digit,
              base,
            },
          });
        }
      }

      // Show bucket distribution
      const bucketSizes = buckets.map((b, idx) => `${idx}:${b.length}`).filter((_, idx) => buckets[idx].length > 0);
      snapshots.push({
        id: `rdx-${step++}`,
        step: snapshots.length,
        description: `Distribution complete. Buckets: [${bucketSizes.join(', ')}]`,
        data: toElements(items, {}),
        currentLine: 3,
        variables: { 
          arrayAccesses, 
          phase: 'distributed', 
          digitPos,
          bucketInfo: bucketSizes.join(', '),
          base,
        },
      });

      // Collect from buckets
      items = [];
      for (let bucket = 0; bucket < base; bucket++) {
        for (const item of buckets[bucket]) {
          items.push(item);
        }
      }

      // Show result of this pass
      const passStates: Record<number, ElementState> = {};
      if (digitPos === maxDigits - 1) {
        for (let i = 0; i < n; i++) {
          passStates[i] = 'sorted';
        }
      }

      snapshots.push({
        id: `rdx-${step++}`,
        step: snapshots.length,
        description: digitPos === maxDigits - 1 
          ? 'Final pass complete - array is sorted!' 
          : `Pass ${digitPos + 1} complete. Array is sorted by digit position ${digitPos}.`,
        data: toElements(items, passStates),
        currentLine: 4,
        variables: { 
          arrayAccesses, 
          phase: digitPos === maxDigits - 1 ? 'done' : 'pass-complete', 
          digitPos,
          maxDigits,
          base,
        },
      });
    }

    // Final state
    const sortedStates: Record<number, ElementState> = {};
    for (let i = 0; i < n; i++) {
      sortedStates[i] = 'sorted';
    }

    snapshots.push({
      id: `rdx-${step++}`,
      step: snapshots.length,
      description: `Radix Sort complete! Sorted in ${maxDigits} passes.`,
      data: toElements(items, sortedStates),
      currentLine: 5,
      variables: { 
        arrayAccesses, 
        phase: 'done', 
        maxDigits,
        stable: true,
        inPlace: false,
        base,
      },
    });

    return snapshots;
  },
};
