import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { GraphData, GraphAlgorithmInput, DEFAULT_GRAPH_DATA } from './types';

class UnionFind {
  parent: Record<string, string> = {};
  rank: Record<string, number> = {};

  constructor(nodes: string[]) {
    for (const n of nodes) {
      this.parent[n] = n;
      this.rank[n] = 0;
    }
  }

  find(x: string): string {
    if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x]);
    return this.parent[x];
  }

  union(x: string, y: string): boolean {
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

function edgeKey(from: string, to: string): string {
  return from < to ? `${from}-${to}` : `${to}-${from}`;
}

export const kruskalMST: AlgorithmDefinition<GraphAlgorithmInput, GraphData> = {
  id: 'kruskal-mst',
  name: "Kruskal's MST Algorithm",
  category: 'graph',
  categoryName: 'Graphs',
  description: 'Finds Minimum Spanning Tree by sorting edges and using Union-Find to avoid cycles.',
  difficulty: 'Medium',
  timeComplexity: { best: 'O(E log E)', average: 'O(E log E)', worst: 'O(E log E)' },
  spaceComplexity: 'O(V + E)',
  defaultInput: { graph: { ...DEFAULT_GRAPH_DATA, directed: false } },
  inputConfig: { type: 'graph' },
  code: [
    'Sort all edges by weight',
    'Initialize Union-Find',
    'for each edge (u, v, w) in sorted order:',
    '  if u and v in different components:',
    '    Add edge to MST',
    '    Union(u, v)',
  ],
  generate: (input?) => {
    const graph = input?.graph ?? { ...DEFAULT_GRAPH_DATA, directed: false };
    const nodes = graph.nodes;
    const edges = (graph.edges ?? []).slice().sort((a, b) => (a.weight ?? 1) - (b.weight ?? 1));
    const uf = new UnionFind(nodes.map(n => n.id));
    const mstEdges: string[] = [];
    const snapshots: Snapshot<GraphData>[] = [];

    const edgeStates: Record<string, any> = {};
    for (const e of edges) edgeStates[edgeKey(e.from, e.to)] = 'default';

    snapshots.push({
      id: '0',
      step: 0,
      description: 'Sorted edges by weight. Initialized Union-Find.',
      data: {
        ...graph,
        nodes: nodes.map(n => ({ ...n, state: 'default' as const })),
        edges: edges.map(e => ({ ...e, state: 'default' as const })),
      },
      currentLine: 0,
      variables: { mstEdges: [] },
    });

    let totalWeight = 0;
    for (const e of edges) {
      const w = e.weight ?? 1;
      const eKey = edgeKey(e.from, e.to);

      if (uf.union(e.from, e.to)) {
        edgeStates[eKey] = 'path';
        mstEdges.push(eKey);
        totalWeight += w;

        snapshots.push({
          id: `${snapshots.length}`,
          step: snapshots.length,
          description: `Added edge (${e.from}-${e.to}) weight ${w} to MST. Total weight: ${totalWeight}.`,
          data: {
            ...graph,
            nodes: nodes.map(n => ({ ...n, state: 'path' as const })),
            edges: edges.map(e => ({ ...e, state: edgeStates[edgeKey(e.from, e.to)] ?? 'default' })),
          },
          currentLine: 4,
          variables: { mstEdges: [...mstEdges], totalWeight },
        });

        if (mstEdges.length === nodes.length - 1) break;
      } else {
        snapshots.push({
          id: `${snapshots.length}`,
          step: snapshots.length,
          description: `Edge (${e.from}-${e.to}) forms cycle. Rejected.`,
          data: {
            ...graph,
            nodes: nodes.map(n => ({ ...n, state: 'default' as const })),
            edges: edges.map(e => ({ ...e, state: edgeStates[edgeKey(e.from, e.to)] ?? 'default' })),
          },
          currentLine: 3,
          variables: { mstEdges: [...mstEdges], totalWeight },
        });
      }
    }

    snapshots.push({
      id: `${snapshots.length}`,
      step: snapshots.length,
      description: `Kruskal's MST complete! ${mstEdges.length} edges, total weight: ${totalWeight}.`,
      data: {
        ...graph,
        nodes: nodes.map(n => ({ ...n, state: 'path' as const })),
        edges: edges.map(e => ({ ...e, state: edgeStates[edgeKey(e.from, e.to)] ?? 'default' })),
      },
      currentLine: 5,
      variables: { mstEdges, totalWeight },
    });

    return snapshots;
  },
};
