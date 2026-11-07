import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import {
  GraphData,
  GraphNode,
  GraphEdge,
  GraphAlgorithmInput,
  DEFAULT_GRAPH_DATA,
  DistanceEntry,
  QueueItem,
} from './types';

function edgeKey(from: string, to: string, directed: boolean): string {
  if (directed) return `${from}->${to}`;
  return from < to ? `${from}-${to}` : `${to}-${from}`;
}

export const bfs: AlgorithmDefinition<GraphAlgorithmInput | any, GraphData> = {
  id: 'bfs',
  name: 'Breadth-First Search (BFS)',
  category: 'graph',
  categoryName: 'Graphs',
  description:
    'Traverses a graph level by level exploring all neighbors of a node. Computes unweighted shortest paths.',
  difficulty: 'Medium',
  timeComplexity: {
    best: 'O(V + E)',
    average: 'O(V + E)',
    worst: 'O(V + E)',
  },
  spaceComplexity: 'O(V)',
  defaultInput: {
    graph: DEFAULT_GRAPH_DATA,
    startNode: 'A',
    targetNode: 'F',
  },
  inputConfig: {
    type: 'graph',
    supportsCustomInput: true,
  },
  code: [
    'queue.push(start); dist[start] = 0; visited.add(start)',
    'while queue is not empty:',
    '  curr = queue.shift()',
    '  for each neighbor v of curr:',
    '    if v not in visited:',
    '      dist[v] = dist[curr] + 1; prev[v] = curr',
    '      visited.add(v); queue.push(v)',
    'reconstruct path from target to start',
  ],
  generate: (input?: GraphAlgorithmInput): Snapshot<GraphData>[] => {
    const graphData: GraphData = input?.graph ?? DEFAULT_GRAPH_DATA;
    const isDirected = Boolean(graphData.directed);
    const nodes = graphData.nodes.length > 0 ? graphData.nodes : DEFAULT_GRAPH_DATA.nodes;
    const edges = graphData.edges ?? DEFAULT_GRAPH_DATA.edges;

    const startNodeId =
      input?.startNode && nodes.some((n) => n.id === input.startNode)
        ? input.startNode
        : nodes[0]?.id ?? 'A';
    const targetNodeId =
      input?.targetNode && nodes.some((n) => n.id === input.targetNode)
        ? input.targetNode
        : nodes[nodes.length - 1]?.id ?? 'F';

    // Build adjacency list
    const adj: Record<string, string[]> = {};
    for (const n of nodes) {
      adj[n.id] = [];
    }
    for (const e of edges) {
      if (adj[e.from]) adj[e.from].push(e.to);
      if (!isDirected && adj[e.to]) adj[e.to].push(e.from);
    }

    const distances: Record<string, number> = {};
    const previous: Record<string, string | null> = {};
    const visited = new Set<string>();
    const nodeVisualStates: Record<string, GraphNode['state']> = {};
    const edgeVisualStates: Record<string, GraphEdge['state']> = {};

    for (const n of nodes) {
      distances[n.id] = Infinity;
      previous[n.id] = null;
      nodeVisualStates[n.id] = 'default';
    }
    for (const e of edges) {
      edgeVisualStates[edgeKey(e.from, e.to, isDirected)] = 'default';
    }

    const queue: string[] = [];
    const snapshots: Snapshot<GraphData>[] = [];

    const getDistanceTable = (): DistanceEntry[] => {
      return nodes.map((n) => ({
        node: n.id,
        dist: distances[n.id],
        prev: previous[n.id],
      }));
    };

    const getQueueItems = (): QueueItem[] => {
      return queue.map((id) => ({
        id,
        label: id,
        priority: distances[id] === Infinity ? undefined : distances[id],
      }));
    };

    const pushSnapshot = (
      desc: string,
      current: string | null = null,
      line: number = 0,
      extraVars: Record<string, any> = {}
    ) => {
      snapshots.push({
        id: `bfs-${snapshots.length}`,
        step: snapshots.length,
        description: desc,
        data: {
          directed: isDirected,
          nodes: nodes.map((n) => ({
            ...n,
            distance: distances[n.id],
            prev: previous[n.id],
            state: n.id === current && nodeVisualStates[n.id] !== 'path'
              ? 'active'
              : nodeVisualStates[n.id],
          })),
          edges: edges.map((e) => ({
            ...e,
            state: edgeVisualStates[edgeKey(e.from, e.to, isDirected)] ?? 'default',
          })),
        },
        currentLine: line,
        variables: {
          current,
          queue: getQueueItems(),
          table: getDistanceTable(),
          distances: { ...distances },
          previous: { ...previous },
          ...extraVars,
        },
      });
    };

    // Initialize BFS
    distances[startNodeId] = 0;
    visited.add(startNodeId);
    queue.push(startNodeId);
    nodeVisualStates[startNodeId] = 'queued';

    pushSnapshot(
      `BFS initialized. Enqueued start node ${startNodeId} at distance 0. All other nodes at distance ∞.`,
      startNodeId,
      0
    );

    while (queue.length > 0) {
      const curr = queue.shift()!;
      nodeVisualStates[curr] = 'visited';

      pushSnapshot(
        `Dequeued node ${curr} (dist: ${distances[curr]}). Exploring outgoing neighbors.`,
        curr,
        2
      );

      const neighbors = adj[curr] ?? [];
      for (const neighbor of neighbors) {
        const eKey = edgeKey(curr, neighbor, isDirected);

        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          distances[neighbor] = distances[curr] + 1;
          previous[neighbor] = curr;
          nodeVisualStates[neighbor] = 'queued';
          edgeVisualStates[eKey] = 'traversed';
          queue.push(neighbor);

          pushSnapshot(
            `Discovered unvisited node ${neighbor}. Set distance = ${distances[neighbor]} (via ${curr}). Enqueued ${neighbor}.`,
            neighbor,
            5,
            { neighbor, dist: distances[neighbor] }
          );
        }
      }
    }

    // Path reconstruction
    const path: string[] = [];
    if (distances[targetNodeId] < Infinity) {
      let step: string | null = targetNodeId;
      while (step !== null) {
        path.unshift(step);
        step = previous[step];
      }

      for (const pNode of path) {
        nodeVisualStates[pNode] = 'path';
      }
      for (let i = 0; i < path.length - 1; i++) {
        edgeVisualStates[edgeKey(path[i], path[i + 1], isDirected)] = 'path';
      }

      pushSnapshot(
        `BFS complete! Shortest unweighted path from ${startNodeId} to ${targetNodeId} is ${path.join(' → ')} (${path.length - 1} edges).`,
        targetNodeId,
        7,
        { path, totalDistance: distances[targetNodeId], phase: 'traceback' }
      );
    } else {
      pushSnapshot(
        `BFS traversal finished. Target node ${targetNodeId} is unreachable from ${startNodeId}.`,
        targetNodeId,
        7,
        { path: [], totalDistance: Infinity, phase: 'unreachable' }
      );
    }

    return snapshots;
  },
};

