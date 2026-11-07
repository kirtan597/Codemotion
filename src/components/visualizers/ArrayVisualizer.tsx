'use client';

import React from 'react';
import { ArrayElement, Snapshot } from '@/lib/types/algorithm';

export interface ArrayVisualizerProps {
  snapshot?: Snapshot<ArrayElement[]>;
}

export const ArrayVisualizer: React.FC<ArrayVisualizerProps> = ({ snapshot }) => {
  if (!snapshot || !Array.isArray(snapshot.data) || snapshot.data.length === 0) {
    return (
      <div className="w-full h-80 flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-400">
        <p className="text-sm font-medium">No array data available</p>
      </div>
    );
  }

  const elements = snapshot.data;
  const maxVal = Math.max(...elements.map((el) => el.value), 10);

  const getStateClasses = (state: ArrayElement['state']) => {
    switch (state) {
      case 'comparing':
        return 'bg-amber-400 dark:bg-amber-500 shadow-md shadow-amber-400/40 ring-2 ring-amber-300 scale-[1.02]';
      case 'swapping':
        return 'bg-rose-500 dark:bg-rose-600 shadow-md shadow-rose-500/40 ring-2 ring-rose-300 scale-105';
      case 'sorted':
        return 'bg-emerald-500 dark:bg-emerald-600 shadow-xs shadow-emerald-500/30';
      case 'pivot':
        return 'bg-cyan-400 dark:bg-cyan-500 shadow-md shadow-cyan-400/40 ring-2 ring-cyan-300';
      case 'active':
        return 'bg-blue-500 dark:bg-blue-600';
      case 'found':
        return 'bg-emerald-400 dark:bg-emerald-500 shadow-lg shadow-emerald-400/50 ring-4 ring-emerald-300 animate-pulse';
      case 'visited':
        return 'bg-zinc-300 dark:bg-zinc-700 opacity-40';
      case 'default':
      default:
        return 'bg-gradient-to-t from-violet-600 to-indigo-500 dark:from-violet-500 dark:to-indigo-400';
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-between p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl shadow-lg min-h-[380px]">
      {/* Step Description Banner */}
      <div className="w-full mb-4 px-4 py-2.5 rounded-xl bg-zinc-100/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-violet-500 animate-ping" />
          <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
            {snapshot.description}
          </p>
        </div>
        <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-zinc-200/60 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
          Step {snapshot.step}
        </span>
      </div>

      {/* Array Bars Visualization Canvas */}
      <div className="w-full flex-1 flex items-end justify-center gap-1.5 sm:gap-2 px-2 py-4">
        {elements.map((el, idx) => {
          // Normalize height between 15% and 95%
          const heightPercent = Math.max(12, Math.round((el.value / maxVal) * 95));
          const stateClass = getStateClasses(el.state);
          const showValueLabel = elements.length <= 32;

          return (
            <div
              key={el.id}
              className="flex-1 max-w-[48px] flex flex-col items-center justify-end h-full group"
            >
              {/* Value Label above bar */}
              {showValueLabel && (
                <span className="text-[10px] sm:text-xs font-mono font-semibold text-zinc-600 dark:text-zinc-300 mb-1.5 transition-transform group-hover:scale-110">
                  {el.value}
                </span>
              )}

              {/* Bar Element */}
              <div
                style={{ height: `${heightPercent}%` }}
                className={`w-full rounded-t-lg transition-all duration-150 ease-out flex items-center justify-center ${stateClass}`}
                title={`Index ${idx}: ${el.value} (${el.state})`}
              />

              {/* Index Label below bar */}
              <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 mt-1.5">
                {idx}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="w-full mt-4 pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60 flex flex-wrap items-center justify-center gap-4 text-[11px] text-zinc-500">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-violet-600" />
          <span>Default</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
          <span>Comparing</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
          <span>Swapping</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400" />
          <span>Pivot</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
          <span>Sorted / Found</span>
        </div>
      </div>
    </div>
  );
};

export default ArrayVisualizer;
