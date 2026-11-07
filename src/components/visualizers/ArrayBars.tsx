'use client';

import React, { useId } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrayElement, ElementState, Snapshot } from '@/lib/types/algorithm';

// ─── Semantic colour map ──────────────────────────────────────────────────────
// Master semantics — single source of truth for bar colours.
// Keep in sync with the Legend below and with the CSS custom-property in globals.css
const STATE_STYLES: Record<
  ElementState,
  { bar: string; text: string; ring: string; label: string }
> = {
  default:   { bar: 'from-violet-600 to-indigo-500 dark:from-violet-500 dark:to-indigo-400', text: 'text-zinc-600 dark:text-zinc-300', ring: '',                        label: 'Default'   },
  comparing: { bar: 'bg-amber-400 dark:bg-amber-500',                                         text: 'text-amber-700 dark:text-amber-200', ring: 'ring-2 ring-amber-300',  label: 'Comparing' },
  swapping:  { bar: 'bg-rose-500 dark:bg-rose-600',                                            text: 'text-rose-700 dark:text-rose-200',   ring: 'ring-2 ring-rose-300',   label: 'Swapping'  },
  sorted:    { bar: 'bg-emerald-500 dark:bg-emerald-600',                                      text: 'text-emerald-700 dark:text-emerald-200', ring: '',                   label: 'Sorted'    },
  pivot:     { bar: 'bg-cyan-400 dark:bg-cyan-500',                                            text: 'text-cyan-700 dark:text-cyan-200',   ring: 'ring-2 ring-cyan-300',   label: 'Pivot/Min' },
  active:    { bar: 'bg-blue-500 dark:bg-blue-600',                                            text: 'text-blue-700 dark:text-blue-200',   ring: '',                       label: 'Active'    },
  found:     { bar: 'bg-emerald-400 dark:bg-emerald-500',                                      text: 'text-emerald-700 dark:text-emerald-200', ring: 'ring-4 ring-emerald-300 animate-pulse', label: 'Found' },
  visited:   { bar: 'bg-zinc-300 dark:bg-zinc-700 opacity-40',                                 text: 'text-zinc-400',                     ring: '',                       label: 'Visited'   },
  target:    { bar: 'bg-yellow-400 dark:bg-yellow-500',                                        text: 'text-yellow-700 dark:text-yellow-200', ring: 'ring-2 ring-yellow-300', label: 'Target'  },
  counting:  { bar: 'bg-fuchsia-500 dark:bg-fuchsia-600',                                      text: 'text-fuchsia-700 dark:text-fuchsia-200', ring: 'ring-1 ring-fuchsia-300', label: 'Counting' },
  radix:     { bar: 'bg-cyan-500 dark:bg-cyan-600',                                             text: 'text-cyan-700 dark:text-cyan-200',   ring: 'ring-1 ring-cyan-300',   label: 'Radix'   },
  bucket:    { bar: 'bg-teal-500 dark:bg-teal-600',                                             text: 'text-teal-700 dark:text-teal-200',   ring: 'ring-1 ring-teal-300',   label: 'Bucket'  },
};

// ─── A11y icons/patterns for comparing vs swapping ───────────────────────────
// SVG patterns rendered as an overlay so the bar meaning is conveyed even
// in high-contrast / grayscale modes.  We keep them minimal to not clutter.
function PatternOverlay({ state }: { state: ElementState }) {
  if (state === 'comparing') {
    // Horizontal stripes
    return (
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full opacity-20 rounded-t-lg pointer-events-none"
      >
        <defs>
          <pattern id="cmp-stripe" patternUnits="userSpaceOnUse" width="4" height="4">
            <path d="M0 0 L4 4 M-1 3 L1 5 M3 -1 L5 1" stroke="white" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#cmp-stripe)" />
      </svg>
    );
  }
  if (state === 'swapping') {
    // Cross-hatch
    return (
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full opacity-20 rounded-t-lg pointer-events-none"
      >
        <defs>
          <pattern id="swp-xhatch" patternUnits="userSpaceOnUse" width="6" height="6">
            <path d="M0 0 L6 6 M6 0 L0 6" stroke="white" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#swp-xhatch)" />
      </svg>
    );
  }
  return null;
}

// ─── Legend ──────────────────────────────────────────────────────────────────
const LEGEND_STATES: ElementState[] = ['default', 'comparing', 'swapping', 'pivot', 'sorted'];

