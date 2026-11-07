import { AlgorithmDefinition, Snapshot, ArrayElement, ElementState } from '../../types/algorithm';

function assignIds(arr: number[]): { id: string; value: number }[] {
  return arr.map((v, i) => ({ id: `hp-${i}-${v}`, value: v }));
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
// 0: BUILD-MAX-HEAP phase:
// 1:   for i from n/2-1 downto 0: heapify(arr, n, i)
// 2: heapify(arr, heapSize, i):
// 3:   largest = i; l = 2i+1; r = 2i+2
// 4:   if l < heapSize and arr[l] > arr[largest]: largest = l
// 5:   if r < heapSize and arr[r] > arr[largest]: largest = r
// 6:   if largest != i: swap(arr[i], arr[largest]); heapify(arr, n, largest)
// 7: EXTRACT phase:
// 8:   for i from n-1 downto 1:
// 9:     swap(arr[0], arr[i])
// 10:    heapify(arr, i, 0)

export const heapSort: AlgorithmDefinition<number[], ArrayElement[]> = {
  id: 'heap-sort',
  name: 'Heap Sort',
  category: 'sorting',
  categoryName: 'Sorting',
  description:
    'Uses a binary max-heap to repeatedly extract the maximum element. Consists of a Build-Heap phase followed by an Extract phase.',
  difficulty: 'Hard',
  timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
  spaceComplexity: 'O(1)',
  defaultInput: [12, 11, 13, 5, 6, 7, 25, 3, 18, 9],
  inputConfig: {
    type: 'array',
    minSize: 2,
    maxSize: 60,
    defaultSize: 15,
    supportsCustomInput: true,
  },
  code: [
    '── BUILD-MAX-HEAP ──',                                  // 0
    'for i from n/2-1 downto 0: heapify(arr, n, i)',        // 1
    'heapify(arr, heapSize, i):',                            // 2
    '  largest = i; l = 2i+1; r = 2i+2',                   // 3
    '  if l < n and arr[l] > arr[largest]: largest = l',    // 4
    '  if r < n and arr[r] > arr[largest]: largest = r',    // 5
    '  if largest != i:',                                    // 6
    '    swap(arr[i], arr[largest])',                        // 6
    '    heapify(arr, heapSize, largest)',                   // 6
    '── EXTRACT PHASE ──',                                   // 7  (display only)
    'for i from n-1 downto 1:',                             // 8
    '  swap(arr[0], arr[i])',                                // 9
    '  heapify(arr, i, 0)',                                  // 10
  ],

  generate(input: number[]): Snapshot<ArrayElement[]>[] {
    const items = assignIds([...input]);
    const n = items.length;
    const snapshots: Snapshot<ArrayElement[]>[] = [];
    const sorted = new Set<number>();
    let stepCount = 0;
    let comparisons = 0;
    let swaps = 0;
    // Track logical heap size for visualization
    let heapSize = n;

    const push = (
      desc: string,
      line: number,
      comparing: number[] = [],
      swapping: number[] = [],
      active: number[] = [],   // heap boundary highlight
      vars: Record<string, string | number | boolean | null> = {}
    ) => {
      const states: Record<number, ElementState> = {};
      sorted.forEach((idx) => { states[idx] = 'sorted'; });
      // Items inside heap are 'active' (light blue)
      for (let k = 0; k < heapSize; k++) {
        if (!states[k]) states[k] = 'active';
      }
      active.forEach((idx) => { if (!states[idx] || states[idx] === 'active') states[idx] = 'active'; });
      comparing.forEach((idx) => { states[idx] = 'comparing'; });
      swapping.forEach((idx) => { states[idx] = 'swapping'; });

      snapshots.push({
        id: `heap-${stepCount++}`,
        step: snapshots.length,
        description: desc,
        data: toElements(items, states),
        highlightIndices: [...comparing, ...swapping, ...active],
        comparingIndices: comparing,
        swapIndices: swapping,
        sortedIndices: Array.from(sorted),
        currentLine: line,
        variables: { comparisons, swaps, heapSize, ...vars },
      });
    };

    push('Initial array loaded. Starting Heap Sort — Build-Max-Heap phase.', 0, [], [], [], { n });

    // Guard: nothing to sort for empty or single-element arrays
    if (n === 0) {
      push('Array is empty — nothing to sort.', 0, [], [], [], { complete: true });
      return snapshots;
    }
    if (n === 1) {
      sorted.add(0);
      heapSize = 1;
      push('Single element — already sorted.', 0, [], [], [], { complete: true });
      return snapshots;
    }

    function heapify(sz: number, i: number) {
      let largest = i;
      const l = 2 * i + 1;
      const r = 2 * i + 2;

      push(
        `heapify(i=${i}): largest=${largest}, left=${l < sz ? l : 'none'}, right=${r < sz ? r : 'none'}.`,
        3,
        [],
        [],
        [],
        { i, largest, l, r, heapSize: sz }
      );

      if (l < sz) {
        comparisons++;
        push(
          `Comparing arr[${l}]=${items[l].value} vs arr[${largest}]=${items[largest].value}.`,
          4,
          [l, largest],
          [],
          [],
          { l, largest }
        );
        if (items[l].value > items[largest].value) {
          largest = l;
          push(`Left child is larger. largest = ${largest}.`, 4, [], [], [], { largest });
        }
      }

      if (r < sz) {
        comparisons++;
        push(
          `Comparing arr[${r}]=${items[r].value} vs arr[${largest}]=${items[largest].value}.`,
          5,
          [r, largest],
          [],
          [],
          { r, largest }
        );
        if (items[r].value > items[largest].value) {
          largest = r;
          push(`Right child is larger. largest = ${largest}.`, 5, [], [], [], { largest });
        }
      }

      if (largest !== i) {
        push(
          `largest (${largest}) ≠ i (${i}). Swapping arr[${i}]=${items[i].value} ↔ arr[${largest}]=${items[largest].value}.`,
          6,
          [],
          [i, largest],
          [],
          { i, largest }
        );
        [items[i], items[largest]] = [items[largest], items[i]];
        swaps++;
        push(
          `Swapped. Recursing heapify(${largest}).`,
          6,
          [],
          [i, largest],
          [],
          { i, largest }
        );
        heapify(sz, largest);
      } else {
        push(`Heap property satisfied at i=${i}. No swap needed.`, 6, [], [], [], { i });
      }
    }

    // ── BUILD-MAX-HEAP ──
    push('Build-Max-Heap: iterating from index n/2-1 downto 0.', 1, [], [], [], {
      startIdx: Math.floor(n / 2) - 1,
    });
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      push(`Build-Max-Heap: heapify at index ${i}.`, 1, [], [], [i], { i });
      heapify(n, i);
    }

    push('Max-Heap built! Largest element is at root (index 0). Starting Extract phase.', 7, [], [], [], {
      rootVal: items[0].value,
    });

    // ── EXTRACT PHASE ──
    heapSize = n;
    for (let i = n - 1; i > 0; i--) {
      push(
        `Extract max: swap arr[0]=${items[0].value} ↔ arr[${i}]=${items[i].value}.`,
        9,
        [],
        [0, i],
        [],
        { extractedVal: items[0].value, extractIdx: i }
      );
      [items[0], items[i]] = [items[i], items[0]];
      swaps++;
      heapSize--;
      sorted.add(i);

      push(
        `${items[i].value} placed at sorted position ${i}. Heap size now ${heapSize}.`,
        9,
        [],
        [0, i],
        [],
        { heapSize }
      );

      push(`Re-heapify with heap size = ${heapSize}.`, 10, [], [], [], { heapSize });
      heapify(heapSize, 0);
    }

    sorted.add(0);
    for (let k = 0; k < n; k++) sorted.add(k);
    push('Heap Sort complete! All elements are in sorted order.', 10, [], [], [], { complete: true });
    return snapshots;
  },
};
