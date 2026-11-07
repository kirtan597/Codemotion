import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { GreedyData, GreedyItem, BuyMaxItemsInput } from '@/lib/types/greedy';

const DEFAULT_INPUT: BuyMaxItemsInput = {
  prices: [1, 12, 5, 111, 200, 1000, 10, 9, 12, 15],
  budget: 50,
};

export const buyMaxItems: AlgorithmDefinition<BuyMaxItemsInput, GreedyData> = {
  id: 'buy-max-items',
  name: 'Buy Maximum Items',
  category: 'greedy',
  categoryName: 'Greedy',
  description:
    'Buy maximum number of items within budget by always buying the cheapest available item first.',
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
    'Sort items by price (ascending)',
    'For each item:',
    '  If price <= remaining budget:',
    '    Buy item',
    '    Subtract price from budget',
  ],
  generate: (input?: BuyMaxItemsInput): Snapshot<GreedyData>[] => {
    const prices = (input?.prices ?? DEFAULT_INPUT.prices).filter((p) => p > 0);
    let budget = Math.max(0, input?.budget ?? DEFAULT_INPUT.budget);

    const snapshots: Snapshot<GreedyData>[] = [];
    let items: GreedyItem[] = prices.map((price, i) => ({
      id: `item-${i}`,
      label: `Item ${i + 1}`,
      value: price,
      state: 'available' as const,
    }));

    const selected: GreedyItem[] = [];

    const pushSnap = (desc: string, line: number, phase: GreedyData['phase']) => {
      snapshots.push({
        id: `bm-${snapshots.length}`,
        step: snapshots.length,
        description: desc,
        data: {
          items: items.map((it) => ({ ...it })),
          selected: selected.map((s) => ({ ...s })),
          totalValue: selected.length,
          remainingCapacity: budget,
          phase,
          criterion: 'Cheapest item first',
        },
        currentLine: line,
        variables: { originalBudget: input?.budget ?? DEFAULT_INPUT.budget, itemsBought: selected.length },
      });
    };

    pushSnap(`Buy maximum items with budget ${budget}.`, 0, 'init');

    items.sort((a, b) => a.value - b.value);
    pushSnap('Sorted items by price (greedy criterion).', 0, 'sorting');

    for (let i = 0; i < items.length; i++) {
      const current = items[i];
      items[i] = { ...current, state: 'considering' };
      pushSnap(
        `Considering "${current.label}" with price ${current.value}. Budget remaining: ${budget}.`,
        1,
        'selecting'
      );

      if (current.value <= budget) {
        items[i] = { ...current, state: 'selected' };
        selected.push({ ...current, state: 'selected' });
        budget -= current.value;
        pushSnap(
          `Bought "${current.label}"! Items bought: ${selected.length}. Budget remaining: ${budget}.`,
          2,
          'selecting'
        );
      } else {
        items[i] = { ...current, state: 'rejected' };
        pushSnap(
          `Cannot afford "${current.label}" (price ${current.value} > budget ${budget}). SKIPPED.`,
          3,
          'selecting'
        );
      }
    }

    items = items.map((it) => (it.state === 'selected' ? { ...it, state: 'optimal' } : it));
    pushSnap(
      `Shopping complete! Bought ${selected.length} items. Budget remaining: ${budget}.`,
      3,
      'done'
    );

    return snapshots;
  },
};
