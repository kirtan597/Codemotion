import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { GraphData, GraphAlgorithmInput, DEFAULT_GRAPH_DATA } from './types';

export const findBridges: AlgorithmDefinition<GraphAlgorithmInput, GraphData> = {
  id: 'find-bridges',
  name: 'Find Bridges (Cut Edges)',
  category: 'graph',
  categoryName: 'Graphs',
  description: 'Finds all bridges (critical edges) whose removal disconnects the graph.',
  difficulty: 'Hard',
  timeComplexity: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)' },
  spaceComplexity: 'O(V)',
  defaultInput: { graph: { ...DEFAULT_GRAPH_DATA, directed: false } },
  inputConfig: { type: 'graph' },
  code: [
    'function DFS(u, parent):',
    '  disc[u] = low[u] = time++',
    '  for each neighbor v of u:',
    '    if v == parent: continue',
    '    if v not visited:',
    '      DFS(v, u)',
    '      low[u] = min(low[u], low[v])',
    '      if low[v] > disc[u]: (u, v) is bridge',
    '    else: low[u] = min(low[u], disc[v])',
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

    const disc: Record<string, number> = {};
    const low: Record<string, number> = {};
    const bridges: Array<[string, string]> = [];
    const snapshots: Snapshot<GraphData>[] = [];
    let time = 0;

    const dfs = (u: string, parent: string | null = null) => {
      disc[u] = low[u] = time++;

      snapshots.push({
        id: `${snapshots.length}`,
        step: snapshots.length,
        description: `Visiting ${u}. disc[${u}] = low[${u}] = ${disc[u]}.`,
        data: { ...graph, nodes: nodes.map(n => ({ ...n, state: n.id === u ? 'active' as const : 'default' as const })) },
        currentLine: 1,
        variables: { current: u, parent, disc: { ...disc }, low: { ...low }, bridges: [...bridges] },
      });

      for (const v of adj[u]) {
        if (v === parent) continue;

        if (disc[v] === undefined) {
          dfs(v, u);
          low[u] = Math.min(low[u], low[v]);

          if (low[v] > disc[u]) {
            bridges.push([u, v]);
            snapshots.push({
              id: `${snapshots.length}`,
              step: snapshots.length,
              description: `Bridge found: (${u}, ${v}). low[${v}] (${low[v]}) > disc[${u}] (${disc[u]}).`,
              data: { ...graph, nodes: nodes.map(n => ({ ...n, state: [u, v].includes(n.id) ? 'path' as const : 'default' as const })) },
              currentLine: 7,
              variables: { bridge: [u, v], bridges: [...bridges] },
            });
          }
        } else {
          low[u] = Math.min(low[u], disc[v]);
        }
      }
    };

    for (const n of nodes) {
      if (disc[n.id] === undefined) dfs(n.id);
    }

    snapshots.push({
      id: `${snapshots.length}`,
      step: snapshots.length,
      description: `Found ${bridges.length} bridge(s): ${bridges.map(b => `(${b[0]},${b[1]})`).join(', ')}.`,
      data: { ...graph, nodes: nodes.map(n => ({ ...n, state: 'path' as const })) },
      currentLine: 8,
      variables: { bridges, bridgeCount: bridges.length },
    });

    return snapshots;
  },
};

export const findArticulationPoints: AlgorithmDefinition<GraphAlgorithmInput, GraphData> = {
  id: 'find-articulation-points',
  name: 'Find Articulation Points (Cut Vertices)',
  category: 'graph',
  categoryName: 'Graphs',
  description: 'Finds all articulation points whose removal disconnects the graph.',
  difficulty: 'Hard',
  timeComplexity: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)' },
  spaceComplexity: 'O(V)',
  defaultInput: { graph: { ...DEFAULT_GRAPH_DATA, directed: false } },
  inputConfig: { type: 'graph' },
  code: [
    'function DFS(u, parent):',
    '  disc[u] = low[u] = time++',
    '  children = 0',
    '  for each neighbor v of u:',
    '    if v not visited:',
    '      children++',
    '      DFS(v, u)',
    '      low[u] = min(low[u], low[v])',
    '      if parent == null and children > 1: u is AP (root case)',
    '      if parent != null and low[v] >= disc[u]: u is AP',
    '    else if v != parent: low[u] = min(low[u], disc[v])',
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

    const disc: Record<string, number> = {};
    const low: Record<string, number> = {};
    const ap = new Set<string>();
    const snapshots: Snapshot<GraphData>[] = [];
    let time = 0;

    const dfs = (u: string, parent: string | null = null) => {
      disc[u] = low[u] = time++;
      let children = 0;

      for (const v of adj[u]) {
        if (disc[v] === undefined) {
          children++;
          dfs(v, u);
          low[u] = Math.min(low[u], low[v]);

          if (parent === null && children > 1) {
            ap.add(u);
            snapshots.push({
              id: `${snapshots.length}`,
              step: snapshots.length,
              description: `AP found: ${u} (root with ${children} children).`,
              data: { ...graph, nodes: nodes.map(n => ({ ...n, state: n.id === u ? 'path' as const : 'default' as const })) },
              currentLine: 8,
              variables: { ap: u, reason: 'root' },
            });
          }

          if (parent !== null && low[v] >= disc[u]) {
            ap.add(u);
            snapshots.push({
              id: `${snapshots.length}`,
              step: snapshots.length,
              description: `AP found: ${u}. low[${v}] (${low[v]}) >= disc[${u}] (${disc[u]}).`,
              data: { ...graph, nodes: nodes.map(n => ({ ...n, state: n.id === u ? 'path' as const : 'default' as const })) },
              currentLine: 9,
              variables: { ap: u, reason: 'non-root' },
            });
          }
        } else if (v !== parent) {
          low[u] = Math.min(low[u], disc[v]);
        }
      }
    };

    for (const n of nodes) {
      if (disc[n.id] === undefined) dfs(n.id);
    }

    snapshots.push({
      id: `${snapshots.length}`,
      step: snapshots.length,
      description: `Found ${ap.size} articulation point(s): {${[...ap].join(', ')}}.`,
      data: { ...graph, nodes: nodes.map(n => ({ ...n, state: ap.has(n.id) ? 'path' as const : 'default' as const })) },
      currentLine: 10,
      variables: { articulationPoints: [...ap], count: ap.size },
    });

    return snapshots;
  },
};
