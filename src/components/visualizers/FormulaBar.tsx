'use client';

/**
 * src/components/visualizers/FormulaBar.tsx
 *
 * Displays the live DP recurrence relation alongside concrete numerical substitutions.
 */

import React from 'react';
import { Calculator, ArrowRight } from 'lucide-react';

export interface FormulaBarProps {
  formula?: string;
  substitutedFormula?: string;
  decision?: string;
  className?: string;
}

export const FormulaBar: React.FC<FormulaBarProps> = ({
  formula = 'dp[i][j]',
  substitutedFormula,
  decision,
  className = '',
}) => {
  return (
    <div
      className={`w-full p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-sm space-y-2 ${className}`}
      data-testid="formula-bar"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
          <Calculator className="w-3.5 h-3.5 text-violet-500" />
          <span>Recurrence Relation</span>
        </div>

        {decision && decision !== 'init' && decision !== 'done' && (
          <span
            className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
              decision === 'take' || decision === 'match'
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700'
            }`}
          >
            Decision: {decision}
          </span>
        )}
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-2 text-xs font-mono">
        {/* Recurrence Template */}
        <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800/60 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 flex-1 truncate">
          {formula}
        </div>

        {/* Arrow separator if substituted values exist */}
        {substitutedFormula && (
          <ArrowRight className="w-4 h-4 text-zinc-400 shrink-0 hidden md:block" />
        )}

        {/* Live Substituted Numbers */}
        {substitutedFormula && (
          <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-950/40 text-violet-900 dark:text-violet-200 border border-violet-200 dark:border-violet-800/60 font-semibold flex-1">
            {substitutedFormula}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormulaBar;

