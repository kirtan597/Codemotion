import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { MinHeap } from '@/lib/utils/minHeap';
import {
  GraphData,
  GraphNode,
  GraphEdge,
  GraphAlgorithmInput,
  NegativeWeightError,
  DEFAULT_GRAPH_DATA,
  DistanceEntry,
  QueueItem,
} from './types';

interface HeapElement {
  node: string;
  dist: number;
}

function edgeKey(from: string, to: string, directed: boolean): string {
  if (directed) return `${from}->${to}`;
  return from < to ? `${from}-${to}` : `${to}-${from}`;
}

export const dijkstra: AlgorithmDefinition<GraphAlgorithmInput | any, GraphData> = {
  id: 'dijkstra',
  name: "Dijkstra's Shortest Path",
  category: 'graph',
  categoryName: 'Graphs',
  description:
    'Finds the shortest paths between nodes in a graph with non-negative edge weights using a priority queue (min-heap).',
  difficulty: 'Medium',
  timeComplexity: {
    best: 'O((V + E) log V)',
    average: 'O((V + E) log V)',
    worst: 'O((V + E) log V)',
  },
  spaceComplexity: 'O(V + E)',
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
    'dist[start] = 0; minHeap.push({ start, 0 })',
    'while minHeap is not empty:',
    '  curr = minHeap.pop()',
    '  if curr is visited: continue',
    '  for each edge (curr -> v, weight w):',
    '    if dist[curr] + w < dist[v]:',
    '      dist[v] = dist[curr] + w; prev[v] = curr',
    '      minHeap.push({ v, dist[v] })',
    'reconstruct path from target to start',
  ],
  generate: (input?: GraphAlgorithmInput): Snapshot<GraphData>[] => {
    const graphData: GraphData = input?.graph ?? DEFAULT_GRAPH_DATA;
    const isDirected = Boolean(graphData.directed);
    const nodes = graphData.nodes.length > 0 ? graphData.nodes : DEFAULT_GRAPH_DATA.nodes;
    const edges = graphData.edges ?? DEFAULT_GRAPH_DATA.edges;

    // Reject negative weights with typed error
    for (const e of edges) {
      if (e.weight !== undefined && e.weight < 0) {
        throw new NegativeWeightError(e.from, e.to, e.weight);
      }
    }

    const startNodeId =
      input?.startNode && nodes.some((n) => n.id === input.startNode)
        ? input.startNode
        : nodes[0]?.id ?? 'A';
    const targetNodeId =
      input?.targetNode && nodes.some((n) => n.id === input.targetNode)
        ? input.targetNode
        : nodes[nodes.length - 1]?.id ?? 'F';

    // Adjacency list: node -> Array<{ neighbor: string, weight: number, edge: GraphEdge }>
    const adj: Record<string, Array<{ to: string; weight: number; edge: GraphEdge }>> = {};
    for (const n of nodes) {
      adj[n.id] = [];
    }
    for (const e of edges) {
      const w = e.weight ?? 1;
      if (adj[e.from]) {
        adj[e.from].push({ to: e.to, weight: w, edge: e });
      }
      if (!isDirected && adj[e.to]) {
        adj[e.to].push({ to: e.from, weight: w, edge: e });
      }
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

    const minHeap = new MinHeap<HeapElement>((a, b) => a.dist - b.dist);
    const snapshots: Snapshot<GraphData>[] = [];

    const getDistanceTable = (): DistanceEntry[] => {
      return nodes.map((n) => ({
        node: n.id,
        dist: distances[n.id],
        prev: previous[n.id],
      }));
    };

    const getHeapQueueItems = (): QueueItem[] => {
      return minHeap
        .toArray()
        .slice()
        .sort((a, b) => a.dist - b.dist)
        .map((item) => ({
          id: `${item.node}-${item.dist}`,
          label: item.node,
          priority: item.dist,
        }));
    };

    const pushSnapshot = (
      desc: string,
      current: string | null = null,
      line: number = 0,
      extraVars: Record<string, any> = {}
    ) => {
      snapshots.push({
        id: `dijkstra-${snapshots.length}`,
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
          minHeap: getHeapQueueItems(),
          queue: getHeapQueueItems(),
          table: getDistanceTable(),
          distances: { ...distances },
          previous: { ...previous },
          ...extraVars,
        },
      });
    };

    // Initialize
    distances[startNodeId] = 0;
    minHeap.push({ node: startNodeId, dist: 0 });
    nodeVisualStates[startNodeId] = 'queued';

    pushSnapshot(
      `Initialized Dijkstra. Set distance to start node ${startNodeId} = 0, all other nodes = ∞. Pushed ${startNodeId} to Min-Heap.`,
      startNodeId,
      0
    );

    while (!minHeap.isEmpty()) {
      const top = minHeap.pop()!;
      const curr = top.node;
      const d = top.dist;

      if (visited.has(curr)) {
        pushSnapshot(
          `Popped (${curr}, dist: ${d}) from Min-Heap, but node ${curr} has already been settled. Skipping.`,
          curr,
          3
        );
        continue;
      }

      visited.add(curr);
      nodeVisualStates[curr] = 'visited';

      pushSnapshot(
        `Settled node ${curr} with shortest distance ${d}. Exploring outgoing edges for relaxation.`,
        curr,
        2
      );

      const neighbors = adj[curr] ?? [];
      for (const { to: neighbor, weight: w, edge } of neighbors) {
        const eKey = edgeKey(edge.from, edge.to, isDirected);

        if (visited.has(neighbor)) {
          continue;
        }

        const tentativeDist = distances[curr] + w;
        const oldDist = distances[neighbor];

        // Highlight edge being evaluated
        if (edgeVisualStates[eKey] !== 'path') {
          edgeVisualStates[eKey] = 'active';
        }

        pushSnapshot(
          `Examining edge (${curr} -> ${neighbor}) weight ${w}. Tentative distance: dist[${curr}] (${distances[curr]}) + ${w} = ${tentativeDist} vs current dist[${neighbor}] (${oldDist === Infinity ? '∞' : oldDist}).`,
          curr,
          4,
          { neighbor, weight: w, tentativeDist, oldDist }
        );

        if (tentativeDist < oldDist) {
          distances[neighbor] = tentativeDist;
          previous[neighbor] = curr;
          nodeVisualStates[neighbor] = 'queued';
          edgeVisualStates[eKey] = 'relaxed';

          minHeap.push({ node: neighbor, dist: tentativeDist });

          pushSnapshot(
            `Relaxed edge (${curr} -> ${neighbor}): updated distance to ${neighbor} from ${oldDist === Infinity ? '∞' : oldDist} to ${tentativeDist} (via ${curr}). Pushed to Min-Heap.`,
            neighbor,
            6,
            { neighbor, relaxed: true, newDist: tentativeDist, prev: curr }
          );
        } else {
          // Revert active edge back to default or traversed
          if (edgeVisualStates[eKey] === 'active') {
            edgeVisualStates[eKey] = 'traversed';
          }
        }
      }
    }

    // Traceback shortest path if target is reachable
    const path: string[] = [];
    if (distances[targetNodeId] < Infinity) {
      let step: string | null = targetNodeId;
      while (step !== null) {
        path.unshift(step);
        step = previous[step];
      }

      // Mark path nodes and edges
      for (const pNode of path) {
        nodeVisualStates[pNode] = 'path';
      }
      for (let i = 0; i < path.length - 1; i++) {
        const u = path[i];
        const v = path[i + 1];
        edgeVisualStates[edgeKey(u, v, isDirected)] = 'path';
      }

      pushSnapshot(
        `Shortest path from ${startNodeId} to ${targetNodeId} found! Total distance: ${distances[targetNodeId]}. Path: ${path.join(' → ')}.`,
        targetNodeId,
        8,
        { path, totalDistance: distances[targetNodeId], phase: 'traceback' }
      );
    } else {
      pushSnapshot(
        `Target node ${targetNodeId} is unreachable from start node ${startNodeId}. Distance is ∞.`,
        targetNodeId,
        8,
        { path: [], totalDistance: Infinity, phase: 'unreachable' }
      );
    }

    return snapshots;
  },
};

