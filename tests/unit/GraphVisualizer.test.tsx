import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, renderHook, act } from '@testing-library/react';
import { GraphCanvas } from '@/components/visualizers/GraphCanvas';
import { QueueOverlay } from '@/components/visualizers/QueueOverlay';
import { GraphBuilder } from '@/components/visualizers/GraphBuilder';
import { useGraphEditor } from '@/hooks/useGraphEditor';
import { GraphData, DEFAULT_GRAPH_DATA } from '@/lib/algorithms/graph/types';
import { Snapshot } from '@/lib/types/algorithm';

describe('GraphCanvas', () => {
  it('renders custom SVG with nodes, edges, and offset weights', () => {
    const testGraph: GraphData = {
      directed: true,
      nodes: [
        { id: 'A', label: 'A', x: 50, y: 50, state: 'visited' },
        { id: 'B', label: 'B', x: 200, y: 50, state: 'queued' },
        { id: 'C', label: 'C', x: 100, y: 150, state: 'path' },
        { id: 'D', label: 'D', x: 250, y: 150, state: 'default' },
      ],
      edges: [
        { from: 'A', to: 'B', weight: 5, state: 'relaxed' },
        { from: 'B', to: 'C', weight: 3, state: 'path' },
        { from: 'C', to: 'D', weight: 7, state: 'default' },
      ],
    };

    const snapshot: Snapshot<GraphData> = {
      id: 'snap-1',
      step: 1,
      description: 'Relaxing edge A -> B',
      data: testGraph,
    };

    const { container } = render(<GraphCanvas snapshot={snapshot} />);

    // SVG elements rendered
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();

    // Node labels
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByText('D')).toBeInTheDocument();

    // Edge weights rendered
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();

    // Relaxed edge has rose-500 color (#f43f5e)
    const lines = container.querySelectorAll('line');
    const relaxedLine = Array.from(lines).find((l) => l.getAttribute('stroke') === '#f43f5e');
    expect(relaxedLine).toBeDefined();

    // Path edge has emerald color (#10b981)
    const pathLine = Array.from(lines).find((l) => l.getAttribute('stroke') === '#10b981');
    expect(pathLine).toBeDefined();
  });
});

describe('QueueOverlay', () => {
  it('renders queue items and distance table', () => {
    const queue = [
      { id: 'A-0', label: 'A', priority: 0 },
      { id: 'B-4', label: 'B', priority: 4 },
    ];
    const table = [
      { node: 'A', dist: 0, prev: null },
      { node: 'B', dist: 4, prev: 'A' },
      { node: 'C', dist: Infinity, prev: null },
    ];

    render(<QueueOverlay queue={queue} table={table} structureType="priorityQueue" />);

    expect(screen.getByText('Min-Heap (Priority Queue)')).toBeInTheDocument();
    expect(screen.getByText('Distance Table')).toBeInTheDocument();

    // Queue elements & table elements
    expect(screen.getAllByText('A').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('B').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('4').length).toBeGreaterThanOrEqual(1);

    // Distance table elements
    expect(screen.getByText('∞')).toBeInTheDocument();
  });
});

describe('useGraphEditor & GraphBuilder', () => {
  it('supports adding a node, toggling directed, and removing a node', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useGraphEditor({
        initialGraph: {
          directed: false,
          nodes: [{ id: 'A', label: 'A', x: 50, y: 50, state: 'default' }],
          edges: [],
        },
        onChange,
      })
    );

    // 1. Add node
    act(() => {
      result.current.addNode(150, 150);
    });
    expect(result.current.graph.nodes.length).toBe(2);
    expect(result.current.graph.nodes[1].label).toBe('B');
    expect(onChange).toHaveBeenCalled();

    // 2. Add edge
    act(() => {
      result.current.addEdge('A', 'B', 10);
    });
    expect(result.current.graph.edges.length).toBe(1);
    expect(result.current.graph.edges[0].weight).toBe(10);

    // 3. Toggle directed
    act(() => {
      result.current.toggleDirected();
    });
    expect(result.current.graph.directed).toBe(true);

    // 4. Remove node
    act(() => {
      result.current.removeNode('A');
    });
    expect(result.current.graph.nodes.length).toBe(1);
    expect(result.current.graph.edges.length).toBe(0);
  });

  it('renders GraphBuilder with warning on negative weights for Dijkstra', () => {
    const negativeGraph: GraphData = {
      directed: false,
      nodes: [
        { id: 'A', label: 'A', x: 50, y: 50, state: 'default' },
        { id: 'B', label: 'B', x: 150, y: 50, state: 'default' },
      ],
      edges: [{ from: 'A', to: 'B', weight: -3, state: 'default' }],
    };

    render(
      <GraphBuilder
        initialGraph={negativeGraph}
        algorithmId="dijkstra"
      />
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Negative Weight Detected/i)).toBeInTheDocument();
  });
});
