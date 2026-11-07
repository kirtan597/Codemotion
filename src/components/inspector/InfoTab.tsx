'use client';

/**
 * src/components/inspector/InfoTab.tsx
 *
 * Algorithm information tab displaying:
 * - Full algorithm description
 * - Complexity table (Best, Average, Worst, Space)
 * - Live counters from snapshot meta (comparisons, swaps, steps, etc.)
 * - Contextual "When to use" guidance note
 */

import React from 'react';
import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import {
  Sparkles,
  Clock,
  Lightbulb,
  Activity,
} from 'lucide-react';

export interface InfoTabProps {
  algorithm: AlgorithmDefinition;
  snapshot?: Snapshot;
  className?: string;
}

// Practical "When to use" engineering notes per algorithm category / ID
function getWhenToUseNote(algorithm: AlgorithmDefinition): string {
  const id = algorithm.id;

  switch (id) {
    case 'bubble-sort':
      return 'Educational purposes or when the input array is almost completely sorted and O(1) auxiliary memory is strictly required.';
    case 'selection-sort':
      return 'When write operations to memory are extremely expensive compared to reads, as it makes at most O(n) total swaps.';
    case 'insertion-sort':
      return 'Ideal for small arrays (n ≤ 30) or nearly sorted datasets, and frequently used as the base case for hybrid algorithms like Timsort.';
    case 'merge-sort':
      return 'When stable sorting is required or sorting linked lists and external data streams where sequential memory access dominates.';
    case 'quick-sort':
      return 'General-purpose in-memory sorting where average O(n log n) performance and hardware cache locality outpace extra memory allocations.';
    case 'heap-sort':
      return 'When guaranteed O(n log n) worst-case time complexity is required with strict O(1) auxiliary space constraints.';
    case 'binary-search':
      return 'When searching within sorted arrays or monotonic decision spaces, dividing the problem size in logarithmic O(log n) time.';
    case 'linear-search':
      return 'Unsorted, small arrays or arbitrary collections where sorting beforehand would be slower than a direct pass.';
    case 'dijkstra':
      return 'Single-source shortest path on graphs with strictly non-negative edge weights (e.g. routing and network protocols).';
    case 'bfs':
      return 'Unweighted shortest paths, finding connected components, or level-by-level breadth exploration in networks and trees.';
    case 'dfs':
      return 'Cycle detection, topological sorting, maze solving, and exhaustive path search in tree/graph decision trees.';
    case 'knapsack-01':
      return 'Discrete resource allocation with integer capacities where greedy heuristics fail to find the global optimum.';
    case 'lcs':
      return 'Diff tools, version control file comparisons (e.g. git diff), and bioinformatics DNA/protein sequence alignment.';
    case 'bst':
      return 'Dynamic datasets requiring fast in-order lookups, range queries, and dynamic insertions/deletions without full array resizing.';
    case 'stack':
      return 'Function call stacks, expression evaluation/parsing, undo/redo buffers, and depth-first backtracking.';
    case 'queue':
      return 'Breadth-first search, task buffering, job schedulers, and producer-consumer streaming pipelines.';
    case 'linked-list':
      return 'Frequent insertions and deletions at arbitrary positions without costly memory reallocation or copying.';
    default:
      return 'Recommended when the problem domain matches the complexity profile and invariants of this algorithm.';
  }
}

export const InfoTab: React.FC<InfoTabProps> = ({
  algorithm,
  snapshot,
  className = '',
}) => {
  const vars = snapshot?.variables ?? {};
  const whenToUse = getWhenToUseNote(algorithm);

  // Extract relevant live metrics
  const comparisons = vars.comparisons;
  const swaps = vars.swaps;
  const heapSize = vars.heapSize;
  const bestValue = vars.bestValue;

  return (
    <div
      className={`w-full flex flex-col p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-sm space-y-4 ${className}`}
      data-testid="info-tab"
    >
      {/* 1. Header with Algorithm Name & Difficulty */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-500" />
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {algorithm.name}
          </h3>
        </div>
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
            algorithm.difficulty === 'Easy'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
              : algorithm.difficulty === 'Medium'
              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
          }`}
        >
          {algorithm.difficulty}
        </span>
      </div>

      {/* 2. Description */}
      <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
        {algorithm.description}
      </p>

      {/* 3. Complexity Table */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
          <Clock className="w-3.5 h-3.5 text-blue-500" />
          <span>Complexity Profile</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60">
            <div className="text-[10px] text-zinc-400 font-medium">Best Case Time</div>
            <div className="font-mono font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {algorithm.timeComplexity.best}
            </div>
          </div>
          <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60">
            <div className="text-[10px] text-zinc-400 font-medium">Average Time</div>
            <div className="font-mono font-semibold text-amber-600 dark:text-amber-400 mt-0.5">
              {algorithm.timeComplexity.average}
            </div>
          </div>
          <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60">
            <div className="text-[10px] text-zinc-400 font-medium">Worst Case Time</div>
            <div className="font-mono font-semibold text-rose-600 dark:text-rose-400 mt-0.5">
              {algorithm.timeComplexity.worst}
            </div>
          </div>
          <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60">
            <div className="text-[10px] text-zinc-400 font-medium">Space Complexity</div>
            <div className="font-mono font-semibold text-violet-600 dark:text-violet-400 mt-0.5">
              {algorithm.spaceComplexity}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Live Counters from Meta */}
      {snapshot && (
        <div className="space-y-2 pt-1 border-t border-zinc-200/60 dark:border-zinc-800/60">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
            <Activity className="w-3.5 h-3.5 text-violet-500" />
            <span>Live Counters</span>
            <span className="text-[10px] font-mono text-zinc-400 ml-auto">
              Step {snapshot.step}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            {comparisons !== undefined && (
              <div className="p-2 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40">
                <span className="text-[10px] text-amber-700 dark:text-amber-400 block">
                  Comparisons
                </span>
                <span className="text-sm font-bold text-amber-900 dark:text-amber-200">
                  {comparisons}
                </span>
              </div>
            )}

            {swaps !== undefined && (
              <div className="p-2 rounded-lg bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-800/40">
                <span className="text-[10px] text-rose-700 dark:text-rose-400 block">
                  Swaps / Shifts
                </span>
                <span className="text-sm font-bold text-rose-900 dark:text-rose-200">
                  {swaps}
                </span>
              </div>
            )}

            {heapSize !== undefined && (
              <div className="p-2 rounded-lg bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-200/60 dark:border-cyan-800/40">
                <span className="text-[10px] text-cyan-700 dark:text-cyan-400 block">
                  Heap Elements
                </span>
                <span className="text-sm font-bold text-cyan-900 dark:text-cyan-200">
                  {heapSize}
                </span>
              </div>
            )}

            {bestValue !== undefined && (
              <div className="p-2 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40">
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block">
                  Optimal Value
                </span>
                <span className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                  {bestValue}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. "When to Use" Note */}
      <div className="p-3 rounded-lg bg-violet-50/60 dark:bg-violet-950/30 border border-violet-200/60 dark:border-violet-800/50 text-xs space-y-1">
        <div className="flex items-center gap-1.5 font-semibold text-violet-900 dark:text-violet-200">
          <Lightbulb className="w-3.5 h-3.5 text-violet-500" />
          <span>When to Use</span>
        </div>
        <p className="text-[11px] text-violet-800 dark:text-violet-300 leading-relaxed">
          {whenToUse}
        </p>
      </div>
    </div>
  );
};

export default InfoTab;

