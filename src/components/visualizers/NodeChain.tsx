'use client';

/**
 * src/components/visualizers/NodeChain.tsx
 *
 * Animated linked-node visualizer for Stack, Queue, and Linked List.
 *
 * Features:
 *  - framer-motion AnimatePresence: nodes enter (scale+fade in) and exit (scale+fade out)
 *  - layout animations so existing nodes slide smoothly when neighbours are added/removed
 *  - Arrows (→) rendered as SVG between nodes
 *  - head / tail / curr / prev pointer labels beneath each node
 *  - Colour mapping from the NodeState master semantics
 *  - Respects prefers-reduced-motion
 *  - A11y: role="list", aria-label per node
 */

import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ListNode, NodeState } from '@/lib/types/linear';
import { Snapshot } from '@/lib/types/algorithm';

// ─── Colour map ───────────────────────────────────────────────────────────────
const NODE_STYLES: Record<
  NodeState,
  { bg: string; border: string; text: string; label: string }
> = {
  default:   { bg: 'bg-gradient-to-br from-violet-600 to-indigo-500', border: 'border-violet-400',  text: 'text-white',           label: 'Default'   },
  active:    { bg: 'bg-amber-400 dark:bg-amber-500',                   border: 'border-amber-300',   text: 'text-amber-950',       label: 'Active'    },
  removing:  { bg: 'bg-rose-500 dark:bg-rose-600',                     border: 'border-rose-300',    text: 'text-white',           label: 'Removing'  },
  searching: { bg: 'bg-blue-500 dark:bg-blue-600',                     border: 'border-blue-300',    text: 'text-white',           label: 'Searching' },
  found:     { bg: 'bg-emerald-400 dark:bg-emerald-500',               border: 'border-emerald-300', text: 'text-emerald-950',     label: 'Found'     },
  head:      { bg: 'bg-cyan-500 dark:bg-cyan-600',                     border: 'border-cyan-300',    text: 'text-white',           label: 'Head'      },
  tail:      { bg: 'bg-fuchsia-500 dark:bg-fuchsia-600',               border: 'border-fuchsia-300', text: 'text-white',           label: 'Tail'      },
  sorted:    { bg: 'bg-emerald-500 dark:bg-emerald-600',               border: 'border-emerald-300', text: 'text-white',           label: 'Sorted'    },
};

// ─── Legend ──────────────────────────────────────────────────────────────────
const LEGEND_STATES: NodeState[] = ['default', 'active', 'removing', 'searching', 'found', 'sorted'];

