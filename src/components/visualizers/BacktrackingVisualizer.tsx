'use client';
/**
 * BacktrackingVisualizer.tsx
 *
 * Generic visualizer for backtracking algorithms.
 * Renders a 2D board/grid derived from snapshot.data.board[][].
 * Each cell is color-coded by its CellState.
 * A stats bar at the bottom shows solutions, backtracks, and checks.
 */

import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Snapshot } from '@/lib/types/algorithm';
import { BacktrackingData, BoardCell, CellState } from '@/lib/types/backtracking';

// ─── Cell styling ─────────────────────────────────────────────────────────────

const CELL_STYLES: Record<CellState, { bg: string; text: string; border: string; label: string }> = {
  empty:     { bg: 'bg-zinc-800/60',    text: 'text-zinc-400',    border: 'border-zinc-700/60',  label: 'Empty'    },
  placed:    { bg: 'bg-violet-500/80',  text: 'text-white',       border: 'border-violet-400',   label: 'Placed'   },
  trying:    { bg: 'bg-amber-500/70',   text: 'text-amber-950',   border: 'border-amber-400',    label: 'Trying'   },
  conflict:  { bg: 'bg-rose-600/80',    text: 'text-white',       border: 'border-rose-400',     label: 'Conflict' },
  blocked:   { bg: 'bg-zinc-900',       text: 'text-zinc-600',    border: 'border-zinc-800',     label: 'Blocked'  },
  path:      { bg: 'bg-emerald-500/70', text: 'text-white',       border: 'border-emerald-400',  label: 'Path'     },
  backtrack: { bg: 'bg-rose-500/40',    text: 'text-rose-200',    border: 'border-rose-500/60',  label: 'Backtrack'},
  solution:  { bg: 'bg-emerald-400/90', text: 'text-emerald-950', border: 'border-emerald-300',  label: 'Solution' },
};

// ─── Single cell ──────────────────────────────────────────────────────────────

function Cell({ cell, size, reduceMotion }: {
  cell: BoardCell;
  size: number;
  reduceMotion: boolean;
}) {
  const s = CELL_STYLES[cell.state] ?? CELL_STYLES.empty;
  const fontSize = size >= 48 ? 14 : size >= 36 ? 12 : size >= 28 ? 10 : 9;
  const displayVal = cell.value !== null && cell.value !== 0 ? String(cell.value) : '';

  return (
    <motion.div
      layout={!reduceMotion}
      key={`${cell.row}-${cell.col}`}
      animate={reduceMotion
        ? { backgroundColor: 'transparent' }
        : {
            scale: cell.state === 'trying' ? 1.05 : cell.state === 'conflict' ? [1, 1.08, 1] : 1,
          }
      }
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={`
        rounded-md border flex items-center justify-center font-mono font-bold
        select-none transition-colors duration-150
        ${s.bg} ${s.text} ${s.border}
        ${cell.state === 'trying' ? 'ring-1 ring-amber-400/60' : ''}
        ${cell.state === 'solution' ? 'ring-2 ring-emerald-300/70' : ''}
      `}
      style={{ width: size, height: size, fontSize }}
      aria-label={`Row ${cell.row + 1} Col ${cell.col + 1}: ${displayVal || s.label}`}
      title={s.label}
    >
      {displayVal}
    </motion.div>
  );
}

// ─── Solution list ────────────────────────────────────────────────────────────

function SolutionBadges({ solutions }: { solutions: Array<string | number[][]> }) {
  if (solutions.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
      {solutions.map((sol, i) => (
        <span
          key={i}
          className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
        >
          #{i + 1} {typeof sol === 'string' ? sol : `[${(sol as number[][]).flat().join(',')}]`}
        </span>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export interface BacktrackingVisualizerProps {
  snapshot?: Snapshot<BacktrackingData>;
}

export const BacktrackingVisualizer: React.FC<BacktrackingVisualizerProps> = ({ snapshot }) => {
  const reduceMotion = useReducedMotion() ?? false;
  const data = snapshot?.data;

  if (!data) {
    return (
      <div className="w-full h-64 flex items-center justify-center border-2 border-dashed border-zinc-800 rounded-2xl text-zinc-500">
        <p className="text-sm">No data</p>
      </div>
    );
  }

  const board = data.board ?? [];
  const rows = board.length;
  const cols = rows > 0 ? board[0].length : 0;

  // Compute a sensible cell size that fits within ~480px width
  const maxWidth = 480;
  const rawSize = cols > 0 ? Math.floor(maxWidth / cols) : 40;
  const cellSize = Math.max(22, Math.min(56, rawSize));

  const phaseColors: Record<string, string> = {
    placing:     'text-amber-400',
    checking:    'text-sky-400',
    backtracking:'text-rose-400',
    solution:    'text-emerald-400',
    done:        'text-zinc-400',
  };
  const phaseColor = phaseColors[data.phase ?? ''] ?? 'text-violet-400';

  return (
    <div
      className="w-full flex flex-col gap-4 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl shadow-lg min-h-[360px]"
      role="region"
      aria-label="Backtracking visualizer"
    >
      {/* Header */}
      <div className="w-full px-4 py-2.5 rounded-xl bg-zinc-100/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-violet-500 animate-ping" aria-hidden />
          <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate max-w-xs">
            {snapshot?.description ?? 'Backtracking'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {data.phase && (
            <span className={`text-[10px] font-mono font-semibold capitalize ${phaseColor}`}>
              {data.phase}
            </span>
          )}
          <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-zinc-200/60 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
            Step {snapshot?.step ?? 0}
          </span>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 flex items-center justify-center overflow-auto py-2">
        {rows === 0 ? (
          <p className="text-sm text-zinc-500 italic">Empty board</p>
        ) : (
          <div
            className="grid gap-0.5"
            style={{ gridTemplateColumns: `repeat(${cols}, ${cellSize}px)` }}
            role="grid"
            aria-label="Algorithm board"
          >
            {board.flatMap((row, ri) =>
              row.map((cell, ci) => (
                <Cell key={`${ri}-${ci}`} cell={cell} size={cellSize} reduceMotion={reduceMotion} />
              ))
            )}
          </div>
        )}
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Solutions', val: data.solutions.length, color: 'text-emerald-400' },
          { label: 'Backtracks', val: data.backtracks, color: 'text-rose-400' },
          { label: 'Checks', val: data.checks, color: 'text-sky-400' },
        ].map(({ label, val, color }) => (
          <div key={label} className="flex flex-col items-center rounded-lg bg-zinc-100/60 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/50 p-2">
            <span className={`text-lg font-mono font-bold ${color}`}>{val}</span>
            <span className="text-[10px] text-zinc-500">{label}</span>
          </div>
        ))}
      </div>

      {/* Solutions list */}
      {data.solutions.length > 0 && (
        <div className="pt-2 border-t border-zinc-200/40 dark:border-zinc-800/40">
          <p className="text-[11px] text-zinc-500 mb-1.5 font-semibold uppercase tracking-wide">Found Solutions</p>
          <SolutionBadges solutions={data.solutions} />
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-zinc-500 pt-1 border-t border-zinc-200/40 dark:border-zinc-800/40">
        {(['placed', 'trying', 'conflict', 'path', 'backtrack', 'solution', 'blocked'] as CellState[]).map((state) => {
          const s = CELL_STYLES[state];
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

export default BacktrackingVisualizer;
