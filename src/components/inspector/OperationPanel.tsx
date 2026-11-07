'use client';

/**
 * src/components/inspector/OperationPanel.tsx
 *
 * Interactive operation panel for Stack, Queue, and Linked List visualizers.
 *
 * Renders operation buttons with a value input and disabled states.
 * When the user triggers an operation it appends to an ops queue and calls
 * onOpsChange so the parent can re-generate snapshots.
 *
 * Acceptance criterion: operations chain correctly across multiple user actions.
 * This is achieved by always appending to the existing ops array (not replacing).
 */

import React, { useState, useCallback } from 'react';
import {
  Plus,
  Minus,
  Search,
  ArrowLeftRight,
  Eye,
  Trash2,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
} from 'lucide-react';
import { StackOp, QueueOp, LinkedListOp } from '@/lib/types/linear';

// ─── Supported structure types ────────────────────────────────────────────────
export type LinearStructure = 'stack' | 'queue' | 'linked-list';

type AnyOp = StackOp | QueueOp | LinkedListOp;

// ─── Operation button config ──────────────────────────────────────────────────
interface OpConfig {
  label: string;
  icon: React.ReactNode;
  needsValue: boolean;
  description: string;
  build: (value: number) => AnyOp;
  /** If true, button is always enabled even when value is empty */
  noValueOk?: boolean;
}

function getOps(structure: LinearStructure): OpConfig[] {
  switch (structure) {
    case 'stack':
      return [
        {
          label: 'Push',
          icon: <Plus className="w-3.5 h-3.5" />,
          needsValue: true,
          description: 'Push value onto the top of the stack',
          build: (v) => ({ type: 'push', value: v }),
        },
        {
          label: 'Pop',
          icon: <Minus className="w-3.5 h-3.5" />,
          needsValue: false,
          noValueOk: true,
          description: 'Remove and return the top element',
          build: () => ({ type: 'pop' }),
        },
        {
          label: 'Peek',
          icon: <Eye className="w-3.5 h-3.5" />,
          needsValue: false,
          noValueOk: true,
          description: 'View the top element without removing it',
          build: () => ({ type: 'peek' }),
        },
      ];

    case 'queue':
      return [
        {
          label: 'Enqueue',
          icon: <ChevronRight className="w-3.5 h-3.5" />,
          needsValue: true,
          description: 'Add value to the tail of the queue',
          build: (v) => ({ type: 'enqueue', value: v }),
        },
        {
          label: 'Dequeue',
          icon: <ChevronLeft className="w-3.5 h-3.5" />,
          needsValue: false,
          noValueOk: true,
          description: 'Remove and return the head element',
          build: () => ({ type: 'dequeue' }),
        },
        {
          label: 'Peek',
          icon: <Eye className="w-3.5 h-3.5" />,
          needsValue: false,
          noValueOk: true,
          description: 'View the head element without removing it',
          build: () => ({ type: 'peek' }),
        },
      ];

    case 'linked-list':
      return [
        {
          label: 'Insert Head',
          icon: <Plus className="w-3.5 h-3.5" />,
          needsValue: true,
          description: 'Insert node at the head (O(1))',
          build: (v) => ({ type: 'insertHead', value: v }),
        },
        {
          label: 'Insert Tail',
          icon: <Plus className="w-3.5 h-3.5" />,
          needsValue: true,
          description: 'Insert node at the tail (O(n))',
          build: (v) => ({ type: 'insertTail', value: v }),
        },
        {
          label: 'Delete',
          icon: <Trash2 className="w-3.5 h-3.5" />,
          needsValue: true,
          description: 'Delete first occurrence of value',
          build: (v) => ({ type: 'delete', value: v }),
        },
        {
          label: 'Search',
          icon: <Search className="w-3.5 h-3.5" />,
          needsValue: true,
          description: 'Find first occurrence of value',
          build: (v) => ({ type: 'search', value: v }),
        },
        {
          label: 'Reverse',
          icon: <ArrowLeftRight className="w-3.5 h-3.5" />,
          needsValue: false,
          noValueOk: true,
          description: 'Reverse the entire list in place',
          build: () => ({ type: 'reverse' }),
        },
      ];
  }
}

// ─── Props ────────────────────────────────────────────────────────────────────
export interface OperationPanelProps {
  structure: LinearStructure;
  /** Current ops array — OperationPanel appends to this */
  ops: AnyOp[];
  /** Called with the new full ops array after each user action */
  onOpsChange: (newOps: AnyOp[]) => void;
  /** Called when user wants to clear all ops and start fresh */
  onReset: () => void;
  /** Max number of chained operations (default 20) */
  maxOps?: number;
  className?: string;
}

