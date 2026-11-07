'use client';

/**
 * src/components/visualizers/GraphBuilder.tsx
 *
 * Interactive Graph Visualizer & Builder:
 * - Integrates GraphCanvas, QueueOverlay, and useGraphEditor
 * - Click empty canvas to add a node
 * - Drag node to reposition
 * - Shift-drag node to node to connect an edge (weight popover)
 * - Delete or right-click to remove node
 * - Directed / Undirected toggle
 * - Source & target node pickers
 * - Visible negative-weight warning for Dijkstra
 * - Live snapshot regeneration & playback reset on edit
 */

import React, { useState } from 'react';
import { GraphCanvas } from './GraphCanvas';
import { QueueOverlay } from './QueueOverlay';
import { useGraphEditor } from '@/hooks/useGraphEditor';
import { GraphData } from '@/lib/algorithms/graph/types';
import { Snapshot } from '@/lib/types/algorithm';
import {
  GitFork,
  Compass,
  Target,
  RotateCcw,
  AlertTriangle,
  Info,
  Check,
  X,
  Plus,
  Trash2,
} from 'lucide-react';

export interface GraphBuilderProps {
  snapshot?: Snapshot<GraphData>;
  initialGraph?: GraphData;
  initialStartNode?: string;
  initialTargetNode?: string;
  algorithmId?: string;
  onGraphChange?: (newGraph: GraphData, startNode: string, targetNode?: string) => void;
  className?: string;
}

