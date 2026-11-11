import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { GreedyData, GreedyItem, PrimInput } from '@/lib/types/greedy';

const DEFAULT_INPUT: PrimInput = {
  vertices: 5,
  edges: [
    { from: 0, to: 1, weight: 2 },
    { from: 0, to: 3, weight: 6 },
    { from: 1, to: 2, weight: 3 },
    { from: 1, to: 3, weight: 8 },
    { from: 1, to: 4, weight: 5 },
    { from: 2, to: 4, weight: 7 },
    { from: 3, to: 4, weight: 9 },
  ],
};

export const prim: AlgorithmDefinition<PrimInput, GreedyData> = {
  id: 'prim-mst-greedy',
  name: "Prim's MST (Greedy)",
  category: 'greedy',
  categoryName: 'Greedy',
  description:
    'Find Minimum Spanning Tree by starting from a vertex and greedily adding minimum weight edge connecting tree to new vertex.',
  difficulty: 'Medium',
  timeComplexity: {
    best: 'O(E log V)',
    average: 'O(E log V)',
    worst: 'O(E log V)',
  },
  spaceComplexity: 'O(V + E)',
  defaultInput: DEFAULT_INPUT,
  inputConfig: {
    type: 'graph',
    supportsCustomInput: true,
  },
  code: [
    'Start with arbitrary vertex in MST',
    'While MST has fewer than V-1 edges:',
    '  Find minimum weight edge connecting MST to new vertex',
    '  Add edge and vertex to MST',
    '  Update candidate edges',
  ],
  generate: (input?: PrimInput): Snapshot<GreedyData>[] => {
    const vertices = Math.max(2, input?.vertices ?? DEFAULT_INPUT.vertices);
    const edges = (input?.edges ?? DEFAULT_INPUT.edges).filter(
      (e) => e.from >= 0 && e.to >= 0 && e.from < vertices && e.to < vertices && e.from !== e.to
    );

    const snapshots: Snapshot<GreedyData>[] = [];
    const inMST = new Set<number>([0]);
    
    // Build adjacency list
    const adj: Array<Array<{ to: number; weight: number }>> = Array.from({ length: vertices }, () => []);
    for (const e of edges) {
      adj[e.from].push({ to: e.to, weight: e.weight });
      adj[e.to].push({ to: e.from, weight: e.weight });
    }

    let items: GreedyItem[] = [];
    const selected: GreedyItem[] = [];
    let totalWeight = 0;

    const pushSnap = (desc: string, line: number, phase: GreedyData['phase']) => {
      snapshots.push({
        id: `pr-${snapshots.length}`,
        step: snapshots.length,
        description: desc,
        data: {
          items: items.map((it) => ({ ...it })),
          selected: selected.map((s) => ({ ...s })),
          totalValue: totalWeight,
          phase,
          criterion: 'Minimum edge from MST',
        },
        currentLine: line,
        variables: { vertices, mstSize: inMST.size, mstEdges: selected.length },
      });
    };

    pushSnap(`Prim's MST starting from vertex 0. Total vertices: ${vertices}.`, 0, 'init');

    while (inMST.size < vertices) {
      // Find all candidate edges from MST to outside
      items = [];
      for (const v of inMST) {
        for (const { to, weight } of adj[v]) {
          if (!inMST.has(to)) {
            const id = `${Math.min(v, to)}-${Math.max(v, to)}`;
            if (!items.find((it) => it.id === id)) {
              items.push({
                id,
                label: `${v}-${to}`,
                value: weight,
                weight,
                state: 'available',
              });
            }
          }
        }
      }

      if (items.length === 0) break;

      items.sort((a, b) => a.value - b.value);
      pushSnap(
        `MST has ${inMST.size} vertices. Found ${items.length} candidate edges.`,
        1,
        'selecting'
      );

      const minEdge = items[0];
      items[0] = { ...minEdge, state: 'considering' };
      pushSnap(
        `Minimum edge: ${minEdge.label} with weight ${minEdge.value}.`,
        2,
        'selecting'
      );

      const [u, v] = minEdge.label.split('-').map(Number);
      const newVertex = inMST.has(u) ? v : u;
      inMST.add(newVertex);

      items[0] = { ...minEdge, state: 'selected' };
      selected.push({ ...minEdge, state: 'selected' });
      totalWeight += minEdge.value;

      pushSnap(
        `Added edge ${minEdge.label} to MST. Vertex ${newVertex} joined. Total weight: ${totalWeight}.`,
        3,
        'selecting'
      );

      if (selected.length === vertices - 1) break;
    }

    items = items.map((it) => (it.state === 'selected' ? { ...it, state: 'optimal' } : it));
    pushSnap(
      `Prim's MST complete! Selected ${selected.length} edges with total weight: ${totalWeight}.`,
      4,
      'done'
    );

    return snapshots;
  },
};
