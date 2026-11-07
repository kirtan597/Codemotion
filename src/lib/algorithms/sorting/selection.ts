import { AlgorithmDefinition, Snapshot, ArrayElement, ElementState } from '../../types/algorithm';

function assignIds(arr: number[]): { id: string; value: number }[] {
  return arr.map((v, i) => ({ id: `sel-${i}-${v}`, value: v }));
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

// Pseudocode (0-indexed):
// 0: for i from 0 to n-1:
// 1:   minIdx = i
// 2:   for j from i+1 to n-1:
// 3:     if arr[j] < arr[minIdx]: minIdx = j
// 4:   if minIdx != i:
// 5:     swap(arr[i], arr[minIdx])

export const selectionSort: AlgorithmDefinition<number[], ArrayElement[]> = {
  id: 'selection-sort',
  name: 'Selection Sort',
  category: 'sorting',
  categoryName: 'Sorting',
  description:
    'Repeatedly finds the minimum element from the unsorted sub-array and places it at the beginning.',
  difficulty: 'Easy',
  timeComplexity: { best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)' },
  spaceComplexity: 'O(1)',
  defaultInput: [64, 25, 12, 22, 11, 40, 5, 33, 19, 50],
  inputConfig: {
    type: 'array',
    minSize: 2,
    maxSize: 60,
    defaultSize: 15,
    supportsCustomInput: true,
  },
  code: [
    'for i from 0 to n - 1:',           // 0
    '  minIdx = i',                       // 1
    '  for j from i + 1 to n - 1:',      // 2
    '    if arr[j] < arr[minIdx]:',       // 3
    '      minIdx = j',                   // 4 (reuse line 3 for discovery)
    '  if minIdx != i:',                  // 4
    '    swap(arr[i], arr[minIdx])',       // 5
  ],

  generate(input: number[]): Snapshot<ArrayElement[]>[] {
    const items = assignIds([...input]);
    const n = items.length;
    const snapshots: Snapshot<ArrayElement[]>[] = [];
    const sorted = new Set<number>();
    let stepCount = 0;
    let comparisons = 0;
    let swaps = 0;

    const push = (
      desc: string,
      line: number,
      comparing: number[] = [],
      swapping: number[] = [],
      minIdx: number | null = null,
      vars: Record<string, string | number | boolean | null> = {}
    ) => {
      const states: Record<number, ElementState> = {};
      sorted.forEach((idx) => { states[idx] = 'sorted'; });
      if (minIdx !== null) states[minIdx] = 'pivot';   // cyan = current minimum
      comparing.forEach((idx) => { states[idx] = 'comparing'; });
      swapping.forEach((idx) => { states[idx] = 'swapping'; });

      snapshots.push({
        id: `sel-${stepCount++}`,
        step: snapshots.length,
        description: desc,
        data: toElements(items, states),
        highlightIndices: [...comparing, ...swapping, ...(minIdx !== null ? [minIdx] : [])],
        comparingIndices: comparing,
        swapIndices: swapping,
        sortedIndices: Array.from(sorted),
        currentLine: line,
        variables: { comparisons, swaps, ...vars },
      });
    };

    push('Initial array loaded. Selection Sort starting.', 0, [], [], null, { n });

    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;
      push(
        `Pass ${i + 1}: assuming index ${i} (${items[i].value}) is minimum.`,
        1,
        [],
        [],
        minIdx,
        { i, minIdx }
      );

      for (let j = i + 1; j < n; j++) {
        comparisons++;
        push(
          `Comparing arr[${j}] (${items[j].value}) vs current min arr[${minIdx}] (${items[minIdx].value}).`,
          3,
          [j],
          [],
          minIdx,
          { i, j, minIdx, 'arr[j]': items[j].value, 'arr[min]': items[minIdx].value }
        );

        if (items[j].value < items[minIdx].value) {
          minIdx = j;
          push(
            `New minimum found at index ${minIdx} (${items[minIdx].value}).`,
            3,
            [],
            [],
            minIdx,
            { newMinIdx: minIdx, minVal: items[minIdx].value }
          );
        }
      }

      if (minIdx !== i) {
        push(
          `Swapping arr[${i}] (${items[i].value}) ↔ arr[${minIdx}] (${items[minIdx].value}).`,
          5,
          [],
          [i, minIdx],
          minIdx,
          { i, minIdx }
        );
        [items[i], items[minIdx]] = [items[minIdx], items[i]];
        swaps++;
        push(
          `Swapped. arr[${i}] is now ${items[i].value}.`,
          5,
          [],
          [i, minIdx],
          null,
          { i, minIdx }
        );
      }

      sorted.add(i);
      push(`Index ${i} (${items[i].value}) is now in its final position.`, 4, [], [], null, { sortedIndex: i });
    }

    for (let k = 0; k < n; k++) sorted.add(k);
    push('Selection Sort complete! Array is sorted.', 5, [], [], null, { complete: true });
    return snapshots;
  },
};