export const GraphBuilder: React.FC<GraphBuilderProps> = ({
  snapshot,
  initialGraph,
  initialStartNode = 'A',
  initialTargetNode = 'F',
  algorithmId = 'dijkstra',
  onGraphChange,
  className = '',
}) => {
  const [isEditMode, setIsEditMode] = useState(false);

  const editor = useGraphEditor({
    initialGraph: snapshot?.data ?? initialGraph,
    initialStartNode,
    initialTargetNode,
    onChange: (newGraph, start, target) => {
      onGraphChange?.(newGraph, start, target);
    },
  });

  const [popoverWeight, setPopoverWeight] = useState<number>(4);

  // Active snapshot data or editor graph
  const displayGraph = isEditMode ? editor.graph : snapshot?.data ?? editor.graph;
  const isDijkstra = algorithmId.includes('dijkstra');

  const structureType = algorithmId.includes('dfs')
    ? 'stack'
    : algorithmId.includes('bfs')
    ? 'queue'
    : 'priorityQueue';

  const queueItems = (snapshot?.variables?.minHeap ?? snapshot?.variables?.queue ?? snapshot?.variables?.stack ?? []) as any[];
  const distanceTable = (snapshot?.variables?.table ?? []) as any[];

  const handleConfirmWeight = () => {
    if (editor.weightPopover) {
      editor.addEdge(editor.weightPopover.from, editor.weightPopover.to, popoverWeight);
      editor.setWeightPopover(null);
    }
  };

  return (
    <div
      className={`w-full flex flex-col p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl shadow-lg space-y-4 ${className}`}
      data-testid="graph-builder"
    >
      {/* 1. Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-200/60 dark:border-zinc-800/60">
        <div className="flex items-center gap-2">
          {/* Step description or mode title */}
          {snapshot?.description ? (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-violet-500 animate-ping" />
              <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200 line-clamp-1">
                {snapshot.description}
              </p>
            </div>
          ) : (
            <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              Interactive Graph Canvas
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {snapshot?.step !== undefined && !isEditMode && (
            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-zinc-200/60 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
              Step {snapshot.step}
            </span>
          )}

          {/* Toggle Edit / Visualizer Mode */}
          <button
            type="button"
            onClick={() => setIsEditMode((prev) => !prev)}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
              isEditMode
                ? 'bg-violet-600 text-white border-violet-500 shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200'
            }`}
          >
            {isEditMode ? '✓ Done Editing' : '✏️ Edit Graph'}
          </button>
        </div>
      </div>

      {/* 2. Interactive Editing Controls Bar */}
      {isEditMode && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-xl bg-violet-50/50 dark:bg-violet-950/20 border border-violet-200/50 dark:border-violet-800/50 text-xs">
          <div className="flex items-center gap-3">
            {/* Directed Toggle */}
            <button
              type="button"
              onClick={editor.toggleDirected}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer shadow-xs"
            >
              <GitFork className="w-3.5 h-3.5 text-violet-500" />
              <span>{editor.graph.directed ? 'Directed' : 'Undirected'}</span>
            </button>

            {/* Source Node Picker */}
            <div className="flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-emerald-500" />
              <label htmlFor="start-node-select" className="text-zinc-500 text-[11px]">Source:</label>
              <select
                id="start-node-select"
                value={editor.startNode}
                onChange={(e) => editor.setStartNode(e.target.value)}
                className="px-2 py-0.5 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 font-mono font-semibold"
              >
                {editor.graph.nodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Node Picker */}
            <div className="flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-rose-500" />
              <label htmlFor="target-node-select" className="text-zinc-500 text-[11px]">Target:</label>
              <select
                id="target-node-select"
                value={editor.targetNode}
                onChange={(e) => editor.setTargetNode(e.target.value)}
                className="px-2 py-0.5 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 font-mono font-semibold"
              >
                {editor.graph.nodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={editor.resetGraph}
            className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Default</span>
          </button>
        </div>
      )}

      {/* 3. Negative-Weight Warning for Dijkstra */}
      {isDijkstra && editor.hasNegativeWeights && (
        <div
          className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300"
          role="alert"
        >
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>
            <strong>Negative Weight Detected:</strong> Dijkstra does not support negative edge weights ({editor.negativeWeights.map(e => `${e.from}→${e.to} (${e.weight})`).join(', ')}). Please edit the weights or switch algorithms.
          </span>
        </div>
      )}

      {/* 4. Canvas Area */}
      <div className="relative w-full min-h-[360px] bg-zinc-50/60 dark:bg-zinc-900/40 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 flex flex-col items-center justify-center p-2">
        <GraphCanvas
          snapshot={isEditMode ? undefined : snapshot}
          graph={displayGraph}
          interactive={isEditMode}
          selectedNodeId={editor.selectedNodeId}
          connectingSourceNode={editor.connectingSourceNode}
          dragCurrentPos={editor.dragCurrentPos}
          onCanvasPointerDown={isEditMode ? editor.handleCanvasPointerDown : undefined}
          onCanvasPointerMove={isEditMode ? editor.handleCanvasPointerMove : undefined}
          onCanvasPointerUp={isEditMode ? editor.handleCanvasPointerUp : undefined}
          onNodePointerDown={isEditMode ? editor.handleNodePointerDown : undefined}
          onNodeClick={isEditMode ? editor.handleNodeClick : undefined}
          onNodeContextMenu={isEditMode ? editor.handleNodeContextMenu : undefined}
        />

        {/* Weight Popover Modal */}
        {editor.weightPopover && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-xs flex items-center justify-center z-20">
            <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-2xl space-y-3 w-64">
              <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                Connect Edge: {editor.weightPopover.from} → {editor.weightPopover.to}
              </h4>
              <div className="space-y-1">
                <label htmlFor="weight-popover-input" className="text-[11px] text-zinc-500 block">
                  Edge Weight:
                </label>
                <input
                  id="weight-popover-input"
                  type="number"
                  value={popoverWeight}
                  onChange={(e) => setPopoverWeight(Number(e.target.value))}
                  className="w-full px-2.5 py-1 text-xs font-mono rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                  autoFocus
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => editor.setWeightPopover(null)}
                  className="px-2.5 py-1 text-xs rounded-md bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmWeight}
                  className="px-2.5 py-1 text-xs rounded-md bg-violet-600 hover:bg-violet-700 text-white font-semibold"
                >
                  Add Edge
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit mode helper hints */}
        {isEditMode && (
          <div className="w-full mt-2 flex flex-wrap items-center justify-center gap-4 text-[10px] text-zinc-400">
            <span>• Click canvas to add node</span>
            <span>• Drag node to reposition</span>
            <span>• Shift+Drag to connect edge</span>
            <span>• Right-click or Del to remove</span>
          </div>
        )}
      </div>

      {/* 5. Live Queue Overlay & Distance Table */}
      <QueueOverlay
        queue={queueItems}
        table={distanceTable}
        structureType={structureType}
      />
    </div>
  );
};

export default GraphBuilder;
