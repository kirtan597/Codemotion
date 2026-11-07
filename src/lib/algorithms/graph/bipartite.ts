import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { GraphData, GraphAlgorithmInput, DEFAULT_GRAPH_DATA } from './types';

export const bipartiteCheck: AlgorithmDefinition<GraphAlgorithmInput, GraphData> = {
  id: 'bipartite-check',
  name: 'Bipartite Graph Check',
  category: 'graph',
  categoryName: 'Graphs',
  description: 'Checks if graph is bipartite (2-colorable) using BFS.',
  difficulty: 'Medium',
  timeComplexity: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)' },
  spaceComplexity: 'O(V)',
  defaultInput: { graph: { ...DEFAULT_GRAPH_DATA, directed: false } },
  inputConfig: { type: 'graph' },
  code: [
    'color[start] = 0',
    'queue.push(start)',
    'while queue not empty:',
    '  u = queue.shift()',
    '  for each neighbor v of u:',
    '    if v not colored: color[v] = 1 - color[u], enqueue v',
    '    else if color[v] == color[u]: not bipartite',
  ],
  generate: (input?) => {
    const graph = input?.graph ?? { ...DEFAULT_GRAPH_DATA, directed: false };
    const nodes = graph.nodes;
    const edges = graph.edges ?? [];
    const adj: Record<string, string[]> = {};

    for (const n of nodes) adj[n.id] = [];
    for (const e of edges) {
      adj[e.from].push(e.to);
      adj[e.to].push(e.from);
    }

    const color: Record<string, number> = {};
    const snapshots: Snapshot<GraphData>[] = [];
    let isBipartite = true;

    const bfs = (start: string) => {
      const queue: string[] = [start];
      color[start] = 0;

      while (queue.length > 0 && isBipartite) {
        const u = queue.shift()!;

        snapshots.push({
          id: `${snapshots.length}`,
          step: snapshots.length,
          description: `Processing ${u} (color: ${color[u]}).`,
          data: { ...graph, nodes: nodes.map(n => ({ ...n, state: n.id === u ? 'active' as const : color[n.id] !== undefined ? 'visited' as const : 'default' as const })) },
          currentLine: 3,
          variables: { current: u, color: { ...color }, queue: [...queue] },
        });

        for (const v of adj[u]) {
          if (color[v] === undefined) {
            color[v] = 1 - color[u];
            queue.push(v);
            snapshots.push({
              id: `${snapshots.length}`,
              step: snapshots.length,
              description: `Colored ${v} with color ${color[v]}.`,
              data: { ...graph, nodes: nodes.map(n => ({ ...n, state: n.id === v ? 'queued' as const : 'default' as const })) },
              currentLine: 5,
              variables: { colored: v, color: { ...color } },
            });
          } else if (color[v] === color[u]) {
            isBipartite = false;
            snapshots.push({
              id: `${snapshots.length}`,
              step: snapshots.length,
              description: `Conflict! ${u} and ${v} have same color. Not bipartite.`,
              data: { ...graph, nodes: nodes.map(n => ({ ...n, state: [u, v].includes(n.id) ? 'path' as const : 'default' as const })) },
              currentLine: 6,
              variables: { conflict: [u, v], isBipartite: false },
            });
            return;
          }
        }
      }
    };

    for (const n of nodes) {
      if (color[n.id] === undefined && isBipartite) bfs(n.id);
    }

    if (isBipartite) {
      const set0 = nodes.filter(n => color[n.id] === 0).map(n => n.id);
      const set1 = nodes.filter(n => color[n.id] === 1).map(n => n.id);

      snapshots.push({
        id: `${snapshots.length}`,
        step: snapshots.length,
        description: `Graph is bipartite! Set A: {${set0.join(', ')}}. Set B: {${set1.join(', ')}}.`,
        data: { ...graph, nodes: nodes.map(n => ({ ...n, state: 'path' as const })) },
        currentLine: 6,
        variables: { isBipartite: true, setA: set0, setB: set1 },
      });
    }

    return snapshots;
  },
};
