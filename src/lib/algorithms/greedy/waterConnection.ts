import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { GreedyData, GreedyItem, WaterConnectionInput } from '@/lib/types/greedy';

const DEFAULT_INPUT: WaterConnectionInput = {
  houses: 7,
  pipes: [
    { from: 1, to: 2, diameter: 60, length: 100 },
    { from: 2, to: 3, diameter: 40, length: 150 },
    { from: 3, to: 4, diameter: 80, length: 120 },
    { from: 5, to: 6, diameter: 70, length: 90 },
    { from: 6, to: 7, diameter: 50, length: 110 },
  ],
};

export const waterConnection: AlgorithmDefinition<WaterConnectionInput, GreedyData> = {
  id: 'water-connection',
  name: 'Water Connection',
  category: 'greedy',
  categoryName: 'Greedy',
  description:
    'Connect water supply by finding optimal pipe paths. Greedy selection based on diameter constraints.',
  difficulty: 'Hard',
  timeComplexity: {
    best: 'O(n)',
    average: 'O(n)',
    worst: 'O(n)',
  },
  spaceComplexity: 'O(n)',
  defaultInput: DEFAULT_INPUT,
  inputConfig: {
    type: 'graph',
    supportsCustomInput: true,
  },
  code: [
    'Build graph from pipes',
    'For each source house (no incoming):',
    '  Trace path to sink (no outgoing)',
    '  Track minimum diameter and total length',
  ],
  generate: (input?: WaterConnectionInput): Snapshot<GreedyData>[] => {
    const houses = Math.max(2, input?.houses ?? DEFAULT_INPUT.houses);
    const pipes = (input?.pipes ?? DEFAULT_INPUT.pipes).filter(
      (p) => p.from > 0 && p.to > 0 && p.from <= houses && p.to <= houses
    );

    const snapshots: Snapshot<GreedyData>[] = [];
    
    // Build adjacency
    const outgoing: Map<number, { to: number; diameter: number; length: number }> = new Map();
    const incoming = new Set<number>();
    
    for (const pipe of pipes) {
      outgoing.set(pipe.from, { to: pipe.to, diameter: pipe.diameter, length: pipe.length });
      incoming.add(pipe.to);
    }

    let items: GreedyItem[] = pipes.map((p, i) => ({
      id: `pipe-${i}`,
      label: `${p.from}→${p.to}`,
      value: p.diameter,
      weight: p.length,
      state: 'available' as const,
    }));

    const selected: GreedyItem[] = [];
    const paths: string[] = [];

    const pushSnap = (desc: string, line: number, phase: GreedyData['phase']) => {
      snapshots.push({
        id: `wc-${snapshots.length}`,
        step: snapshots.length,
        description: desc,
        data: {
          items: items.map((it) => ({ ...it })),
          selected: selected.map((s) => ({ ...s })),
          totalValue: paths.length,
          phase,
          criterion: 'Trace source to sink paths',
          extra: { paths },
        },
        currentLine: line,
        variables: { houses, pipes: pipes.length, pathsFound: paths.length },
      });
    };

    pushSnap(`Water connection for ${houses} houses with ${pipes.length} pipes.`, 0, 'init');

    // Find sources (no incoming)
    for (let h = 1; h <= houses; h++) {
      if (!incoming.has(h) && outgoing.has(h)) {
        let current = h;
        let minDiameter = Infinity;
        let totalLength = 0;
        const pathHouses = [current];

        pushSnap(`Tracing path from source house ${h}.`, 1, 'selecting');

        while (outgoing.has(current)) {
          const pipe = outgoing.get(current)!;
          const pipeIdx = items.findIndex(
            (it) => it.label === `${current}→${pipe.to}` && it.state !== 'selected'
          );

          if (pipeIdx >= 0) {
            items[pipeIdx] = { ...items[pipeIdx], state: 'considering' };
          }

          pushSnap(
            `Following pipe ${current}→${pipe.to} (diameter: ${pipe.diameter}, length: ${pipe.length}).`,
            2,
            'selecting'
          );

          minDiameter = Math.min(minDiameter, pipe.diameter);
          totalLength += pipe.length;
          pathHouses.push(pipe.to);

          if (pipeIdx >= 0) {
            items[pipeIdx] = { ...items[pipeIdx], state: 'selected' };
            selected.push({ ...items[pipeIdx] });
          }

          current = pipe.to;
        }

        const pathStr = `${h}→${current}: diameter=${minDiameter}, length=${totalLength}`;
        paths.push(pathStr);

        pushSnap(
          `Completed path: ${pathStr}.`,
          3,
          'selecting'
        );
      }
    }

    items = items.map((it) => (it.state === 'selected' ? { ...it, state: 'optimal' } : it));
    pushSnap(
      `Water connection complete! Found ${paths.length} source-to-sink paths.`,
      3,
      'done'
    );

    return snapshots;
  },
};
