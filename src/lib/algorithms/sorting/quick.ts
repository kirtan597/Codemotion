import { AlgorithmDefinition, Snapshot, ArrayElement, ElementState } from '../../types/algorithm';

function assignIds(arr: number[]): { id: string; value: number }[] {
  return arr.map((v, i) => ({ id: `qk-${i}-${v}`, value: v }));
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

// Lomuto partition scheme
// Pseudocode (0-indexed):
// 0: quickSort(arr, low, high):
// 1:   if low < high:
// 2:     p = partition(arr, low, high)
// 3:     quickSort(arr, low, p-1)
// 4:     quickSort(arr, p+1, high)
// 5: partition(arr, low, high):
// 6:   pivot = arr[high]
// 7:   i = low - 1
// 8:   for j = low to high-1:
// 9:     if arr[j] < pivot: i++; swap(arr[i], arr[j])
// 10:  swap(arr[i+1], arr[high])
// 11:  return i+1

export const quickSort: AlgorithmDefinition<number[], ArrayElement[]> = {
  id: 'quick-sort',
  name: 'Quick Sort',
  category: 'sorting',
  categoryName: 'Sorting',
  description:
    'Divide-and-conquer algorithm using Lomuto partition scheme. Selects a pivot (last element) and partitions the array around it.',
  difficulty: 'Medium',
  timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)' },
  spaceComplexity: 'O(log n)',
  defaultInput: [38, 27, 43, 3, 9, 82, 10, 19, 50, 14],
  inputConfig: {
    type: 'array',
    minSize: 2,
    maxSize: 60,
    defaultSize: 15,
    supportsCustomInput: true,
  },
  code: [
    'quickSort(arr, low, high):',        // 0
    '  if low < high:',                   // 1
    '    p = partition(arr, low, high)',  // 2
    '    quickSort(arr, low, p - 1)',     // 3
    '    quickSort(arr, p + 1, high)',    // 4
    'partition(arr, low, high):',         // 5
    '  pivot = arr[high]',                // 6
    '  i = low - 1',                      // 7
    '  for j = low to high - 1:',         // 8
    '    if arr[j] < pivot:',             // 9
    '      i++; swap(arr[i], arr[j])',    // 9  (same visual line)
    '  swap(arr[i+1], arr[high])',        // 10
    '  return i + 1',                     // 11
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
      pivots: number[] = [],
      partitionRange: [number, number] | null = null,
      vars: Record<string, string | number | boolean | null> = {}
    ) => {
      const states: Record<number, ElementState> = {};
      sorted.forEach((idx) => { states[idx] = 'sorted'; });
      if (partitionRange) {
        for (let k = partitionRange[0]; k <= partitionRange[1]; k++) {
          if (!states[k]) states[k] = 'active';
        }
      }
      pivots.forEach((idx) => { states[idx] = 'pivot'; });
      comparing.forEach((idx) => { states[idx] = 'comparing'; });
      swapping.forEach((idx) => { states[idx] = 'swapping'; });

      snapshots.push({
        id: `quick-${stepCount++}`,
        step: snapshots.length,
        description: desc,
        data: toElements(items, states),
        highlightIndices: [...comparing, ...swapping, ...pivots],
        comparingIndices: comparing,
        swapIndices: swapping,
        sortedIndices: Array.from(sorted),
        currentLine: line,
        variables: {
          comparisons,
          swaps,
          pivot: pivots[0] != null ? items[pivots[0]]?.value ?? null : null,
          partitionLow: partitionRange?.[0] ?? null,
          partitionHigh: partitionRange?.[1] ?? null,
          ...vars,
        },
      });
    };

    push('Initial array loaded. Ready for Quick Sort (Lomuto).', 0, [], [], [], null, { n });

    function partition(low: number, high: number): number {
      const pivotVal = items[high].value;
      push(
        `Pivot = arr[${high}] = ${pivotVal}. Partitioning range [${low}, ${high}].`,
        6,
        [],
        [],
        [high],
        [low, high],
        { low, high, pivot: pivotVal, i: low - 1 }
      );

      let i = low - 1;

      for (let j = low; j < high; j++) {
        comparisons++;
        push(
          `Comparing arr[${j}] (${items[j].value}) with pivot (${pivotVal}).`,
          9,
          [j, high],
          [],
          [high],
          [low, high],
          { j, 'arr[j]': items[j].value, pivot: pivotVal, i }
        );

        if (items[j].value < pivotVal) {
          i++;
          if (i !== j) {
            push(
              `arr[${j}] < pivot — swapping arr[${i}] (${items[i].value}) ↔ arr[${j}] (${items[j].value}).`,
              9,
              [],
              [i, j],
              [high],
              [low, high],
              { i, j }
            );
            [items[i], items[j]] = [items[j], items[i]];
            swaps++;
            push(
              `Swapped. i now = ${i}.`,
              9,
              [],
              [i, j],
              [high],
              [low, high],
              { i, j }
            );
          } else {
            push(
              `arr[${j}] < pivot but i = j (${i}) — no swap needed.`,
              9,
              [],
              [],
              [high],
              [low, high],
              { i, j }
            );
          }
        }
      }

      // Place pivot in correct position
      const pivotPos = i + 1;
      push(
        `Placing pivot: swap arr[${pivotPos}] (${items[pivotPos].value}) ↔ arr[${high}] (${items[high].value}).`,
        10,
        [],
        [pivotPos, high],
        [high],
        [low, high],
        { pivotPos }
      );
      [items[pivotPos], items[high]] = [items[high], items[pivotPos]];
      swaps++;
      sorted.add(pivotPos);

      push(
        `Pivot ${pivotVal} is now fixed at index ${pivotPos}. Partition boundary established.`,
        11,
        [],
        [],
        [pivotPos],
        [low, high],
        { pivotPos }
      );

      return pivotPos;
    }

    function qs(low: number, high: number) {
      if (low < high) {
        push(
          `quickSort([${low}..${high}]). Partitioning.`,
          1,
          [],
          [],
          [],
          [low, high],
          { low, high }
        );
        const p = partition(low, high);
        qs(low, p - 1);
        qs(p + 1, high);
      } else if (low === high) {
        sorted.add(low);
        push(`Single element at index ${low} — already sorted.`, 1, [], [], [], null, { idx: low });
      }
    }

    qs(0, n - 1);

    for (let k = 0; k < n; k++) sorted.add(k);
    push('Quick Sort complete! Array is fully sorted.', 0, [], [], [], null, { complete: true });
    return snapshots;
  },
};

