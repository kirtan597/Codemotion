import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { GraphData, GraphAlgorithmInput, DEFAULT_GRAPH_DATA } from './types';

function heuristic(from: string, to: string, nodes: any[]): number {
  const n1 = nodes.find(n => n.id === from);
  const n2 = nodes.find(n => n.id === to);
  if (!n1 || !n2) return 0;
  return Math.sqrt((n1.x - n2.x) ** 2 + (n1.y - n2.y) ** 2) / 50;
}

function edgeKey(from: string, to: string, directed: boolean): string {
  if (directed) return `${from}->${to}`;
  return from < to ? `${from}-${to}` : `${to}-${from}`;
}

export const astar: AlgorithmDefinition<GraphAlgorithmInput, GraphData> = {
  id: 'astar',
  name: 'A* Search Algorithm',
  category: 'graph',
  categoryName: 'Graphs',
  description: 'Finds shortest path using heuristic function f(n) = g(n) + h(n).',
  difficulty: 'Hard',
  timeComplexity: { best: 'O(E)', average: 'O(E log V)', worst: 'O(E log V)' },
  spaceComplexity: 'O(V)',
  defaultInput: { graph: DEFAULT_GRAPH_DATA, startNode: 'A', targetNode: 'F' },
  inputConfig: { type: 'graph' },
  code: [
    'openSet.push({ start, f: h(start, target) })',
    'g[start] = 0',
    'while openSet not empty:',
    '  current = node with lowest f in openSet',
    '  if current == target: reconstruct path',
    '  for each neighbor v of current:',
    '    tentative_g = g[current] + weight(current, v)',
    '    if tentative_g < g[v]:',
    '      g[v] = tentative_g, f[v] = g[v] + h(v, target)',
    '      openSet.push({ v, f[v] })',
  ],
  generate: (input?) => {
    const graph = input?.graph ?? DEFAULT_GRAPH_DATA;
    const isDirected = Boolean(graph.directed);
    const nodes = graph.nodes;
    const edges = graph.edges ?? [];
    const start = input?.startNode ?? nodes[0]?.id ?? 'A';
    const target = input?.targetNode ?? nodes[nodes.length - 1]?.id ?? 'F';

    const adj: Record<string, Array<{ to: string; weight: number }>> = {};
    for (const n of nodes) adj[n.id] = [];
    for (const e of edges) {
      adj[e.from].push({ to: e.to, weight: e.weight ?? 1 });
      if (!isDirected) adj[e.to].push({ to: e.from, weight: e.weight ?? 1 });
    }

    const gScore: Record<string, number> = {};
    const fScore: Record<string, number> = {};
    const previous: Record<string, string | null> = {};
    const closedSet = new Set<string>();

    for (const n of nodes) {
      gScore[n.id] = Infinity;
      fScore[n.id] = Infinity;
      previous[n.id] = null;
    }

    gScore[start] = 0;
    fScore[start] = heuristic(start, target, nodes);

    const openSet: Array<{ node: string; f: number }> = [{ node: start, f: fScore[start] }];
    const snapshots: Snapshot<GraphData>[] = [];
    const edgeStates: Record<string, any> = {};

    for (const e of edges) edgeStates[edgeKey(e.from, e.to, isDirected)] = 'default';

    snapshots.push({
      id: '0',
      step: 0,
      description: `A* initialized. Start: ${start}, Target: ${target}. f(${start}) = ${fScore[start].toFixed(2)}.`,
      data: { ...graph, nodes: nodes.map(n => ({ ...n, state: n.id === start ? 'queued' as const : 'default' as const })) },
      currentLine: 0,
      variables: { gScore: { ...gScore }, fScore: { ...fScore }, openSet: [...openSet] },
    });

    while (openSet.length > 0) {
      openSet.sort((a, b) => a.f - b.f);
      const current = openSet.shift()!.node;

      if (current === target) {
        const path: string[] = [];
        let step: string | null = target;
        while (step) {
          path.unshift(step);
          step = previous[step];
        }

        for (const p of path) {
          for (const e of edges) {
            if ((e.from === p || e.to === p) && path.includes(e.from) && path.includes(e.to)) {
              edgeStates[edgeKey(e.from, e.to, isDirected)] = 'path';
            }
          }
        }

        snapshots.push({
          id: `${snapshots.length}`,
          step: snapshots.length,
          description: `Target reached! Path: ${path.join(' → ')}. Total cost: ${gScore[target].toFixed(2)}.`,
          data: { ...graph, nodes: nodes.map(n => ({ ...n, state: path.includes(n.id) ? 'path' as const : 'default' as const })), edges: edges.map(e => ({ ...e, state: edgeStates[edgeKey(e.from, e.to, isDirected)] })) },
          currentLine: 4,
          variables: { path, totalCost: gScore[target] },
        });
        return snapshots;
      }

      closedSet.add(current);

      snapshots.push({
        id: `${snapshots.length}`,
        step: snapshots.length,
        description: `Processing ${current}. g(${current}) = ${gScore[current].toFixed(2)}, f(${current}) = ${fScore[current].toFixed(2)}.`,
        data: { ...graph, nodes: nodes.map(n => ({ ...n, state: n.id === current ? 'active' as const : closedSet.has(n.id) ? 'visited' as const : 'default' as const })) },
        currentLine: 3,
        variables: { current, gScore: { ...gScore }, fScore: { ...fScore } },
      });

      for (const { to: neighbor, weight } of adj[current]) {
        if (closedSet.has(neighbor)) continue;

        const tentative_g = gScore[current] + weight;

        if (tentative_g < gScore[neighbor]) {
          previous[neighbor] = current;
          gScore[neighbor] = tentative_g;
          fScore[neighbor] = tentative_g + heuristic(neighbor, target, nodes);

          if (!openSet.find(item => item.node === neighbor)) {
            openSet.push({ node: neighbor, f: fScore[neighbor] });
          }

          snapshots.push({
            id: `${snapshots.length}`,
            step: snapshots.length,
            description: `Updated ${neighbor}. g(${neighbor}) = ${gScore[neighbor].toFixed(2)}, f(${neighbor}) = ${fScore[neighbor].toFixed(2)}.`,
            data: { ...graph, nodes: nodes.map(n => ({ ...n, state: n.id === neighbor ? 'queued' as const : 'default' as const })) },
            currentLine: 8,
            variables: { neighbor, gScore: { ...gScore }, fScore: { ...fScore } },
          });
        }
      }
    }

    snapshots.push({
      id: `${snapshots.length}`,
      step: snapshots.length,
      description: `Target ${target} unreachable from ${start}.`,
      data: { ...graph, nodes: nodes.map(n => ({ ...n, state: 'default' as const })) },
      currentLine: 9,
      variables: { path: [], unreachable: true },
    });

    return snapshots;
  },
};
