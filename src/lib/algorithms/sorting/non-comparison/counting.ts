/**
 * Counting Sort - Non-comparison sorting algorithm
 * 
 * Time Complexity: O(n + k) where k is the range of input
 * Space Complexity: O(k)
 * Stable: Yes
 * In-place: No
 */

import { AlgorithmDefinition, Snapshot, ArrayElement, ElementState } from '../../../types/algorithm';

function assignIds(arr: number[]): { id: string; value: number }[] {
  return arr.map((v, i) => ({ id: `cnt-${i}-${v}`, value: v }));
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

// Pseudocode:
// 0: Find min and max values
// 1: Create count array of size (max - min + 1)
// 2: Count occurrences: for each element: count[element - min]++
// 3: Accumulate counts: for i from 1 to k: count[i] += count[i-1]
// 4: Build output: for each element (reverse): output[--count[element-min]] = element
// 5: Copy output back to original array

export const countingSort: AlgorithmDefinition<number[], ArrayElement[]> = {
  id: 'counting-sort',
  name: 'Counting Sort',
  category: 'sorting',
  categoryName: 'Sorting',
  description:
    'Non-comparison integer sorting algorithm that counts occurrences of each value. Works well when range of input is not significantly greater than the number of elements.',
  difficulty: 'Medium',
  timeComplexity: { best: 'O(n+k)', average: 'O(n+k)', worst: 'O(n+k)' },
  spaceComplexity: 'O(k)',
  code: [
    'Find min and max values in array',                    // 0
    'count[max-min+1] initialized to 0',                   // 1
    'for each element: count[element - min]++',            // 2
    'for i from 1 to k: count[i] += count[i-1]',          // 3
    'for element in reverse: output[--count[element-min]] = element', // 4
    'Copy output back to original array',                  // 5
  ],
  defaultInput: [4, 2, 2, 8, 3, 3, 1, 7, 5, 6],
  inputConfig: {
    type: 'array',
    minSize: 2,
    maxSize: 50,
    defaultSize: 15,
    supportsCustomInput: true,
  },
  generate: (input: number[]) => {
    const snapshots: Snapshot<ArrayElement[]>[] = [];
    let step = 0;
    let comparisons = 0;
    let arrayAccesses = 0;

    const items = assignIds(input);
    const n = items.length;

    // Initial state
    snapshots.push({
      id: `cnt-${step++}`,
      step: snapshots.length,
      description: 'Starting Counting Sort. This is a non-comparison sort.',
      data: toElements(items, {}),
      currentLine: 0,
      variables: { comparisons, arrayAccesses, phase: 'init' },
    });

    if (n === 0) {
      snapshots.push({
        id: `cnt-${step++}`,
        step: snapshots.length,
        description: 'Array is empty.',
        data: toElements(items, {}),
        currentLine: 0,
        variables: { comparisons, arrayAccesses, phase: 'done' },
      });
      return snapshots;
    }

    // Step 1: Find min and max
    let min = items[0].value;
    let max = items[0].value;
    const highlightStates: Record<number, ElementState> = {};

    for (let i = 0; i < n; i++) {
      arrayAccesses++;
      highlightStates[i] = 'active';
      
      if (items[i].value < min) min = items[i].value;
      if (items[i].value > max) max = items[i].value;

      if (i % 3 === 0 || i === n - 1) {
        snapshots.push({
          id: `cnt-${step++}`,
          step: snapshots.length,
          description: `Finding range: min=${min}, max=${max} (checking index ${i})`,
          data: toElements(items, highlightStates),
          currentLine: 0,
          variables: { comparisons, arrayAccesses, min, max, phase: 'find-range' },
        });
      }
    }

    const range = max - min + 1;
    
    snapshots.push({
      id: `cnt-${step++}`,
      step: snapshots.length,
      description: `Range determined: [${min}, ${max}], creating count array of size ${range}`,
      data: toElements(items, {}),
      currentLine: 1,
      variables: { comparisons, arrayAccesses, min, max, range, phase: 'create-count' },
    });

    // Step 2: Count occurrences
    const count: number[] = new Array(range).fill(0);

    for (let i = 0; i < n; i++) {
      const val = items[i].value;
      const countIdx = val - min;
      count[countIdx]++;
      arrayAccesses++;

      if (i % 2 === 0 || i === n - 1) {
        snapshots.push({
          id: `cnt-${step++}`,
          step: snapshots.length,
          description: `Counting: value ${val} appears ${count[countIdx]} time(s) so far`,
          data: toElements(items, { [i]: 'counting' }),
          currentLine: 2,
          variables: { 
            comparisons, 
            arrayAccesses, 
            phase: 'counting',
            currentValue: val,
            countIndex: countIdx,
            countArray: count.slice(0, Math.min(10, count.length)),
          },
        });
      }
    }

    snapshots.push({
      id: `cnt-${step++}`,
      step: snapshots.length,
      description: 'Counting complete. Count array shows frequency of each value.',
      data: toElements(items, {}),
      currentLine: 2,
      variables: { 
        comparisons, 
        arrayAccesses, 
        phase: 'count-done',
        countArray: count.slice(0, Math.min(10, count.length)),
      },
    });

    // Step 3: Accumulate counts (prefix sum)
    for (let i = 1; i < range; i++) {
      count[i] += count[i - 1];
      
      if (i % 5 === 0 || i === range - 1) {
        snapshots.push({
          id: `cnt-${step++}`,
          step: snapshots.length,
          description: `Accumulating counts (prefix sum) at index ${i}`,
          data: toElements(items, {}),
          currentLine: 3,
          variables: { 
            comparisons, 
            arrayAccesses, 
            phase: 'accumulate',
            countArray: count.slice(0, Math.min(10, count.length)),
          },
        });
      }
    }

    snapshots.push({
      id: `cnt-${step++}`,
      step: snapshots.length,
      description: 'Prefix sum complete. Count array now shows positions.',
      data: toElements(items, {}),
      currentLine: 3,
      variables: { 
        comparisons, 
        arrayAccesses, 
        phase: 'accumulate-done',
        countArray: count.slice(0, Math.min(10, count.length)),
      },
    });

    // Step 4: Build output array
    const output: { id: string; value: number }[] = new Array(n);
    
    // Iterate in reverse to maintain stability
    for (let i = n - 1; i >= 0; i--) {
      const val = items[i].value;
      const countIdx = val - min;
      count[countIdx]--;
      const outputPos = count[countIdx];
      output[outputPos] = items[i];
      arrayAccesses += 2;

      if (i % 2 === 0 || i === 0) {
        const tempElements = new Array(n);
        for (let j = 0; j < n; j++) {
          if (output[j]) {
            tempElements[j] = { ...output[j] };
          } else {
            tempElements[j] = { id: `empty-${j}`, value: 0 };
          }
        }

        const states: Record<number, ElementState> = {};
        if (outputPos >= 0 && outputPos < n) {
          states[outputPos] = 'swapping';
        }

        snapshots.push({
          id: `cnt-${step++}`,
          step: snapshots.length,
          description: `Placing ${val} at position ${outputPos} in output array`,
          data: toElements(tempElements, states),
          currentLine: 4,
          variables: { 
            comparisons, 
            arrayAccesses, 
            phase: 'building-output',
            currentValue: val,
            position: outputPos,
          },
        });
      }
    }

    // Step 5: Show sorted result
    const sortedStates: Record<number, ElementState> = {};
    for (let i = 0; i < n; i++) {
      sortedStates[i] = 'sorted';
    }

    snapshots.push({
      id: `cnt-${step++}`,
      step: snapshots.length,
      description: 'Counting Sort complete! Array is now sorted.',
      data: toElements(output, sortedStates),
      currentLine: 5,
      variables: { 
        comparisons, 
        arrayAccesses, 
        phase: 'done',
        stable: true,
        inPlace: false,
      },
    });

    return snapshots;
  },
};
