'use client';

/**
 * src/components/visualizers/DPVisualizer.tsx
 *
 * Visualizer component for Dynamic Programming algorithms.
 * Integrates:
 * - Step description banner
 * - FormulaBar (live recurrence with substituted values)
 * - DPMatrix (interactive 2D table with sticky headers, computing/dependency/backtrack highlights)
 * - SummaryCard (remaining capacity, current item, decision, chosen items)
 */

import React from 'react';
import { Snapshot } from '@/lib/types/algorithm';
import { DPMatrixData } from '@/lib/algorithms/dp/types';
import { DPMatrix } from './DPMatrix';
import { FormulaBar } from './FormulaBar';
import { SummaryCard } from './SummaryCard';

export interface DPVisualizerProps {
  snapshot?: Snapshot<DPMatrixData>;
  className?: string;
}

export const DPVisualizer: React.FC<DPVisualizerProps> = ({
  snapshot,
  className = '',
}) => {
  if (!snapshot || !snapshot.data) {
    return (
      <div className="w-full h-80 flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-400">
        <p className="text-sm font-medium">No DP matrix data available</p>
      </div>
    );
  }

  const { data, variables = {}, description, step } = snapshot;

  return (
    <div
      className={`w-full flex flex-col p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl shadow-lg space-y-4 ${className}`}
      data-testid="dp-visualizer"
    >
      {/* 1. Step Description Banner */}
      <div className="w-full px-4 py-2.5 rounded-xl bg-zinc-100/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-violet-500 animate-ping" />
          <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
            {description}
          </p>
        </div>
        <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-zinc-200/60 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
          Step {step}
        </span>
      </div>

      {/* 2. Recurrence Formula Bar */}
      <FormulaBar
        formula={variables.formula}
        substitutedFormula={variables.substitutedFormula}
        decision={variables.decision}
      />

      {/* 3. 2D DP Table Matrix */}
      <DPMatrix data={data} />

      {/* 4. Live Summary Info Card */}
      <SummaryCard
        remainingCapacity={variables.remainingCapacity}
        currentItem={variables.currentItem}
        decision={variables.decision}
        bestValue={variables.bestValue}
        chosenItems={variables.chosenItems}
        lcsString={variables.lcsString}
        currentPair={variables.currentPair}
      />
    </div>
  );
};

export default DPVisualizer;

