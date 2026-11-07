'use client';

/**
 * src/hooks/useGraphEditor.ts
 *
 * Hook managing interactive Graph Editing:
 * - Click canvas to add a node
 * - Drag node to reposition
 * - Drag node to node to connect an edge (with weight popover)
 * - Delete key or right-click to remove node
 * - Directed toggle
 * - Source & target node pickers
 * - Negative-weight detector for Dijkstra warning
 * - Pointer events with touch support
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { GraphData, GraphNode, GraphEdge, DEFAULT_GRAPH_DATA } from '@/lib/algorithms/graph/types';

export interface UseGraphEditorOptions {
  initialGraph?: GraphData;
  initialStartNode?: string;
  initialTargetNode?: string;
  onChange?: (graph: GraphData, startNode: string, targetNode?: string) => void;
  width?: number;
  height?: number;
}

export interface WeightPopoverState {
  from: string;
  to: string;
  weight: number;
  x: number;
  y: number;
}

export function useGraphEditor({
  initialGraph = DEFAULT_GRAPH_DATA,
  initialStartNode = 'A',
  initialTargetNode = 'F',
  onChange,
  width = 600,
  height = 380,
}: UseGraphEditorOptions = {}) {
  const [graph, setGraph] = useState<GraphData>(() => initialGraph);
  const [startNode, setStartNodeState] = useState<string>(initialStartNode);
  const [targetNode, setTargetNodeState] = useState<string>(initialTargetNode);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Dragging & connecting state
  const [connectingSourceNode, setConnectingSourceNode] = useState<GraphNode | null>(null);
  const [dragCurrentPos, setDragCurrentPos] = useState<{ x: number; y: number } | null>(null);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const dragStartPosRef = useRef<{ x: number; y: number; nodeX: number; nodeY: number } | null>(null);
  const isDragThresholdPassedRef = useRef(false);

  // Edge weight popover
  const [weightPopover, setWeightPopover] = useState<WeightPopoverState | null>(null);

  // Track negative weights for Dijkstra warning
  const negativeWeights = graph.edges.filter((e) => e.weight !== undefined && e.weight < 0);
  const hasNegativeWeights = negativeWeights.length > 0;

  // Notify parent of updates
  const notifyChange = useCallback(
    (newGraph: GraphData, newStart = startNode, newTarget = targetNode) => {
      onChange?.(newGraph, newStart, newTarget);
    },
    [onChange, startNode, targetNode]
  );

  // Generate next available node label (A, B, ..., Z, A1, B1, ...)
  const getNextLabel = useCallback(
    (existingNodes: GraphNode[]): string => {
      const existing = new Set(existingNodes.map((n) => n.label));
      for (let i = 0; i < 26; i++) {
        const char = String.fromCharCode(65 + i);
        if (!existing.has(char)) return char;
      }
      for (let num = 1; num < 100; num++) {
        for (let i = 0; i < 26; i++) {
          const char = `${String.fromCharCode(65 + i)}${num}`;
          if (!existing.has(char)) return char;
        }
      }
      return `N${existingNodes.length + 1}`;
    },
    []
  );

  // 1. Add Node
  const addNode = useCallback(
    (x: number, y: number) => {
      setGraph((prev) => {
        const label = getNextLabel(prev.nodes);
        const newNode: GraphNode = {
          id: label,
          label,
          x: Math.round(Math.max(30, Math.min(width - 30, x))),
          y: Math.round(Math.max(30, Math.min(height - 30, y))),
          state: 'default',
        };
        const nextNodes = [...prev.nodes, newNode];
        const nextGraph = { ...prev, nodes: nextNodes };
        notifyChange(nextGraph, startNode, targetNode);
        return nextGraph;
      });
    },
    [getNextLabel, width, height, notifyChange, startNode, targetNode]
  );

  // 2. Remove Node
  const removeNode = useCallback(
    (nodeId: string) => {
      setGraph((prev) => {
        const nextNodes = prev.nodes.filter((n) => n.id !== nodeId);
        const nextEdges = prev.edges.filter((e) => e.from !== nodeId && e.to !== nodeId);
        const nextGraph = { ...prev, nodes: nextNodes, edges: nextEdges };

        let nextStart = startNode;
        let nextTarget = targetNode;
        if (startNode === nodeId) {
          nextStart = nextNodes[0]?.id ?? '';
          setStartNodeState(nextStart);
        }
        if (targetNode === nodeId) {
          nextTarget = nextNodes[nextNodes.length - 1]?.id ?? '';
          setTargetNodeState(nextTarget);
        }

        setSelectedNodeId(null);
        notifyChange(nextGraph, nextStart, nextTarget);
        return nextGraph;
      });
    },
    [notifyChange, startNode, targetNode]
  );

  // 3. Add or Update Edge
  const addEdge = useCallback(
    (from: string, to: string, weight = 1) => {
      if (from === to) return;
      setGraph((prev) => {
        const existingIdx = prev.edges.findIndex(
          (e) => (e.from === from && e.to === to) || (!prev.directed && e.from === to && e.to === from)
        );

        let nextEdges: GraphEdge[];
        if (existingIdx >= 0) {
          nextEdges = prev.edges.map((e, idx) => (idx === existingIdx ? { ...e, weight } : e));
        } else {
          nextEdges = [...prev.edges, { from, to, weight, state: 'default' }];
        }

        const nextGraph = { ...prev, edges: nextEdges };
        notifyChange(nextGraph);
        return nextGraph;
      });
    },
    [notifyChange]
  );

  // 4. Remove Edge
  const removeEdge = useCallback(
    (from: string, to: string) => {
      setGraph((prev) => {
        const nextEdges = prev.edges.filter(
          (e) => !(e.from === from && e.to === to) && !(Boolean(!prev.directed) && e.from === to && e.to === from)
        );
        const nextGraph = { ...prev, edges: nextEdges };
        notifyChange(nextGraph);
        return nextGraph;
      });
    },
    [notifyChange]
  );

  // 5. Toggle Directed
  const toggleDirected = useCallback(() => {
    setGraph((prev) => {
      const nextDirected = !prev.directed;
      const nextGraph = { ...prev, directed: nextDirected };
      notifyChange(nextGraph);
      return nextGraph;
    });
  }, [notifyChange]);

  // 6. Source / Target Setters
  const setStartNode = useCallback(
    (id: string) => {
      setStartNodeState(id);
      notifyChange(graph, id, targetNode);
    },
    [graph, targetNode, notifyChange]
  );

  const setTargetNode = useCallback(
    (id: string) => {
      setTargetNodeState(id);
      notifyChange(graph, startNode, id);
    },
    [graph, startNode, notifyChange]
  );

  // Reset to default
  const resetGraph = useCallback(() => {
    setGraph(DEFAULT_GRAPH_DATA);
    setStartNodeState('A');
    setTargetNodeState('F');
    setSelectedNodeId(null);
    notifyChange(DEFAULT_GRAPH_DATA, 'A', 'F');
  }, [notifyChange]);

  // Pointer & Drag Handlers for SVG Canvas
  const getSvgCoordinates = (e: React.PointerEvent<SVGSVGElement>): { x: number; y: number } => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleCanvasPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    // Only left-click on canvas directly (not on node)
    if (e.target === e.currentTarget && e.button === 0) {
      const { x, y } = getSvgCoordinates(e);
      addNode(x, y);
      setSelectedNodeId(null);
    }
  };

  const handleNodePointerDown = (node: GraphNode, e: React.PointerEvent) => {
    e.stopPropagation();
    if (e.button === 2) return; // Right-click handled by context menu

    setSelectedNodeId(node.id);
    dragStartPosRef.current = {
      x: e.clientX,
      y: e.clientY,
      nodeX: node.x,
      nodeY: node.y,
    };
    isDragThresholdPassedRef.current = false;

    // Shift-click or Alt-click to connect edge, or normal drag if connectingSourceNode is active
    if (e.shiftKey) {
      setConnectingSourceNode(node);
      setDragCurrentPos({ x: node.x, y: node.y });
    } else {
      setDraggedNodeId(node.id);
    }
  };

  const handleCanvasPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const coords = getSvgCoordinates(e);

    // If connecting edge
    if (connectingSourceNode) {
      setDragCurrentPos(coords);
      return;
    }

    // If dragging node to reposition
    if (draggedNodeId && dragStartPosRef.current) {
      const dx = (e.clientX - dragStartPosRef.current.x) * (width / e.currentTarget.getBoundingClientRect().width);
      const dy = (e.clientY - dragStartPosRef.current.y) * (height / e.currentTarget.getBoundingClientRect().height);

      if (Math.hypot(dx, dy) > 4) {
        isDragThresholdPassedRef.current = true;
      }

      const nextX = Math.round(Math.max(25, Math.min(width - 25, dragStartPosRef.current.nodeX + dx)));
      const nextY = Math.round(Math.max(25, Math.min(height - 25, dragStartPosRef.current.nodeY + dy)));

      setGraph((prev) => ({
        ...prev,
        nodes: prev.nodes.map((n) => (n.id === draggedNodeId ? { ...n, x: nextX, y: nextY } : n)),
      }));
    }
  };

  const handleCanvasPointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    // Finish node reposition
    if (draggedNodeId) {
      if (isDragThresholdPassedRef.current) {
        notifyChange(graph);
      }
      setDraggedNodeId(null);
      dragStartPosRef.current = null;
    }

    // Finish connecting line if dropped on another node
    if (connectingSourceNode) {
      const coords = getSvgCoordinates(e);
      // Check if dropped near any other node
      const target = graph.nodes.find(
        (n) => n.id !== connectingSourceNode.id && Math.hypot(n.x - coords.x, n.y - coords.y) <= 28
      );

      if (target) {
        // Open weight popover
        setWeightPopover({
          from: connectingSourceNode.id,
          to: target.id,
          weight: 4,
          x: coords.x,
          y: coords.y,
        });
      }

      setConnectingSourceNode(null);
      setDragCurrentPos(null);
    }
  };

  const handleNodeClick = (node: GraphNode, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDragThresholdPassedRef.current && !connectingSourceNode) {
      setSelectedNodeId(node.id);
    }
  };

  const handleNodeContextMenu = (node: GraphNode, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    removeNode(node.id);
  };

  // Keyboard shortcut: Delete or Backspace removes selected node
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === 'Delete' || e.key === 'Backspace') &&
        selectedNodeId &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        removeNode(selectedNodeId);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, removeNode]);

  return {
    graph,
    setGraph,
    startNode,
    setStartNode,
    targetNode,
    setTargetNode,
    selectedNodeId,
    setSelectedNodeId,
    connectingSourceNode,
    setConnectingSourceNode,
    dragCurrentPos,
    weightPopover,
    setWeightPopover,
    negativeWeights,
    hasNegativeWeights,
    addNode,
    removeNode,
    addEdge,
    removeEdge,
    toggleDirected,
    resetGraph,
    handleCanvasPointerDown,
    handleNodePointerDown,
    handleCanvasPointerMove,
    handleCanvasPointerUp,
    handleNodeClick,
    handleNodeContextMenu,
  };
}

