/**
 * src/lib/algorithms/searching/linear.ts
 *
 * Linear Search — rewrite from the monolithic searching.ts, now in its own module.
 * Emits a snapshot for every element visited. Pointer "i" is tracked in variables.
 * Discarded range (already-visited indices) encoded in meta via variables.visitedRange.
 */

import { AlgorithmDefinition, Snapshot, ArrayElement, ElementState } from '../../types/algorithm';

export interface SearchInput {
  array: number[];
  target: number;
}

function makeId(prefix: string, idx: number, value: number): string {
  return `${prefix}-${idx}-${value}`;
}

function buildElements(
  arr: number[],
  states: Record<number, ElementState>
): ArrayElement[] {
  return arr.map((value, idx) => ({
    id: makeId('ls', idx, value),
    value,
    state: states[idx] ?? 'default',
  }));
}

// Pseudocode (0-indexed):
// 0: for i from 0 to n-1:
// 1:   if arr[i] == target: return i
// 2: return -1

export const linearSearch: AlgorithmDefinition<SearchInput | number[], ArrayElement[]> = {
  id: 'linear-search',
  name: 'Linear Search',
  category: 'searching',
  categoryName: 'Searching',
  description:
    'Sequentially checks each element until a match is found or the list is exhausted.',
  difficulty: 'Easy',
  timeComplexity: { best: 'O(1)', average: 'O(n)', worst: 'O(n)' },
  spaceComplexity: 'O(1)',
  defaultInput: { array: [24, 7, 42, 19, 88, 3, 56, 12], target: 88 },
  inputConfig: {
    type: 'array-target',
    minSize: 2,
    maxSize: 60,
    defaultSize: 8,
    supportsCustomInput: true,
  },
  code: [
    'for i from 0 to n - 1:',         // 0
    '  if arr[i] == target: return i', // 1
    'return -1',                        // 2
  ],

  generate(input: SearchInput | number[]): Snapshot<ArrayElement[]>[] {
    let arr: number[];
    let target: number;

    if (Array.isArray(input)) {
      arr = [...input];
      target = arr[Math.floor(arr.length / 2)] ?? 0;
    } else {
      arr = [...input.array];
      target = input.target ?? arr[Math.floor(arr.length / 2)] ?? 0;
    }

    const n = arr.length;
    const snapshots: Snapshot<ArrayElement[]>[] = [];
    let stepCount = 0;

    const push = (
      desc: string,
      line: number,
      currentIdx: number | null,
      found: boolean,
      visitedCount: number
    ) => {
      const states: Record<number, ElementState> = {};
      for (let i = 0; i < n; i++) {
        if (currentIdx !== null && i < visitedCount) {
          states[i] = 'visited';   // discarded range
        } else if (i === currentIdx) {
          states[i] = found ? 'found' : 'comparing';
        }
        // else stays 'default'
      }

      snapshots.push({
        id: `ls-${stepCount++}`,
        step: snapshots.length,
        description: desc,
        data: buildElements(arr, states),
        comparingIndices: currentIdx !== null ? [currentIdx] : [],
        highlightIndices: currentIdx !== null ? [currentIdx] : [],
        currentLine: line,
        variables: {
          i: currentIdx,
          target,
          found,
          // Discarded range: all indices < currentIdx
          visitedRange: visitedCount > 0 ? `[0..${visitedCount - 1}]` : 'none',
        },
      });
    };

    push(`Linear Search: looking for ${target} in ${n} elements.`, 0, null, false, 0);

    let found = false;
    for (let i = 0; i < n; i++) {
      push(`Checking index ${i}: arr[${i}] = ${arr[i]}.`, 0, i, false, i);
      if (arr[i] === target) {
        found = true;
        push(`Match! arr[${i}] = ${target}. Found at index ${i}.`, 1, i, true, i);
        break;
      } else {
        push(`arr[${i}] (${arr[i]}) ≠ ${target}. Discarding index ${i}.`, 1, i, false, i + 1);
      }
    }

    if (!found) {
      push(`Target ${target} is not in the array. Search exhausted.`, 2, null, false, n);
    }

    return snapshots;
  },
};

