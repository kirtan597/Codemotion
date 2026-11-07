import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { dijkstra } from '@/lib/algorithms/graph/dijkstra';
import { bfs } from '@/lib/algorithms/graph/bfs';
import { dfs } from '@/lib/algorithms/graph/dfs';
import {
  GraphData,
  GraphNode,
  GraphEdge,
  NegativeWeightError,
  DEFAULT_GRAPH_DATA,
} from '@/lib/algorithms/graph/types';

// Reference Bellman-Ford algorithm to verify Dijkstra correctness
function bellmanFord(
  nodes: GraphNode[],
  edges: GraphEdge[],
  startNode: string,
  directed: boolean
): Record<string, number> {
  const dist: Record<string, number> = {};
  for (const n of nodes) {
    dist[n.id] = Infinity;
  }
  dist[startNode] = 0;

  for (let i = 0; i < nodes.length - 1; i++) {
    let changed = false;
    for (const e of edges) {
      const w = e.weight ?? 1;
      if (dist[e.from] < Infinity && dist[e.from] + w < dist[e.to]) {
        dist[e.to] = dist[e.from] + w;
        changed = true;
      }
      if (!directed && dist[e.to] < Infinity && dist[e.to] + w < dist[e.from]) {
        dist[e.from] = dist[e.to] + w;
        changed = true;
      }
    }
    if (!changed) break;
  }

  return dist;
}

// Reference unweighted shortest path (BFS)
function unweightedBFS(
  nodes: GraphNode[],
  edges: GraphEdge[],
  startNode: string,
  directed: boolean
): Record<string, number> {
  const dist: Record<string, number> = {};
  for (const n of nodes) dist[n.id] = Infinity;
  dist[startNode] = 0;

  const adj: Record<string, string[]> = {};
  for (const n of nodes) adj[n.id] = [];
  for (const e of edges) {
    adj[e.from].push(e.to);
    if (!directed) adj[e.to].push(e.from);
  }

  const q = [startNode];
  while (q.length > 0) {
    const curr = q.shift()!;
    for (const neighbor of adj[curr] ?? []) {
      if (dist[neighbor] === Infinity) {
        dist[neighbor] = dist[curr] + 1;
        q.push(neighbor);
      }
    }
  }

  return dist;
}

// Fast-check arbitrary for non-negative graphs
const nodeIds = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

const randomGraphArb = fc
  .record({
    nodeCount: fc.integer({ min: 2, max: 8 }),
    directed: fc.boolean(),
    edgePairs: fc.array(
      fc.record({
        fromIdx: fc.integer({ min: 0, max: 7 }),
        toIdx: fc.integer({ min: 0, max: 7 }),
        weight: fc.integer({ min: 0, max: 50 }),
      }),
      { minLength: 1, maxLength: 20 }
    ),
  })
  .map(({ nodeCount, directed, edgePairs }) => {
    const selectedIds = nodeIds.slice(0, nodeCount);
    const nodes: GraphNode[] = selectedIds.map((id, idx) => ({
      id,
      label: id,
      x: 100 + (idx % 3) * 120,
      y: 80 + Math.floor(idx / 3) * 100,
      state: 'default',
    }));

    const edges: GraphEdge[] = [];
    for (const ep of edgePairs) {
      const from = selectedIds[ep.fromIdx % nodeCount];
      const to = selectedIds[ep.toIdx % nodeCount];
      if (from !== to && !edges.some((e) => e.from === from && e.to === to)) {
        edges.push({
          from,
          to,
          weight: ep.weight,
          state: 'default',
        });
      }
    }

    const startNode = selectedIds[0];
    const targetNode = selectedIds[selectedIds.length - 1];

    return {
      graph: { nodes, edges, directed },
      startNode,
      targetNode,
    };
  });

