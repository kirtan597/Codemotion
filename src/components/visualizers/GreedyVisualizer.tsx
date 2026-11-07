'use client';

/**
 * src/components/visualizers/GreedyVisualizer.tsx
 *
 * Visualizer component for Greedy algorithms.
 * Displays items with their states, selection process, and accumulated results.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Snapshot } from '@/lib/types/algorithm';
import { GreedyData, GreedyItem, GreedyItemState } from '@/lib/types/greedy';

export interface GreedyVisualizerProps {
  snapshot?: Snapshot<GreedyData>;
  className?: string;
}

// ─── Item styling ─────────────────────────────────────────────────────────────

const ITEM_STYLES: Record<GreedyItemState, { bg: string; border: string; text: string; label: string }> = {
  available: {
    bg: 'bg-zinc-800/60',
    border: 'border-zinc-700/60',
    text: 'text-zinc-300',
    label: 'Available',
  },
  considering: {
    bg: 'bg-amber-500/70',
    border: 'border-amber-400',
    text: 'text-amber-950',
    label: 'Considering',
  },
  selected: {
    bg: 'bg-emerald-500/80',
    border: 'border-emerald-400',
    text: 'text-white',
    label: 'Selected',
  },
  rejected: {
    bg: 'bg-rose-600/60',
    border: 'border-rose-500/60',
    text: 'text-rose-200',
    label: 'Rejected',
  },
  optimal: {
    bg: 'bg-violet-500/80',
    border: 'border-violet-400',
    text: 'text-white',
    label: 'Optimal',
  },
};

// ─── Item card ────────────────────────────────────────────────────────────────

function ItemCard({ item }: { item: GreedyItem }) {
  const style = ITEM_STYLES[item.state];
  
  return (
    <motion.div
      layout
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ 
        scale: item.state === 'considering' ? 1.05 : 1,
        opacity: 1 
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`
        relative px-4 py-3 rounded-xl border-2 flex flex-col gap-1
        ${style.bg} ${style.border} ${style.text}
        ${item.state === 'considering' ? 'ring-2 ring-amber-400/60 shadow-lg' : ''}
        ${item.state === 'selected' ? 'shadow-md' : ''}
      `}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono font-bold text-sm">{item.label}</span>
        {item.state === 'considering' && (
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
        )}
      </div>
      
      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs font-mono">
        {item.value !== undefined && (
          <span>val: <strong>{item.value}</strong></span>
        )}
        {item.weight !== undefined && (
          <span>wt: <strong>{item.weight}</strong></span>
        )}
        {item.profit !== undefined && (
          <span>profit: <strong>{item.profit}</strong></span>
        )}
        {item.deadline !== undefined && (
          <span>deadline: <strong>{item.deadline}</strong></span>
        )}
        {item.start !== undefined && item.end !== undefined && (
          <span>[{item.start}, {item.end}]</span>
        )}
        {item.sortKey !== undefined && (
          <span className="text-violet-300">ratio: <strong>{item.sortKey.toFixed(2)}</strong></span>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export const GreedyVisualizer: React.FC<GreedyVisualizerProps> = ({
  snapshot,
  className = '',
}) => {
  if (!snapshot || !snapshot.data) {
    return (
      <div className="w-full h-80 flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-400">
        <p className="text-sm font-medium">No greedy algorithm data available</p>
      </div>
    );
  }

  const { data, description, step, variables = {} } = snapshot;
  const { items, selected, totalValue, remainingCapacity, criterion, phase } = data;

  const phaseColors: Record<string, string> = {
    init: 'text-zinc-400',
    sorting: 'text-sky-400',
    selecting: 'text-emerald-400',
    done: 'text-violet-400',
  };
  const phaseColor = phaseColors[phase] || 'text-zinc-400';

  return (
    <div
      className={`w-full flex flex-col p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl shadow-lg space-y-4 ${className}`}
      data-testid="greedy-visualizer"
    >
      {/* 1. Step Description Banner */}
      <div className="w-full px-4 py-2.5 rounded-xl bg-zinc-100/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping flex-shrink-0" />
          <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate">
            {description}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          <span className={`text-[10px] font-mono font-semibold capitalize ${phaseColor}`}>
            {phase}
          </span>
          <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-zinc-200/60 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
            Step {step}
          </span>
        </div>
      </div>

      {/* 2. Criterion Banner */}
      {criterion && (
        <div className="px-4 py-2 rounded-lg bg-violet-500/10 border border-violet-500/30">
          <p className="text-xs text-violet-300 font-mono">
            <span className="font-semibold">Criterion:</span> {criterion}
          </p>
        </div>
      )}

      {/* 3. Summary Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center rounded-lg bg-zinc-100/60 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/50 p-2">
          <span className="text-lg font-mono font-bold text-emerald-400">{selected.length}</span>
          <span className="text-[10px] text-zinc-500">Selected</span>
        </div>
        <div className="flex flex-col items-center rounded-lg bg-zinc-100/60 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/50 p-2">
          <span className="text-lg font-mono font-bold text-violet-400">{totalValue}</span>
          <span className="text-[10px] text-zinc-500">Total Value</span>
        </div>
        {remainingCapacity !== undefined && (
          <div className="flex flex-col items-center rounded-lg bg-zinc-100/60 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/50 p-2">
            <span className="text-lg font-mono font-bold text-sky-400">{remainingCapacity}</span>
            <span className="text-[10px] text-zinc-500">Remaining</span>
          </div>
        )}
      </div>

      {/* 4. Items Grid */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </div>

      {/* 5. Selected Items Summary */}
      {selected.length > 0 && phase === 'done' && (
        <div className="pt-3 border-t border-zinc-200/40 dark:border-zinc-800/40">
          <p className="text-[11px] text-zinc-500 mb-2 font-semibold uppercase tracking-wide">
            Selected Items ({selected.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {selected.map((item) => (
              <span
                key={item.id}
                className="px-2 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono"
              >
                {item.label}
                {item.value !== undefined && ` (${item.value})`}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 6. Legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-zinc-500 pt-2 border-t border-zinc-200/40 dark:border-zinc-800/40">
        {(['available', 'considering', 'selected', 'rejected', 'optimal'] as GreedyItemState[]).map((state) => {
          const s = ITEM_STYLES[state];
          return (
            <span key={state} className="flex items-center gap-1">
              <span className={`w-2.5 h-2.5 rounded-sm border ${s.bg} ${s.border}`} />
              {s.label}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default GreedyVisualizer;
