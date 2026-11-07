import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { DPMatrixData } from './types';

interface CoinChangeDPInput {
  coins: number[];
  amount: number;
}

const DEFAULT_INPUT: CoinChangeDPInput = {
  coins: [1, 2, 5],
  amount: 11,
};

export const coinChangeDP: AlgorithmDefinition<CoinChangeDPInput, DPMatrixData> = {
  id: 'coin-change-dp',
  name: 'Coin Change (Min Coins)',
  category: 'dp',
  categoryName: 'Dynamic Programming',
  description:
    'Find minimum number of coins needed to make amount using dynamic programming.',
  difficulty: 'Medium',
  timeComplexity: {
    best: 'O(n · amount)',
    average: 'O(n · amount)',
    worst: 'O(n · amount)',
  },
  spaceComplexity: 'O(n · amount)',
  defaultInput: DEFAULT_INPUT,
  inputConfig: {
    type: 'dp',
    supportsCustomInput: true,
  },
  code: [
    'dp[0] = 0',
    'for amount from 1 to target:',
    '  for each coin:',
    '    if coin <= amount:',
    '      dp[amount] = min(dp[amount], dp[amount - coin] + 1)',
  ],
  generate: (input?: CoinChangeDPInput): Snapshot<DPMatrixData>[] => {
    const coins = (input?.coins ?? DEFAULT_INPUT.coins).filter((c) => c > 0).sort((a, b) => a - b);
    const amount = Math.max(0, Math.min(50, input?.amount ?? DEFAULT_INPUT.amount));
    const n = coins.length;

    const table: (number | null)[][] = Array.from({ length: n + 1 }, () =>
      Array.from({ length: amount + 1 }, () => null)
    );

    const rowHeaders = ['Ø', ...coins.map((c, i) => `Coin ${c}`)];
    const colHeaders = Array.from({ length: amount + 1 }, (_, i) => `${i}`);
    const snapshots: Snapshot<DPMatrixData>[] = [];

    const pushSnap = (
      desc: string,
      line: number,
      computing: [number, number] | null,
      deps: Array<[number, number]>,
      phase: 'init' | 'compute' | 'done',
      vars: Record<string, any> = {}
    ) => {
      snapshots.push({
        id: `cc-${snapshots.length}`,
        step: snapshots.length,
        description: desc,
        data: {
          table: table.map((r) => [...r]),
          rowHeaders,
          colHeaders,
          computingCell: computing,
          dependencyCells: deps,
          phase,
          dpMode: 'table',
        },
        currentLine: line,
        variables: vars,
      });
    };

    // Init: 0 coins for amount 0
    for (let i = 0; i <= n; i++) table[i][0] = 0;
    pushSnap('Base case: 0 coins needed for amount 0.', 0, null, [], 'init');

    // Init: infinite for other amounts with no coins
    for (let a = 1; a <= amount; a++) table[0][a] = Infinity;
    pushSnap('Without any coins, amounts > 0 are impossible (Infinity).', 0, null, [], 'init');

    for (let i = 1; i <= n; i++) {
      const coin = coins[i - 1];
      for (let a = 1; a <= amount; a++) {
        const skip = table[i - 1][a]!;
        let take = Infinity;
        if (coin <= a) {
          take = table[i][a - coin]! + 1;
        }

        table[i][a] = Math.min(skip, take);
        const deps: Array<[number, number]> = [[i - 1, a] as [number, number]];
        if (coin <= a) deps.push([i, a - coin] as [number, number]);

        pushSnap(
          `Cell [${i}, ${a}]: coin=${coin}. Skip=${skip === Infinity ? '∞' : skip}, Take=${take === Infinity ? '∞' : take}. Min=${table[i][a] === Infinity ? '∞' : table[i][a]}.`,
          4,
          [i, a],
          deps,
          'compute',
          { coin, skip, take, result: table[i][a] }
        );
      }
    }

    const result = table[n][amount]!;
    pushSnap(
      `Coin change complete! Minimum coins needed: ${result === Infinity ? 'impossible' : result}.`,
      4,
      null,
      [],
      'done',
      { result }
    );

    return snapshots;
  },
};
