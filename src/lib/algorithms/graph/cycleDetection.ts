import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { GraphData, GraphAlgorithmInput, DEFAULT_GRAPH_DATA } from './types';

export const cycleDetectionDFS: AlgorithmDefinition<GraphAlgorithmInput, GraphData> = {
  id: 'cycle-detection-dfs',
  name: 'Cycle Detection (DFS)',
  category: 'graph',
  categoryName: 'Graphs',
  description: 'Detects cycles in directed or undirected graphs using DFS.',
  difficulty: 'Medium',
  timeComplexity: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)' },
  spaceComplexity: 'O(V)',
  defaultInput: { graph: DEFAULT_GRAPH_DATA },
  inputConfig: { type: 'graph' },
  code: [
    'function DFS(u, parent):',
    '  mark u as visiting',
    '  for each neighbor v of u:',
    '    if v == parent: continue (undirected)',
    '    if v is visiting: cycle found',
    '    if v not visited: DFS(v, u)',
    '  mark u as visited',
  ],
  generate: (input?) => {
    const graph = input?.graph ?? DEFAULT_GRAPH_DATA;
    const isDirected = Boolean(graph.directed);
    const nodes = graph.nodes;
    const edges = graph.edges ?? [];
    const adj: Record<string, string[]> = {};

    for (const n of nodes) adj[n.id] = [];
    for (const e of edges) {
      adj[e.from].push(e.to);
      if (!isDirected) adj[e.to].push(e.from);
    }

    const visited = new Set<string>();
    const visiting = new Set<string>();
    const snapshots: Snapshot<GraphData>[] = [];
    let cycleFound = false;

    const dfs = (u: string, parent: string | null = null) => {
      if (cycleFound) return;
      visiting.add(u);

      snapshots.push({
        id: `${snapshots.length}`,
        step: snapshots.length,
        description: `Visiting ${u}.`,
        data: { ...graph, nodes: nodes.map(n => ({ ...n, state: n.id === u ? 'active' as const : 'default' as const })) },
        currentLine: 1,
        variables: { current: u, parent },
      });

      for (const v of adj[u]) {
        if (!isDirected && v === parent) continue;

        if (visiting.has(v)) {
          cycleFound = true;
          snapshots.push({
            id: `${snapshots.length}`,
            step: snapshots.length,
            description: `Cycle detected! Back edge from ${u} to ${v}.`,
            data: { ...graph, nodes: nodes.map(n => ({ ...n, state: [u, v].includes(n.id) ? 'path' as const : 'default' as const })) },
            currentLine: 4,
            variables: { cycleEdge: [u, v], hasCycle: true },
          });
          return;
        }

        if (!visited.has(v)) dfs(v, u);
      }

      visiting.delete(u);
      visited.add(u);
    };

    for (const n of nodes) {
      if (!visited.has(n.id) && !cycleFound) dfs(n.id);
    }

    if (!cycleFound) {
      snapshots.push({
        id: `${snapshots.length}`,
        step: snapshots.length,
        description: 'No cycle detected. Graph is acyclic.',
        data: { ...graph, nodes: nodes.map(n => ({ ...n, state: 'path' as const })) },
        currentLine: 6,
        variables: { hasCycle: false },
      });
    }

    return snapshots;
  },
};

export const cycleDetectionUnionFind: AlgorithmDefinition<GraphAlgorithmInput, GraphData> = {
  id: 'cycle-detection-union-find',
  name: 'Cycle Detection (Union-Find)',
  category: 'graph',
  categoryName: 'Graphs',
  description: 'Detects cycles in undirected graphs using Union-Find (Disjoint Set Union).',
  difficulty: 'Medium',
  timeComplexity: { best: 'O(E α(V))', average: 'O(E α(V))', worst: 'O(E α(V))' },
  spaceComplexity: 'O(V)',
  defaultInput: { graph: { ...DEFAULT_GRAPH_DATA, directed: false } },
  inputConfig: { type: 'graph' },
  code: [
    'Initialize Union-Find',
    'for each edge (u, v):',
    '  if Find(u) == Find(v): cycle found',
    '  Union(u, v)',
  ],
  generate: (input?) => {
    const graph = input?.graph ?? { ...DEFAULT_GRAPH_DATA, directed: false };
    const nodes = graph.nodes;
    const edges = graph.edges ?? [];

    class UF {
      parent: Record<string, string> = {};
      constructor(nodes: string[]) {
        for (const n of nodes) this.parent[n] = n;
      }
      find(x: string): string {
        if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x]);
        return this.parent[x];
      }
      union(x: string, y: string): boolean {
        const rootX = this.find(x);
        const rootY = this.find(y);
        if (rootX === rootY) return false;
        this.parent[rootX] = rootY;
        return true;
      }
    }

    const uf = new UF(nodes.map(n => n.id));
    const snapshots: Snapshot<GraphData>[] = [];
    let cycleFound = false;

    snapshots.push({
      id: '0',
      step: 0,
      description: 'Initialized Union-Find.',
      data: { ...graph, nodes: nodes.map(n => ({ ...n, state: 'default' as const })) },
      currentLine: 0,
      variables: {},
    });

    for (const e of edges) {
      if (uf.find(e.from) === uf.find(e.to)) {
        cycleFound = true;
        snapshots.push({
          id: `${snapshots.length}`,
          step: snapshots.length,
          description: `Cycle detected! Edge (${e.from}-${e.to}) connects vertices in same set.`,
          data: { ...graph, nodes: nodes.map(n => ({ ...n, state: [e.from, e.to].includes(n.id) ? 'path' as const : 'default' as const })) },
          currentLine: 2,
          variables: { cycleEdge: [e.from, e.to], hasCycle: true },
        });
        break;
      }

      uf.union(e.from, e.to);
      snapshots.push({
        id: `${snapshots.length}`,
        step: snapshots.length,
        description: `Processed edge (${e.from}-${e.to}). Union performed.`,
        data: { ...graph, nodes: nodes.map(n => ({ ...n, state: 'default' as const })) },
        currentLine: 3,
        variables: {},
      });
    }

    if (!cycleFound) {
      snapshots.push({
        id: `${snapshots.length}`,
        step: snapshots.length,
        description: 'No cycle detected.',
        data: { ...graph, nodes: nodes.map(n => ({ ...n, state: 'path' as const })) },
        currentLine: 3,
        variables: { hasCycle: false },
      });
    }

    return snapshots;
  },
};
