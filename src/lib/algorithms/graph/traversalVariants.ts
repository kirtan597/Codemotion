import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { GraphData, GraphAlgorithmInput, DEFAULT_GRAPH_DATA } from './types';

export const recursiveDFS: AlgorithmDefinition<GraphAlgorithmInput, GraphData> = {
  id: 'recursive-dfs',
  name: 'Recursive DFS',
  category: 'graph',
  categoryName: 'Graphs',
  description: 'Depth-First Search using recursion with call stack visualization.',
  difficulty: 'Easy',
  timeComplexity: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)' },
  spaceComplexity: 'O(V)',
  defaultInput: { graph: DEFAULT_GRAPH_DATA, startNode: 'A' },
  inputConfig: { type: 'graph' },
  code: [
    'function DFS_Recursive(u):',
    '  mark u as visited',
    '  for each neighbor v of u:',
    '    if v not visited:',
    '      DFS_Recursive(v)',
  ],
  generate: (input?) => {
    const graph = input?.graph ?? DEFAULT_GRAPH_DATA;
    const nodes = graph.nodes;
    const edges = graph.edges ?? [];
    const start = input?.startNode ?? nodes[0]?.id ?? 'A';
    const adj: Record<string, string[]> = {};

    for (const n of nodes) adj[n.id] = [];
    for (const e of edges) {
      adj[e.from].push(e.to);
      if (!graph.directed) adj[e.to].push(e.from);
    }

    const visited = new Set<string>();
    const snapshots: Snapshot<GraphData>[] = [];
    const order: string[] = [];

    const dfs = (u: string, depth = 0) => {
      visited.add(u);
      order.push(u);

      snapshots.push({
        id: `${snapshots.length}`,
        step: snapshots.length,
        description: `Recursively visiting ${u} at depth ${depth}.`,
        data: { ...graph, nodes: nodes.map(n => ({ ...n, state: n.id === u ? 'active' as const : visited.has(n.id) ? 'visited' as const : 'default' as const })) },
        currentLine: 1,
        variables: { current: u, depth, order: [...order] },
      });

      for (const v of adj[u]) {
        if (!visited.has(v)) dfs(v, depth + 1);
      }
    };

    dfs(start);

    snapshots.push({
      id: `${snapshots.length}`,
      step: snapshots.length,
      description: `Recursive DFS complete. Traversal order: ${order.join(' → ')}.`,
      data: { ...graph, nodes: nodes.map(n => ({ ...n, state: 'path' as const })) },
      currentLine: 4,
      variables: { order },
    });

    return snapshots;
  },
};

