import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { GraphData, GraphAlgorithmInput, DEFAULT_GRAPH_DATA } from './types';

export const topologicalSortKahn: AlgorithmDefinition<GraphAlgorithmInput, GraphData> = {
  id: 'topological-sort-kahn',
  name: "Kahn's Topological Sort",
  category: 'graph',
  categoryName: 'Graphs',
  description: 'Topological ordering of DAG using BFS and in-degree tracking.',
  difficulty: 'Medium',
  timeComplexity: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)' },
  spaceComplexity: 'O(V)',
  defaultInput: { graph: { ...DEFAULT_GRAPH_DATA, directed: true } },
  inputConfig: { type: 'graph' },
  code: [
    'Calculate in-degree for all vertices',
    'Enqueue all vertices with in-degree 0',
    'while queue not empty:',
    '  u = queue.dequeue()',
    '  add u to result',
    '  for each neighbor v of u:',
    '    decrease in-degree[v]',
    '    if in-degree[v] == 0: enqueue v',
  ],
  generate: (input?) => {
    const graph = input?.graph ?? { ...DEFAULT_GRAPH_DATA, directed: true };
    const nodes = graph.nodes;
    const edges = graph.edges ?? [];
    const inDegree: Record<string, number> = {};
    const adj: Record<string, string[]> = {};

    for (const n of nodes) {
      inDegree[n.id] = 0;
      adj[n.id] = [];
    }
    for (const e of edges) {
      adj[e.from].push(e.to);
      inDegree[e.to]++;
    }

    const queue: string[] = [];
    const result: string[] = [];
    const snapshots: Snapshot<GraphData>[] = [];

    for (const n of nodes) {
      if (inDegree[n.id] === 0) queue.push(n.id);
    }

    snapshots.push({
      id: '0',
      step: 0,
      description: `Initialized. ${queue.length} vertices with in-degree 0.`,
      data: { ...graph, nodes: nodes.map(n => ({ ...n, state: 'default' as const })) },
      currentLine: 0,
      variables: { inDegree: { ...inDegree }, queue: [...queue], result: [] },
    });

    while (queue.length > 0) {
      const u = queue.shift()!;
      result.push(u);

      snapshots.push({
        id: `${snapshots.length}`,
        step: snapshots.length,
        description: `Processed ${u}. Added to topological order.`,
        data: { ...graph, nodes: nodes.map(n => ({ ...n, state: n.id === u ? 'path' as const : 'default' as const })) },
        currentLine: 4,
        variables: { current: u, queue: [...queue], result: [...result] },
      });

      for (const v of adj[u]) {
        inDegree[v]--;
        if (inDegree[v] === 0) queue.push(v);
      }
    }

    if (result.length !== nodes.length) {
      snapshots.push({
        id: `${snapshots.length}`,
        step: snapshots.length,
        description: 'Cycle detected! Graph is not a DAG.',
        data: { ...graph, nodes: nodes.map(n => ({ ...n, state: 'default' as const })) },
        currentLine: 7,
        variables: { result: [...result], hasCycle: true },
      });
    } else {
      snapshots.push({
        id: `${snapshots.length}`,
        step: snapshots.length,
        description: `Topological order: ${result.join(' → ')}.`,
        data: { ...graph, nodes: nodes.map(n => ({ ...n, state: 'path' as const })) },
        currentLine: 7,
        variables: { result },
      });
    }

    return snapshots;
  },
};

export const topologicalSortDFS: AlgorithmDefinition<GraphAlgorithmInput, GraphData> = {
  id: 'topological-sort-dfs',
  name: 'DFS-Based Topological Sort',
  category: 'graph',
  categoryName: 'Graphs',
  description: 'Topological ordering using DFS post-order traversal.',
  difficulty: 'Medium',
  timeComplexity: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)' },
  spaceComplexity: 'O(V)',
  defaultInput: { graph: { ...DEFAULT_GRAPH_DATA, directed: true } },
  inputConfig: { type: 'graph' },
  code: [
    'function DFS(u):',
    '  mark u as visiting',
    '  for each neighbor v of u:',
    '    if v is visiting: cycle detected',
    '    if v not visited: DFS(v)',
    '  mark u as visited',
    '  push u to stack',
  ],
  generate: (input?) => {
    const graph = input?.graph ?? { ...DEFAULT_GRAPH_DATA, directed: true };
    const nodes = graph.nodes;
    const edges = graph.edges ?? [];
    const adj: Record<string, string[]> = {};
    for (const n of nodes) adj[n.id] = [];
    for (const e of edges) adj[e.from].push(e.to);

    const visited = new Set<string>();
    const visiting = new Set<string>();
    const stack: string[] = [];
    const snapshots: Snapshot<GraphData>[] = [];
    let hasCycle = false;

    const dfs = (u: string) => {
      if (hasCycle) return;
      visiting.add(u);
      snapshots.push({
        id: `${snapshots.length}`,
        step: snapshots.length,
        description: `Visiting ${u}.`,
        data: { ...graph, nodes: nodes.map(n => ({ ...n, state: n.id === u ? 'active' as const : 'default' as const })) },
        currentLine: 1,
        variables: { current: u, stack: [...stack] },
      });

      for (const v of adj[u]) {
        if (visiting.has(v)) {
          hasCycle = true;
          return;
        }
        if (!visited.has(v)) dfs(v);
      }

      visiting.delete(u);
      visited.add(u);
      stack.push(u);
    };

    for (const n of nodes) {
      if (!visited.has(n.id)) dfs(n.id);
    }

    if (hasCycle) {
      snapshots.push({
        id: `${snapshots.length}`,
        step: snapshots.length,
        description: 'Cycle detected!',
        data: { ...graph, nodes: nodes.map(n => ({ ...n, state: 'default' as const })) },
        currentLine: 3,
        variables: { hasCycle: true },
      });
    } else {
      stack.reverse();
      snapshots.push({
        id: `${snapshots.length}`,
        step: snapshots.length,
        description: `Topological order: ${stack.join(' → ')}.`,
        data: { ...graph, nodes: nodes.map(n => ({ ...n, state: 'path' as const })) },
        currentLine: 6,
        variables: { result: stack },
      });
    }

    return snapshots;
  },
};