function Legend() {
  return (
    <div
      role="list"
      aria-label="Node colour legend"
      className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-zinc-500"
    >
      {LEGEND_STATES.map((s) => {
        const style = NODE_STYLES[s];
        return (
          <div key={s} role="listitem" className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded-full border ${style.bg} ${style.border}`} aria-hidden="true" />
            <span>{style.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Single Node ─────────────────────────────────────────────────────────────
interface NodeBoxProps {
  node: ListNode;
  isLast: boolean;
  reduceMotion: boolean;
}

function NodeBox({ node, isLast, reduceMotion }: NodeBoxProps) {
  const style = NODE_STYLES[node.state] ?? NODE_STYLES.default;

  const enterAnim = reduceMotion
    ? { opacity: 1 }
    : { opacity: 1, scale: 1, y: 0 };
  const exitAnim = reduceMotion
    ? { opacity: 0 }
    : { opacity: 0, scale: 0.5, y: -12 };
  const initAnim = reduceMotion
    ? { opacity: 0 }
    : { opacity: 0, scale: 0.5, y: -12 };

  return (
    <div className="flex items-center">
      {/* Node + pointer labels wrapper */}
      <div className="flex flex-col items-center gap-1">
        {/* Node circle */}
        <motion.div
          key={node.id}
          layoutId={node.id}
          layout={!reduceMotion}
          initial={initAnim}
          animate={enterAnim}
          exit={exitAnim}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { type: 'spring', stiffness: 450, damping: 35 }
          }
          role="listitem"
          aria-label={`Node value ${node.value}, state: ${style.label}`}
          title={`${node.value} (${style.label})`}
          className={`
            w-12 h-12 rounded-full border-2 flex items-center justify-center
            font-mono font-bold text-sm select-none shadow-md
            ${style.bg} ${style.border} ${style.text}
            ${node.state === 'removing' ? 'ring-2 ring-rose-400 ring-offset-1' : ''}
            ${node.state === 'found'    ? 'ring-2 ring-emerald-300 ring-offset-1' : ''}
          `}
        >
          {String(node.value)}
        </motion.div>

        {/* Pointer labels beneath node */}
        {node.pointers && node.pointers.length > 0 && (
          <div className="flex gap-1">
            {node.pointers.map((ptr) => (
              <span
                key={ptr}
                className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded
                           bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300
                           border border-zinc-200 dark:border-zinc-700"
              >
                {ptr}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Arrow → between nodes (not after last) */}
      {!isLast && (
        <motion.div
          layout={!reduceMotion}
          className="mx-1.5 flex items-center text-zinc-400 dark:text-zinc-500 select-none"
          aria-hidden="true"
        >
          <svg width="24" height="16" viewBox="0 0 24 16" fill="none">
            <path
              d="M2 8 L18 8 M14 4 L18 8 L14 12"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      )}
    </div>
  );
}

// ─── NodeChain component ──────────────────────────────────────────────────────
export interface NodeChainProps {
  snapshot?: Snapshot<ListNode[]>;
  /** Label shown in the header (e.g. 'Stack', 'Queue', 'Linked List') */
  structureLabel?: string;
}

export const NodeChain: React.FC<NodeChainProps> = ({
  snapshot,
  structureLabel = 'Linear Structure',
}) => {
  const reduceMotion = useReducedMotion() ?? false;

  if (!snapshot) {
    return (
      <div className="w-full h-64 flex items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-400">
        <p className="text-sm font-medium">No data available</p>
      </div>
    );
  }

  const nodes: ListNode[] = Array.isArray(snapshot.data) ? snapshot.data : [];

  return (
    <div
      className="w-full flex flex-col gap-4 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl shadow-lg min-h-[280px]"
      role="region"
      aria-label={`${structureLabel} visualizer, step ${snapshot.step}: ${snapshot.description}`}
    >
      {/* Step Banner */}
      <div className="w-full px-4 py-2.5 rounded-xl bg-zinc-100/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between">
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

      {/* Node chain canvas */}
      <div
        className="flex-1 flex items-center justify-center overflow-x-auto py-4 px-2"
        aria-hidden="true"
      >
        {nodes.length === 0 ? (
          <p className="text-sm text-zinc-400 italic">Empty structure</p>
        ) : (
          <motion.div
            layout={!reduceMotion}
            className="flex items-start gap-0 flex-wrap justify-center"
            role="list"
            aria-label={`${structureLabel} nodes`}
          >
            <AnimatePresence initial={false} mode="popLayout">
              {nodes.map((node, idx) => (
                <NodeBox
                  key={node.id}
                  node={node}
                  isLast={idx === nodes.length - 1}
                  reduceMotion={reduceMotion}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Meta row: size + operation from variables */}
      {snapshot.variables && (
        <div className="flex items-center justify-center gap-6 text-[11px] font-mono text-zinc-400 dark:text-zinc-500">
          {snapshot.variables.size != null && (
            <span>📦 size: {String(snapshot.variables.size)}</span>
          )}
          {snapshot.variables.operation != null && (
            <span>⚙ op: {String(snapshot.variables.operation)}</span>
          )}
          {snapshot.variables.result != null && (
            <span className="text-emerald-500 dark:text-emerald-400 font-semibold">
              → {String(snapshot.variables.result)}
            </span>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60">
        <Legend />
      </div>
    </div>
  );
};

export default NodeChain;

