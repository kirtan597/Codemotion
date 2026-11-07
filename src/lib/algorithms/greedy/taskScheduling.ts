import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { GreedyData, GreedyItem, TaskSchedulingInput } from '@/lib/types/greedy';

const DEFAULT_INPUT: TaskSchedulingInput = {
  tasks: [
    { id: 'T1', deadline: 4, duration: 1 },
    { id: 'T2', deadline: 2, duration: 1 },
    { id: 'T3', deadline: 4, duration: 1 },
    { id: 'T4', deadline: 2, duration: 1 },
    { id: 'T5', deadline: 4, duration: 1 },
  ],
};

export const taskScheduling: AlgorithmDefinition<TaskSchedulingInput, GreedyData> = {
  id: 'task-scheduling',
  name: 'Task Scheduling to Minimize Lateness',
  category: 'greedy',
  categoryName: 'Greedy',
  description:
    'Schedule tasks to minimize maximum lateness by sorting tasks by earliest deadline first (EDF).',
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
    'Sort tasks by deadline (ascending)',
    'Schedule tasks in that order',
    'Calculate finish times and lateness',
  ],
  generate: (input?: TaskSchedulingInput): Snapshot<GreedyData>[] => {
    const tasks = (input?.tasks ?? DEFAULT_INPUT.tasks).filter(
      (t) => t.deadline > 0 && t.duration > 0
    );

    const snapshots: Snapshot<GreedyData>[] = [];
    let currentTime = 0;
    let maxLateness = 0;

    let items: GreedyItem[] = tasks.map((t, i) => ({
      id: `task-${i}`,
      label: t.id,
      value: t.duration,
      deadline: t.deadline,
      state: 'available' as const,
    }));

    const selected: GreedyItem[] = [];

    const pushSnap = (desc: string, line: number, phase: GreedyData['phase']) => {
      snapshots.push({
        id: `ts-${snapshots.length}`,
        step: snapshots.length,
        description: desc,
        data: {
          items: items.map((it) => ({ ...it })),
          selected: selected.map((s) => ({ ...s })),
          totalValue: maxLateness,
          phase,
          criterion: 'Earliest deadline first (EDF)',
        },
        currentLine: line,
        variables: { currentTime, maxLateness, tasksScheduled: selected.length },
      });
    };

    pushSnap(`Task scheduling for ${tasks.length} tasks to minimize lateness.`, 0, 'init');

    items.sort((a, b) => (a.deadline ?? 0) - (b.deadline ?? 0));
    pushSnap('Sorted tasks by deadline (greedy criterion: EDF).', 0, 'sorting');

    for (let i = 0; i < items.length; i++) {
      const task = items[i];
      items[i] = { ...task, state: 'considering' };
      pushSnap(
        `Scheduling task "${task.label}" (deadline: ${task.deadline}, duration: ${task.value}).`,
        1,
        'selecting'
      );

      const finishTime = currentTime + task.value;
      const lateness = Math.max(0, finishTime - (task.deadline ?? 0));
      maxLateness = Math.max(maxLateness, lateness);

      items[i] = { ...task, state: 'selected' };
      selected.push({ ...task, state: 'selected' });

      pushSnap(
        `Task "${task.label}" scheduled at time ${currentTime}-${finishTime}. Lateness: ${lateness}. Max lateness: ${maxLateness}.`,
        2,
        'selecting'
      );

      currentTime = finishTime;
    }

    items = items.map((it) => ({ ...it, state: 'optimal' }));
    pushSnap(
      `Task scheduling complete! All ${selected.length} tasks scheduled. Maximum lateness: ${maxLateness}.`,
      2,
      'done'
    );

    return snapshots;
  },
};
