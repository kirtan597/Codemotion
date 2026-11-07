/**
 * Bucket Sort - Non-comparison sorting algorithm
 * Distributes elements into buckets, sorts buckets, then concatenates
 * 
 * Time Complexity: O(n + k) average, O(n²) worst (when all in one bucket)
 * Space Complexity: O(n + k)
 * Stable: Yes (with stable bucket sort)
 * In-place: No
 */

import { AlgorithmDefinition, Snapshot, ArrayElement, ElementState } from '../../../types/algorithm';

function assignIds(arr: number[]): { id: string; value: number }[] {
  return arr.map((v, i) => ({ id: `bkt-${i}-${v}`, value: v }));
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

// Simple insertion sort for buckets
function insertionSortBucket(bucket: { id: string; value: number }[]): void {
  for (let i = 1; i < bucket.length; i++) {
    const key = bucket[i];
    let j = i - 1;
    while (j >= 0 && bucket[j].value > key.value) {
      bucket[j + 1] = bucket[j];
      j--;
    }
    bucket[j + 1] = key;
  }
}

// Pseudocode:
// 0: Find min and max to determine range
// 1: Create n buckets
// 2: for each element: place in appropriate bucket based on value
// 3: Sort each non-empty bucket (using insertion sort)
// 4: Concatenate all buckets in order
// 5: Array is now sorted

export const bucketSort: AlgorithmDefinition<number[], ArrayElement[]> = {
  id: 'bucket-sort',
  name: 'Bucket Sort',
  category: 'sorting',
  categoryName: 'Sorting',
  description:
    'Distribution sort that divides elements into buckets, sorts each bucket individually (often using insertion sort), then concatenates them. Works well with uniformly distributed data.',
  difficulty: 'Medium',
  timeComplexity: { best: 'O(n+k)', average: 'O(n+k)', worst: 'O(n²)' },
  spaceComplexity: 'O(n)',
  code: [
    'Find min and max to determine range',          // 0
    'Create n buckets',                             // 1
    'Distribute: for each element → bucket[⌊(value-min)/(max-min+1)*n⌋]', // 2
    'Sort each non-empty bucket (insertion sort)',  // 3
    'Concatenate all buckets in order',             // 4
    'Array is sorted',                              // 5
  ],
  defaultInput: [29, 25, 3, 49, 9, 37, 21, 43],
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
    let comparisons = 0;
    let arrayAccesses = 0;

    const items = assignIds(input);
    const n = items.length;

    // Initial state
    snapshots.push({
      id: `bkt-${step++}`,
      step: snapshots.length,
      description: 'Starting Bucket Sort. Will distribute elements into buckets.',
      data: toElements(items, {}),
      currentLine: 0,
      variables: { comparisons, arrayAccesses, phase: 'init' },
    });

    if (n === 0 || n === 1) {
      snapshots.push({
        id: `bkt-${step++}`,
        step: snapshots.length,
        description: n === 0 ? 'Array is empty.' : 'Single element - already sorted.',
        data: toElements(items, n === 1 ? { 0: 'sorted' } : {}),
        currentLine: 0,
        variables: { comparisons, arrayAccesses, phase: 'done' },
      });
      return snapshots;
    }

    // Find min and max
    let min = items[0].value;
    let max = items[0].value;
    for (const item of items) {
      arrayAccesses++;
      if (item.value < min) min = item.value;
      if (item.value > max) max = item.value;
    }

    snapshots.push({
      id: `bkt-${step++}`,
      step: snapshots.length,
      description: `Range: [${min}, ${max}]. Creating ${n} buckets.`,
      data: toElements(items, {}),
      currentLine: 0,
      variables: { comparisons, arrayAccesses, phase: 'find-range', min, max, bucketCount: n },
    });

    // Create buckets
    const bucketCount = Math.max(n, 5); // At least 5 buckets for better distribution
    const buckets: { id: string; value: number }[][] = Array.from({ length: bucketCount }, () => []);
    const range = max - min + 1;

    snapshots.push({
      id: `bkt-${step++}`,
      step: snapshots.length,
      description: `Created ${bucketCount} buckets. Now distributing elements...`,
      data: toElements(items, {}),
      currentLine: 1,
      variables: { comparisons, arrayAccesses, phase: 'create-buckets', bucketCount },
    });

    // Distribute elements into buckets
    for (let i = 0; i < n; i++) {
      const value = items[i].value;
      const bucketIndex = Math.min(
        Math.floor(((value - min) / range) * bucketCount),
        bucketCount - 1
      );
      buckets[bucketIndex].push(items[i]);
      arrayAccesses++;

      if (i % 2 === 0 || i === n - 1) {
        snapshots.push({
          id: `bkt-${step++}`,
          step: snapshots.length,
          description: `Element ${value} → bucket ${bucketIndex}`,
          data: toElements(items, { [i]: 'bucket' }),
          currentLine: 2,
          variables: { 
            comparisons, 
            arrayAccesses, 
            phase: 'distribute',
            currentValue: value,
            bucketIndex,
            bucketCount,
          },
        });
      }
    }

    // Show distribution
    const bucketSizes = buckets.map((b, idx) => b.length > 0 ? `${idx}:${b.length}` : null).filter(Boolean);
    snapshots.push({
      id: `bkt-${step++}`,
      step: snapshots.length,
      description: `Distribution complete. Non-empty buckets: [${bucketSizes.join(', ')}]`,
      data: toElements(items, {}),
      currentLine: 2,
      variables: { 
        comparisons, 
        arrayAccesses, 
        phase: 'distributed',
        bucketInfo: bucketSizes.join(', '),
        bucketCount,
      },
    });

    // Sort each bucket
    for (let bucketIdx = 0; bucketIdx < bucketCount; bucketIdx++) {
      if (buckets[bucketIdx].length > 1) {
        snapshots.push({
          id: `bkt-${step++}`,
          step: snapshots.length,
          description: `Sorting bucket ${bucketIdx} (${buckets[bucketIdx].length} elements) using insertion sort...`,
          data: toElements(items, {}),
          currentLine: 3,
          variables: { 
            comparisons, 
            arrayAccesses, 
            phase: 'sort-bucket',
            currentBucket: bucketIdx,
            bucketSize: buckets[bucketIdx].length,
          },
        });

        insertionSortBucket(buckets[bucketIdx]);
        comparisons += buckets[bucketIdx].length; // Approximate
      }
    }

    snapshots.push({
      id: `bkt-${step++}`,
      step: snapshots.length,
      description: 'All buckets sorted. Now concatenating in order...',
      data: toElements(items, {}),
      currentLine: 3,
      variables: { 
        comparisons, 
        arrayAccesses, 
        phase: 'buckets-sorted',
        bucketCount,
      },
    });

    // Concatenate buckets
    const sorted: { id: string; value: number }[] = [];
    for (const bucket of buckets) {
      for (const item of bucket) {
        sorted.push(item);
      }
    }

    // Final sorted state
    const sortedStates: Record<number, ElementState> = {};
    for (let i = 0; i < n; i++) {
      sortedStates[i] = 'sorted';
    }

    snapshots.push({
      id: `bkt-${step++}`,
      step: snapshots.length,
      description: 'Bucket Sort complete! Array is now sorted.',
      data: toElements(sorted, sortedStates),
      currentLine: 5,
      variables: { 
        comparisons, 
        arrayAccesses, 
        phase: 'done',
        bucketCount,
        stable: true,
        inPlace: false,
      },
    });

    return snapshots;
  },
};
