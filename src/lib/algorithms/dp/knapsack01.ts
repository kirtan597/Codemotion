import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import {
  DPMatrixData,
  KnapsackInput,
  KnapsackItem,
  DEFAULT_KNAPSACK_INPUT,
} from './types';

export const knapsack01: AlgorithmDefinition<KnapsackInput | any, DPMatrixData> = {
  id: 'knapsack-01',
  name: '0/1 Knapsack',
  category: 'dp',
  categoryName: 'Dynamic Programming',
  description:
    'Solves the 0/1 Knapsack problem using dynamic programming table construction and backtracks to retrieve optimal items.',
  difficulty: 'Medium',
  timeComplexity: {
    best: 'O(n · W)',
    average: 'O(n · W)',
    worst: 'O(n · W)',
  },
  spaceComplexity: 'O(n · W)',
  defaultInput: DEFAULT_KNAPSACK_INPUT,
  inputConfig: {
    type: 'dp',
    supportsCustomInput: true,
  },
  code: [
    'for i from 1 to n:',
    '  for w from 0 to W:',
    '    skip = dp[i-1][w]',
    '    if weight[i-1] <= w:',
    '      take = dp[i-1][w - weight[i-1]] + value[i-1]',
    '      dp[i][w] = max(skip, take)',
    '    else: dp[i][w] = skip',
    'backtrack from dp[n][W] to find chosen items',
  ],
  generate: (input?: KnapsackInput): Snapshot<DPMatrixData>[] => {
    const rawItems: KnapsackItem[] = input?.items ?? DEFAULT_KNAPSACK_INPUT.items;
    const items = rawItems.filter((it) => it.weight >= 0 && it.value >= 0);
    const capacity = Math.max(0, Math.min(30, input?.capacity ?? DEFAULT_KNAPSACK_INPUT.capacity));
    const n = items.length;

    // Table dimensions: (n + 1) rows, (capacity + 1) columns
    const table: (number | null)[][] = Array.from({ length: n + 1 }, () =>
      Array.from({ length: capacity + 1 }, () => null)
    );

    const rowHeaders = ['0 (None)', ...items.map((it, idx) => `${idx + 1} (${it.name}: wt=${it.weight}, val=${it.value})`)];
    const colHeaders = Array.from({ length: capacity + 1 }, (_, w) => `w=${w}`);

    const snapshots: Snapshot<DPMatrixData>[] = [];

    const copyTable = (): (number | null)[][] => {
      return table.map((row) => [...row]);
    };

    const pushSnapshot = (
      desc: string,
      line: number,
      computingCell: [number, number] | null,
      dependencies: Array<[number, number]>,
      backtrackCells: Array<[number, number]> = [],
      phase: DPMatrixData['phase'] = 'compute',
      vars: Record<string, any> = {}
    ) => {
      snapshots.push({
        id: `knapsack-${snapshots.length}`,
        step: snapshots.length,
        description: desc,
        data: {
          table: copyTable(),
          rowHeaders,
          colHeaders,
          computingCell,
          dependencyCells: dependencies,
          backtrackCells,
          phase,
        },
        currentLine: line,
        variables: {
          ...vars,
        },
      });
    };

    // 1. Initialize base row (i = 0): dp[0][w] = 0 for all w
    for (let w = 0; w <= capacity; w++) {
      table[0][w] = 0;
    }
    pushSnapshot(
      `Initialized base case: 0 items available. dp[0][w] = 0 for all capacities w from 0 to ${capacity}.`,
      0,
      null,
      [],
      [],
      'init',
      {
        formula: 'dp[0][w] = 0',
        decision: 'init',
        remainingCapacity: capacity,
      }
    );

    // 2. Main DP loop
    for (let i = 1; i <= n; i++) {
      const item = items[i - 1];

      for (let w = 0; w <= capacity; w++) {
        const skip = table[i - 1][w]!;
        const canTake = item.weight <= w;
        const take = canTake ? table[i - 1][w - item.weight]! + item.value : null;

        const deps: Array<[number, number]> = [[i - 1, w]];
        if (canTake) {
          deps.push([i - 1, w - item.weight]);
        }

        const chosenVal = canTake ? Math.max(skip, take!) : skip;
        const decision = canTake && take! > skip ? 'take' : 'skip';

        table[i][w] = chosenVal;

        const formulaStr = canTake
          ? `dp[${i}][${w}] = max(dp[${i - 1}][${w}], dp[${i - 1}][${w - item.weight}] + ${item.value})`
          : `dp[${i}][${w}] = dp[${i - 1}][${w}] (item weight ${item.weight} > capacity ${w})`;

        const substitutedStr = canTake
          ? `max(skip: ${skip}, take: ${table[i - 1][w - item.weight]} + ${item.value} = ${take}) → ${chosenVal}`
          : `skip: ${skip} (cannot fit ${item.name})`;

        pushSnapshot(
          `Cell [${i}, ${w}] for item "${item.name}" (wt: ${item.weight}, val: ${item.value}) at capacity ${w}: ${
            decision === 'take'
              ? `TAKE item! New value ${chosenVal} exceeds skip value ${skip}.`
              : `SKIP item! Value remains ${chosenVal}.`
          }`,
          decision === 'take' ? 5 : 6,
          [i, w],
          deps,
          [],
          'compute',
          {
            formula: formulaStr,
            substitutedFormula: substitutedStr,
            decision,
            skipVal: skip,
            takeVal: take,
            bestValue: chosenVal,
            currentItem: item,
            remainingCapacity: w,
          }
        );
      }
    }

    // 3. Backtrack Phase
    const backtrackPath: Array<[number, number]> = [];
    const chosenItems: KnapsackItem[] = [];
    let currW = capacity;

    pushSnapshot(
      `Table complete! Maximum value achievable is ${table[n][capacity]}. Starting backtrack phase from cell [${n}, ${capacity}] to identify selected items.`,
      7,
      [n, capacity],
      [],
      [[n, capacity]],
      'backtrack',
      {
        formula: 'Backtracking from dp[n][W]',
        decision: 'backtrack',
        bestValue: table[n][capacity]!,
        remainingCapacity: currW,
        chosenItems: [],
      }
    );

    for (let i = n; i > 0; i--) {
      const item = items[i - 1];
      backtrackPath.push([i, currW]);

      if (table[i][currW] !== table[i - 1][currW]) {
        // Item was included!
        chosenItems.unshift(item);
        currW -= item.weight;

        pushSnapshot(
          `At cell [${i}, ${currW + item.weight}]: dp[${i}][${currW + item.weight}] (${table[i][currW + item.weight]}) ≠ dp[${i - 1}][${currW + item.weight}] (${table[i - 1][currW + item.weight]}). Item "${item.name}" was TAKEN! Remaining capacity becomes ${currW}.`,
          7,
          [i, currW + item.weight],
          [[i - 1, currW]],
          [...backtrackPath],
          'backtrack',
          {
            formula: `Took "${item.name}" (wt: ${item.weight}, val: ${item.value})`,
            decision: 'take',
            currentItem: item,
            remainingCapacity: currW,
            chosenItems: [...chosenItems],
            bestValue: table[n][capacity]!,
          }
        );
      } else {
        // Item was skipped
        pushSnapshot(
          `At cell [${i}, ${currW}]: dp[${i}][${currW}] == dp[${i - 1}][${currW}] (${table[i][currW]}). Item "${item.name}" was SKIPPED. Moving to row ${i - 1}.`,
          7,
          [i, currW],
          [[i - 1, currW]],
          [...backtrackPath],
          'backtrack',
          {
            formula: `Skipped "${item.name}"`,
            decision: 'skip',
            currentItem: item,
            remainingCapacity: currW,
            chosenItems: [...chosenItems],
            bestValue: table[n][capacity]!,
          }
        );
      }
    }

    backtrackPath.push([0, currW]);

    // Final Snapshot
    pushSnapshot(
      `Knapsack Complete! Selected items: [${chosenItems.map((it) => it.name).join(', ')}]. Total value: ${table[n][capacity]}. Total weight used: ${capacity - currW}/${capacity}.`,
      7,
      null,
      [],
      [...backtrackPath],
      'done',
      {
        formula: `Optimal solution = ${table[n][capacity]}`,
        decision: 'done',
        bestValue: table[n][capacity]!,
        remainingCapacity: currW,
        chosenItems: [...chosenItems],
      }
    );

    return snapshots;
  },
};

