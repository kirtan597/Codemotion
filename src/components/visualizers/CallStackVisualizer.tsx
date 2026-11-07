'use client';
/**
 * CallStackVisualizer.tsx
 *
 * Renders a call-stack panel for recursion algorithms.
 * - Stack frames slide in from the top with framer-motion
 * - Color-coded by state (active / calling / returning / base-case / returned)
 * - Shows function name, arguments, and return value
 * - Special "Tower of Hanoi" mode renders three pegs when snapshot.data.pegs exists
 */

import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Snapshot } from '@/lib/types/algorithm';
import { RecursionData, CallFrame, FrameState, HanoiData, HanoiDisk } from '@/lib/types/recursion';

// ─── Constants ────────────────────────────────────────────────────────────────

const FRAME_COLORS: Record<FrameState, { bg: string; border: string; text: string; badge: string; label: string }> = {
  active:     { bg: 'bg-violet-500/15',  border: 'border-violet-500/60',  text: 'text-violet-200',  badge: 'bg-violet-500',   label: 'Executing'  },
  calling:    { bg: 'bg-amber-500/15',   border: 'border-amber-500/60',   text: 'text-amber-200',   badge: 'bg-amber-500',    label: 'Calling'    },
  returning:  { bg: 'bg-emerald-500/15', border: 'border-emerald-500/60', text: 'text-emerald-200', badge: 'bg-emerald-500',  label: 'Returning'  },
  returned:   { bg: 'bg-zinc-500/10',    border: 'border-zinc-600/40',    text: 'text-zinc-400',    badge: 'bg-zinc-600',     label: 'Done'       },
  'base-case':{ bg: 'bg-sky-500/15',     border: 'border-sky-500/60',     text: 'text-sky-200',     badge: 'bg-sky-500',      label: 'Base Case'  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function FrameCard({ frame, reduceMotion }: { frame: CallFrame; reduceMotion: boolean }) {
  const c = FRAME_COLORS[frame.state] ?? FRAME_COLORS.active;

  return (
    <motion.div
      key={frame.id}
      layout={!reduceMotion}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -16, scale: 0.95 }}
      animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 420, damping: 36 }}
      className={`rounded-xl border px-4 py-3 flex items-start gap-3 ${c.bg} ${c.border}`}
      aria-label={`Frame: ${frame.fnName}(${frame.args}), state: ${c.label}`}
    >
      {/* Depth indicator */}
      <div className="flex flex-col items-center gap-1 shrink-0">
        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${c.badge} text-white`}>
          {c.label}
        </span>
        <span className="text-[10px] text-zinc-500 font-mono">d={frame.depth}</span>
      </div>

      {/* Frame content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-mono font-semibold ${c.text} truncate`}>
          <span className="text-zinc-400">{frame.fnName}</span>
          <span className="text-zinc-300">(</span>
          <span className="text-amber-300">{frame.args}</span>
          <span className="text-zinc-300">)</span>
        </p>
        {frame.returnValue !== undefined && frame.returnValue !== null && (
          <p className="text-xs font-mono mt-0.5 text-emerald-400">
            ↩ return <span className="font-bold">{String(frame.returnValue)}</span>
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ─── Hanoi Peg Renderer ───────────────────────────────────────────────────────

const PEG_COLORS = [
  'bg-violet-500',
  'bg-amber-500',
  'bg-emerald-500',
  'bg-rose-500',
  'bg-sky-500',
  'bg-fuchsia-500',
  'bg-orange-500',
  'bg-teal-500',
];

function HanoiPeg({ label, disks, maxDisks }: { label: string; disks: HanoiDisk[]; maxDisks: number }) {
  return (
    <div className="flex flex-col items-center gap-0 flex-1">
      <p className="text-xs font-bold text-zinc-400 font-mono mb-2">Peg {label}</p>
      <div className="relative flex flex-col-reverse items-center gap-0.5 h-48 justify-start">
        {/* Peg rod */}
        <div className="absolute bottom-0 top-0 left-1/2 -translate-x-1/2 w-1 bg-zinc-600 rounded-full" />
        {/* Base */}
        <div className="absolute bottom-0 w-24 h-1.5 bg-zinc-600 rounded-full" />
        {/* Disks */}
        <div className="relative flex flex-col-reverse items-center gap-0.5 pb-2 z-10 w-full">
          <AnimatePresence initial={false} mode="popLayout">
            {disks.map((disk) => {
              const widthPct = 20 + (disk.size / maxDisks) * 60;
              const colorClass = PEG_COLORS[(disk.size - 1) % PEG_COLORS.length];
              return (
                <motion.div
                  key={disk.id}
                  layout
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  className={`${colorClass} rounded h-5 flex items-center justify-center text-[10px] font-mono font-bold text-white shadow`}
                  style={{ width: `${widthPct}%` }}
                  aria-label={`Disk ${disk.size}`}
                >
                  {disk.size}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export interface CallStackVisualizerProps {
  snapshot?: Snapshot<RecursionData | HanoiData>;
}

export const CallStackVisualizer: React.FC<CallStackVisualizerProps> = ({ snapshot }) => {
  const reduceMotion = useReducedMotion() ?? false;
  const data = snapshot?.data as any;

  const isHanoi = data && 'pegs' in data;
  const frames: CallFrame[] = data?.frames ?? [];
  const expression: string | undefined = data?.expression;
  const result = data?.result;
  const phase = data?.phase;

  return (
    <div
      className="w-full flex flex-col gap-4 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl shadow-lg min-h-[360px]"
      role="region"
      aria-label="Call stack visualizer"
    >
      {/* Header */}
      <div className="w-full px-4 py-2.5 rounded-xl bg-zinc-100/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-violet-500 animate-ping" aria-hidden />
          <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate max-w-xs">
            {snapshot?.description ?? 'Call Stack'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {phase && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 capitalize">
              {phase}
            </span>
          )}
          <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-zinc-200/60 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
            Step {snapshot?.step ?? 0}
          </span>
        </div>
      </div>

      {/* Expression line */}
      {expression && (
        <div className="px-4 py-2 rounded-lg bg-zinc-900/80 border border-zinc-700/60 font-mono text-sm text-amber-300 text-center">
          {expression}
        </div>
      )}

      {/* Hanoi pegs */}
      {isHanoi && (
        <div className="flex gap-2 px-2">
          {(['A', 'B', 'C'] as const).map((peg) => (
            <HanoiPeg
              key={peg}
              label={peg}
              disks={(data as HanoiData).pegs[peg]}
              maxDisks={(data as HanoiData).totalMoves + 1}
            />
          ))}
        </div>
      )}

      {/* Call stack frames */}
      <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
        <div className="flex items-center gap-2 text-[11px] font-semibold text-zinc-500 uppercase tracking-wide px-1">
          <span>Call Stack</span>
          <span className="font-mono text-zinc-600">({frames.length} frame{frames.length !== 1 ? 's' : ''})</span>
        </div>

        {frames.length === 0 ? (
          <p className="text-sm text-zinc-500 italic px-2">Stack is empty</p>
        ) : (
          <motion.div layout={!reduceMotion} className="flex flex-col gap-2">
            <AnimatePresence initial={false} mode="popLayout">
              {frames.map((frame) => (
                <FrameCard key={frame.id} frame={frame} reduceMotion={reduceMotion} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Result */}
      {result !== undefined && result !== null && (
        <div className="px-4 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center gap-2">
          <span className="text-emerald-400 text-sm font-mono font-bold">Result:</span>
          <span className="text-emerald-200 font-mono text-sm">{String(result)}</span>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-2 text-[10px] text-zinc-500 pt-2 border-t border-zinc-200/40 dark:border-zinc-800/40">
        {(Object.entries(FRAME_COLORS) as [FrameState, typeof FRAME_COLORS[FrameState]][]).map(([state, c]) => (
          <span key={state} className="flex items-center gap-1">
            <span className={`w-2.5 h-2.5 rounded-sm ${c.badge}`} />
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default CallStackVisualizer;
