import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { GreedyData, GreedyItem, JobSequencingInput } from '@/lib/types/greedy';

const DEFAULT_INPUT: JobSequencingInput = {
  jobs: [
    { id: 'J1', deadline: 2, profit: 100 },
    { id: 'J2', deadline: 1, profit: 19 },
    { id: 'J3', deadline: 2, profit: 27 },
    { id: 'J4', deadline: 1, profit: 25 },
    { id: 'J5', deadline: 3, profit: 15 },
  ],
};

export const jobSequencing: AlgorithmDefinition<JobSequencingInput, GreedyData> = {
  id: 'job-sequencing',
  name: 'Job Sequencing with Deadlines',
  category: 'greedy',
  categoryName: 'Greedy',
  description:
    'Maximize profit by scheduling jobs before their deadlines. Greedy choice: sort by profit (descending).',
  difficulty: 'Medium',
  timeComplexity: {
    best: 'O(n²)',
    average: 'O(n²)',
    worst: 'O(n²)',
  },
  spaceComplexity: 'O(n)',
  defaultInput: DEFAULT_INPUT,
  inputConfig: {
    type: 'array',
    supportsCustomInput: true,
  },
  code: [
    'Sort jobs by profit (descending)',
    'Find maximum deadline',
    'For each job:',
    '  Find latest available slot before deadline',
    '  If slot exists: schedule job',
    '  Else: skip job',
  ],
  generate: (input?: JobSequencingInput): Snapshot<GreedyData>[] => {
    const jobs = (input?.jobs ?? DEFAULT_INPUT.jobs).filter(
      (j) => j.deadline > 0 && j.profit >= 0
    );

    const snapshots: Snapshot<GreedyData>[] = [];
    const maxDeadline = Math.max(...jobs.map((j) => j.deadline));
    const slots: (string | null)[] = Array(maxDeadline).fill(null);

    let items: GreedyItem[] = jobs.map((j, i) => ({
      id: `job-${i}`,
      label: j.id,
      value: j.profit,
      deadline: j.deadline,
      profit: j.profit,
      state: 'available' as const,
    }));

    const selected: GreedyItem[] = [];
    let totalProfit = 0;

    const pushSnap = (desc: string, line: number, phase: GreedyData['phase']) => {
      snapshots.push({
        id: `js-${snapshots.length}`,
        step: snapshots.length,
        description: desc,
        data: {
          items: items.map((it) => ({ ...it })),
          selected: selected.map((s) => ({ ...s })),
          totalValue: totalProfit,
          phase,
          criterion: 'Highest profit first',
          extra: { slots: [...slots] },
        },
        currentLine: line,
        variables: { maxDeadline, slotsUsed: selected.length },
      });
    };

    pushSnap('Initialized job sequencing problem.', 0, 'init');

    // Sort by profit (descending)
    items.sort((a, b) => (b.profit ?? 0) - (a.profit ?? 0));
    pushSnap('Sorted jobs by profit (greedy criterion).', 0, 'sorting');

    for (let i = 0; i < items.length; i++) {
      const job = items[i];
      items[i] = { ...job, state: 'considering' };
      pushSnap(
        `Considering job "${job.label}" (profit: ${job.profit}, deadline: ${job.deadline}).`,
        2,
        'selecting'
      );

      // Find latest available slot before deadline
      let slot = -1;
      for (let t = Math.min((job.deadline ?? 1) - 1, maxDeadline - 1); t >= 0; t--) {
        if (!slots[t]) {
          slot = t;
          break;
        }
      }

      if (slot >= 0) {
        slots[slot] = job.label;
        items[i] = { ...job, state: 'selected' };
        selected.push({ ...job, state: 'selected' });
        totalProfit += job.profit ?? 0;
        pushSnap(
          `Scheduled job "${job.label}" in slot ${slot + 1}. Total profit: ${totalProfit}.`,
          4,
          'selecting'
        );
      } else {
        items[i] = { ...job, state: 'rejected' };
        pushSnap(
          `No available slot for job "${job.label}" before deadline ${job.deadline}. SKIPPED.`,
          5,
          'selecting'
        );
      }
    }

    items = items.map((it) => (it.state === 'selected' ? { ...it, state: 'optimal' } : it));
    pushSnap(
      `Job sequencing complete! Scheduled ${selected.length} jobs with total profit: ${totalProfit}.`,
      5,
      'done'
    );

    return snapshots;
  },
};
