'use client';
/**
 * DivConquerVisualizer.tsx
 *
 * Visualizes Divide & Conquer algorithms.
 * - Animated bar chart of elements (like ArrayBars)
 * - Active sub-range highlighted with a bracket overlay
 * - Left/right sub-problem ranges shaded differently
 * - Phase label (divide / solve / merge)
 *
 * Falls back gracefully when data is a plain ArrayElement[].
 */

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Snapshot } from '@/lib/types/algorithm';
import { DivConquerData } from '@/lib/types/divconquer';
import { ArrayElement, ElementState } from '@/lib/types/algorithm';

// ─── Colour map (matches ArrayBars for consistency) ───────────────────────────

const STATE_STYLES: Record<ElementState, { bg: string; ring: string }> = {
  default:   { bg: 'bg-violet-500',   ring: '' },
  comparing: { bg: 'bg-amber-400',    ring: 'ring-2 ring-amber-300' },
  swapping:  { bg: 'bg-rose-500',     ring: 'ring-2 ring-rose-300' },
  sorted:    { bg: 'bg-emerald-500',  ring: '' },
  pivot:     { bg: 'bg-orange-400',   ring: 'ring-2 ring-orange-300' },
  active:    { bg: 'bg-sky-400',      ring: 'ring-1 ring-sky-300' },
  found:     { bg: 'bg-emerald-400',  ring: 'ring-2 ring-emerald-300' },
  visited:   { bg: 'bg-indigo-400',   ring: '' },
  target:    { bg: 'bg-yellow-400',   ring: 'ring-2 ring-yellow-300' },
  counting:  { bg: 'bg-fuchsia-500',  ring: 'ring-1 ring-fuchsia-300' },
  radix:     { bg: 'bg-cyan-500',     ring: 'ring-1 ring-cyan-300' },
  bucket:    { bg: 'bg-teal-500',     ring: 'ring-1 ring-teal-300' },
};

const PHASE_BADGE: Record<string, string> = {
  divide:  'bg-amber-500/20 text-amber-300',
  solve:   'bg-sky-500/20 text-sky-300',
  merge:   'bg-violet-500/20 text-violet-300',
  combine: 'bg-violet-500/20 text-violet-300',
  done:    'bg-emerald-500/20 text-emerald-300',
};

// ─── Single bar ───────────────────────────────────────────────────────────────

function Bar({ el, maxVal, reduceMotion }: {
  el: ArrayElement;
  maxVal: number;
  reduceMotion: boolean;
}) {
  const pct = maxVal > 0 ? (el.value / maxVal) * 100 : 50;
  const s = STATE_STYLES[el.state] ?? STATE_STYLES.default;
  return (
    <motion.div
      key={el.id}
      layoutId={String(el.id)}
      layout={!reduceMotion}
      className="flex flex-col items-center gap-1 flex-1 min-w-0"
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      <motion.div
        className={`w-full rounded-t-md ${s.bg} ${s.ring}`}
        style={{ height: `${Math.max(pct, 4)}%` }}
        animate={{ height: `${Math.max(pct, 4)}%` }}
        transition={{ duration: reduceMotion ? 0 : 0.25 }}
        aria-label={`Value ${el.value}`}
      />
      <span className="text-[9px] font-mono text-zinc-500 truncate w-full text-center">
        {el.value}
      </span>
    </motion.div>
  );
}

// ─── Range bracket ────────────────────────────────────────────────────────────

function RangeBracket({ lo, hi, count, label, color }: {
  lo: number; hi: number; count: number; label: string; color: string;
}) {
  if (lo < 0 || hi < lo || count === 0) return null;
  const leftPct = (lo / count) * 100;
  const widthPct = ((hi - lo + 1) / count) * 100;
  return (
    <div
      className="absolute bottom-7 h-1 rounded-full pointer-events-none"
      style={{ left: `${leftPct}%`, width: `${widthPct}%`, backgroundColor: color }}
      aria-hidden
    >
      <span
        className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-mono whitespace-nowrap"
        style={{ color }}
      >
        {label}
      </span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export interface DivConquerVisualizerProps {
  snapshot?: Snapshot<DivConquerData | ArrayElement[]>;
}

export const DivConquerVisualizer: React.FC<DivConquerVisualizerProps> = ({ snapshot }) => {
  const reduceMotion = useReducedMotion() ?? false;
  const raw = snapshot?.data;

  // Support both DivConquerData and plain ArrayElement[] (e.g. merge-sort already uses ArrayBars)
  let elements: ArrayElement[] = [];
  let divData: DivConquerData | null = null;

  if (raw && !Array.isArray(raw) && 'elements' in (raw as any)) {
    divData = raw as DivConquerData;
    elements = divData.elements;
  } else if (Array.isArray(raw)) {
    elements = raw as ArrayElement[];
  }

  const n = elements.length;
  const maxVal = n > 0 ? Math.max(...elements.map((e) => e.value), 1) : 1;

  const phase = divData?.phase;
  const activeRange = divData?.activeRange;
  const leftRange = divData?.leftRange;
  const rightRange = divData?.rightRange;

  return (
    <div
      className="w-full flex flex-col gap-4 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl shadow-lg min-h-[340px]"
      role="region"
      aria-label="Divide and Conquer visualizer"
    >
      {/* Header */}
      <div className="w-full px-4 py-2.5 rounded-xl bg-zinc-100/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-violet-500 animate-ping" aria-hidden />
          <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate max-w-xs">
            {snapshot?.description ?? 'Divide & Conquer'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {phase && (
            <span className={`text-[10px] font-mono font-semibold capitalize px-2 py-0.5 rounded ${PHASE_BADGE[phase] ?? 'bg-zinc-700/40 text-zinc-400'}`}>
              {phase}
            </span>
          )}
          <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-zinc-200/60 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
            Step {snapshot?.step ?? 0}
          </span>
        </div>
      </div>

      {/* Bar chart */}
      <div className="relative flex-1 flex items-end gap-0.5 px-2 overflow-x-auto min-h-[220px]">
        {/* Range overlays */}
        {leftRange && (
          <RangeBracket lo={leftRange[0]} hi={leftRange[1]} count={n} label="left" color="#f59e0b" />
        )}
        {rightRange && (
          <RangeBracket lo={rightRange[0]} hi={rightRange[1]} count={n} label="right" color="#60a5fa" />
        )}
        {activeRange && (
          <RangeBracket lo={activeRange[0]} hi={activeRange[1]} count={n} label="active" color="#a78bfa" />
        )}

        {n === 0 ? (
          <p className="text-sm text-zinc-500 italic m-auto">No elements</p>
        ) : (
          elements.map((el) => (
            <Bar key={el.id} el={el} maxVal={maxVal} reduceMotion={reduceMotion} />
          ))
        )}
      </div>

      {/* Extra metadata from snapshot.variables */}
      {snapshot?.variables && Object.keys(snapshot.variables).length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-mono text-zinc-500">
          {(Object.entries(snapshot.variables) as [string, any][])
            .filter(([, v]) => typeof v !== 'object' || v === null)
            .slice(0, 8)
            .map(([k, v]) => (
              <span key={k}>
                <span className="text-zinc-600">{k}:</span>{' '}
                <span className="text-zinc-300">{String(v)}</span>
              </span>
            ))}
        </div>
      )}
    </div>
  );
};

export default DivConquerVisualizer;
