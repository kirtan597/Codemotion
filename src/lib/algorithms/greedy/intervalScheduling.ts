import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { GreedyData, GreedyItem, IntervalSchedulingInput } from '@/lib/types/greedy';

const DEFAULT_INPUT: IntervalSchedulingInput = {
  intervals: [
    { start: 0, end: 6, name: 'I1' },
    { start: 1, end: 4, name: 'I2' },
    { start: 3, end: 5, name: 'I3' },
    { start: 3, end: 8, name: 'I4' },
    { start: 4, end: 7, name: 'I5' },
    { start: 5, end: 9, name: 'I6' },
    { start: 6, end: 10, name: 'I7' },
    { start: 8, end: 11, name: 'I8' },
  ],
};

export const intervalScheduling: AlgorithmDefinition<IntervalSchedulingInput, GreedyData> = {
  id: 'interval-scheduling',
  name: 'Interval Scheduling',
  category: 'greedy',
  categoryName: 'Greedy',
  description:
    'Select maximum number of non-overlapping intervals. Same as Activity Selection but generalized.',
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
    'Sort intervals by end time',
    'Select first interval',
    'For each remaining interval:',
    '  If start >= last end: select it',
  ],
  generate: (input?: IntervalSchedulingInput): Snapshot<GreedyData>[] => {
    const intervals = (input?.intervals ?? DEFAULT_INPUT.intervals).filter(
      (iv) => iv.start < iv.end
    );

    const snapshots: Snapshot<GreedyData>[] = [];
    let items: GreedyItem[] = intervals.map((iv, i) => ({
      id: `iv-${i}`,
      label: iv.name || `I${i + 1}`,
      value: 1,
      start: iv.start,
      end: iv.end,
      state: 'available' as const,
    }));

    const selected: GreedyItem[] = [];
    let lastEnd = -Infinity;

    const pushSnap = (desc: string, line: number, phase: GreedyData['phase']) => {
      snapshots.push({
        id: `is-${snapshots.length}`,
        step: snapshots.length,
        description: desc,
        data: {
          items: items.map((it) => ({ ...it })),
          selected: selected.map((s) => ({ ...s })),
          totalValue: selected.length,
          phase,
          criterion: 'Earliest end time',
        },
        currentLine: line,
        variables: { selectedCount: selected.length },
      });
    };

    pushSnap('Initialized interval scheduling problem.', 0, 'init');
    
    items.sort((a, b) => (a.end ?? 0) - (b.end ?? 0));
    pushSnap('Sorted intervals by end time (greedy criterion).', 0, 'sorting');

    for (let i = 0; i < items.length; i++) {
      const current = items[i];
      items[i] = { ...current, state: 'considering' };
      pushSnap(`Considering interval "${current.label}" [${current.start}, ${current.end}].`, 2, 'selecting');

      if ((current.start ?? 0) >= lastEnd) {
        items[i] = { ...current, state: 'selected' };
        selected.push({ ...current, state: 'selected' });
        lastEnd = current.end ?? 0;
        pushSnap(
          `Interval "${current.label}" is compatible (starts at ${current.start} >= ${lastEnd}). SELECTED!`,
          3,
          'selecting'
        );
      } else {
        items[i] = { ...current, state: 'rejected' };
        pushSnap(`Interval "${current.label}" overlaps. REJECTED.`, 3, 'selecting');
      }
    }

    items = items.map((it) => (it.state === 'selected' ? { ...it, state: 'optimal' } : it));
    pushSnap(`Interval scheduling complete! Selected ${selected.length} non-overlapping intervals.`, 3, 'done');

    return snapshots;
  },
};
