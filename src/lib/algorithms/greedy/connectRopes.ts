import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { GreedyData, GreedyItem, ConnectRopesInput } from '@/lib/types/greedy';

const DEFAULT_INPUT: ConnectRopesInput = {
  ropes: [4, 3, 2, 6],
};

export const connectRopes: AlgorithmDefinition<ConnectRopesInput, GreedyData> = {
  id: 'connect-ropes',
  name: 'Connect Ropes (Min Cost)',
  category: 'greedy',
  categoryName: 'Greedy',
  description:
    'Connect ropes with minimum cost by always connecting two shortest ropes first (similar to Huffman Coding).',
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
    'Create min-heap with all rope lengths',
    'While more than one rope:',
    '  Extract two shortest ropes',
    '  Connect them (cost = sum of lengths)',
    '  Insert combined rope back',
    'Return total cost',
  ],
  generate: (input?: ConnectRopesInput): Snapshot<GreedyData>[] => {
    const ropes = (input?.ropes ?? DEFAULT_INPUT.ropes).filter((r) => r > 0);
    const snapshots: Snapshot<GreedyData>[] = [];

    let items: GreedyItem[] = ropes.map((len, i) => ({
      id: `rope-${i}`,
      label: `R${i + 1}`,
      value: len,
      state: 'available' as const,
    }));

    const selected: GreedyItem[] = [];
    let totalCost = 0;
    let heap = [...ropes];
    let nextId = ropes.length;

    const pushSnap = (desc: string, line: number, phase: GreedyData['phase']) => {
      snapshots.push({
        id: `cr-${snapshots.length}`,
        step: snapshots.length,
        description: desc,
        data: {
          items: items.map((it) => ({ ...it })),
          selected: selected.map((s) => ({ ...s })),
          totalValue: totalCost,
          phase,
          criterion: 'Connect two shortest ropes',
        },
        currentLine: line,
        variables: { totalCost, ropesRemaining: heap.length },
      });
    };

    pushSnap(`Connect ${ropes.length} ropes with minimum cost.`, 0, 'init');

    while (heap.length > 1) {
      heap.sort((a, b) => a - b);
      const rope1 = heap.shift()!;
      const rope2 = heap.shift()!;

      // Find items to merge
      const idx1 = items.findIndex((it) => it.value === rope1 && it.state !== 'selected');
      const idx2 = items.findIndex((it) => it.value === rope2 && it.state !== 'selected');

      if (idx1 >= 0) items[idx1] = { ...items[idx1], state: 'considering' };
      if (idx2 >= 0) items[idx2] = { ...items[idx2], state: 'considering' };

      pushSnap(
        `Connecting ropes of length ${rope1} and ${rope2}.`,
        2,
        'selecting'
      );

      const cost = rope1 + rope2;
      totalCost += cost;
      heap.push(cost);

      if (idx1 >= 0) items[idx1] = { ...items[idx1], state: 'selected' };
      if (idx2 >= 0) items[idx2] = { ...items[idx2], state: 'selected' };

      const newRope: GreedyItem = {
        id: `rope-${nextId++}`,
        label: `R(${rope1}+${rope2})`,
        value: cost,
        state: 'selected',
      };
      items.push(newRope);
      selected.push(newRope);

      pushSnap(
        `Connected! Cost: ${cost}. Total cost so far: ${totalCost}. Ropes remaining: ${heap.length}.`,
        3,
        'selecting'
      );
    }

    items = items.map((it) => (it.state === 'selected' ? { ...it, state: 'optimal' } : it));
    pushSnap(
      `All ropes connected! Minimum total cost: ${totalCost}.`,
      5,
      'done'
    );

    return snapshots;
  },
};
