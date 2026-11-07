/**
 * src/lib/algorithms/searching/binary.ts
 *
 * Binary Search — rewrite from the monolithic searching.ts, now in its own module.
 * Emits a snapshot for every comparison. Tracks low / mid / high pointers.
 * Discarded ranges shown via 'visited' state; active window stays 'default'.
 * variables.discardedLeft / discardedRight expose the discarded ranges.
 */

import { AlgorithmDefinition, Snapshot, ArrayElement, ElementState } from '../../types/algorithm';
import { SearchInput } from './linear';

function buildElements(
  arr: number[],
  low: number,
  high: number,
  mid: number | null,
  found: boolean
): ArrayElement[] {
  const n = arr.length;
  return arr.map((value, idx) => {
    let state: ElementState = 'default';
    if (idx < low || idx > high) {
      state = 'visited'; // discarded range
    }
    if (mid !== null && idx === mid) {
      state = found ? 'found' : 'comparing';
    }
    return {
      id: `bs-${idx}-${value}`,
      value,
      state,
    };
  });
}

// Pseudocode (0-indexed):
// 0: low = 0, high = n-1
// 1: while low <= high:
// 2:   mid = ⌊(low+high)/2⌋
// 3:   if arr[mid] == target: return mid
// 4:   else if arr[mid] < target: low = mid + 1
// 5:   else: high = mid - 1
// 6: return -1

export const binarySearch: AlgorithmDefinition<SearchInput | number[], ArrayElement[]> = {
  id: 'binary-search',
  name: 'Binary Search',
  category: 'searching',
  categoryName: 'Searching',
  description:
    'Efficiently searches a sorted array by repeatedly halving the search window.',
  difficulty: 'Easy',
  timeComplexity: { best: 'O(1)', average: 'O(log n)', worst: 'O(log n)' },
  spaceComplexity: 'O(1)',
  defaultInput: { array: [10, 18, 25, 32, 45, 54, 63, 72, 81, 95], target: 54 },
  inputConfig: {
    type: 'array-target',
    minSize: 2,
    maxSize: 60,
    defaultSize: 10,
    supportsCustomInput: true,
  },
  code: [
    'low = 0, high = n - 1',                        // 0
    'while low <= high:',                            // 1
    '  mid = ⌊(low + high) / 2⌋',                   // 2
    '  if arr[mid] == target: return mid',           // 3
    '  else if arr[mid] < target: low = mid + 1',   // 4
    '  else: high = mid - 1',                        // 5
    'return -1',                                     // 6
  ],

  generate(input: SearchInput | number[]): Snapshot<ArrayElement[]>[] {
    let rawArr: number[];
    let target: number;

    if (Array.isArray(input)) {
      rawArr = [...input].sort((a, b) => a - b);
      target = rawArr[Math.floor(rawArr.length / 2)] ?? 0;
    } else {
      rawArr = [...input.array].sort((a, b) => a - b);
      target = input.target ?? rawArr[Math.floor(rawArr.length / 2)] ?? 0;
    }

    const n = rawArr.length;
    const snapshots: Snapshot<ArrayElement[]>[] = [];
    let stepCount = 0;

    const push = (
      desc: string,
      line: number,
      low: number,
      high: number,
      mid: number | null,
      found: boolean
    ) => {
      snapshots.push({
        id: `bs-${stepCount++}`,
        step: snapshots.length,
        description: desc,
        data: buildElements(rawArr, low, high, mid, found),
        comparingIndices: mid !== null ? [mid] : [],
        highlightIndices: mid !== null ? [mid] : [],
        currentLine: line,
        variables: {
          low,
          high,
          mid: mid ?? -1,
          target,
          found,
          // Discarded ranges — "meta" as required
          discardedLeft:  low > 0      ? `[0..${low - 1}]`  : 'none',
          discardedRight: high < n - 1 ? `[${high + 1}..${n - 1}]` : 'none',
          activeWindow: low <= high    ? `[${low}..${high}]` : 'empty',
        },
      });
    };

    push(
      `Binary Search on sorted array of ${n} elements. Target = ${target}.`,
      0,
      0,
      n - 1,
      null,
      false
    );

    let low = 0;
    let high = n - 1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      push(
        `Window [${low}..${high}], mid = ${mid} (arr[mid] = ${rawArr[mid]}).`,
        2,
        low,
        high,
        mid,
        false
      );

      if (rawArr[mid] === target) {
        push(`arr[${mid}] = ${rawArr[mid]} == ${target}. Target found at index ${mid}!`, 3, low, high, mid, true);
        break;
      } else if (rawArr[mid] < target) {
        push(
          `arr[${mid}] (${rawArr[mid]}) < ${target}. Discarding left half [${low}..${mid}]. New low = ${mid + 1}.`,
          4,
          low,
          high,
          mid,
          false
        );
        low = mid + 1;
      } else {
        push(
          `arr[${mid}] (${rawArr[mid]}) > ${target}. Discarding right half [${mid}..${high}]. New high = ${mid - 1}.`,
          5,
          low,
          high,
          mid,
          false
        );
        high = mid - 1;
      }
    }

    if (low > high) {
      // Loop exhausted without finding
      push(`Search window empty. Target ${target} is not in the array.`, 6, low, high, null, false);
    }

    return snapshots;
  },
};

