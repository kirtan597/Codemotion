import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { GreedyData, GreedyItem, MinPlatformsInput } from '@/lib/types/greedy';

const DEFAULT_INPUT: MinPlatformsInput = {
  arrivals: [900, 940, 950, 1100, 1500, 1800],
  departures: [910, 1200, 1120, 1130, 1900, 2000],
};

export const minPlatforms: AlgorithmDefinition<MinPlatformsInput, GreedyData> = {
  id: 'min-platforms',
  name: 'Minimum Platforms',
  category: 'greedy',
  categoryName: 'Greedy',
  description:
    'Find minimum railway platforms needed to accommodate all trains without overlap by processing events in time order.',
  difficulty: 'Medium',
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
    'Sort arrivals and departures separately',
    'Use two pointers for arrivals and departures',
    'Track current platforms and max platforms needed',
    'Process events in time order',
  ],
  generate: (input?: MinPlatformsInput): Snapshot<GreedyData>[] => {
    const arr = [...(input?.arrivals ?? DEFAULT_INPUT.arrivals)].sort((a, b) => a - b);
    const dep = [...(input?.departures ?? DEFAULT_INPUT.departures)].sort((a, b) => a - b);
    const n = Math.min(arr.length, dep.length);

    const snapshots: Snapshot<GreedyData>[] = [];
    let platforms = 0;
    let maxPlatforms = 0;
    let i = 0;
    let j = 0;

    let items: GreedyItem[] = arr.map((a, idx) => ({
      id: `train-${idx}`,
      label: `T${idx + 1}`,
      value: 1,
      start: a,
      end: dep[idx],
      state: 'available' as const,
    }));

    const selected: GreedyItem[] = [];

    const pushSnap = (desc: string, line: number, phase: GreedyData['phase']) => {
      snapshots.push({
        id: `mp-${snapshots.length}`,
        step: snapshots.length,
        description: desc,
        data: {
          items: items.map((it) => ({ ...it })),
          selected: selected.map((s) => ({ ...s })),
          totalValue: maxPlatforms,
          phase,
          criterion: 'Process events in time order',
        },
        currentLine: line,
        variables: { platforms, maxPlatforms, trains: n },
      });
    };

    pushSnap(`Minimum platforms problem for ${n} trains.`, 0, 'init');
    pushSnap('Sorted arrival and departure times.', 0, 'sorting');

    while (i < n && j < n) {
      if (arr[i] <= dep[j]) {
        platforms++;
        items[i] = { ...items[i], state: 'considering' };
        pushSnap(
          `Train T${i + 1} arrives at ${arr[i]}. Platforms in use: ${platforms}.`,
          3,
          'selecting'
        );
        
        if (platforms > maxPlatforms) {
          maxPlatforms = platforms;
          pushSnap(
            `New maximum platforms needed: ${maxPlatforms}.`,
            3,
            'selecting'
          );
        }
        
        items[i] = { ...items[i], state: 'selected' };
        selected.push({ ...items[i] });
        i++;
      } else {
        platforms--;
        pushSnap(
          `Train departs at ${dep[j]}. Platforms in use: ${platforms}.`,
          3,
          'selecting'
        );
        j++;
      }
    }

    items = items.map((it) => ({ ...it, state: 'optimal' }));
    pushSnap(
      `Minimum platforms calculation complete! Need ${maxPlatforms} platforms for ${n} trains.`,
      3,
      'done'
    );

    return snapshots;
  },
};