function Legend() {
  return (
    <div
      role="list"
      aria-label="Bar colour legend"
      className="w-full mt-4 pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60 flex flex-wrap items-center justify-center gap-4 text-[11px] text-zinc-500"
    >
      {LEGEND_STATES.map((s) => {
        const style = STATE_STYLES[s];
        return (
          <div key={s} role="listitem" className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className={`w-2.5 h-2.5 rounded-sm ${
                s === 'default' ? 'bg-gradient-to-t from-violet-600 to-indigo-500' : style.bar.split(' ')[0]
              }`}
            />
            <span>{style.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Props ───────────────────────────────────────────────────────────────────
export interface ArrayBarsProps {
  snapshot?: Snapshot<ArrayElement[]>;
}

// ─── ArrayBars ───────────────────────────────────────────────────────────────
export const ArrayBars: React.FC<ArrayBarsProps> = ({ snapshot }) => {
  const patternBaseId = useId();
  const shouldReduceMotion = useReducedMotion();

  if (!snapshot || !Array.isArray(snapshot.data) || snapshot.data.length === 0) {
    return (
      <div className="w-full h-80 flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-400">
        <p className="text-sm font-medium">No array data available</p>
      </div>
    );
  }

  const elements = snapshot.data;
  const n = elements.length;
  const maxVal = Math.max(...elements.map((el) => el.value), 1);
  const showValueLabel = n <= 40;
  const showIndexLabel = n <= 60; // always show up to 60, hide at >60

  return (
    <div
      className="w-full flex flex-col items-center justify-between p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl shadow-lg min-h-[380px]"
      role="region"
      aria-label={`Array visualizer, step ${snapshot.step}: ${snapshot.description}`}
    >
      {/* Step Description Banner */}
      <div className="w-full mb-4 px-4 py-2.5 rounded-xl bg-zinc-100/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-violet-500 animate-ping" aria-hidden="true" />
          <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200" aria-live="polite">
            {snapshot.description}
          </p>
        </div>
        <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-zinc-200/60 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
          Step {snapshot.step}
        </span>
      </div>

      {/* Array Bars Canvas */}
      <div
        className="w-full flex-1 flex items-end justify-center gap-0.5 sm:gap-1 px-1 py-4"
        aria-hidden="true" /* individual bars are decorative; description above is the a11y label */
      >
        <AnimatePresence initial={false}>
          {elements.map((el) => {
            const heightPercent = Math.max(8, Math.round((el.value / maxVal) * 92));
            const style = STATE_STYLES[el.state] ?? STATE_STYLES.default;
            const isDefault = el.state === 'default';

            return (
              <motion.div
                key={el.id}  // stable id — NOT index — so framer-motion animates position swaps
                layout={!shouldReduceMotion}
                layoutId={String(el.id)}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 500, damping: 40 }
                }
                className="flex-1 max-w-[48px] flex flex-col items-center justify-end h-full group"
                title={`Value: ${el.value} | State: ${el.state}`}
                aria-label={`${el.value} (${style.label})`}
              >
                {/* Value label — hidden when n > 40 */}
                {showValueLabel && (
                  <span
                    className={`text-[10px] sm:text-xs font-mono font-semibold mb-1 transition-transform group-hover:scale-110 ${style.text}`}
                  >
                    {el.value}
                  </span>
                )}

                {/* Bar */}
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`relative w-full rounded-t-lg ${
                    shouldReduceMotion ? '' : 'transition-[background-color] duration-150 ease-out'
                  } ${style.ring} ${
                    isDefault
                      ? 'bg-gradient-to-t from-violet-600 to-indigo-500 dark:from-violet-500 dark:to-indigo-400'
                      : style.bar
                  }`}
                >
                  {/* A11y pattern overlay for comparing / swapping */}
                  <PatternOverlay state={el.state} />
                </div>

                {/* Pointer / index label beneath — always shown up to n=60 */}
                {showIndexLabel && (
                  <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 mt-1">
                    {/* Show state icon for comparing/swapping/pivot */}
                    {el.state === 'comparing' ? '⇅' : el.state === 'swapping' ? '⇄' : el.state === 'pivot' ? '◆' : ''}
                  </span>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Meta: comparisons & swaps from variables */}
      {snapshot.variables && (
        <div className="w-full flex items-center justify-center gap-6 text-[11px] font-mono text-zinc-400 dark:text-zinc-500 pb-1">
          {snapshot.variables.comparisons != null && (
            <span>⚖ {String(snapshot.variables.comparisons)} comparisons</span>
          )}
          {snapshot.variables.swaps != null && (
            <span>↔ {String(snapshot.variables.swaps)} swaps</span>
          )}
          {snapshot.variables.heapSize != null && (
            <span>🌳 heap: {String(snapshot.variables.heapSize)}</span>
          )}
        </div>
      )}

      <Legend />
    </div>
  );
};

export default ArrayBars;

