import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { GraphData, GraphAlgorithmInput, DEFAULT_GRAPH_DATA } from './types';

export const kosarajuSCC: AlgorithmDefinition<GraphAlgorithmInput, GraphData> = {
  id: 'kosaraju-scc',
  name: "Kosaraju's SCC Algorithm",
  category: 'graph',
  categoryName: 'Graphs',
  description: 'Finds Strongly Connected Components using two DFS passes.',
  difficulty: 'Hard',
  timeComplexity: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)' },
  spaceComplexity: 'O(V + E)',
  defaultInput: { graph: { ...DEFAULT_GRAPH_DATA, directed: true } },
  inputConfig: { type: 'graph' },
  code: [
    'DFS on original graph, record finish times',
    'Reverse all edges',
    'DFS on reversed graph in decreasing finish time order',
    'Each DFS tree in step 3 is one SCC',
  ],
  generate: (input?) => {
    const graph = input?.graph ?? { ...DEFAULT_GRAPH_DATA, directed: true };
    const nodes = graph.nodes;
    const edges = graph.edges ?? [];
    const adj: Record<string, string[]> = {};
    const adjRev: Record<string, string[]> = {};

    for (const n of nodes) {
      adj[n.id] = [];
      adjRev[n.id] = [];
    }
    for (const e of edges) {
      adj[e.from].push(e.to);
      adjRev[e.to].push(e.from);
    }

    const visited = new Set<string>();
    const stack: string[] = [];
    const sccMap: Record<string, number> = {};
    const snapshots: Snapshot<GraphData>[] = [];
    let sccCount = 0;

    const dfs1 = (u: string) => {
      visited.add(u);
      for (const v of adj[u]) {
        if (!visited.has(v)) dfs1(v);
      }
      stack.push(u);
    };

    snapshots.push({
      id: '0',
      step: 0,
      description: 'Phase 1: DFS on original graph to get finish times.',
      data: { ...graph, nodes: nodes.map(n => ({ ...n, state: 'default' as const })) },
      currentLine: 0,
      variables: { phase: 1 },
    });

    for (const n of nodes) {
      if (!visited.has(n.id)) dfs1(n.id);
    }

    snapshots.push({
      id: `${snapshots.length}`,
      step: snapshots.length,
      description: 'Phase 1 complete. Computed finish times.',
      data: { ...graph, nodes: nodes.map(n => ({ ...n, state: 'visited' as const })) },
      currentLine: 0,
      variables: { phase: 1, stack: [...stack] },
    });

    visited.clear();

    const dfs2 = (u: string, sccId: number) => {
      visited.add(u);
      sccMap[u] = sccId;
      for (const v of adjRev[u]) {
        if (!visited.has(v)) dfs2(v, sccId);
      }
    };

    snapshots.push({
      id: `${snapshots.length}`,
      step: snapshots.length,
      description: 'Phase 2: DFS on reversed graph in decreasing finish time.',
      data: { ...graph, nodes: nodes.map(n => ({ ...n, state: 'default' as const })) },
      currentLine: 2,
      variables: { phase: 2 },
    });

    while (stack.length > 0) {
      const u = stack.pop()!;
      if (!visited.has(u)) {
        dfs2(u, sccCount);
        snapshots.push({
          id: `${snapshots.length}`,
          step: snapshots.length,
          description: `Found SCC #${sccCount + 1} starting from ${u}.`,
          data: { ...graph, nodes: nodes.map(n => ({ ...n, state: sccMap[n.id] === sccCount ? 'path' as const : 'default' as const })) },
          currentLine: 2,
          variables: { sccId: sccCount, sccMap: { ...sccMap } },
        });
        sccCount++;
      }
    }

    snapshots.push({
      id: `${snapshots.length}`,
      step: snapshots.length,
      description: `Kosaraju complete! Found ${sccCount} strongly connected components.`,
      data: { ...graph, nodes: nodes.map(n => ({ ...n, state: 'path' as const })) },
      currentLine: 3,
      variables: { sccCount, sccMap },
    });

    return snapshots;
  },
};

export const tarjanSCC: AlgorithmDefinition<GraphAlgorithmInput, GraphData> = {
  id: 'tarjan-scc',
  name: "Tarjan's SCC Algorithm",
  category: 'graph',
  categoryName: 'Graphs',
  description: 'Finds SCCs using single DFS with low-link values.',
  difficulty: 'Hard',
  timeComplexity: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)' },
  spaceComplexity: 'O(V)',
  defaultInput: { graph: { ...DEFAULT_GRAPH_DATA, directed: true } },
  inputConfig: { type: 'graph' },
  code: [
    'function Tarjan(u):',
    '  disc[u] = low[u] = time++',
    '  stack.push(u)',
    '  for each neighbor v of u:',
    '    if v not visited: Tarjan(v), low[u] = min(low[u], low[v])',
    '    else if v on stack: low[u] = min(low[u], disc[v])',
    '  if disc[u] == low[u]: pop SCC from stack',
  ],
  generate: (input?) => {
    const graph = input?.graph ?? { ...DEFAULT_GRAPH_DATA, directed: true };
    const nodes = graph.nodes;
    const edges = graph.edges ?? [];
    const adj: Record<string, string[]> = {};

    for (const n of nodes) adj[n.id] = [];
    for (const e of edges) adj[e.from].push(e.to);

    const disc: Record<string, number> = {};
    const low: Record<string, number> = {};
    const onStack = new Set<string>();
    const stack: string[] = [];
    const snapshots: Snapshot<GraphData>[] = [];
    let time = 0;
    let sccCount = 0;

    const tarjan = (u: string) => {
      disc[u] = low[u] = time++;
      stack.push(u);
      onStack.add(u);

      snapshots.push({
        id: `${snapshots.length}`,
        step: snapshots.length,
        description: `Visiting ${u}. disc[${u}] = low[${u}] = ${disc[u]}.`,
        data: { ...graph, nodes: nodes.map(n => ({ ...n, state: n.id === u ? 'active' as const : 'default' as const })) },
        currentLine: 1,
        variables: { current: u, disc: { ...disc }, low: { ...low }, stack: [...stack] },
      });

      for (const v of adj[u]) {
        if (disc[v] === undefined) {
          tarjan(v);
          low[u] = Math.min(low[u], low[v]);
        } else if (onStack.has(v)) {
          low[u] = Math.min(low[u], disc[v]);
        }
      }

      if (disc[u] === low[u]) {
        const scc: string[] = [];
        let w: string;
        do {
          w = stack.pop()!;
          onStack.delete(w);
          scc.push(w);
        } while (w !== u);

        snapshots.push({
          id: `${snapshots.length}`,
          step: snapshots.length,
          description: `SCC #${sccCount + 1}: {${scc.join(', ')}}.`,
          data: { ...graph, nodes: nodes.map(n => ({ ...n, state: scc.includes(n.id) ? 'path' as const : 'default' as const })) },
          currentLine: 6,
          variables: { scc, sccCount: sccCount + 1 },
        });
        sccCount++;
      }
    };

    for (const n of nodes) {
      if (disc[n.id] === undefined) tarjan(n.id);
    }

    snapshots.push({
      id: `${snapshots.length}`,
      step: snapshots.length,
      description: `Tarjan complete! Found ${sccCount} SCCs.`,
      data: { ...graph, nodes: nodes.map(n => ({ ...n, state: 'path' as const })) },
      currentLine: 6,
      variables: { sccCount },
    });

    return snapshots;
  },
};
