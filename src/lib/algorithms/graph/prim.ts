import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { GraphData, GraphAlgorithmInput, DEFAULT_GRAPH_DATA } from './types';

function edgeKey(from: string, to: string): string {
  return from < to ? `${from}-${to}` : `${to}-${from}`;
}

export const primMST: AlgorithmDefinition<GraphAlgorithmInput, GraphData> = {
  id: 'prim-mst',
  name: "Prim's MST Algorithm",
  category: 'graph',
  categoryName: 'Graphs',
  description: 'Finds Minimum Spanning Tree by growing tree from arbitrary vertex.',
  difficulty: 'Medium',
  timeComplexity: { best: 'O(E log V)', average: 'O(E log V)', worst: 'O(E log V)' },
  spaceComplexity: 'O(V + E)',
  defaultInput: { graph: { ...DEFAULT_GRAPH_DATA, directed: false }, startNode: 'A' },
  inputConfig: { type: 'graph' },
  code: [
    'Add start vertex to MST',
    'while MST has fewer than V vertices:',
    '  Find minimum weight edge connecting MST to non-MST vertex',
    '  Add edge and vertex to MST',
  ],
  generate: (input?) => {
    const graph = input?.graph ?? { ...DEFAULT_GRAPH_DATA, directed: false };
    const nodes = graph.nodes;
    const edges = graph.edges ?? [];
    const start = input?.startNode ?? nodes[0]?.id ?? 'A';
    const inMST = new Set<string>([start]);
    const mstEdges: string[] = [];
    const snapshots: Snapshot<GraphData>[] = [];

    const edgeStates: Record<string, any> = {};
    for (const e of edges) edgeStates[edgeKey(e.from, e.to)] = 'default';

    snapshots.push({
      id: '0',
      step: 0,
      description: `Started Prim's MST from ${start}.`,
      data: {
        ...graph,
        nodes: nodes.map(n => ({ ...n, state: n.id === start ? 'active' as const : 'default' as const })),
        edges: edges.map(e => ({ ...e, state: 'default' as const })),
      },
      currentLine: 0,
      variables: { inMST: [...inMST], mstEdges: [] },
    });

    while (inMST.size < nodes.length) {
      let minEdge: any = null;
      let minWeight = Infinity;

      for (const e of edges) {
        const w = e.weight ?? 1;
        if ((inMST.has(e.from) && !inMST.has(e.to)) || (inMST.has(e.to) && !inMST.has(e.from))) {
          if (w < minWeight) {
            minWeight = w;
            minEdge = e;
          }
        }
      }

      if (!minEdge) break;

      const newVertex = inMST.has(minEdge.from) ? minEdge.to : minEdge.from;
      inMST.add(newVertex);
      const eKey = edgeKey(minEdge.from, minEdge.to);
      edgeStates[eKey] = 'path';
      mstEdges.push(eKey);

      snapshots.push({
        id: `${snapshots.length}`,
        step: snapshots.length,
        description: `Added edge (${minEdge.from}-${minEdge.to}) weight ${minWeight}. Added vertex ${newVertex} to MST.`,
        data: {
          ...graph,
          nodes: nodes.map(n => ({ ...n, state: inMST.has(n.id) ? 'path' as const : 'default' as const })),
          edges: edges.map(e => ({ ...e, state: edgeStates[edgeKey(e.from, e.to)] ?? 'default' })),
        },
        currentLine: 3,
        variables: { inMST: [...inMST], mstEdges: [...mstEdges], totalWeight: mstEdges.length * minWeight },
      });
    }

    snapshots.push({
      id: `${snapshots.length}`,
      step: snapshots.length,
      description: `Prim's MST complete! ${mstEdges.length} edges in MST.`,
      data: {
        ...graph,
        nodes: nodes.map(n => ({ ...n, state: 'path' as const })),
        edges: edges.map(e => ({ ...e, state: edgeStates[edgeKey(e.from, e.to)] ?? 'default' })),
      },
      currentLine: 3,
      variables: { inMST: [...inMST], mstEdges: [...mstEdges] },
    });

    return snapshots;
  },
};
