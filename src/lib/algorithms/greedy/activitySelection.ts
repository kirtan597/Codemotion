import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { GreedyData, GreedyItem, ActivitySelectionInput } from '@/lib/types/greedy';

const DEFAULT_INPUT: ActivitySelectionInput = {
  activities: [
    { start: 1, end: 3, name: 'A' },
    { start: 2, end: 5, name: 'B' },
    { start: 4, end: 6, name: 'C' },
    { start: 6, end: 7, name: 'D' },
    { start: 5, end: 9, name: 'E' },
    { start: 8, end: 9, name: 'F' },
  ],
};

export const activitySelection: AlgorithmDefinition<ActivitySelectionInput, GreedyData> = {
  id: 'activity-selection',
  name: 'Activity Selection',
  category: 'greedy',
  categoryName: 'Greedy',
  description:
    'Select maximum number of non-overlapping activities. Greedy choice: always pick the activity that finishes earliest.',
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
    'Sort activities by finish time',
    'Select first activity',
    'For each remaining activity:',
    '  If start time >= last finish time:',
    '    Select this activity',
    '    Update last finish time',
  ],
  generate: (input?: ActivitySelectionInput): Snapshot<GreedyData>[] => {
    const activities = (input?.activities ?? DEFAULT_INPUT.activities)
      .map((a, i) => ({ ...a, name: a.name || `A${i + 1}` }))
      .filter((a) => a.start < a.end);

    const snapshots: Snapshot<GreedyData>[] = [];
    let items: GreedyItem[] = activities.map((a, i) => ({
      id: `act-${i}`,
      label: a.name,
      value: 1,
      start: a.start,
      end: a.end,
      state: 'available' as const,
    }));

    const pushSnap = (
      desc: string,
      line: number,
      phase: GreedyData['phase'],
      selected: GreedyItem[],
      totalValue: number
    ) => {
      snapshots.push({
        id: `as-${snapshots.length}`,
        step: snapshots.length,
        description: desc,
        data: {
          items: items.map((it) => ({ ...it })),
          selected: selected.map((s) => ({ ...s })),
          totalValue,
          phase,
          criterion: 'Earliest finish time',
        },
        currentLine: line,
        variables: { selectedCount: selected.length },
      });
    };

    pushSnap('Initialized activity selection problem.', 0, 'init', [], 0);

    // Sort by finish time
    items.sort((a, b) => (a.end ?? 0) - (b.end ?? 0));
    pushSnap('Sorted activities by finish time (greedy criterion).', 0, 'sorting', [], 0);

    const selected: GreedyItem[] = [];
    let lastFinish = -Infinity;

    for (let i = 0; i < items.length; i++) {
      const current = items[i];
      items[i] = { ...current, state: 'considering' };
      pushSnap(
        `Considering activity "${current.label}" [${current.start}, ${current.end}].`,
        2,
        'selecting',
        selected,
        selected.length
      );

      if ((current.start ?? 0) >= lastFinish) {
        items[i] = { ...current, state: 'selected' };
        selected.push({ ...current, state: 'selected' });
        lastFinish = current.end ?? 0;
        pushSnap(
          `Activity "${current.label}" is compatible (starts at ${current.start} >= ${lastFinish}). SELECTED!`,
          4,
          'selecting',
          selected,
          selected.length
        );
      } else {
        items[i] = { ...current, state: 'rejected' };
        pushSnap(
          `Activity "${current.label}" overlaps with previous (starts at ${current.start} < ${lastFinish}). REJECTED.`,
          5,
          'selecting',
          selected,
          selected.length
        );
      }
    }

    items = items.map((it) => (it.state === 'selected' ? { ...it, state: 'optimal' } : it));
    pushSnap(
      `Activity selection complete! Selected ${selected.length} non-overlapping activities.`,
      5,
      'done',
      selected,
      selected.length
    );

    return snapshots;
  },
};