export const bidirectionalBFS: AlgorithmDefinition<GraphAlgorithmInput, GraphData> = {
  id: 'bidirectional-bfs',
  name: 'Bidirectional BFS',
  category: 'graph',
  categoryName: 'Graphs',
  description: 'Simultaneously search from both start and target, meeting in the middle.',
  difficulty: 'Hard',
  timeComplexity: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)' },
  spaceComplexity: 'O(V)',
  defaultInput: { graph: DEFAULT_GRAPH_DATA, startNode: 'A', targetNode: 'F' },
  inputConfig: { type: 'graph' },
  code: [
    'queue1.push(start), queue2.push(target)',
    'visited1.add(start), visited2.add(target)',
    'while both queues not empty:',
    '  BFS one level from queue1',
    '  if intersection found: path exists',
    '  BFS one level from queue2',
    '  if intersection found: path exists',
  ],
  generate: (input?) => {
    const graph = input?.graph ?? DEFAULT_GRAPH_DATA;
    const nodes = graph.nodes;
    const edges = graph.edges ?? [];
    const start = input?.startNode ?? nodes[0]?.id ?? 'A';
    const target = input?.targetNode ?? nodes[nodes.length - 1]?.id ?? 'F';
    const adj: Record<string, string[]> = {};

    for (const n of nodes) adj[n.id] = [];
    for (const e of edges) {
      adj[e.from].push(e.to);
      if (!graph.directed) adj[e.to].push(e.from);
    }

    const visited1 = new Set<string>([start]);
    const visited2 = new Set<string>([target]);
    const queue1 = [start];
    const queue2 = [target];
    const parent1: Record<string, string | null> = { [start]: null };
    const parent2: Record<string, string | null> = { [target]: null };
    const snapshots: Snapshot<GraphData>[] = [];

    snapshots.push({
      id: '0',
      step: 0,
      description: `Bidirectional BFS: Start from ${start} and ${target} simultaneously.`,
      data: { ...graph, nodes: nodes.map(n => ({ ...n, state: [start, target].includes(n.id) ? 'queued' as const : 'default' as const })) },
      currentLine: 0,
      variables: { queue1: [...queue1], queue2: [...queue2] },
    });

    while (queue1.length > 0 && queue2.length > 0) {
      if (queue1.length <= queue2.length) {
        const u = queue1.shift()!;
        for (const v of adj[u]) {
          if (visited2.has(v)) {
            snapshots.push({
              id: `${snapshots.length}`,
              step: snapshots.length,
              description: `Paths met at ${v}! Found connection.`,
              data: { ...graph, nodes: nodes.map(n => ({ ...n, state: [u, v].includes(n.id) ? 'path' as const : 'default' as const })) },
              currentLine: 4,
              variables: { meetingPoint: v, found: true },
            });
            return snapshots;
          }
          if (!visited1.has(v)) {
            visited1.add(v);
            parent1[v] = u;
            queue1.push(v);
          }
        }
        snapshots.push({
          id: `${snapshots.length}`,
          step: snapshots.length,
          description: `Forward search: processed ${u}.`,
          data: { ...graph, nodes: nodes.map(n => ({ ...n, state: visited1.has(n.id) ? 'visited' as const : 'default' as const })) },
          currentLine: 3,
          variables: { direction: 'forward', current: u },
        });
      } else {
        const u = queue2.shift()!;
        for (const v of adj[u]) {
          if (visited1.has(v)) {
            snapshots.push({
              id: `${snapshots.length}`,
              step: snapshots.length,
              description: `Paths met at ${v}! Found connection.`,
              data: { ...graph, nodes: nodes.map(n => ({ ...n, state: [u, v].includes(n.id) ? 'path' as const : 'default' as const })) },
              currentLine: 6,
              variables: { meetingPoint: v, found: true },
            });
            return snapshots;
          }
          if (!visited2.has(v)) {
            visited2.add(v);
            parent2[v] = u;
            queue2.push(v);
          }
        }
        snapshots.push({
          id: `${snapshots.length}`,
          step: snapshots.length,
          description: `Backward search: processed ${u}.`,
          data: { ...graph, nodes: nodes.map(n => ({ ...n, state: visited2.has(n.id) ? 'visited' as const : 'default' as const })) },
          currentLine: 5,
          variables: { direction: 'backward', current: u },
        });
      }
    }

    snapshots.push({
      id: `${snapshots.length}`,
      step: snapshots.length,
      description: `No path exists between ${start} and ${target}.`,
      data: { ...graph, nodes: nodes.map(n => ({ ...n, state: 'default' as const })) },
      currentLine: 6,
      variables: { found: false },
    });

    return snapshots;
  },
};

