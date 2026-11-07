import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { GraphData, GraphAlgorithmInput, DEFAULT_GRAPH_DATA } from './types';

export const fordFulkerson: AlgorithmDefinition<GraphAlgorithmInput, GraphData> = {
  id: 'ford-fulkerson',
  name: 'Ford-Fulkerson Max Flow',
  category: 'graph',
  categoryName: 'Graphs',
  description: 'Computes maximum flow from source to sink using augmenting paths.',
  difficulty: 'Hard',
  timeComplexity: { best: 'O(E · maxFlow)', average: 'O(E · maxFlow)', worst: 'O(E · maxFlow)' },
  spaceComplexity: 'O(V²)',
  defaultInput: { graph: { ...DEFAULT_GRAPH_DATA, directed: true }, startNode: 'A', targetNode: 'F' },
  inputConfig: { type: 'graph' },
  code: [
    'maxFlow = 0',
    'while exists augmenting path from source to sink:',
    '  find path using BFS/DFS',
    '  bottleneck = min capacity along path',
    '  augment flow along path by bottleneck',
    '  maxFlow += bottleneck',
  ],
  generate: (input?) => {
    const graph = input?.graph ?? { ...DEFAULT_GRAPH_DATA, directed: true };
    const nodes = graph.nodes;
    const edges = graph.edges ?? [];
    const source = input?.startNode ?? nodes[0]?.id ?? 'A';
    const sink = input?.targetNode ?? nodes[nodes.length - 1]?.id ?? 'F';

    const capacity: Record<string, Record<string, number>> = {};
    for (const n of nodes) {
      capacity[n.id] = {};
      for (const m of nodes) capacity[n.id][m.id] = 0;
    }
    for (const e of edges) {
      capacity[e.from][e.to] = e.weight ?? 10;
    }

    const flow: Record<string, Record<string, number>> = {};
    for (const n of nodes) {
      flow[n.id] = {};
      for (const m of nodes) flow[n.id][m.id] = 0;
    }

    const snapshots: Snapshot<GraphData>[] = [];
    let maxFlow = 0;

    const bfs = (): string[] | null => {
      const visited = new Set<string>([source]);
      const queue: Array<{ node: string; path: string[] }> = [{ node: source, path: [source] }];

      while (queue.length > 0) {
        const { node: u, path } = queue.shift()!;

        if (u === sink) return path;

        for (const v of nodes.map(n => n.id)) {
          if (!visited.has(v) && capacity[u][v] - flow[u][v] > 0) {
            visited.add(v);
            queue.push({ node: v, path: [...path, v] });
          }
        }
      }
      return null;
    };

    snapshots.push({
      id: '0',
      step: 0,
      description: `Ford-Fulkerson: Finding max flow from ${source} to ${sink}.`,
      data: { ...graph, nodes: nodes.map(n => ({ ...n, state: 'default' as const })) },
      currentLine: 0,
      variables: { maxFlow: 0 },
    });

    while (true) {
      const path = bfs();
      if (!path) break;

      let bottleneck = Infinity;
      for (let i = 0; i < path.length - 1; i++) {
        const u = path[i], v = path[i + 1];
        bottleneck = Math.min(bottleneck, capacity[u][v] - flow[u][v]);
      }

      for (let i = 0; i < path.length - 1; i++) {
        const u = path[i], v = path[i + 1];
        flow[u][v] += bottleneck;
        flow[v][u] -= bottleneck;
      }

      maxFlow += bottleneck;

      snapshots.push({
        id: `${snapshots.length}`,
        step: snapshots.length,
        description: `Augmenting path: ${path.join(' → ')}. Bottleneck: ${bottleneck}. Total flow: ${maxFlow}.`,
        data: { ...graph, nodes: nodes.map(n => ({ ...n, state: path.includes(n.id) ? 'path' as const : 'default' as const })) },
        currentLine: 4,
        variables: { path, bottleneck, maxFlow },
      });
    }

    snapshots.push({
      id: `${snapshots.length}`,
      step: snapshots.length,
      description: `Maximum flow: ${maxFlow}.`,
      data: { ...graph, nodes: nodes.map(n => ({ ...n, state: 'path' as const })) },
      currentLine: 5,
      variables: { maxFlow },
    });

    return snapshots;
  },
};

export const edmondsKarp: AlgorithmDefinition<GraphAlgorithmInput, GraphData> = {
  id: 'edmonds-karp',
  name: 'Edmonds-Karp Max Flow',
  category: 'graph',
  categoryName: 'Graphs',
  description: 'Ford-Fulkerson with BFS for finding augmenting paths. Guaranteed O(VE²) complexity.',
  difficulty: 'Hard',
  timeComplexity: { best: 'O(V · E²)', average: 'O(V · E²)', worst: 'O(V · E²)' },
  spaceComplexity: 'O(V²)',
  defaultInput: { graph: { ...DEFAULT_GRAPH_DATA, directed: true }, startNode: 'A', targetNode: 'F' },
  inputConfig: { type: 'graph' },
  code: [
    'Same as Ford-Fulkerson but always use BFS',
    'BFS finds shortest augmenting path',
    'This guarantees polynomial time complexity',
  ],
  generate: (input?) => {
    // Edmonds-Karp is Ford-Fulkerson with BFS (which we already use)
    return fordFulkerson.generate(input ?? { graph: DEFAULT_GRAPH_DATA, startNode: 'A', targetNode: 'F' });
  },
};
