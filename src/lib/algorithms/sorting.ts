import { AlgorithmDefinition, Snapshot, ArrayElement, ElementState } from '../types/algorithm';

function toElements(arr: number[], states: Record<number, ElementState> = {}): ArrayElement[] {
  return arr.map((value, idx) => ({
    id: `el-${idx}-${value}`,
    value,
    state: states[idx] || 'default',
  }));
}

// -------------------------------------------------------------
// Bubble Sort
// -------------------------------------------------------------
export const bubbleSort: AlgorithmDefinition<number[], ArrayElement[]> = {
  id: 'bubble-sort',
  name: 'Bubble Sort',
  category: 'sorting',
  categoryName: 'Sorting',
  description: 'Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.',
  difficulty: 'Easy',
  timeComplexity: {
    best: 'O(n)',
    average: 'O(n²)',
    worst: 'O(n²)',
  },
  spaceComplexity: 'O(1)',
  defaultInput: [34, 12, 56, 8, 45, 23, 78, 19, 62, 5],
  inputConfig: {
    type: 'array',
    minSize: 5,
    maxSize: 60,
    defaultSize: 15,
    supportsCustomInput: true,
  },
  code: [
    'for i from 0 to n - 1:',
    '  swapped = false',
    '  for j from 0 to n - i - 2:',
    '    if arr[j] > arr[j + 1]:',
    '      swap(arr[j], arr[j + 1])',
    '      swapped = true',
    '  if not swapped: break',
  ],
  generate: (input: number[]): Snapshot<ArrayElement[]>[] => {
    const arr = [...input];
    const n = arr.length;
    const snapshots: Snapshot<ArrayElement[]>[] = [];
    const sorted = new Set<number>();
    let stepCount = 0;

    const pushSnapshot = (
      desc: string,
      comparing: number[] = [],
      swapping: number[] = [],
      active: number[] = [],
      line: number = 0,
      vars: Record<string, any> = {}
    ) => {
      const states: Record<number, ElementState> = {};
      sorted.forEach((idx) => {
        states[idx] = 'sorted';
      });
      active.forEach((idx) => {
        states[idx] = 'active';
      });
      comparing.forEach((idx) => {
        states[idx] = 'comparing';
      });
      swapping.forEach((idx) => {
        states[idx] = 'swapping';
      });

      snapshots.push({
        id: `bubble-${stepCount++}`,
        step: snapshots.length,
        description: desc,
        data: toElements(arr, states),
        comparingIndices: comparing,
        swapIndices: swapping,
        sortedIndices: Array.from(sorted),
        highlightIndices: [...comparing, ...swapping, ...active],
        currentLine: line,
        variables: vars,
      });
    };

    pushSnapshot('Initial array loaded. Ready to begin Bubble Sort.', [], [], [], 0, { n });

    for (let i = 0; i < n; i++) {
      let swapped = false;
      pushSnapshot(`Pass ${i + 1} starting. Elements from index 0 to ${n - i - 1}.`, [], [], [], 1, { i, swapped });

      for (let j = 0; j < n - i - 1; j++) {
        pushSnapshot(
          `Comparing arr[${j}] (${arr[j]}) and arr[${j + 1}] (${arr[j + 1]}).`,
          [j, j + 1],
          [],
          [],
          3,
          { i, j, 'arr[j]': arr[j], 'arr[j+1]': arr[j + 1] }
        );

        if (arr[j] > arr[j + 1]) {
          pushSnapshot(
            `${arr[j]} > ${arr[j + 1]}, swapping arr[${j}] and arr[${j + 1}].`,
            [],
            [j, j + 1],
            [],
            4,
            { i, j, 'arr[j]': arr[j], 'arr[j+1]': arr[j + 1] }
          );
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          swapped = true;

          pushSnapshot(
            `Swapped ${arr[j]} and ${arr[j + 1]}.`,
            [],
            [j, j + 1],
            [],
            5,
            { i, j, swapped: true }
          );
        }
      }

      sorted.add(n - i - 1);
      pushSnapshot(
        `Element at index ${n - i - 1} (${arr[n - i - 1]}) is now sorted in its final position.`,
        [],
        [],
        [],
        6,
        { i, 'sortedIndex': n - i - 1 }
      );

      if (!swapped) {
        for (let k = 0; k < n; k++) sorted.add(k);
        pushSnapshot('No swaps occurred during this pass! Array is already fully sorted.', [], [], [], 6, { fullySorted: true });
        break;
      }
    }

    for (let k = 0; k < n; k++) sorted.add(k);
    pushSnapshot('Bubble Sort complete! All elements sorted.', [], [], [], 6, { complete: true });

    return snapshots;
  },
};

