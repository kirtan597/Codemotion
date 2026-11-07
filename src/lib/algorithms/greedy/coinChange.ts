import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { GreedyData, GreedyItem, MinCoinChangeInput } from '@/lib/types/greedy';

const DEFAULT_INPUT: MinCoinChangeInput = {
  coins: [1, 2, 5, 10, 20, 50, 100],
  amount: 93,
};

export const coinChangeGreedy: AlgorithmDefinition<MinCoinChangeInput, GreedyData> = {
  id: 'coin-change-greedy',
  name: 'Coin Change (Greedy)',
  category: 'greedy',
  categoryName: 'Greedy',
  description:
    'Make change using minimum coins by always picking the largest denomination that fits. Works optimally for canonical coin systems.',
  difficulty: 'Easy',
  timeComplexity: {
    best: 'O(n)',
    average: 'O(n)',
    worst: 'O(n)',
  },
  spaceComplexity: 'O(1)',
  defaultInput: DEFAULT_INPUT,
  inputConfig: {
    type: 'array',
    supportsCustomInput: true,
  },
  code: [
    'Sort coins in descending order',
    'For each coin denomination:',
    '  While amount >= coin:',
    '    Use one coin',
    '    Subtract coin from amount',
    'Return total coins used',
  ],
  generate: (input?: MinCoinChangeInput): Snapshot<GreedyData>[] => {
    const coins = (input?.coins ?? DEFAULT_INPUT.coins)
      .filter((c) => c > 0)
      .sort((a, b) => b - a);
    let amount = Math.max(0, input?.amount ?? DEFAULT_INPUT.amount);

    const snapshots: Snapshot<GreedyData>[] = [];
    let items: GreedyItem[] = coins.map((coin, i) => ({
      id: `coin-${i}`,
      label: `${coin}¢`,
      value: coin,
      state: 'available' as const,
    }));

    const selected: GreedyItem[] = [];
    let totalCoins = 0;

    const pushSnap = (desc: string, line: number, phase: GreedyData['phase']) => {
      snapshots.push({
        id: `cc-${snapshots.length}`,
        step: snapshots.length,
        description: desc,
        data: {
          items: items.map((it) => ({ ...it })),
          selected: selected.map((s) => ({ ...s })),
          totalValue: totalCoins,
          remainingCapacity: amount,
          phase,
          criterion: 'Largest coin first',
        },
        currentLine: line,
        variables: { originalAmount: input?.amount ?? DEFAULT_INPUT.amount, remaining: amount },
      });
    };

    pushSnap(`Coin change for amount: ${amount}. Using greedy approach.`, 0, 'init');
    pushSnap('Sorted coins in descending order (greedy criterion).', 0, 'sorting');

    for (let i = 0; i < coins.length && amount > 0; i++) {
      const coin = coins[i];
      items[i] = { ...items[i], state: 'considering' };
      pushSnap(`Considering coin ${coin}¢. Remaining amount: ${amount}¢.`, 1, 'selecting');

      let count = 0;
      while (amount >= coin) {
        amount -= coin;
        count++;
        totalCoins++;
        selected.push({ ...items[i], state: 'selected' });
        pushSnap(
          `Used coin ${coin}¢ (count: ${count}). Remaining: ${amount}¢, total coins: ${totalCoins}.`,
          2,
          'selecting'
        );
      }

      items[i] = { ...items[i], state: count > 0 ? 'selected' : 'rejected' };
      if (count === 0) {
        pushSnap(`Coin ${coin}¢ too large. Skipping to next denomination.`, 4, 'selecting');
      }
    }

    items = items.map((it) => (it.state === 'selected' ? { ...it, state: 'optimal' } : it));
    const msg =
      amount === 0
        ? `Change made successfully! Used ${totalCoins} coins.`
        : `Change incomplete. ${amount}¢ remaining (impossible with given denominations).`;
    pushSnap(msg, 5, 'done');

    return snapshots;
  },
};