// ─── OperationPanel ───────────────────────────────────────────────────────────
export const OperationPanel: React.FC<OperationPanelProps> = ({
  structure,
  ops,
  onOpsChange,
  onReset,
  maxOps = 20,
  className = '',
}) => {
  const [value, setValue] = useState<string>('');
  const [lastAdded, setLastAdded] = useState<string | null>(null);

  const opConfigs = getOps(structure);
  const numVal = parseInt(value, 10);
  const valueValid = !isNaN(numVal) && isFinite(numVal);
  const atMax = ops.length >= maxOps;

  const handleOp = useCallback(
    (cfg: OpConfig) => {
      if (atMax) return;
      if (cfg.needsValue && !valueValid) return;

      const newOp = cfg.build(valueValid ? numVal : 0);
      const newOps = [...ops, newOp];
      onOpsChange(newOps as AnyOp[]);
      setLastAdded(cfg.label);

      // Clear value after value-requiring ops
      if (cfg.needsValue) setValue('');
    },
    [ops, onOpsChange, atMax, valueValid, numVal]
  );

  const handleReset = useCallback(() => {
    setValue('');
    setLastAdded(null);
    onReset();
  }, [onReset]);

  const structureTitle =
    structure === 'stack'
      ? 'Stack Operations'
      : structure === 'queue'
      ? 'Queue Operations'
      : 'Linked List Operations';

  return (
    <div
      className={`p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-sm space-y-4 ${className}`}
      data-testid="operation-panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {structureTitle}
          </h3>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
            {ops.length} / {maxOps} operations queued
          </p>
        </div>
        <button
          type="button"
          onClick={handleReset}
          title="Clear all operations and reset"
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-all active:scale-95 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
          Reset
        </button>
      </div>

      {/* Value input */}
      <div className="space-y-1">
        <label
          htmlFor="op-value-input"
          className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block"
        >
          Value (for value-requiring operations)
        </label>
        <input
          id="op-value-input"
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g. 42"
          className="w-full px-3 py-1.5 text-sm font-mono rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors"
          aria-label="Operation value"
          data-testid="op-value-input"
        />
        {value && !valueValid && (
          <p className="text-[11px] text-rose-500">Please enter a valid integer.</p>
        )}
      </div>

      {/* Operation buttons */}
      <div className="grid grid-cols-2 gap-2">
        {opConfigs.map((cfg) => {
          const disabled = atMax || (cfg.needsValue && !valueValid);
          return (
            <button
              key={cfg.label}
              type="button"
              disabled={disabled}
              onClick={() => handleOp(cfg)}
              title={disabled ? (atMax ? 'Max operations reached' : 'Enter a value first') : cfg.description}
              aria-label={cfg.label}
              data-testid={`op-btn-${cfg.label.toLowerCase().replace(/\s+/g, '-')}`}
              className={`
                flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border
                transition-all duration-150 cursor-pointer
                ${disabled
                  ? 'opacity-40 cursor-not-allowed bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-400'
                  : 'bg-violet-600 hover:bg-violet-700 active:scale-95 border-violet-500 text-white shadow-sm shadow-violet-500/20'
                }
              `}
            >
              {cfg.icon}
              {cfg.label}
            </button>
          );
        })}
      </div>

      {/* Max cap warning */}
      {atMax && (
        <div className="text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-lg p-2 text-center">
          Maximum {maxOps} operations reached. Reset to add more.
        </div>
      )}

      {/* Operation history log */}
      {ops.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
            Operation Queue ({ops.length})
          </div>
          <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
            {ops.map((op, idx) => {
              const opStr =
                'value' in op
                  ? `${op.type}(${(op as any).value})`
                  : `${op.type}()`;
              const isLast = idx === ops.length - 1;
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-2 px-2 py-1 rounded-md text-[11px] font-mono
                    ${isLast
                      ? 'bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300 border border-violet-200/50 dark:border-violet-800/50'
                      : 'bg-zinc-50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400'
                    }`}
                >
                  <span className="w-5 text-right text-zinc-400 shrink-0 text-[10px]">{idx + 1}.</span>
                  <span>{opStr}</span>
                  {isLast && (
                    <span className="ml-auto text-[9px] bg-violet-500/20 text-violet-600 dark:text-violet-400 px-1.5 py-0.5 rounded font-semibold">
                      latest
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Last added feedback */}
      {lastAdded && (
        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 text-center">
          ✓ {lastAdded} added to queue
        </p>
      )}
    </div>
  );
};

export default OperationPanel;