// -------------------------------------------------------------
// Quick Sort
// -------------------------------------------------------------
export const quickSort: AlgorithmDefinition<number[], ArrayElement[]> = {
  id: 'quick-sort',
  name: 'Quick Sort',
  category: 'sorting',
  categoryName: 'Sorting',
  description: 'Divide-and-conquer algorithm that selects a "pivot" element and partitions other elements into two sub-arrays.',
  difficulty: 'Medium',
  timeComplexity: {
    best: 'O(n log n)',
    average: 'O(n log n)',
    worst: 'O(n²)',
  },
  spaceComplexity: 'O(log n)',
  defaultInput: [38, 27, 43, 3, 9, 82, 10, 19, 50, 14],
  inputConfig: {
    type: 'array',
    minSize: 5,
    maxSize: 60,
    defaultSize: 15,
    supportsCustomInput: true,
  },
  code: [
    'quickSort(arr, low, high):',
    '  if low < high:',
    '    pivotIndex = partition(arr, low, high)',
    '    quickSort(arr, low, pivotIndex - 1)',
    '    quickSort(arr, pivotIndex + 1, high)',
    'partition(arr, low, high):',
    '  pivot = arr[high], i = low - 1',
    '  for j = low to high - 1:',
    '    if arr[j] < pivot: i++; swap(arr[i], arr[j])',
    '  swap(arr[i + 1], arr[high])',
  ],
  generate: (input: number[]): Snapshot<ArrayElement[]>[] => {
    const arr = [...input];
    const n = arr.length;
    const snapshots: Snapshot<ArrayElement[]>[] = [];
    const sorted = new Set<number>();
    let stepCount = 0;

    const pushSnapshot = (
      desc: string,
      comparing: number[] = [],
      swapping: number[] = [],
      pivots: number[] = [],
      activeRange: [number, number] | null = null,
      line: number = 0,
      vars: Record<string, any> = {}
    ) => {
      const states: Record<number, ElementState> = {};
      sorted.forEach((idx) => {
        states[idx] = 'sorted';
      });
      if (activeRange) {
        for (let k = activeRange[0]; k <= activeRange[1]; k++) {
          if (!states[k]) states[k] = 'active';
        }
      }
      pivots.forEach((idx) => {
        states[idx] = 'pivot';
      });
      comparing.forEach((idx) => {
        states[idx] = 'comparing';
      });
      swapping.forEach((idx) => {
        states[idx] = 'swapping';
      });

      snapshots.push({
        id: `quick-${stepCount++}`,
        step: snapshots.length,
        description: desc,
        data: toElements(arr, states),
        comparingIndices: comparing,
        swapIndices: swapping,
        sortedIndices: Array.from(sorted),
        highlightIndices: [...comparing, ...swapping, ...pivots],
        currentLine: line,
        variables: vars,
      });
    };

    pushSnapshot('Initial array loaded. Ready to execute Quick Sort.', [], [], [], null, 0, { n });

    function partition(low: number, high: number): number {
      const pivot = arr[high];
      pushSnapshot(`Choosing pivot arr[${high}] = ${pivot}. Partitioning range [${low}, ${high}].`, [], [], [high], [low, high], 6, {
        low,
        high,
        pivot,
      });

      let i = low - 1;
      for (let j = low; j < high; j++) {
        pushSnapshot(
          `Comparing arr[${j}] (${arr[j]}) with pivot (${pivot}).`,
          [j, high],
          [],
          [high],
          [low, high],
          8,
          { j, 'arr[j]': arr[j], pivot, i }
        );

        if (arr[j] < pivot) {
          i++;
          if (i !== j) {
            pushSnapshot(
              `arr[${j}] < ${pivot}. Swapping arr[${i}] (${arr[i]}) with arr[${j}] (${arr[j]}).`,
              [],
              [i, j],
              [high],
              [low, high],
              8,
              { i, j }
            );
            [arr[i], arr[j]] = [arr[j], arr[i]];
            pushSnapshot(`Swapped arr[${i}] and arr[${j}].`, [], [i, j], [high], [low, high], 8, { i, j });
          }
        }
      }

      pushSnapshot(
        `Placing pivot into correct partition position: swap arr[${i + 1}] (${arr[i + 1]}) with arr[${high}] (${arr[high]}).`,
        [],
        [i + 1, high],
        [high],
        [low, high],
        9,
        { pivotPos: i + 1 }
      );
      [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
      sorted.add(i + 1);

      pushSnapshot(
        `Pivot ${pivot} is now fixed at index ${i + 1}.`,
        [],
        [],
        [],
        [low, high],
        9,
        { pivotIndex: i + 1 }
      );

      return i + 1;
    }

    function qs(low: number, high: number) {
      if (low < high) {
        const p = partition(low, high);
        qs(low, p - 1);
        qs(p + 1, high);
      } else if (low === high) {
        sorted.add(low);
      }
    }

    qs(0, n - 1);

    for (let k = 0; k < n; k++) sorted.add(k);
    pushSnapshot('Quick Sort complete! Array is sorted.', [], [], [], null, 0, { complete: true });

    return snapshots;
  },
};

// -------------------------------------------------------------
// Insertion Sort
// -------------------------------------------------------------
export const insertionSort: AlgorithmDefinition<number[], ArrayElement[]> = {
  id: 'insertion-sort',
  name: 'Insertion Sort',
  category: 'sorting',
  categoryName: 'Sorting',
  description: 'Builds the sorted array one item at a time by repeatedly picking the next element and inserting it into its correct position.',
  difficulty: 'Easy',
  timeComplexity: {
    best: 'O(n)',
    average: 'O(n²)',
    worst: 'O(n²)',
  },
  spaceComplexity: 'O(1)',
  defaultInput: [29, 10, 14, 37, 13, 45, 20, 8, 33, 17],
  inputConfig: {
    type: 'array',
    minSize: 5,
    maxSize: 60,
    defaultSize: 15,
    supportsCustomInput: true,
  },
  code: [
    'for i from 1 to n - 1:',
    '  key = arr[i]',
    '  j = i - 1',
    '  while j >= 0 and arr[j] > key:',
    '    arr[j + 1] = arr[j]',
    '    j = j - 1',
    '  arr[j + 1] = key',
  ],
  generate: (input: number[]): Snapshot<ArrayElement[]>[] => {
    const arr = [...input];
    const n = arr.length;
    const snapshots: Snapshot<ArrayElement[]>[] = [];
    const sorted = new Set<number>([0]);
    let stepCount = 0;

    const pushSnapshot = (
      desc: string,
      comparing: number[] = [],
      swapping: number[] = [],
      active: number[] = [],
      line: number = 0,
      vars: Record<string, any> = {}
    ) => {
      const states: Record<number, ElementState> = {};
      sorted.forEach((idx) => {
        states[idx] = 'sorted';
      });
      active.forEach((idx) => {
        states[idx] = 'active';
      });
      comparing.forEach((idx) => {
        states[idx] = 'comparing';
      });
      swapping.forEach((idx) => {
        states[idx] = 'swapping';
      });

      snapshots.push({
        id: `insert-${stepCount++}`,
        step: snapshots.length,
        description: desc,
        data: toElements(arr, states),
        comparingIndices: comparing,
        swapIndices: swapping,
        sortedIndices: Array.from(sorted),
        highlightIndices: [...comparing, ...swapping, ...active],
        currentLine: line,
        variables: vars,
      });
    };

    pushSnapshot('Initial array loaded. Index 0 is considered trivially sorted.', [], [], [0], 0, { n });

    for (let i = 1; i < n; i++) {
      const key = arr[i];
      let j = i - 1;

      pushSnapshot(`Selected key = ${key} at index ${i} to insert into sorted prefix [0..${i - 1}].`, [], [], [i], 1, {
        i,
        key,
      });

      while (j >= 0 && arr[j] > key) {
        pushSnapshot(
          `arr[${j}] (${arr[j]}) > key (${key}). Shifting arr[${j}] right to index ${j + 1}.`,
          [j, j + 1],
          [],
          [i],
          4,
          { j, 'arr[j]': arr[j], key }
        );
        arr[j + 1] = arr[j];
        j--;

        pushSnapshot(`Shifted element right. Checking previous position.`, [], [j + 1], [i], 5, { j });
      }

      arr[j + 1] = key;
      for (let k = 0; k <= i; k++) sorted.add(k);

      pushSnapshot(`Inserted key (${key}) at position ${j + 1}.`, [], [], [j + 1], 6, {
        insertedAt: j + 1,
        key,
      });
    }

    pushSnapshot('Insertion Sort complete! All items in place.', [], [], [], 0, { complete: true });
    return snapshots;
  },
};

// -------------------------------------------------------------
// Selection Sort
// -------------------------------------------------------------
export const selectionSort: AlgorithmDefinition<number[], ArrayElement[]> = {
  id: 'selection-sort',
  name: 'Selection Sort',
  category: 'sorting',
  categoryName: 'Sorting',
  description: 'Repeatedly finds the minimum element from the unsorted sub-array and places it at the beginning.',
  difficulty: 'Easy',
  timeComplexity: {
    best: 'O(n²)',
    average: 'O(n²)',
    worst: 'O(n²)',
  },
  spaceComplexity: 'O(1)',
  defaultInput: [64, 25, 12, 22, 11, 40, 5, 33, 19, 50],
  inputConfig: {
    type: 'array',
    minSize: 5,
    maxSize: 60,
    defaultSize: 15,
    supportsCustomInput: true,
  },
  code: [
    'for i from 0 to n - 1:',
    '  minIdx = i',
    '  for j from i + 1 to n - 1:',
    '    if arr[j] < arr[minIdx]: minIdx = j',
    '  if minIdx != i:',
    '    swap(arr[i], arr[minIdx])',
  ],
  generate: (input: number[]): Snapshot<ArrayElement[]>[] => {
    const arr = [...input];
    const n = arr.length;
    const snapshots: Snapshot<ArrayElement[]>[] = [];
    const sorted = new Set<number>();
    let stepCount = 0;

    const pushSnapshot = (
      desc: string,
      comparing: number[] = [],
      swapping: number[] = [],
      minIdx: number | null = null,
      line: number = 0,
      vars: Record<string, any> = {}
    ) => {
      const states: Record<number, ElementState> = {};
      sorted.forEach((idx) => {
        states[idx] = 'sorted';
      });
      if (minIdx !== null && minIdx >= 0) {
        states[minIdx] = 'pivot';
      }
      comparing.forEach((idx) => {
        states[idx] = 'comparing';
      });
      swapping.forEach((idx) => {
        states[idx] = 'swapping';
      });

      snapshots.push({
        id: `sel-${stepCount++}`,
        step: snapshots.length,
        description: desc,
        data: toElements(arr, states),
        comparingIndices: comparing,
        swapIndices: swapping,
        sortedIndices: Array.from(sorted),
        highlightIndices: [...comparing, ...swapping, ...(minIdx !== null ? [minIdx] : [])],
        currentLine: line,
        variables: vars,
      });
    };

    pushSnapshot('Initial array loaded. Selection Sort starting.', [], [], null, 0, { n });

    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;
      pushSnapshot(`Assuming index ${i} (${arr[i]}) is current minimum for pass ${i + 1}.`, [], [], minIdx, 1, {
        i,
        minIdx,
      });

      for (let j = i + 1; j < n; j++) {
        pushSnapshot(
          `Comparing arr[${j}] (${arr[j]}) with current min arr[${minIdx}] (${arr[minIdx]}).`,
          [j, minIdx],
          [],
          minIdx,
          3,
          { j, minIdx, 'arr[j]': arr[j], 'arr[min]': arr[minIdx] }
        );

        if (arr[j] < arr[minIdx]) {
          minIdx = j;
          pushSnapshot(
            `New minimum found: arr[${minIdx}] = ${arr[minIdx]}.`,
            [],
            [],
            minIdx,
            3,
            { newMinIdx: minIdx, minVal: arr[minIdx] }
          );
        }
      }

      if (minIdx !== i) {
        pushSnapshot(
          `Swapping arr[${i}] (${arr[i]}) with minimum arr[${minIdx}] (${arr[minIdx]}).`,
          [],
          [i, minIdx],
          minIdx,
          5,
          { i, minIdx }
        );
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
      }

      sorted.add(i);
      pushSnapshot(`Position ${i} is now sorted.`, [], [], null, 0, { sortedIndex: i });
    }

    for (let k = 0; k < n; k++) sorted.add(k);
    pushSnapshot('Selection Sort complete! Array is sorted.', [], [], null, 0, { complete: true });
    return snapshots;
  },
};