export const zeroOneBFS: AlgorithmDefinition<GraphAlgorithmInput, GraphData> = {
  id: 'zero-one-bfs',
  name: '0-1 BFS',
  category: 'graph',
  categoryName: 'Graphs',
  description: 'Shortest path in graph with edge weights of 0 or 1 using deque.',
  difficulty: 'Medium',
  timeComplexity: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)' },
  spaceComplexity: 'O(V)',
  defaultInput: { graph: DEFAULT_GRAPH_DATA, startNode: 'A', targetNode: 'F' },
  inputConfig: { type: 'graph' },
  code: [
    'deque.push(start), dist[start] = 0',
    'while deque not empty:',
    '  u = deque.popFront()',
    '  for each edge (u, v, w):',
    '    if dist[u] + w < dist[v]:',
    '      dist[v] = dist[u] + w',
    '      if w == 0: deque.pushFront(v)',
    '      else: deque.pushBack(v)',
  ],
  generate: (input?) => {
    const graph = input?.graph ?? DEFAULT_GRAPH_DATA;
    const nodes = graph.nodes;
    const edges = graph.edges ?? [];
    const start = input?.startNode ?? nodes[0]?.id ?? 'A';
    const target = input?.targetNode ?? nodes[nodes.length - 1]?.id ?? 'F';

    // Normalize edge weights to 0 or 1
    const normalizedEdges = edges.map(e => ({
      ...e,
      weight: (e.weight ?? 1) <= 1 ? 0 : 1,
    }));

    const adj: Record<string, Array<{ to: string; weight: number }>> = {};
    for (const n of nodes) adj[n.id] = [];
    for (const e of normalizedEdges) {
      adj[e.from].push({ to: e.to, weight: e.weight });
      if (!graph.directed) adj[e.to].push({ to: e.from, weight: e.weight });
    }

    const dist: Record<string, number> = {};
    for (const n of nodes) dist[n.id] = Infinity;
    dist[start] = 0;

    const deque: string[] = [start];
    const snapshots: Snapshot<GraphData>[] = [];

    snapshots.push({
      id: '0',
      step: 0,
      description: '0-1 BFS initialized. Using deque for 0-weight priority.',
      data: { ...graph, nodes: nodes.map(n => ({ ...n, state: n.id === start ? 'queued' as const : 'default' as const })) },
      currentLine: 0,
      variables: { dist: { ...dist } },
    });

    while (deque.length > 0) {
      const u = deque.shift()!;

      snapshots.push({
        id: `${snapshots.length}`,
        step: snapshots.length,
        description: `Processing ${u} (dist: ${dist[u]}).`,
        data: { ...graph, nodes: nodes.map(n => ({ ...n, state: n.id === u ? 'active' as const : 'default' as const })) },
        currentLine: 2,
        variables: { current: u, dist: { ...dist } },
      });

      for (const { to: v, weight: w } of adj[u]) {
        if (dist[u] + w < dist[v]) {
          dist[v] = dist[u] + w;
          if (w === 0) {
            deque.unshift(v);
            snapshots.push({
              id: `${snapshots.length}`,
              step: snapshots.length,
              description: `Relaxed ${v} with 0-weight edge. Added to front of deque.`,
              data: { ...graph, nodes: nodes.map(n => ({ ...n, state: n.id === v ? 'queued' as const : 'default' as const })) },
              currentLine: 6,
              variables: { neighbor: v, weight: 0, dist: { ...dist } },
            });
          } else {
            deque.push(v);
            snapshots.push({
              id: `${snapshots.length}`,
              step: snapshots.length,
              description: `Relaxed ${v} with 1-weight edge. Added to back of deque.`,
              data: { ...graph, nodes: nodes.map(n => ({ ...n, state: n.id === v ? 'queued' as const : 'default' as const })) },
              currentLine: 7,
              variables: { neighbor: v, weight: 1, dist: { ...dist } },
            });
          }
        }
      }
    }

    snapshots.push({
      id: `${snapshots.length}`,
      step: snapshots.length,
      description: `0-1 BFS complete. Distance to ${target}: ${dist[target] === Infinity ? '∞' : dist[target]}.`,
      data: { ...graph, nodes: nodes.map(n => ({ ...n, state: 'path' as const })) },
      currentLine: 7,
      variables: { dist, targetDist: dist[target] },
    });

    return snapshots;
  },
};

export const connectedComponents: AlgorithmDefinition<GraphAlgorithmInput, GraphData> = {
  id: 'connected-components',
  name: 'Connected Components',
  category: 'graph',
  categoryName: 'Graphs',
  description: 'Finds all connected components in undirected graph using DFS.',
  difficulty: 'Easy',
  timeComplexity: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)' },
  spaceComplexity: 'O(V)',
  defaultInput: { graph: { ...DEFAULT_GRAPH_DATA, directed: false } },
  inputConfig: { type: 'graph' },
  code: [
    'componentId = 0',
    'for each vertex v:',
    '  if v not visited:',
    '    DFS(v, componentId)',
    '    componentId++',
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

    const visited = new Set<string>();
    const component: Record<string, number> = {};
    const snapshots: Snapshot<GraphData>[] = [];
    let compId = 0;

    const dfs = (u: string, id: number) => {
      visited.add(u);
      component[u] = id;

      for (const v of adj[u]) {
        if (!visited.has(v)) dfs(v, id);
      }
    };

    for (const n of nodes) {
      if (!visited.has(n.id)) {
        dfs(n.id, compId);

        snapshots.push({
          id: `${snapshots.length}`,
          step: snapshots.length,
          description: `Found component #${compId + 1} starting from ${n.id}.`,
          data: { ...graph, nodes: nodes.map(node => ({ ...node, state: component[node.id] === compId ? 'path' as const : 'default' as const })) },
          currentLine: 3,
          variables: { componentId: compId, component: { ...component } },
        });

        compId++;
      }
    }

    snapshots.push({
      id: `${snapshots.length}`,
      step: snapshots.length,
      description: `Found ${compId} connected component(s).`,
      data: { ...graph, nodes: nodes.map(n => ({ ...n, state: 'path' as const })) },
      currentLine: 4,
      variables: { totalComponents: compId, component },
    });

    return snapshots;
  },
};
