import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { GraphData, GraphAlgorithmInput, DEFAULT_GRAPH_DATA } from './types';

export const eulerianPath: AlgorithmDefinition<GraphAlgorithmInput, GraphData> = {
  id: 'eulerian-path',
  name: 'Eulerian Path/Circuit Check',
  category: 'graph',
  categoryName: 'Graphs',
  description: 'Checks if graph has Eulerian path (visits every edge exactly once) or circuit.',
  difficulty: 'Medium',
  timeComplexity: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)' },
  spaceComplexity: 'O(V)',
  defaultInput: { graph: { ...DEFAULT_GRAPH_DATA, directed: false } },
  inputConfig: { type: 'graph' },
  code: [
    'Count in-degree and out-degree for each vertex',
    'For undirected: Eulerian circuit if all even degree',
    'For undirected: Eulerian path if exactly 2 odd degree',
    'For directed: check in-degree == out-degree',
  ],
  generate: (input?) => {
    const graph = input?.graph ?? { ...DEFAULT_GRAPH_DATA, directed: false };
    const nodes = graph.nodes;
    const edges = graph.edges ?? [];
    const isDirected = Boolean(graph.directed);

    const degree: Record<string, number> = {};
    const inDegree: Record<string, number> = {};
    const outDegree: Record<string, number> = {};

    for (const n of nodes) {
      degree[n.id] = 0;
      inDegree[n.id] = 0;
      outDegree[n.id] = 0;
    }

    for (const e of edges) {
      if (isDirected) {
        outDegree[e.from]++;
        inDegree[e.to]++;
      } else {
        degree[e.from]++;
        degree[e.to]++;
      }
    }

    const snapshots: Snapshot<GraphData>[] = [];

    snapshots.push({
      id: '0',
      step: 0,
      description: `Checking for Eulerian path/circuit in ${isDirected ? 'directed' : 'undirected'} graph.`,
      data: { ...graph, nodes: nodes.map(n => ({ ...n, state: 'default' as const })) },
      currentLine: 0,
      variables: { degree: isDirected ? outDegree : degree },
    });

    let hasEulerianCircuit = false;
    let hasEulerianPath = false;

    if (!isDirected) {
      const oddDegreeCount = nodes.filter(n => degree[n.id] % 2 === 1).length;

      if (oddDegreeCount === 0) {
        hasEulerianCircuit = true;
        snapshots.push({
          id: `${snapshots.length}`,
          step: snapshots.length,
          description: 'All vertices have even degree. Eulerian circuit exists!',
          data: { ...graph, nodes: nodes.map(n => ({ ...n, state: 'path' as const })) },
          currentLine: 1,
          variables: { hasEulerianCircuit: true },
        });
      } else if (oddDegreeCount === 2) {
        hasEulerianPath = true;
        const oddNodes = nodes.filter(n => degree[n.id] % 2 === 1).map(n => n.id);
        snapshots.push({
          id: `${snapshots.length}`,
          step: snapshots.length,
          description: `Exactly 2 vertices with odd degree: {${oddNodes.join(', ')}}. Eulerian path exists!`,
          data: { ...graph, nodes: nodes.map(n => ({ ...n, state: oddNodes.includes(n.id) ? 'path' as const : 'default' as const })) },
          currentLine: 2,
          variables: { hasEulerianPath: true, oddNodes },
        });
      } else {
        snapshots.push({
          id: `${snapshots.length}`,
          step: snapshots.length,
          description: `${oddDegreeCount} vertices with odd degree. No Eulerian path or circuit.`,
          data: { ...graph, nodes: nodes.map(n => ({ ...n, state: 'default' as const })) },
          currentLine: 2,
          variables: { hasEulerianPath: false, hasEulerianCircuit: false },
        });
      }
    } else {
      let balanced = true;
      let startEnd = 0;

      for (const n of nodes) {
        if (inDegree[n.id] !== outDegree[n.id]) {
          balanced = false;
          if (outDegree[n.id] - inDegree[n.id] === 1 || inDegree[n.id] - outDegree[n.id] === 1) {
            startEnd++;
          }
        }
      }

      if (balanced) {
        hasEulerianCircuit = true;
        snapshots.push({
          id: `${snapshots.length}`,
          step: snapshots.length,
          description: 'All vertices have in-degree == out-degree. Eulerian circuit exists!',
          data: { ...graph, nodes: nodes.map(n => ({ ...n, state: 'path' as const })) },
          currentLine: 3,
          variables: { hasEulerianCircuit: true },
        });
      } else if (startEnd === 2) {
        hasEulerianPath = true;
        snapshots.push({
          id: `${snapshots.length}`,
          step: snapshots.length,
          description: 'Exactly one vertex with out-degree - in-degree = 1, and one with in-degree - out-degree = 1. Eulerian path exists!',
          data: { ...graph, nodes: nodes.map(n => ({ ...n, state: 'path' as const })) },
          currentLine: 3,
          variables: { hasEulerianPath: true },
        });
      } else {
        snapshots.push({
          id: `${snapshots.length}`,
          step: snapshots.length,
          description: 'Degree conditions not satisfied. No Eulerian path or circuit.',
          data: { ...graph, nodes: nodes.map(n => ({ ...n, state: 'default' as const })) },
          currentLine: 3,
          variables: { hasEulerianPath: false, hasEulerianCircuit: false },
        });
      }
    }

    return snapshots;
  },
};

