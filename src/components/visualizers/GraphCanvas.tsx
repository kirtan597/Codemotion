'use client';

/**
 * src/components/visualizers/GraphCanvas.tsx
 *
 * Custom SVG Canvas for Graph Algorithms (no React Flow).
 *
 * Node States:
 *  - unvisited: thin gray border (stroke="#94a3b8", strokeWidth=1.5)
 *  - in-queue (queued): amber ring + pulse (stroke="#f59e0b", animate-ping)
 *  - visited: indigo fill (fill="#4f46e5")
 *  - path: emerald fill / emerald edges with arrowheads (fill="#10b981", stroke="#10b981")
 *
 * Edge States:
 *  - relaxed: rose-500 (stroke="#f43f5e", strokeWidth=3)
 *  - path: emerald-500 (stroke="#10b981", strokeWidth=3.5, marker-end arrow)
 *  - traversed: violet-500 (stroke="#8b5cf6")
 *  - default: slate-300 / zinc-600 (stroke="#cbd5e1")
 *
 * Weights:
 *  - Positioned perpendicular off the edge midpoint with high-contrast badge.
 */

import React from 'react';
import { GraphData, GraphNode, GraphEdge } from '@/lib/algorithms/graph/types';
import { Snapshot } from '@/lib/types/algorithm';

export interface GraphCanvasProps {
  snapshot?: Snapshot<GraphData>;
  graph?: GraphData; // fallback if direct graph is provided
  width?: number;
  height?: number;
  interactive?: boolean;
  onNodePointerDown?: (node: GraphNode, e: React.PointerEvent) => void;
  onNodeClick?: (node: GraphNode, e: React.MouseEvent) => void;
  onNodeContextMenu?: (node: GraphNode, e: React.MouseEvent) => void;
  onCanvasPointerDown?: (e: React.PointerEvent<SVGSVGElement>) => void;
  onCanvasPointerMove?: (e: React.PointerEvent<SVGSVGElement>) => void;
  onCanvasPointerUp?: (e: React.PointerEvent<SVGSVGElement>) => void;
  connectingSourceNode?: GraphNode | null;
  dragCurrentPos?: { x: number; y: number } | null;
  selectedNodeId?: string | null;
  className?: string;
}

