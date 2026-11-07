import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { GreedyData, GreedyItem, GraphColoringGreedyInput } from '@/lib/types/greedy';

const DEFAULT_INPUT: GraphColoringGreedyInput = {
  vertices: 5,
  edges: [
    [0, 1],
    [0, 2],
    [1, 2],
    [1, 3],
    [2, 3],
    [3, 4],
  ],
};

export const graphColoringGreedy: AlgorithmDefinition<GraphColoringGreedyInput, GreedyData> = {
  id: 'graph-coloring-greedy',
  name: 'Graph Coloring (Greedy)',
  category: 'greedy',
  categoryName: 'Greedy',
  description:
    'Color graph vertices using minimum colors such that no adjacent vertices share same color. Greedy approach.',
  difficulty: 'Medium',
  timeComplexity: {
    best: 'O(V + E)',
    average: 'O(V + E)',
    worst: 'O(V²)',
  },
  spaceComplexity: 'O(V)',
  defaultInput: DEFAULT_INPUT,
  inputConfig: {
    type: 'graph',
    supportsCustomInput: true,
  },
  code: [
    'For each vertex v:',
    '  Find colors used by adjacent vertices',
    '  Assign smallest available color to v',
  ],
  generate: (input?: GraphColoringGreedyInput): Snapshot<GreedyData>[] => {
    const vertices = Math.max(2, input?.vertices ?? DEFAULT_INPUT.vertices);
    const edges = (input?.edges ?? DEFAULT_INPUT.edges).filter(
      ([u, v]) => u >= 0 && v >= 0 && u < vertices && v < vertices && u !== v
    );

    const snapshots: Snapshot<GreedyData>[] = [];
    
    // Build adjacency list
    const adj: Set<number>[] = Array.from({ length: vertices }, () => new Set());
    for (const [u, v] of edges) {
      adj[u].add(v);
      adj[v].add(u);
    }

    const colors: number[] = Array(vertices).fill(-1);
    let maxColor = 0;

    let items: GreedyItem[] = Array.from({ length: vertices }, (_, i) => ({
      id: `v${i}`,
      label: `V${i}`,
      value: -1,
      state: 'available' as const,
    }));

    const selected: GreedyItem[] = [];

    const pushSnap = (desc: string, line: number, phase: GreedyData['phase']) => {
      snapshots.push({
        id: `gc-${snapshots.length}`,
        step: snapshots.length,
        description: desc,
        data: {
          items: items.map((it) => ({ ...it })),
          selected: selected.map((s) => ({ ...s })),
          totalValue: maxColor + 1,
          phase,
          criterion: 'Smallest available color',
        },
        currentLine: line,
        variables: { vertices, edges: edges.length, colorsUsed: maxColor + 1 },
      });
    };

    pushSnap(`Graph coloring for ${vertices} vertices and ${edges.length} edges.`, 0, 'init');

    for (let v = 0; v < vertices; v++) {
      items[v] = { ...items[v], state: 'considering' };
      pushSnap(`Coloring vertex V${v}. Checking neighbors...`, 0, 'selecting');

      // Find colors used by neighbors
      const usedColors = new Set<number>();
      for (const neighbor of adj[v]) {
        if (colors[neighbor] !== -1) {
          usedColors.add(colors[neighbor]);
        }
      }

      // Find smallest available color
      let color = 0;
      while (usedColors.has(color)) {
        color++;
      }

      colors[v] = color;
      maxColor = Math.max(maxColor, color);

      items[v] = { ...items[v], value: color, state: 'selected' };
      selected.push({ ...items[v] });

      pushSnap(
        `Assigned color ${color} to V${v}. Neighbors have colors: [${[...usedColors].join(', ') || 'none'}].`,
        1,
        'selecting'
      );
    }

    items = items.map((it) => ({ ...it, state: 'optimal' }));
    pushSnap(
      `Graph coloring complete! Used ${maxColor + 1} colors (chromatic number ≤ ${maxColor + 1}).`,
      1,
      'done'
    );

    return snapshots;
  },
};