export const hierholzer: AlgorithmDefinition<GraphAlgorithmInput, GraphData> = {
  id: 'hierholzer',
  name: "Hierholzer's Algorithm",
  category: 'graph',
  categoryName: 'Graphs',
  description: 'Finds Eulerian circuit/path in a graph efficiently.',
  difficulty: 'Hard',
  timeComplexity: { best: 'O(E)', average: 'O(E)', worst: 'O(E)' },
  spaceComplexity: 'O(E)',
  defaultInput: { graph: { ...DEFAULT_GRAPH_DATA, directed: false }, startNode: 'A' },
  inputConfig: { type: 'graph' },
  code: [
    'Start at any vertex (or vertex with odd degree)',
    'Follow edges, removing them as visited',
    'When stuck, backtrack and continue from unvisited edges',
    'Reverse the path to get Eulerian circuit/path',
  ],
  generate: (input?) => {
    const graph = input?.graph ?? { ...DEFAULT_GRAPH_DATA, directed: false };
    const nodes = graph.nodes;
    const edges = graph.edges ?? [];
    const start = input?.startNode ?? nodes[0]?.id ?? 'A';

    const adj: Record<string, string[]> = {};
    for (const n of nodes) adj[n.id] = [];
    for (const e of edges) {
      adj[e.from].push(e.to);
      if (!graph.directed) adj[e.to].push(e.from);
    }

    const snapshots: Snapshot<GraphData>[] = [];
    const circuit: string[] = [];
    const stack: string[] = [start];

    snapshots.push({
      id: '0',
      step: 0,
      description: `Hierholzer's algorithm starting from ${start}.`,
      data: { ...graph, nodes: nodes.map(n => ({ ...n, state: n.id === start ? 'active' as const : 'default' as const })) },
      currentLine: 0,
      variables: { current: start, circuit: [] },
    });

    while (stack.length > 0) {
      const u = stack[stack.length - 1];

      if (adj[u].length > 0) {
        const v = adj[u].pop()!;
        stack.push(v);

        // Remove reverse edge for undirected
        if (!graph.directed) {
          const idx = adj[v].indexOf(u);
          if (idx >= 0) adj[v].splice(idx, 1);
        }

        snapshots.push({
          id: `${snapshots.length}`,
          step: snapshots.length,
          description: `Traversing edge ${u} → ${v}.`,
          data: { ...graph, nodes: nodes.map(n => ({ ...n, state: n.id === v ? 'active' as const : 'default' as const })) },
          currentLine: 1,
          variables: { from: u, to: v, circuit: [...circuit] },
        });
      } else {
        circuit.push(stack.pop()!);
        snapshots.push({
          id: `${snapshots.length}`,
          step: snapshots.length,
          description: `Added ${circuit[circuit.length - 1]} to circuit.`,
          data: { ...graph, nodes: nodes.map(n => ({ ...n, state: 'visited' as const })) },
          currentLine: 2,
          variables: { circuit: [...circuit] },
        });
      }
    }

    circuit.reverse();

    snapshots.push({
      id: `${snapshots.length}`,
      step: snapshots.length,
      description: `Eulerian circuit/path: ${circuit.join(' → ')}.`,
      data: { ...graph, nodes: nodes.map(n => ({ ...n, state: 'path' as const })) },
      currentLine: 3,
      variables: { circuit },
    });

    return snapshots;
  },
};
