import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { GraphData, GraphNode, GraphEdge, GraphAlgorithmInput, DEFAULT_GRAPH_DATA, DistanceEntry } from './types';

function edgeKey(from: string, to: string, directed: boolean): string {
  if (directed) return `${from}->${to}`;
  return from < to ? `${from}-${to}` : `${to}-${from}`;
}

export const bellmanFord: AlgorithmDefinition<GraphAlgorithmInput, GraphData> = {
  id: 'bellman-ford',
  name: 'Bellman-Ford Algorithm',
  category: 'graph',
  categoryName: 'Graphs',
  description: 'Finds shortest paths from source to all vertices, handling negative weights and detecting negative cycles.',
  difficulty: 'Hard',
  timeComplexity: { best: 'O(V · E)', average: 'O(V · E)', worst: 'O(V · E)' },
  spaceComplexity: 'O(V)',
  defaultInput: { graph: DEFAULT_GRAPH_DATA, startNode: 'A', targetNode: 'F' },
  inputConfig: { type: 'graph', supportsCustomInput: true },
  code: [
    'dist[start] = 0',
    'for i from 1 to V-1:',
    '  for each edge (u, v, w):',
    '    if dist[u] + w < dist[v]:',
    '      dist[v] = dist[u] + w',
    '      prev[v] = u',
    'for each edge (u, v, w):',
    '  if dist[u] + w < dist[v]: negative cycle exists',
  ],
  generate: (input?) => {
    const graphData: GraphData = input?.graph ?? DEFAULT_GRAPH_DATA;
    const isDirected = Boolean(graphData.directed);
    const nodes = graphData.nodes.length > 0 ? graphData.nodes : DEFAULT_GRAPH_DATA.nodes;
    const edges = graphData.edges ?? DEFAULT_GRAPH_DATA.edges;
    const startNodeId = input?.startNode && nodes.some(n => n.id === input.startNode) ? input.startNode : nodes[0]?.id ?? 'A';
    const targetNodeId = input?.targetNode && nodes.some(n => n.id === input.targetNode) ? input.targetNode : nodes[nodes.length - 1]?.id ?? 'F';

    const distances: Record<string, number> = {};
    const previous: Record<string, string | null> = {};
    const nodeStates: Record<string, GraphNode['state']> = {};
    const edgeStates: Record<string, GraphEdge['state']> = {};

    for (const n of nodes) {
      distances[n.id] = Infinity;
      previous[n.id] = null;
      nodeStates[n.id] = 'default';
    }
    for (const e of edges) edgeStates[edgeKey(e.from, e.to, isDirected)] = 'default';

    const snapshots: Snapshot<GraphData>[] = [];
    const getTable = (): DistanceEntry[] => nodes.map(n => ({ node: n.id, dist: distances[n.id], prev: previous[n.id] }));
    const pushSnap = (desc: string, line = 0, vars: any = {}) => {
      snapshots.push({
        id: `bf-${snapshots.length}`,
        step: snapshots.length,
        description: desc,
        data: {
          directed: isDirected,
          nodes: nodes.map(n => ({ ...n, distance: distances[n.id], prev: previous[n.id], state: nodeStates[n.id] })),
          edges: edges.map(e => ({ ...e, state: edgeStates[edgeKey(e.from, e.to, isDirected)] })),
        },
        currentLine: line,
        variables: { table: getTable(), distances: { ...distances }, previous: { ...previous }, ...vars },
      });
    };

    distances[startNodeId] = 0;
    pushSnap(`Initialized Bellman-Ford. Set dist[${startNodeId}] = 0, all others = ∞.`, 0);

    const V = nodes.length;
    for (let i = 1; i < V; i++) {
      let relaxed = false;
      for (const e of edges) {
        const w = e.weight ?? 1;
        const eKey = edgeKey(e.from, e.to, isDirected);
        if (distances[e.from] !== Infinity && distances[e.from] + w < distances[e.to]) {
          distances[e.to] = distances[e.from] + w;
          previous[e.to] = e.from;
          edgeStates[eKey] = 'relaxed';
          relaxed = true;
          pushSnap(`Iteration ${i}: Relaxed edge (${e.from}→${e.to}). dist[${e.to}] = ${distances[e.to]}.`, 3, { iteration: i });
        }
      }
      if (!relaxed) {
        pushSnap(`Iteration ${i}: No edges relaxed. Early termination.`, 1, { iteration: i });
        break;
      }
    }

    let hasNegCycle = false;
    for (const e of edges) {
      const w = e.weight ?? 1;
      if (distances[e.from] !== Infinity && distances[e.from] + w < distances[e.to]) {
        hasNegCycle = true;
        pushSnap(`Negative cycle detected! Edge (${e.from}→${e.to}) can still be relaxed.`, 7, { negativeCycle: true });
        break;
      }
    }

    if (!hasNegCycle && distances[targetNodeId] < Infinity) {
      const path: string[] = [];
      let step: string | null = targetNodeId;
      while (step) {
        path.unshift(step);
        step = previous[step];
      }
      for (const pNode of path) nodeStates[pNode] = 'path';
      for (let i = 0; i < path.length - 1; i++) {
        edgeStates[edgeKey(path[i], path[i + 1], isDirected)] = 'path';
      }
      pushSnap(`Shortest path from ${startNodeId} to ${targetNodeId}: ${path.join(' → ')} (dist: ${distances[targetNodeId]}).`, 8, { path, totalDistance: distances[targetNodeId] });
    } else if (!hasNegCycle) {
      pushSnap(`Target ${targetNodeId} is unreachable from ${startNodeId}.`, 8, { path: [], totalDistance: Infinity });
    }

    return snapshots;
  },
};
