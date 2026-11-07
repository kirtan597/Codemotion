import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { GreedyData, GreedyItem } from '@/lib/types/greedy';

interface MaximizeSumInput {
  array: number[];
  k: number;
}

const DEFAULT_INPUT: MaximizeSumInput = {
  array: [1, 2, 3, 4, 5],
  k: 3,
};

export const maximizeSum: AlgorithmDefinition<MaximizeSumInput, GreedyData> = {
  id: 'maximize-sum',
  name: 'Maximize Array Sum',
  category: 'greedy',
  categoryName: 'Greedy',
  description:
    'Maximize sum by negating at most K elements. Greedy: repeatedly negate the smallest (most negative) element.',
  difficulty: 'Easy',
  timeComplexity: {
    best: 'O(n log n)',
    average: 'O(n log n)',
    worst: 'O(n log n)',
  },
  spaceComplexity: 'O(n)',
  defaultInput: DEFAULT_INPUT,
  inputConfig: {
    type: 'array',
    supportsCustomInput: true,
  },
  code: [
    'Sort array',
    'For each of K operations:',
    '  Negate smallest element',
    '  Resort array',
    'Return sum of all elements',
  ],
  generate: (input?: MaximizeSumInput): Snapshot<GreedyData>[] => {
    const arr = [...(input?.array ?? DEFAULT_INPUT.array)];
    const k = Math.max(0, input?.k ?? DEFAULT_INPUT.k);

    const snapshots: Snapshot<GreedyData>[] = [];
    let items: GreedyItem[] = arr.map((val, i) => ({
      id: `elem-${i}`,
      label: `A[${i}]`,
      value: val,
      state: 'available' as const,
    }));

    const selected: GreedyItem[] = [];
    let operations = 0;

    const pushSnap = (desc: string, line: number, phase: GreedyData['phase']) => {
      const sum = items.reduce((acc, it) => acc + it.value, 0);
      snapshots.push({
        id: `ms-${snapshots.length}`,
        step: snapshots.length,
        description: desc,
        data: {
          items: items.map((it) => ({ ...it })),
          selected: selected.map((s) => ({ ...s })),
          totalValue: sum,
          phase,
          criterion: 'Negate smallest element',
        },
        currentLine: line,
        variables: { k, operations, currentSum: sum },
      });
    };

    pushSnap(`Maximize sum with ${k} negations. Initial sum: ${items.reduce((acc, it) => acc + it.value, 0)}.`, 0, 'init');

    for (let op = 0; op < k; op++) {
      items.sort((a, b) => a.value - b.value);
      
      if (op === 0) {
        pushSnap('Sorted array (greedy preparation).', 0, 'sorting');
      }

      const minIdx = 0;
      const minItem = items[minIdx];

      items[minIdx] = { ...minItem, state: 'considering' };
      pushSnap(
        `Operation ${op + 1}/${k}: Negating smallest element "${minItem.label}" (value: ${minItem.value}).`,
        1,
        'selecting'
      );

      items[minIdx] = { ...minItem, value: -minItem.value, state: 'selected' };
      selected.push({ ...items[minIdx] });
      operations++;

      const newSum = items.reduce((acc, it) => acc + it.value, 0);
      pushSnap(
        `Negated "${minItem.label}": ${minItem.value} → ${-minItem.value}. New sum: ${newSum}.`,
        2,
        'selecting'
      );

      // Reset states
      items = items.map((it) => ({ ...it, state: 'available' }));
    }

    items = items.map((it) => ({ ...it, state: 'optimal' }));
    const finalSum = items.reduce((acc, it) => acc + it.value, 0);
    pushSnap(
      `Maximize sum complete! Performed ${operations} negations. Final sum: ${finalSum}.`,
      3,
      'done'
    );

    return snapshots;
  },
};
