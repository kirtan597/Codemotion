'use client';

/**
 * Visualizer index — maps algorithm category → the correct visualizer component.
 *
 * Usage:
 *   import { getVisualizer } from '@/components/visualizers';
 *   const Viz = getVisualizer(definition.category);
 *   <Viz snapshot={activeSnapshot} />
 */

import React from 'react';
import { AlgorithmCategory, Snapshot } from '@/lib/types/algorithm';

// Concrete visualizers
import { ArrayBars }               from './ArrayBars';
import { ArrayVisualizer }          from './ArrayVisualizer';
import { GraphVisualizer }          from './GraphVisualizer';
import { NodeChain }                from './NodeChain';
import { DPVisualizer }             from './DPVisualizer';
import { TreeCanvas }               from './TreeCanvas';
import { CallStackVisualizer }      from './CallStackVisualizer';
import { BacktrackingVisualizer }   from './BacktrackingVisualizer';
import { DivConquerVisualizer }     from './DivConquerVisualizer';
import { GreedyVisualizer }         from './GreedyVisualizer';
import StringVisualizer              from './StringVisualizer';
import MathVisualizer                from './MathVisualizer';
import AdvancedVisualizer            from './AdvancedVisualizer';

// ─── Type for any visualizer component ────────────────────────────────────────
export type VisualizerComponent = React.FC<{ snapshot?: Snapshot<any>; data?: any; [key: string]: any }>;

// ─── Category → component map ─────────────────────────────────────────────────
const VISUALIZER_MAP: Record<AlgorithmCategory, VisualizerComponent> = {
  sorting:      ArrayBars,               // animated framer-motion bars
  searching:    ArrayVisualizer,         // search highlights
  graph:        GraphVisualizer,         // SVG graph with interactions
  tree:         TreeCanvas,              // SVG tree with visit badges
  dp:           DPVisualizer,            // DP matrix + formula bar
  linear:       NodeChain,              // linked-list node chain
  heap:         ArrayVisualizer,         // fallback (HeapVisualizer TBD)
  hash:         ArrayVisualizer,         // fallback
  trie:         TreeCanvas,              // trie reuses tree canvas
  'advanced-tree': TreeCanvas,
  array:        ArrayBars,
  specialized:  ArrayVisualizer,
  spatial:      ArrayVisualizer,
  recursion:    CallStackVisualizer,     // call-stack frames
  backtracking: BacktrackingVisualizer,  // board + stats
  divconquer:   DivConquerVisualizer,    // bar chart + range overlay
  greedy:       GreedyVisualizer,        // greedy item selection
  string:       StringVisualizer as any, // string pattern matching, palindromes, edit distance
  math:         MathVisualizer as any,   // mathematical algorithms, primes, GCD, exponentiation
  bitwise:      MathVisualizer as any,   // bit manipulation operations
  geometry:     AdvancedVisualizer as any, // computational geometry
  advanced:     AdvancedVisualizer as any, // advanced data structures
};

/**
 * Returns the correct visualizer component for the given algorithm category.
 * Falls back to ArrayVisualizer for unknown categories.
 */
export function getVisualizer(category: AlgorithmCategory | string): VisualizerComponent {
  return VISUALIZER_MAP[category as AlgorithmCategory] ?? ArrayVisualizer;
}

// Named re-exports for direct imports
export { ArrayBars }             from './ArrayBars';
export { ArrayVisualizer }       from './ArrayVisualizer';
export { GraphVisualizer }       from './GraphVisualizer';
export { GraphCanvas }           from './GraphCanvas';
export { QueueOverlay }          from './QueueOverlay';
export { GraphBuilder }          from './GraphBuilder';
export { NodeChain }             from './NodeChain';
export { DPVisualizer }          from './DPVisualizer';
export { DPMatrix }              from './DPMatrix';
export { FormulaBar }            from './FormulaBar';
export { SummaryCard }           from './SummaryCard';
export { TreeCanvas }            from './TreeCanvas';
export { CallStackVisualizer }   from './CallStackVisualizer';
export { BacktrackingVisualizer }from './BacktrackingVisualizer';
export { DivConquerVisualizer }  from './DivConquerVisualizer';
export { GreedyVisualizer }      from './GreedyVisualizer';
export { default as StringVisualizer } from './StringVisualizer';
export { default as MathVisualizer } from './MathVisualizer';
export { default as AdvancedVisualizer } from './AdvancedVisualizer';
