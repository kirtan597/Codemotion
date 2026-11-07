'use client';

/**
 * src/components/visualizers/TreeCanvas.tsx
 *
 * Custom SVG Canvas for Tree Algorithms (Binary Search Tree).
 * Features:
 * - Clean SVG branches connecting parent to left and right children
 * - Node states: comparing (amber), found (emerald), inserting/deleting (rose), visited (indigo), successor (cyan)
 * - Visit-order badges (#1, #2, ...) during tree traversals
 * - Live output array strip beneath canvas that builds up as nodes are visited
 */

import React from 'react';
import { TreeNode, TreeData } from '@/lib/algorithms/tree/types';
import { Snapshot } from '@/lib/types/algorithm';
import { motion, AnimatePresence } from 'framer-motion';
import { ListOrdered } from 'lucide-react';

export interface TreeCanvasProps {
  snapshot?: Snapshot<TreeData>;
  width?: number;
  height?: number;
  className?: string;
}

const NODE_RADIUS = 20;

export const TreeCanvas: React.FC<TreeCanvasProps> = ({
  snapshot,
  width = 600,
  height = 340,
  className = '',
}) => {
  const root = snapshot?.data?.root ?? null;
  const outputArray = snapshot?.data?.outputArray ?? [];

  // Flatten nodes and edges for SVG rendering
  const allNodes: TreeNode[] = [];
  const edges: Array<{ from: TreeNode; to: TreeNode }> = [];

  function collectNodes(node: TreeNode | null) {
    if (!node) return;
    allNodes.push(node);
    if (node.left) {
      edges.push({ from: node, to: node.left });
      collectNodes(node.left);
    }
    if (node.right) {
      edges.push({ from: node, to: node.right });
      collectNodes(node.right);
    }
  }

  collectNodes(root);

  const getNodeVisuals = (node: TreeNode) => {
    switch (node.state) {
      case 'found':
        return {
          fill: '#10b981', // emerald
          stroke: '#059669',
          strokeWidth: 2.5,
          textFill: '#ffffff',
          pulse: false,
        };
      case 'visited':
        return {
          fill: '#4f46e5', // indigo
          stroke: '#4338ca',
          strokeWidth: 2,
          textFill: '#ffffff',
          pulse: false,
        };
      case 'comparing':
        return {
          fill: '#fef3c7', // amber-100
          stroke: '#f59e0b', // amber-500
          strokeWidth: 3,
          textFill: '#92400e',
          pulse: true,
        };
      case 'inserting':
      case 'deleting':
        return {
          fill: '#f43f5e', // rose-500
          stroke: '#e11d48',
          strokeWidth: 3,
          textFill: '#ffffff',
          pulse: true,
        };
      case 'successor':
        return {
          fill: '#06b6d4', // cyan-500
          stroke: '#0891b2',
          strokeWidth: 3,
          textFill: '#ffffff',
          pulse: true,
        };
      case 'default':
      default:
        return {
          fill: '#ffffff',
          stroke: '#94a3b8',
          strokeWidth: 1.8,
          textFill: '#1e293b',
          pulse: false,
        };
    }
  };

  return (
    <div
      className={`w-full flex flex-col items-center justify-between p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl shadow-lg min-h-[380px] space-y-4 ${className}`}
      data-testid="tree-canvas"
    >
      {/* 1. Step Description Header */}
      {snapshot?.description && (
        <div className="w-full px-4 py-2.5 rounded-xl bg-zinc-100/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-violet-500 animate-ping" />
            <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200 line-clamp-1">
              {snapshot.description}
            </p>
          </div>
          <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-zinc-200/60 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
            Step {snapshot.step}
          </span>
        </div>
      )}

      {/* 2. SVG Tree Canvas */}
      <div className="w-full flex-1 flex items-center justify-center overflow-x-auto min-h-[260px]">
        {allNodes.length === 0 ? (
          <p className="text-sm text-zinc-400 italic">Empty Binary Search Tree</p>
        ) : (
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-full max-h-[360px] select-none"
          >
            {/* Edges Layer */}
            {edges.map(({ from, to }) => (
              <line
                key={`${from.id}->${to.id}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="#cbd5e1"
                strokeWidth={2}
                className="transition-all duration-300 dark:stroke-zinc-700"
              />
            ))}

            {/* Nodes Layer */}
            {allNodes.map((node) => {
              const { fill, stroke, strokeWidth, textFill, pulse } = getNodeVisuals(node);
              const nx = node.x ?? 0;
              const ny = node.y ?? 0;

              return (
                <g key={node.id} className="transition-transform duration-300">
                  {/* Pulse ring for active/comparing */}
                  {pulse && (
                    <circle
                      cx={nx}
                      cy={ny}
                      r={NODE_RADIUS + 6}
                      fill="none"
                      stroke={stroke}
                      strokeWidth={2}
                      className="animate-ping opacity-75"
                    />
                  )}

                  {/* Main Node Circle */}
                  <circle
                    cx={nx}
                    cy={ny}
                    r={NODE_RADIUS}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    className="transition-colors duration-200 shadow-md"
                  />

                  {/* Node Value Label */}
                  <text
                    x={nx}
                    y={ny + 4.5}
                    textAnchor="middle"
                    fill={textFill}
                    fontSize={12}
                    fontWeight="bold"
                    fontFamily="monospace"
                    className="select-none pointer-events-none"
                  >
                    {node.value}
                  </text>

                  {/* Visit-order badge (for traversals) */}
                  {node.visitOrder !== undefined && (
                    <g transform={`translate(${nx + 13}, ${ny - 13})`}>
                      <circle
                        cx="0"
                        cy="0"
                        r="8"
                        className="fill-emerald-500 shadow-xs"
                      />
                      <text
                        x="0"
                        y="3"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="9"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {node.visitOrder}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        )}
      </div>

      {/* 3. Output Array Strip (builds up dynamically during traversals) */}
      <div className="w-full pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60 flex flex-col gap-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
          <ListOrdered className="w-3.5 h-3.5 text-violet-500" />
          <span>Traversal Output</span>
          <span className="text-[10px] font-mono text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
            {outputArray.length} visited
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 min-h-[36px] items-center p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60">
          {outputArray.length === 0 ? (
            <span className="text-[11px] text-zinc-400 italic">No output yet</span>
          ) : (
            <AnimatePresence mode="popLayout" initial={false}>
              {outputArray.map((val, idx) => (
                <motion.div
                  key={`${val}-${idx}`}
                  layout
                  initial={{ scale: 0.6, opacity: 0, y: -6 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-xs font-semibold text-zinc-800 dark:text-zinc-200 shadow-2xs"
                >
                  <span className="text-[9px] text-zinc-400">#{idx + 1}</span>
                  <span className="text-violet-600 dark:text-violet-400 font-bold">{val}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};

export default TreeCanvas;