const NODE_RADIUS = 20;

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  snapshot,
  graph: explicitGraph,
  width = 600,
  height = 380,
  interactive = false,
  onNodePointerDown,
  onNodeClick,
  onNodeContextMenu,
  onCanvasPointerDown,
  onCanvasPointerMove,
  onCanvasPointerUp,
  connectingSourceNode,
  dragCurrentPos,
  selectedNodeId,
  className = '',
}) => {
  const graph = snapshot?.data ?? explicitGraph;

  const nodes = graph?.nodes ?? [];
  const edges = graph?.edges ?? [];
  const isDirected = Boolean(graph?.directed);

  // Compute node fill & stroke based on state
  const getNodeVisuals = (node: GraphNode) => {
    switch (node.state) {
      case 'path':
        return {
          fill: '#10b981', // emerald
          stroke: '#059669',
          strokeWidth: 2.5,
          textFill: '#ffffff',
          isQueued: false,
        };
      case 'visited':
        return {
          fill: '#4f46e5', // indigo
          stroke: '#4338ca',
          strokeWidth: 2,
          textFill: '#ffffff',
          isQueued: false,
        };
      case 'queued':
        return {
          fill: '#fef3c7', // amber-100
          stroke: '#f59e0b', // amber-500 ring
          strokeWidth: 3,
          textFill: '#92400e',
          isQueued: true,
        };
      case 'active':
        return {
          fill: '#8b5cf6', // violet
          stroke: '#7c3aed',
          strokeWidth: 3,
          textFill: '#ffffff',
          isQueued: false,
        };
      case 'default':
      default:
        return {
          fill: '#ffffff',
          stroke: '#94a3b8', // thin gray border
          strokeWidth: 1.5,
          textFill: '#334155',
          isQueued: false,
        };
    }
  };

  // Compute edge visuals (color, strokeWidth, marker)
  const getEdgeVisuals = (edge: GraphEdge) => {
    switch (edge.state) {
      case 'path':
        return {
          stroke: '#10b981', // emerald
          strokeWidth: 3.5,
          markerId: 'url(#arrow-emerald)',
          dashArray: undefined,
        };
      case 'relaxed':
        return {
          stroke: '#f43f5e', // rose-500
          strokeWidth: 3,
          markerId: isDirected ? 'url(#arrow-rose)' : undefined,
          dashArray: undefined,
        };
      case 'traversed':
      case 'active':
        return {
          stroke: '#8b5cf6', // violet-500
          strokeWidth: 2.5,
          markerId: isDirected ? 'url(#arrow-violet)' : undefined,
          dashArray: undefined,
        };
      case 'default':
      default:
        return {
          stroke: '#cbd5e1', // slate-300
          strokeWidth: 1.5,
          markerId: isDirected ? 'url(#arrow-default)' : undefined,
          dashArray: isDirected ? undefined : '4 4',
        };
    }
  };

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center overflow-hidden rounded-xl ${className}`}
      data-testid="graph-canvas"
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full max-h-[460px] touch-none select-none"
        onPointerDown={onCanvasPointerDown}
        onPointerMove={onCanvasPointerMove}
        onPointerUp={onCanvasPointerUp}
      >
        <defs>
          {/* Arrowhead markers */}
          <marker
            id="arrow-default"
            viewBox="0 0 10 10"
            refX={NODE_RADIUS + 7}
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#94a3b8" />
          </marker>
          <marker
            id="arrow-emerald"
            viewBox="0 0 10 10"
            refX={NODE_RADIUS + 7}
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#10b981" />
          </marker>
          <marker
            id="arrow-rose"
            viewBox="0 0 10 10"
            refX={NODE_RADIUS + 7}
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#f43f5e" />
          </marker>
          <marker
            id="arrow-violet"
            viewBox="0 0 10 10"
            refX={NODE_RADIUS + 7}
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#8b5cf6" />
          </marker>
        </defs>

        {/* 1. Edges Layer */}
        {edges.map((edge) => {
          const fromNode = nodes.find((n) => n.id === edge.from);
          const toNode = nodes.find((n) => n.id === edge.to);
          if (!fromNode || !toNode) return null;

          const { stroke, strokeWidth, markerId, dashArray } = getEdgeVisuals(edge);

          // Calculate offset position for weight label (off the edge midpoint)
          const dx = toNode.x - fromNode.x;
          const dy = toNode.y - fromNode.y;
          const len = Math.hypot(dx, dy) || 1;

          // Unit normal perpendicular vector
          const nx = -dy / len;
          const ny = dx / len;

          const midX = (fromNode.x + toNode.x) / 2;
          const midY = (fromNode.y + toNode.y) / 2;

          // Offset weight label 14px perpendicular to the edge
          const labelX = midX + nx * 14;
          const labelY = midY + ny * 14;

          const edgeId = `${edge.from}-${edge.to}`;

          return (
            <g key={edgeId} className="transition-all duration-300">
              <line
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke={stroke}
                strokeWidth={strokeWidth}
                strokeDasharray={dashArray}
                markerEnd={markerId}
                className="transition-colors duration-200"
              />

              {/* Edge Weight badge (positioned off midpoint) */}
              {edge.weight !== undefined && (
                <g transform={`translate(${labelX}, ${labelY})`}>
                  <rect
                    x="-12"
                    y="-8"
                    width="24"
                    height="16"
                    rx="4"
                    className="fill-white dark:fill-zinc-900 stroke-zinc-200 dark:stroke-zinc-700"
                    strokeWidth="1"
                  />
                  <text
                    x="0"
                    y="3.5"
                    textAnchor="middle"
                    className="text-[10px] font-mono font-bold fill-zinc-700 dark:fill-zinc-300 select-none"
                  >
                    {edge.weight}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Active connection line during edge drag in interactive mode */}
        {connectingSourceNode && dragCurrentPos && (
          <line
            x1={connectingSourceNode.x}
            y1={connectingSourceNode.y}
            x2={dragCurrentPos.x}
            y2={dragCurrentPos.y}
            stroke="#8b5cf6"
            strokeWidth={2}
            strokeDasharray="4 4"
            className="animate-pulse"
          />
        )}

        {/* 2. Nodes Layer */}
        {nodes.map((node) => {
          const { fill, stroke, strokeWidth, textFill, isQueued } = getNodeVisuals(node);
          const isSelected = selectedNodeId === node.id;

          return (
            <g
              key={node.id}
              className={`transition-transform duration-200 ${
                interactive ? 'cursor-pointer hover:scale-105' : ''
              }`}
              onPointerDown={(e) => onNodePointerDown?.(node, e)}
              onClick={(e) => onNodeClick?.(node, e)}
              onContextMenu={(e) => onNodeContextMenu?.(node, e)}
            >
              {/* In-queue amber pulse ring */}
              {isQueued && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={NODE_RADIUS + 7}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  className="animate-ping opacity-75"
                />
              )}

              {/* Selection highlight halo */}
              {isSelected && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={NODE_RADIUS + 5}
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                />
              )}

              {/* Main Node Circle */}
              <circle
                cx={node.x}
                cy={node.y}
                r={NODE_RADIUS}
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeWidth}
                className="transition-colors duration-300 shadow-md"
              />

              {/* Node Label */}
              <text
                x={node.x}
                y={node.y + 4.5}
                textAnchor="middle"
                fill={textFill}
                fontSize={13}
                fontWeight="bold"
                fontFamily="monospace"
                className="select-none pointer-events-none"
              >
                {node.label}
              </text>

              {/* Tentative Distance badge above node */}
              {node.distance !== undefined && node.distance !== null && (
                <g transform={`translate(${node.x}, ${node.y - NODE_RADIUS - 8})`}>
                  <rect
                    x="-14"
                    y="-7"
                    width="28"
                    height="14"
                    rx="3"
                    className="fill-zinc-900/90 dark:fill-zinc-100/90"
                  />
                  <text
                    x="0"
                    y="3.5"
                    textAnchor="middle"
                    className="text-[9px] font-mono font-bold fill-white dark:fill-zinc-900 select-none"
                  >
                    {node.distance === Infinity ? '∞' : node.distance}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default GraphCanvas;

