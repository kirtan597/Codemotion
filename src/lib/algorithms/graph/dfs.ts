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

export const dfs: AlgorithmDefinition<GraphAlgorithmInput | any, GraphData> = {
  id: 'dfs',
  name: 'Depth-First Search (DFS)',
  category: 'graph',
  categoryName: 'Graphs',
  description:
    'Explores as deep as possible along each branch before backtracking. Uses an explicit iterative stack.',
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
    'stack.push({ node: start, parent: null })',
    'while stack is not empty:',
    '  { curr, parent } = stack.pop()',
    '  if curr in visited: continue',
    '  visited.add(curr); mark edge(parent -> curr)',
    '  for each neighbor of curr in reverse order:',
    '    if neighbor not in visited: stack.push(neighbor)',
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

    // Adjacency list
    const adj: Record<string, string[]> = {};
    for (const n of nodes) {
      adj[n.id] = [];
    }
    for (const e of edges) {
      if (adj[e.from]) adj[e.from].push(e.to);
      if (!isDirected && adj[e.to]) adj[e.to].push(e.from);
    }

    const visited = new Set<string>();
    const previous: Record<string, string | null> = {};
    const depth: Record<string, number> = {};
    const nodeVisualStates: Record<string, GraphNode['state']> = {};
    const edgeVisualStates: Record<string, GraphEdge['state']> = {};

    for (const n of nodes) {
      previous[n.id] = null;
      depth[n.id] = Infinity;
      nodeVisualStates[n.id] = 'default';
    }
    for (const e of edges) {
      edgeVisualStates[edgeKey(e.from, e.to, isDirected)] = 'default';
    }

    // Explicit iterative stack: array of { node, parent, depth }
    interface StackItem {
      node: string;
      parent: string | null;
      d: number;
    }
    const stack: StackItem[] = [];
    const snapshots: Snapshot<GraphData>[] = [];

    const getDistanceTable = (): DistanceEntry[] => {
      return nodes.map((n) => ({
        node: n.id,
        dist: depth[n.id],
        prev: previous[n.id],
      }));
    };

    const getStackQueueItems = (): QueueItem[] => {
      // Top of stack is at the end of the array, show reversed for overlay view
      return stack
        .slice()
        .reverse()
        .map((item, idx) => ({
          id: `${item.node}-${item.d}-${idx}`,
          label: item.node,
          priority: item.d,
        }));
    };

    const pushSnapshot = (
      desc: string,
      current: string | null = null,
      line: number = 0,
      extraVars: Record<string, any> = {}
    ) => {
      snapshots.push({
        id: `dfs-${snapshots.length}`,
        step: snapshots.length,
        description: desc,
        data: {
          directed: isDirected,
          nodes: nodes.map((n) => ({
            ...n,
            distance: depth[n.id],
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
          stack: getStackQueueItems(),
          queue: getStackQueueItems(), // for QueueOverlay compatibility
          table: getDistanceTable(),
          distances: { ...depth },
          previous: { ...previous },
          ...extraVars,
        },
      });
    };

    // Initialize DFS
    stack.push({ node: startNodeId, parent: null, d: 0 });
    nodeVisualStates[startNodeId] = 'queued';

    pushSnapshot(
      `DFS initialized. Pushed start node ${startNodeId} to explicit call stack.`,
      startNodeId,
      0
    );

    while (stack.length > 0) {
      const top = stack.pop()!;
      const curr = top.node;
      const parent = top.parent;
      const d = top.d;

      if (visited.has(curr)) {
        pushSnapshot(
          `Popped node ${curr} from stack, but it was already visited. Backtracking.`,
          curr,
          3
        );
        continue;
      }

      visited.add(curr);
      depth[curr] = d;
      previous[curr] = parent;
      nodeVisualStates[curr] = 'visited';

      if (parent) {
        edgeVisualStates[edgeKey(parent, curr, isDirected)] = 'traversed';
      }

      pushSnapshot(
        `Popped and visited node ${curr} at depth ${d}${parent ? ` (arrived via ${parent})` : ''}.`,
        curr,
        4,
        { parent, depth: d }
      );

      // Explore neighbors in reverse order so first neighbor is popped first
      const neighbors = (adj[curr] ?? []).slice().reverse();
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (nodeVisualStates[neighbor] !== 'visited') {
            nodeVisualStates[neighbor] = 'queued';
          }
          stack.push({ node: neighbor, parent: curr, d: d + 1 });
          pushSnapshot(
            `Found unvisited neighbor ${neighbor} of ${curr}. Pushed ${neighbor} to stack with parent ${curr}.`,
            neighbor,
            6,
            { neighbor, parent: curr }
          );
        }
      }
    }

    // Path reconstruction to targetNodeId if reached
    const path: string[] = [];
    if (depth[targetNodeId] < Infinity) {
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
        `DFS complete! Path to ${targetNodeId} via DFS traversal tree: ${path.join(' → ')}.`,
        targetNodeId,
        0,
        { path, phase: 'traceback' }
      );
    } else {
      pushSnapshot(
        `DFS complete. All reachable vertices visited. Target ${targetNodeId} was unreachable from ${startNodeId}.`,
        targetNodeId,
        0,
        { path: [], phase: 'unreachable' }
      );
    }

    return snapshots;
  },
};

