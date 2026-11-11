import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { GreedyData, GreedyItem, KruskalInput } from '@/lib/types/greedy';

const DEFAULT_INPUT: KruskalInput = {
  vertices: 4,
  edges: [
    { from: 0, to: 1, weight: 10 },
    { from: 0, to: 2, weight: 6 },
    { from: 0, to: 3, weight: 5 },
    { from: 1, to: 3, weight: 15 },
    { from: 2, to: 3, weight: 4 },
  ],
};

class UnionFind {
  parent: number[];
  rank: number[];

  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = Array(n).fill(0);
  }

  find(x: number): number {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]);
    }
    return this.parent[x];
  }

  union(x: number, y: number): boolean {
    const rootX = this.find(x);
    const rootY = this.find(y);
    if (rootX === rootY) return false;

    if (this.rank[rootX] < this.rank[rootY]) {
      this.parent[rootX] = rootY;
    } else if (this.rank[rootX] > this.rank[rootY]) {
      this.parent[rootY] = rootX;
    } else {
      this.parent[rootY] = rootX;
      this.rank[rootX]++;
    }
    return true;
  }
}

export const kruskal: AlgorithmDefinition<KruskalInput, GreedyData> = {
  id: 'kruskal-mst-greedy',
  name: "Kruskal's MST (Greedy)",
  category: 'greedy',
  categoryName: 'Greedy',
  description:
    'Find Minimum Spanning Tree by sorting edges by weight and greedily adding non-cycle-forming edges using Union-Find.',
  difficulty: 'Medium',
  timeComplexity: {
    best: 'O(E log E)',
    average: 'O(E log E)',
    worst: 'O(E log E)',
  },
  spaceComplexity: 'O(V + E)',
  defaultInput: DEFAULT_INPUT,
  inputConfig: {
    type: 'graph',
    supportsCustomInput: true,
  },
  code: [
    'Sort edges by weight (ascending)',
    'Initialize Union-Find for V vertices',
    'For each edge (u, v, w):',
    '  If u and v in different components:',
    '    Add edge to MST',
    '    Union(u, v)',
  ],
  generate: (input?: KruskalInput): Snapshot<GreedyData>[] => {
    const vertices = Math.max(2, input?.vertices ?? DEFAULT_INPUT.vertices);
    const edges = (input?.edges ?? DEFAULT_INPUT.edges).filter(
      (e) => e.from >= 0 && e.to >= 0 && e.from < vertices && e.to < vertices && e.from !== e.to
    );

    const snapshots: Snapshot<GreedyData>[] = [];
    const uf = new UnionFind(vertices);

    let items: GreedyItem[] = edges.map((e, i) => ({
      id: `edge-${i}`,
      label: `${e.from}-${e.to}`,
      value: e.weight,
      weight: e.weight,
      state: 'available' as const,
    }));

    const selected: GreedyItem[] = [];
    let totalWeight = 0;

    const pushSnap = (desc: string, line: number, phase: GreedyData['phase']) => {
      snapshots.push({
        id: `kr-${snapshots.length}`,
        step: snapshots.length,
        description: desc,
        data: {
          items: items.map((it) => ({ ...it })),
          selected: selected.map((s) => ({ ...s })),
          totalValue: totalWeight,
          phase,
          criterion: 'Minimum weight edge',
        },
        currentLine: line,
        variables: { vertices, totalEdges: edges.length, mstEdges: selected.length },
      });
    };

    pushSnap(`Kruskal's MST for ${vertices} vertices and ${edges.length} edges.`, 0, 'init');

    items.sort((a, b) => a.value - b.value);
    pushSnap('Sorted edges by weight (greedy criterion).', 0, 'sorting');

    for (let i = 0; i < items.length; i++) {
      const edge = edges.find((e) => `${e.from}-${e.to}` === items[i].label || `${e.to}-${e.from}` === items[i].label);
      if (!edge) continue;

      items[i] = { ...items[i], state: 'considering' };
      pushSnap(
        `Considering edge ${items[i].label} with weight ${items[i].value}.`,
        2,
        'selecting'
      );

      if (uf.union(edge.from, edge.to)) {
        items[i] = { ...items[i], state: 'selected' };
        selected.push({ ...items[i] });
        totalWeight += items[i].value;
        pushSnap(
          `Edge ${items[i].label} connects different components. ADDED to MST! Total weight: ${totalWeight}.`,
          4,
          'selecting'
        );
      } else {
        items[i] = { ...items[i], state: 'rejected' };
        pushSnap(
          `Edge ${items[i].label} forms a cycle. REJECTED.`,
          5,
          'selecting'
        );
      }

      if (selected.length === vertices - 1) {
        break;
      }
    }

    items = items.map((it) => (it.state === 'selected' ? { ...it, state: 'optimal' } : it));
    pushSnap(
      `Kruskal's MST complete! Selected ${selected.length} edges with total weight: ${totalWeight}.`,
      5,
      'done'
    );

    return snapshots;
  },
};
