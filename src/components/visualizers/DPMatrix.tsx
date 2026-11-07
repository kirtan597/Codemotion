'use client';

/**
 * src/components/visualizers/DPMatrix.tsx
 *
 * Dynamic Programming 2D Table Matrix Visualizer.
 * Features:
 * - Sticky row and column headers
 * - Computing cell: pulsing amber border
 * - Dependency cells: purple highlight
 * - Backtrack cells: emerald badges
 */

import React from 'react';
import { DPMatrixData } from '@/lib/algorithms/dp/types';

export interface DPMatrixProps {
  data?: DPMatrixData;
  className?: string;
}

export const DPMatrix: React.FC<DPMatrixProps> = ({ data, className = '' }) => {
  if (!data || !data.table || data.table.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-400">
        No table data available
      </div>
    );
  }

  const {
    table,
    rowHeaders,
    colHeaders,
    computingCell,
    dependencyCells = [],
    backtrackCells = [],
  } = data;

  const isComputing = (r: number, c: number) =>
    computingCell && computingCell[0] === r && computingCell[1] === c;

  const isDependency = (r: number, c: number) =>
    dependencyCells.some(([dr, dc]) => dr === r && dc === c);

  const isBacktrack = (r: number, c: number) =>
    backtrackCells.some(([br, bc]) => br === r && bc === c);

  return (
    <div
      className={`w-full overflow-auto max-h-[420px] rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-950/90 shadow-md ${className}`}
      data-testid="dp-matrix"
    >
      <table className="min-w-full border-collapse text-xs font-mono select-none">
        {/* Sticky Column Header */}
        <thead className="sticky top-0 z-10 bg-zinc-100 dark:bg-zinc-900 shadow-xs">
          <tr>
            {/* Top-left corner cell */}
            <th className="sticky left-0 z-20 bg-zinc-200 dark:bg-zinc-800 p-2 text-center text-zinc-500 font-semibold border-b border-r border-zinc-300 dark:border-zinc-700">
              i \ j
            </th>
            {colHeaders.map((colHeader, cIdx) => (
              <th
                key={cIdx}
                className="p-2 text-center font-bold text-zinc-700 dark:text-zinc-300 border-b border-r border-zinc-200 dark:border-zinc-800 min-w-[54px]"
              >
                {colHeader}
              </th>
            ))}
          </tr>
        </thead>

        {/* Matrix Body */}
        <tbody>
          {table.map((row, rIdx) => {
            const rowHeader = rowHeaders[rIdx] ?? `i=${rIdx}`;

            return (
              <tr key={rIdx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                {/* Sticky Row Header */}
                <th className="sticky left-0 z-10 bg-zinc-100 dark:bg-zinc-900 p-2 text-left font-semibold text-zinc-700 dark:text-zinc-300 border-b border-r border-zinc-200 dark:border-zinc-800 whitespace-nowrap shadow-xs">
                  {rowHeader}
                </th>

                {/* Table Cells */}
                {row.map((cellVal, cIdx) => {
                  const computing = isComputing(rIdx, cIdx);
                  const dependency = isDependency(rIdx, cIdx);
                  const backtrack = isBacktrack(rIdx, cIdx);

                  // Cell style determination
                  let cellBg = 'bg-transparent text-zinc-700 dark:text-zinc-300';
                  let ring = '';
                  let badge = null;

                  if (backtrack) {
                    cellBg = 'bg-emerald-500 text-white font-bold shadow-sm';
                    ring = 'ring-2 ring-emerald-400 z-1';
                    badge = '★';
                  } else if (computing) {
                    cellBg = 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-100 font-bold';
                    ring = 'ring-2 ring-amber-400 animate-pulse z-1';
                  } else if (dependency) {
                    cellBg = 'bg-purple-100 dark:bg-purple-950/60 text-purple-900 dark:text-purple-200 font-bold';
                    ring = 'ring-2 ring-purple-400 z-1';
                  }

                  return (
                    <td
                      key={cIdx}
                      className={`relative p-2 text-center border-b border-r border-zinc-200/60 dark:border-zinc-800/60 transition-colors duration-150 ${cellBg} ${ring}`}
                      title={`Cell [${rIdx}, ${cIdx}] = ${cellVal ?? 'uncomputed'}`}
                    >
                      {cellVal !== null ? (
                        <div className="flex items-center justify-center gap-1">
                          <span>{cellVal}</span>
                          {badge && <span className="text-[9px] text-emerald-100">{badge}</span>}
                        </div>
                      ) : (
                        <span className="text-zinc-300 dark:text-zinc-700">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DPMatrix;

