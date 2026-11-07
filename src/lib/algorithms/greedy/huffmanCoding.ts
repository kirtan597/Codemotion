import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { GreedyData, GreedyItem, HuffmanCodingInput } from '@/lib/types/greedy';

const DEFAULT_INPUT: HuffmanCodingInput = {
  text: 'ABRACADABRA',
};

export const huffmanCoding: AlgorithmDefinition<HuffmanCodingInput, GreedyData> = {
  id: 'huffman-coding',
  name: 'Huffman Coding',
  category: 'greedy',
  categoryName: 'Greedy',
  description:
    'Build optimal prefix-free binary code by repeatedly merging two nodes with smallest frequencies.',
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
    'Count character frequencies',
    'Create leaf node for each character',
    'While more than one node:',
    '  Extract two nodes with min frequency',
    '  Create parent with sum frequency',
    '  Insert parent back into priority queue',
    'Assign binary codes based on tree',
  ],
  generate: (input?: HuffmanCodingInput): Snapshot<GreedyData>[] => {
    const text = (input?.text ?? DEFAULT_INPUT.text).slice(0, 100);
    const snapshots: Snapshot<GreedyData>[] = [];

    // Count frequencies
    const freqMap: Record<string, number> = {};
    for (const char of text) {
      freqMap[char] = (freqMap[char] || 0) + 1;
    }

    const chars = Object.keys(freqMap).sort();
    let items: GreedyItem[] = chars.map((char, i) => ({
      id: `hc-${i}`,
      label: char,
      value: freqMap[char],
      state: 'available' as const,
    }));

    const selected: GreedyItem[] = [];

    const pushSnap = (desc: string, line: number, phase: GreedyData['phase']) => {
      snapshots.push({
        id: `hc-${snapshots.length}`,
        step: snapshots.length,
        description: desc,
        data: {
          items: items.map((it) => ({ ...it })),
          selected: selected.map((s) => ({ ...s })),
          totalValue: selected.length,
          phase,
          criterion: 'Smallest frequency first',
        },
        currentLine: line,
        variables: { textLength: text.length, uniqueChars: chars.length },
      });
    };

    pushSnap(`Huffman Coding for text: "${text}". Counted ${chars.length} unique characters.`, 0, 'init');

    // Simulate priority queue merging
    let nodeId = chars.length;
    let nodes = [...items];

    while (nodes.length > 1) {
      nodes.sort((a, b) => a.value - b.value);
      const node1 = nodes.shift()!;
      const node2 = nodes.shift()!;

      items = items.map((it) =>
        it.id === node1.id || it.id === node2.id ? { ...it, state: 'considering' } : it
      );
      pushSnap(
        `Merging "${node1.label}" (freq: ${node1.value}) and "${node2.label}" (freq: ${node2.value}).`,
        3,
        'selecting'
      );

      const parent: GreedyItem = {
        id: `node-${nodeId++}`,
        label: `[${node1.label}+${node2.label}]`,
        value: node1.value + node2.value,
        state: 'selected',
      };

      nodes.push(parent);
      selected.push(parent);

      items = items.map((it) =>
        it.id === node1.id || it.id === node2.id ? { ...it, state: 'selected' } : it
      );
      items.push(parent);

      pushSnap(
        `Created parent node "${parent.label}" with frequency ${parent.value}.`,
        4,
        'selecting'
      );
    }

    items = items.map((it) => ({ ...it, state: 'optimal' }));
    pushSnap(
      `Huffman tree construction complete! Root frequency: ${nodes[0].value}. Optimal prefix code built.`,
      6,
      'done'
    );

    return snapshots;
  },
};
