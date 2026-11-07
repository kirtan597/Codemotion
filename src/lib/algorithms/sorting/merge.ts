import { AlgorithmDefinition, Snapshot, ArrayElement, ElementState } from '../../types/algorithm';

function assignIds(arr: number[]): { id: string; value: number }[] {
  return arr.map((v, i) => ({ id: `mrg-${i}-${v}`, value: v }));
}

function toElements(
  items: { id: string; value: number }[],
  states: Record<number, ElementState>
): ArrayElement[] {
  // During merge, the same source element temporarily exists in the aux array
  // AND the main items array (before being overwritten).  Use a position-unique
  // composite key so framer-motion never sees duplicate layout IDs in one frame.
  const seen = new Map<string, number>();
  return items.map((item, idx) => {
    const count = seen.get(item.id) ?? 0;
    seen.set(item.id, count + 1);
    return {
      id: count === 0 ? item.id : `${item.id}~${idx}`,
      value: item.value,
      state: states[idx] ?? 'default',
    };
  });
}

// Pseudocode (0-indexed):
// 0: mergeSort(arr, l, r):
// 1:   if l >= r: return
// 2:   mid = (l + r) / 2
// 3:   mergeSort(arr, l, mid)
// 4:   mergeSort(arr, mid+1, r)
// 5:   merge(arr, l, mid, r):
// 6:     copy left half → aux
// 7:     copy right half → aux
// 8:     i = l, j = mid+1, k = l
// 9:     while i<=mid and j<=r: pick smaller → arr[k++]
// 10:    copy remaining

export const mergeSort: AlgorithmDefinition<number[], ArrayElement[]> = {
  id: 'merge-sort',
  name: 'Merge Sort',
  category: 'sorting',
  categoryName: 'Sorting',
  description:
    'Divide-and-conquer algorithm that recursively splits the array in half, sorts each half, then merges them back.',
  difficulty: 'Medium',
  timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
  spaceComplexity: 'O(n)',
  defaultInput: [38, 27, 43, 3, 9, 82, 10],
  inputConfig: {
    type: 'array',
    minSize: 2,
    maxSize: 60,
    defaultSize: 15,
    supportsCustomInput: true,
  },
  code: [
    'mergeSort(arr, l, r):',            // 0
    '  if l >= r: return',              // 1
    '  mid = (l + r) / 2',             // 2
    '  mergeSort(arr, l, mid)',         // 3
    '  mergeSort(arr, mid+1, r)',       // 4
    'merge(arr, l, mid, r):',           // 5
    '  copy halves to aux[]',           // 6
    '  i = l, j = mid+1, k = l',       // 7
    '  while i<=mid and j<=r:',         // 8
    '    pick smaller into arr[k++]',   // 9
    '  copy remaining elements',        // 10
  ],

  generate(input: number[]): Snapshot<ArrayElement[]>[] {
    const items = assignIds([...input]);
    const n = items.length;
    const snapshots: Snapshot<ArrayElement[]>[] = [];
    const sorted = new Set<number>();
    let stepCount = 0;
    let comparisons = 0;
    let swaps = 0;   // "swaps" = overwrites

    const push = (
      desc: string,
      line: number,
      comparing: number[] = [],
      swapping: number[] = [],
      active: number[] = [],
      vars: Record<string, string | number | boolean | null> = {},
      aux?: { id: string; value: number }[]
    ) => {
      const states: Record<number, ElementState> = {};
      sorted.forEach((idx) => { states[idx] = 'sorted'; });
      active.forEach((idx) => { states[idx] = 'active'; });
      comparing.forEach((idx) => { states[idx] = 'comparing'; });
      swapping.forEach((idx) => { states[idx] = 'swapping'; });

      snapshots.push({
        id: `merge-${stepCount++}`,
        step: snapshots.length,
        description: desc,
        data: toElements(items, states),
        highlightIndices: [...comparing, ...swapping, ...active],
        comparingIndices: comparing,
        swapIndices: swapping,
        sortedIndices: Array.from(sorted),
        currentLine: line,
        variables: {
          comparisons,
          swaps,
          ...vars,
          // embed aux array for CodeViewer meta display
          aux: aux ? JSON.stringify(aux.map((x) => x.value)) : null,
        },
      });
    };

    push('Initial array. Ready for Merge Sort.', 0, [], [], [], { n });

    function merge(l: number, mid: number, r: number) {
      const aux = items.slice(l, r + 1).map((x) => ({ ...x }));
      push(
        `Merging [${l}..${mid}] and [${mid + 1}..${r}]. Copying to auxiliary array.`,
        6,
        [],
        [],
        Array.from({ length: r - l + 1 }, (_, k) => l + k),
        { l, mid, r },
        aux
      );

      let i = 0; // pointer into left half of aux
      let j = mid - l + 1; // pointer into right half of aux
      let k = l; // pointer into main array

      while (i <= mid - l && j <= r - l) {
        comparisons++;
        const li = l + i;
        const ri = l + j;
        push(
          `Comparing aux[${i}]=${aux[i].value} (pos ${li}) vs aux[${j}]=${aux[j].value} (pos ${ri}).`,
          8,
          [li, ri],
          [],
          [],
          { i: li, j: ri, k },
          aux
        );

        if (aux[i].value <= aux[j].value) {
          items[k] = { id: aux[i].id, value: aux[i].value };
          i++;
        } else {
          items[k] = { id: aux[j].id, value: aux[j].value };
          j++;
        }
        swaps++;
        push(
          `Placed ${items[k].value} at index ${k}.`,
          9,
          [],
          [k],
          [],
          { k, placed: items[k].value },
          aux
        );
        k++;
      }

      while (i <= mid - l) {
        items[k] = { id: aux[i].id, value: aux[i].value };
        swaps++;
        push(`Copying remaining left: ${items[k].value} → index ${k}.`, 10, [], [k], [], { k }, aux);
        i++;
        k++;
      }

      while (j <= r - l) {
        items[k] = { id: aux[j].id, value: aux[j].value };
        swaps++;
        push(`Copying remaining right: ${items[k].value} → index ${k}.`, 10, [], [k], [], { k }, aux);
        j++;
        k++;
      }

      // Mark merged range as sorted if it's the full extent
      for (let x = l; x <= r; x++) sorted.add(x);
      if (l === 0 && r === n - 1) {
        push(`Sub-array [${l}..${r}] fully merged and sorted.`, 5, [], [], [], { l, r });
      }
    }

    function ms(l: number, r: number) {
      if (l >= r) {
        if (l === r) sorted.add(l);
        return;
      }
      const mid = Math.floor((l + r) / 2);
      push(`Dividing [${l}..${r}] at mid = ${mid}.`, 2, [], [], Array.from({ length: r - l + 1 }, (_, k) => l + k), {
        l,
        r,
        mid,
      });
      ms(l, mid);
      ms(mid + 1, r);
      merge(l, mid, r);
    }

    ms(0, n - 1);

    for (let k = 0; k < n; k++) sorted.add(k);
    push('Merge Sort complete! Array is fully sorted.', 0, [], [], [], { complete: true });
    return snapshots;
  },
};
