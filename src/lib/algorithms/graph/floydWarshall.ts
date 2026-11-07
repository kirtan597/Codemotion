import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { GraphData, GraphAlgorithmInput, DEFAULT_GRAPH_DATA } from './types';

export const floydWarshall: AlgorithmDefinition<GraphAlgorithmInput, GraphData> = {
  id: 'floyd-warshall',
  name: 'Floyd-Warshall Algorithm',
  category: 'graph',
  categoryName: 'Graphs',
  description: 'All-pairs shortest paths using dynamic programming. Handles negative weights.',
  difficulty: 'Hard',
  timeComplexity: { best: 'O(V³)', average: 'O(V³)', worst: 'O(V³)' },
  spaceComplexity: 'O(V²)',
  defaultInput: { graph: DEFAULT_GRAPH_DATA, startNode: 'A', targetNode: 'F' },
  inputConfig: { type: 'graph' },
  code: [
    'dist[i][j] = weight(i, j) or ∞',
    'for k from 1 to V:',
    '  for i from 1 to V:',
    '    for j from 1 to V:',
    '      if dist[i][k] + dist[k][j] < dist[i][j]:',
    '        dist[i][j] = dist[i][k] + dist[k][j]',
  ],
  generate: (input?) => {
    const graph = input?.graph ?? DEFAULT_GRAPH_DATA;
    const nodes = graph.nodes;
    const V = nodes.length;
    const dist: number[][] = Array.from({ length: V }, () => Array(V).fill(Infinity));
    const snapshots: Snapshot<GraphData>[] = [];

    for (let i = 0; i < V; i++) dist[i][i] = 0;
    for (const e of graph.edges!) {
      const i = nodes.findIndex(n => n.id === e.from);
      const j = nodes.findIndex(n => n.id === e.to);
      if (i >= 0 && j >= 0) dist[i][j] = e.weight ?? 1;
      if (!graph.directed && i >= 0 && j >= 0) dist[j][i] = e.weight ?? 1;
    }

    snapshots.push({
      id: '0',
      step: 0,
      description: 'Initialized distance matrix with edge weights.',
      data: { ...graph, nodes: nodes.map(n => ({ ...n, state: 'default' as const })) },
      currentLine: 0,
      variables: { dist: dist.map(r => [...r]) },
    });

    for (let k = 0; k < V; k++) {
      for (let i = 0; i < V; i++) {
        for (let j = 0; j < V; j++) {
          if (dist[i][k] + dist[k][j] < dist[i][j]) {
            dist[i][j] = dist[i][k] + dist[k][j];
            snapshots.push({
              id: `${snapshots.length}`,
              step: snapshots.length,
              description: `Via node ${nodes[k].id}: dist[${nodes[i].id}][${nodes[j].id}] = ${dist[i][j]}.`,
              data: { ...graph, nodes: nodes.map((n, idx) => ({ ...n, state: idx === k ? 'active' as const : 'default' as const })) },
              currentLine: 5,
              variables: { k: nodes[k].id, dist: dist.map(r => [...r]) },
            });
          }
        }
      }
    }

    snapshots.push({
      id: `${snapshots.length}`,
      step: snapshots.length,
      description: 'All-pairs shortest paths computed.',
      data: { ...graph, nodes: nodes.map(n => ({ ...n, state: 'path' as const })) },
      currentLine: 5,
      variables: { dist: dist.map(r => [...r]) },
    });

    return snapshots;
  },
};
