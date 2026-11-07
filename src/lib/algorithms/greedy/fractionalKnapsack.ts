import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { GreedyData, GreedyItem, FractionalKnapsackInput } from '@/lib/types/greedy';

const DEFAULT_INPUT: FractionalKnapsackInput = {
  capacity: 50,
  items: [
    { weight: 10, value: 60, name: 'Item A' },
    { weight: 20, value: 100, name: 'Item B' },
    { weight: 30, value: 120, name: 'Item C' },
  ],
};

export const fractionalKnapsack: AlgorithmDefinition<FractionalKnapsackInput, GreedyData> = {
  id: 'fractional-knapsack',
  name: 'Fractional Knapsack',
  category: 'greedy',
  categoryName: 'Greedy',
  description:
    'Maximize knapsack value by taking items (or fractions) with highest value-to-weight ratio first.',
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
    'Calculate value/weight ratio for each item',
    'Sort items by ratio (descending)',
    'For each item:',
    '  If item fits completely: take it',
    '  Else: take fraction that fits',
    '  Update remaining capacity',
  ],
  generate: (input?: FractionalKnapsackInput): Snapshot<GreedyData>[] => {
    const capacity = Math.max(1, input?.capacity ?? DEFAULT_INPUT.capacity);
    const rawItems = (input?.items ?? DEFAULT_INPUT.items).filter(
      (it) => it.weight > 0 && it.value >= 0
    );

    const snapshots: Snapshot<GreedyData>[] = [];
    let remaining = capacity;

    let items: GreedyItem[] = rawItems.map((it, i) => ({
      id: `fk-${i}`,
      label: it.name || `Item ${i + 1}`,
      value: it.value,
      weight: it.weight,
      sortKey: it.value / it.weight,
      state: 'available' as const,
    }));

    const selected: GreedyItem[] = [];
    let totalValue = 0;

    const pushSnap = (
      desc: string,
      line: number,
      phase: GreedyData['phase']
    ) => {
      snapshots.push({
        id: `fk-${snapshots.length}`,
        step: snapshots.length,
        description: desc,
        data: {
          items: items.map((it) => ({ ...it })),
          selected: selected.map((s) => ({ ...s })),
          totalValue: Math.round(totalValue * 100) / 100,
          remainingCapacity: Math.round(remaining * 100) / 100,
          phase,
          criterion: 'Highest value/weight ratio',
        },
        currentLine: line,
        variables: { capacity, remaining },
      });
    };

    pushSnap('Initialized fractional knapsack problem.', 0, 'init');

    // Sort by value/weight ratio (descending)
    items.sort((a, b) => (b.sortKey ?? 0) - (a.sortKey ?? 0));
    pushSnap('Sorted items by value/weight ratio (greedy criterion).', 1, 'sorting');

    for (let i = 0; i < items.length && remaining > 0; i++) {
      const current = items[i];
      items[i] = { ...current, state: 'considering' };
      pushSnap(
        `Considering "${current.label}" (wt: ${current.weight}, val: ${current.value}, ratio: ${current.sortKey?.toFixed(2)}).`,
        2,
        'selecting'
      );

      if ((current.weight ?? 0) <= remaining) {
        // Take full item
        items[i] = { ...current, state: 'selected' };
        selected.push({ ...current, state: 'selected' });
        totalValue += current.value;
        remaining -= current.weight ?? 0;
        pushSnap(
          `Took full item "${current.label}". Added value ${current.value}. Remaining capacity: ${Math.round(remaining * 100) / 100}.`,
          3,
          'selecting'
        );
      } else {
        // Take fraction
        const fraction = remaining / (current.weight ?? 1);
        const fractionalValue = fraction * current.value;
        items[i] = { ...current, state: 'selected', value: Math.round(fractionalValue * 100) / 100 };
        selected.push({ ...items[i] });
        totalValue += fractionalValue;
        remaining = 0;
        pushSnap(
          `Took fraction (${(fraction * 100).toFixed(1)}%) of "${current.label}". Added value ${fractionalValue.toFixed(2)}. Knapsack FULL!`,
          4,
          'selecting'
        );
      }
    }

    // Mark remaining as rejected
    for (let i = 0; i < items.length; i++) {
      if (items[i].state === 'available') {
        items[i] = { ...items[i], state: 'rejected' };
      }
    }

    items = items.map((it) => (it.state === 'selected' ? { ...it, state: 'optimal' } : it));
    pushSnap(
      `Fractional knapsack complete! Total value: ${totalValue.toFixed(2)} with capacity ${capacity}.`,
      5,
      'done'
    );

    return snapshots;
  },
};