describe('Graph Algorithms', () => {
  describe('Dijkstra', () => {
    it('property test: Dijkstra equals Bellman-Ford on 200 random non-negative graphs', () => {
      fc.assert(
        fc.property(randomGraphArb, ({ graph, startNode, targetNode }) => {
          const snapshots = dijkstra.generate({ graph, startNode, targetNode });
          const lastSnap = snapshots[snapshots.length - 1];
          const dijkstraDistances = lastSnap.variables?.distances as Record<string, number>;

          const bfDistances = bellmanFord(
            graph.nodes,
            graph.edges,
            startNode,
            Boolean(graph.directed)
          );

          for (const node of graph.nodes) {
            expect(dijkstraDistances[node.id]).toBe(bfDistances[node.id]);
          }
          return true;
        }),
        { numRuns: 200 }
      );
    });

    it('rejects negative weights with typed NegativeWeightError', () => {
      const graphWithNegative: GraphData = {
        nodes: [
          { id: 'A', label: 'A', x: 0, y: 0, state: 'default' },
          { id: 'B', label: 'B', x: 100, y: 0, state: 'default' },
        ],
        edges: [{ from: 'A', to: 'B', weight: -5, state: 'default' }],
      };

      expect(() => {
        dijkstra.generate({ graph: graphWithNegative, startNode: 'A' });
      }).toThrowError(NegativeWeightError);
    });

    it('disconnected nodes return Infinity', () => {
      const disconnectedGraph: GraphData = {
        nodes: [
          { id: 'A', label: 'A', x: 0, y: 0, state: 'default' },
          { id: 'B', label: 'B', x: 100, y: 0, state: 'default' },
          { id: 'C', label: 'C', x: 200, y: 0, state: 'default' }, // disconnected
        ],
        edges: [{ from: 'A', to: 'B', weight: 4, state: 'default' }],
      };

      const snapshots = dijkstra.generate({ graph: disconnectedGraph, startNode: 'A' });
      const lastSnap = snapshots[snapshots.length - 1];
      const dists = lastSnap.variables?.distances as Record<string, number>;

      expect(dists['A']).toBe(0);
      expect(dists['B']).toBe(4);
      expect(dists['C']).toBe(Infinity);
    });

    it('logs every edge relaxation, distance updates, and min-heap in meta', () => {
      const snapshots = dijkstra.generate({ graph: DEFAULT_GRAPH_DATA, startNode: 'A' });
      expect(snapshots.length).toBeGreaterThan(0);

      // Check min-heap in variables
      const hasHeap = snapshots.some(
        (s) => Array.isArray(s.variables?.minHeap) && s.variables?.minHeap.length > 0
      );
      expect(hasHeap).toBe(true);

      // Check table in variables
      const lastSnap = snapshots[snapshots.length - 1];
      expect(Array.isArray(lastSnap.variables?.table)).toBe(true);

      // Check path traceback
      const tracebackSnap = snapshots.find((s) => s.variables?.phase === 'traceback');
      expect(tracebackSnap).toBeDefined();
      expect(Array.isArray(tracebackSnap?.variables?.path)).toBe(true);
    });
  });

  describe('BFS', () => {
    it('property test: BFS equals unweighted shortest path on random graphs', () => {
      fc.assert(
        fc.property(randomGraphArb, ({ graph, startNode, targetNode }) => {
          const snapshots = bfs.generate({ graph, startNode, targetNode });
          const lastSnap = snapshots[snapshots.length - 1];
          const bfsDistances = lastSnap.variables?.distances as Record<string, number>;

          const refDistances = unweightedBFS(
            graph.nodes,
            graph.edges,
            startNode,
            Boolean(graph.directed)
          );

          for (const node of graph.nodes) {
            expect(bfsDistances[node.id]).toBe(refDistances[node.id]);
          }
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('disconnected nodes return Infinity', () => {
      const disconnectedGraph: GraphData = {
        nodes: [
          { id: 'A', label: 'A', x: 0, y: 0, state: 'default' },
          { id: 'B', label: 'B', x: 100, y: 0, state: 'default' },
          { id: 'Z', label: 'Z', x: 200, y: 0, state: 'default' },
        ],
        edges: [{ from: 'A', to: 'B', state: 'default' }],
      };

      const snaps = bfs.generate({ graph: disconnectedGraph, startNode: 'A', targetNode: 'Z' });
      const last = snaps[snaps.length - 1];
      expect(last.variables?.distances?.['Z']).toBe(Infinity);
    });
  });

  describe('DFS', () => {
    it('uses iterative explicit stack and explores reachable nodes', () => {
      const snaps = dfs.generate({ graph: DEFAULT_GRAPH_DATA, startNode: 'A' });
      expect(snaps.length).toBeGreaterThan(0);

      // Verify stack exists in variables
      const hasStack = snaps.some((s) => Array.isArray(s.variables?.stack));
      expect(hasStack).toBe(true);

      const last = snaps[snaps.length - 1];
      expect(last.variables?.distances?.['A']).toBe(0);
      expect(last.variables?.distances?.['F']).toBeLessThan(Infinity);
    });
  });
});

