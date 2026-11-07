import { AlgorithmDefinition, Snapshot, ArrayElement, ElementState } from '../../types/algorithm';

// ─── Stable ID helper ────────────────────────────────────────────────────────
// IDs are assigned once at generate-time and travel with each element so that
// framer-motion can animate the position change (not a value change).
function assignIds(arr: number[]): { id: string; value: number }[] {
  return arr.map((v, i) => ({ id: `bbl-${i}-${v}`, value: v }));
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

// Pseudocode lines (0-indexed):
// 0: for i from 0 to n-1:
// 1:   swapped = false
// 2:   for j from 0 to n-i-2:
// 3:     if arr[j] > arr[j+1]:
// 4:       swap(arr[j], arr[j+1])
// 5:       swapped = true
// 6:   if not swapped: break  ← also used for "element settled"

export const bubbleSort: AlgorithmDefinition<number[], ArrayElement[]> = {
  id: 'bubble-sort',
  name: 'Bubble Sort',
  category: 'sorting',
  categoryName: 'Sorting',
  description:
    'Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.',
  difficulty: 'Easy',
  timeComplexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
  spaceComplexity: 'O(1)',
  defaultInput: [34, 12, 56, 8, 45, 23, 78, 19, 62, 5],
  inputConfig: {
    type: 'array',
    minSize: 2,
    maxSize: 60,
    defaultSize: 15,
    supportsCustomInput: true,
  },
  code: [
    'for i from 0 to n - 1:',        // 0
    '  swapped = false',               // 1
    '  for j from 0 to n - i - 2:',   // 2
    '    if arr[j] > arr[j + 1]:',     // 3
    '      swap(arr[j], arr[j + 1])',  // 4
    '      swapped = true',            // 5
    '  if not swapped: break',         // 6
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
      active: number[] = [],
      vars: Record<string, string | number | boolean | null> = {}
    ) => {
      const states: Record<number, ElementState> = {};
      sorted.forEach((idx) => { states[idx] = 'sorted'; });
      active.forEach((idx) => { states[idx] = 'active'; });
      comparing.forEach((idx) => { states[idx] = 'comparing'; });
      swapping.forEach((idx) => { states[idx] = 'swapping'; });

      snapshots.push({
        id: `bubble-${stepCount++}`,
        step: snapshots.length,
        description: desc,
        data: toElements(items, states),
        highlightIndices: [...comparing, ...swapping, ...active],
        comparingIndices: comparing,
        swapIndices: swapping,
        sortedIndices: Array.from(sorted),
        currentLine: line,
        variables: { comparisons, swaps, ...vars },
      });
    };

    push('Initial array loaded. Ready to begin Bubble Sort.', 0, [], [], [], { n });

    for (let i = 0; i < n; i++) {
      let swapped = false;
      push(`Pass ${i + 1}: scanning indices 0 → ${n - i - 1}.`, 1, [], [], [], { i, swapped });

      for (let j = 0; j < n - i - 1; j++) {
        comparisons++;
        push(
          `Comparing arr[${j}] (${items[j].value}) and arr[${j + 1}] (${items[j + 1].value}).`,
          3,
          [j, j + 1],
          [],
          [],
          { i, j, 'arr[j]': items[j].value, 'arr[j+1]': items[j + 1].value }
        );

        if (items[j].value > items[j + 1].value) {
          push(
            `${items[j].value} > ${items[j + 1].value} — swapping arr[${j}] ↔ arr[${j + 1}].`,
            4,
            [],
            [j, j + 1],
            [],
            { i, j }
          );
          [items[j], items[j + 1]] = [items[j + 1], items[j]];
          swaps++;
          swapped = true;

          push(
            `Swapped. arr[${j}]=${items[j].value}, arr[${j + 1}]=${items[j + 1].value}.`,
            5,
            [],
            [j, j + 1],
            [],
            { i, j, swapped }
          );
        }
      }

      sorted.add(n - i - 1);
      push(
        `arr[${n - i - 1}] (${items[n - i - 1].value}) is in its final sorted position.`,
        6,
        [],
        [],
        [],
        { sortedIndex: n - i - 1 }
      );

      if (!swapped) {
        for (let k = 0; k < n; k++) sorted.add(k);
        push('No swaps in this pass — array is fully sorted. Early exit.', 6, [], [], [], { fullySorted: true });
        break;
      }
    }

    for (let k = 0; k < n; k++) sorted.add(k);
    push('Bubble Sort complete! All elements are in sorted order.', 6, [], [], [], { complete: true });
    return snapshots;
  },
};

