import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { GreedyData, GreedyItem, EgyptianFractionInput } from '@/lib/types/greedy';

const DEFAULT_INPUT: EgyptianFractionInput = {
  numerator: 6,
  denominator: 14,
};

export const egyptianFraction: AlgorithmDefinition<EgyptianFractionInput, GreedyData> = {
  id: 'egyptian-fraction',
  name: 'Egyptian Fraction',
  category: 'greedy',
  categoryName: 'Greedy',
  description:
    'Represent a fraction as sum of unit fractions (1/n) using greedy algorithm.',
  difficulty: 'Medium',
  timeComplexity: {
    best: 'O(log n)',
    average: 'O(log n)',
    worst: 'O(log n)',
  },
  spaceComplexity: 'O(1)',
  defaultInput: DEFAULT_INPUT,
  inputConfig: {
    type: 'array',
    supportsCustomInput: true,
  },
  code: [
    'While numerator != 0:',
    '  Find ceiling of denominator/numerator',
    '  Add unit fraction 1/ceiling to result',
    '  Update numerator = (num * ceiling - denom)',
    '  Update denominator = (denom * ceiling)',
  ],
  generate: (input?: EgyptianFractionInput): Snapshot<GreedyData>[] => {
    let nr = Math.max(1, input?.numerator ?? DEFAULT_INPUT.numerator);
    let dr = Math.max(1, input?.denominator ?? DEFAULT_INPUT.denominator);
    
    // Simplify fraction
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
    const g = gcd(nr, dr);
    nr /= g;
    dr /= g;

    if (nr >= dr) {
      nr = nr % dr;
    }

    const snapshots: Snapshot<GreedyData>[] = [];
    const items: GreedyItem[] = [];
    const selected: GreedyItem[] = [];

    const pushSnap = (desc: string, line: number, phase: GreedyData['phase']) => {
      snapshots.push({
        id: `ef-${snapshots.length}`,
        step: snapshots.length,
        description: desc,
        data: {
          items: items.map((it) => ({ ...it })),
          selected: selected.map((s) => ({ ...s })),
          totalValue: selected.length,
          phase,
          criterion: 'Largest unit fraction that fits',
        },
        currentLine: line,
        variables: { numerator: nr, denominator: dr },
      });
    };

    pushSnap(`Egyptian fraction for ${nr}/${dr}.`, 0, 'init');

    let iteration = 0;
    const MAX_ITERATIONS = 20;

    while (nr > 0 && iteration < MAX_ITERATIONS) {
      const unitDenom = Math.ceil(dr / nr);
      
      const item: GreedyItem = {
        id: `frac-${iteration}`,
        label: `1/${unitDenom}`,
        value: unitDenom,
        state: 'considering',
      };
      items.push(item);
      
      pushSnap(
        `Current fraction: ${nr}/${dr}. Trying unit fraction 1/${unitDenom}.`,
        1,
        'selecting'
      );

      // Update fraction: nr/dr - 1/unitDenom
      nr = nr * unitDenom - dr;
      dr = dr * unitDenom;

      // Simplify
      if (nr > 0) {
        const g2 = gcd(Math.abs(nr), dr);
        nr /= g2;
        dr /= g2;
      }

      items[items.length - 1] = { ...item, state: 'selected' };
      selected.push({ ...item, state: 'selected' });

      pushSnap(
        `Selected 1/${unitDenom}. Remaining: ${nr > 0 ? `${nr}/${dr}` : '0 (done)'}.`,
        2,
        'selecting'
      );

      iteration++;
    }

    items.forEach((_, i) => {
      items[i] = { ...items[i], state: 'optimal' };
    });

    pushSnap(
      `Egyptian fraction complete! Expressed as sum of ${selected.length} unit fractions: ${selected.map((s) => s.label).join(' + ')}.`,
      4,
      'done'
    );

    return snapshots;
  },
};
