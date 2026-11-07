import { AlgorithmDefinition, Snapshot, ArrayElement, ElementState } from '../../types/algorithm';

function assignIds(arr: number[]): { id: string; value: number }[] {
  return arr.map((v, i) => ({ id: `ins-${i}-${v}`, value: v }));
}

function toElements(
  items: { id: string; value: number }[],
  states: Record<number, ElementState>
): ArrayElement[] {
  // Use position-unique IDs to ensure no two bars share the same key in a
  // snapshot (needed during shift operations where the same source element
  // can temporarily occupy two adjacent slots).
  const seen = new Map<string, number>();
  return items.map((item, idx) => {
    const count = (seen.get(item.id) ?? 0);
    seen.set(item.id, count + 1);
    return {
      id: count === 0 ? item.id : `${item.id}~${idx}`,
      value: item.value,
      state: states[idx] ?? 'default',
    };
  });
}

// Pseudocode (0-indexed):
// 0: for i from 1 to n-1:
// 1:   key = arr[i]
// 2:   j = i - 1
// 3:   while j >= 0 and arr[j] > key:
// 4:     arr[j+1] = arr[j]   ← shift right
// 5:     j = j - 1
// 6:   arr[j+1] = key

export const insertionSort: AlgorithmDefinition<number[], ArrayElement[]> = {
  id: 'insertion-sort',
  name: 'Insertion Sort',
  category: 'sorting',
  categoryName: 'Sorting',
  description:
    'Builds the sorted array one item at a time by repeatedly picking the next element and inserting it into its correct position.',
  difficulty: 'Easy',
  timeComplexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
  spaceComplexity: 'O(1)',
  defaultInput: [29, 10, 14, 37, 13, 45, 20, 8, 33, 17],
  inputConfig: {
    type: 'array',
    minSize: 2,
    maxSize: 60,
    defaultSize: 15,
    supportsCustomInput: true,
  },
  code: [
    'for i from 1 to n - 1:',          // 0
    '  key = arr[i]',                    // 1
    '  j = i - 1',                       // 2
    '  while j >= 0 and arr[j] > key:',  // 3
    '    arr[j + 1] = arr[j]',           // 4
    '    j = j - 1',                     // 5
    '  arr[j + 1] = key',                // 6
  ],

  generate(input: number[]): Snapshot<ArrayElement[]>[] {
    const items = assignIds([...input]);
    const n = items.length;
    const snapshots: Snapshot<ArrayElement[]>[] = [];
    const sorted = new Set<number>([0]);
    let stepCount = 0;
    let comparisons = 0;
    let swaps = 0;   // "swaps" here = shifts

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
        id: `ins-${stepCount++}`,
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

    push('Initial array. Index 0 is trivially sorted.', 0, [], [], [0], { n });

    for (let i = 1; i < n; i++) {
      const key = items[i].value;
      const keyId = items[i].id;
      let j = i - 1;

      push(`Pick key = ${key} at index ${i} to insert into sorted prefix [0..${i - 1}].`, 1, [], [], [i], {
        i,
        key,
      });

      while (j >= 0 && items[j].value > key) {
        comparisons++;
        push(
          `arr[${j}] (${items[j].value}) > key (${key}). Shifting arr[${j}] right to index ${j + 1}.`,
          3,
          [j, j + 1],
          [],
          [i],
          { j, 'arr[j]': items[j].value, key }
        );
        // Shift: move element right — use a unique placeholder ID for the
        // shifted copy so element IDs stay unique within every snapshot.
        items[j + 1] = { id: `${items[j].id}~s${j}`, value: items[j].value };
        swaps++;
        j--;

        push(`Shifted. arr[${j + 1}] = ${items[j + 1].value}. Checking j = ${j}.`, 4, [], [j + 1], [], {
          j,
          key,
        });
      }

      // Insert key at j+1 — restore original stable ID
      items[j + 1] = { id: keyId, value: key };
      for (let k = 0; k <= i; k++) sorted.add(k);

      push(`Inserted key (${key}) at position ${j + 1}. Sorted prefix now [0..${i}].`, 6, [], [], [j + 1], {
        insertedAt: j + 1,
        key,
        i,
      });
    }

    push('Insertion Sort complete! All elements are in sorted order.', 6, [], [], [], { complete: true });
    return snapshots;
  },
};
