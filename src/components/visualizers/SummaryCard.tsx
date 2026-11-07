'use client';

/**
 * src/components/visualizers/SummaryCard.tsx
 *
 * Summary information card for DP algorithms:
 * - Remaining capacity (Knapsack) / Current match count
 * - Current item / characters
 * - Skip vs Take decision
 * - Best value so far
 * - Chosen items / Reconstructed sequence
 */

import React from 'react';
import { Package, CheckCircle, Scale, Sparkles, Trophy } from 'lucide-react';
import { KnapsackItem } from '@/lib/algorithms/dp/types';

export interface SummaryCardProps {
  remainingCapacity?: number;
  currentItem?: KnapsackItem | null;
  decision?: string;
  bestValue?: number;
  chosenItems?: KnapsackItem[];
  lcsString?: string;
  currentPair?: { char1: string; char2: string; i: number; j: number };
  className?: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  remainingCapacity,
  currentItem,
  decision,
  bestValue,
  chosenItems,
  lcsString,
  currentPair,
  className = '',
}) => {
  return (
    <div
      className={`grid grid-cols-2 sm:grid-cols-4 gap-2.5 ${className}`}
      data-testid="summary-card"
    >
      {/* 1. Best Value / Length */}
      <div className="p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-900/90 shadow-sm flex flex-col justify-between">
        <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">
          <Trophy className="w-3.5 h-3.5 text-amber-500" />
          <span>Optimal Value</span>
        </div>
        <div className="text-lg font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1">
          {bestValue !== undefined ? bestValue : '—'}
        </div>
      </div>

      {/* 2. Remaining Capacity or Subsequence length */}
      <div className="p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-900/90 shadow-sm flex flex-col justify-between">
        <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">
          <Scale className="w-3.5 h-3.5 text-blue-500" />
          <span>{remainingCapacity !== undefined ? 'Rem. Capacity' : 'LCS Length'}</span>
        </div>
        <div className="text-lg font-bold font-mono text-blue-600 dark:text-blue-400 mt-1">
          {remainingCapacity !== undefined ? remainingCapacity : (lcsString?.length ?? 0)}
        </div>
      </div>

      {/* 3. Current Item or Current Characters */}
      <div className="p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-900/90 shadow-sm flex flex-col justify-between">
        <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">
          <Package className="w-3.5 h-3.5 text-violet-500" />
          <span>{currentItem ? 'Current Item' : 'Active Symbol'}</span>
        </div>
        <div className="text-xs font-semibold font-mono text-zinc-800 dark:text-zinc-200 mt-1 truncate">
          {currentItem ? (
            <span>
              {currentItem.name} (wt: {currentItem.weight})
            </span>
          ) : currentPair ? (
            <span>
              &apos;{currentPair.char1}&apos; vs &apos;{currentPair.char2}&apos;
            </span>
          ) : (
            '—'
          )}
        </div>
      </div>

      {/* 4. Decision: Skip vs Take */}
      <div className="p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-900/90 shadow-sm flex flex-col justify-between">
        <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          <span>Decision</span>
        </div>
        <div className="text-xs font-bold font-mono mt-1">
          {decision === 'take' || decision === 'match' ? (
            <span className="text-emerald-600 dark:text-emerald-400 uppercase">
              ✓ {decision}
            </span>
          ) : decision === 'skip' || decision === 'top' || decision === 'left' ? (
            <span className="text-zinc-500 uppercase">
              • {decision}
            </span>
          ) : (
            <span className="text-zinc-400">{decision ?? '—'}</span>
          )}
        </div>
      </div>

      {/* 5. Chosen Items / Reconstructed String Banner (Full width below) */}
      {(chosenItems && chosenItems.length > 0) || lcsString ? (
        <div className="col-span-2 sm:col-span-4 p-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/80 bg-emerald-50/50 dark:bg-emerald-950/20 flex flex-wrap items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">
            {chosenItems ? 'Chosen Items:' : 'Reconstructed LCS:'}
          </span>
          {chosenItems ? (
            <div className="flex flex-wrap gap-1.5">
              {chosenItems.map((it, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-white dark:bg-zinc-900 border border-emerald-300 dark:border-emerald-700 text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300 shadow-2xs"
                >
                  {it.name} (val: {it.value}, wt: {it.weight})
                </span>
              ))}
            </div>
          ) : (
            <span className="px-2.5 py-0.5 rounded-md bg-white dark:bg-zinc-900 border border-emerald-300 dark:border-emerald-700 text-sm font-mono font-bold text-emerald-600 dark:text-emerald-300 tracking-wider">
              &quot;{lcsString}&quot;
            </span>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default SummaryCard;

