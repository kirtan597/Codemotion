'use client';

/**
 * src/components/visualizers/QueueOverlay.tsx
 *
 * Live Priority Queue / Stack / FIFO Queue overlay with push/pop animation
 * and a real-time distance table (node, dist, prev).
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DistanceEntry, QueueItem } from '@/lib/algorithms/graph/types';
import { Layers, Table2 } from 'lucide-react';

export interface QueueOverlayProps {
  queue?: QueueItem[] | string[];
  table?: DistanceEntry[];
  structureType?: 'priorityQueue' | 'stack' | 'queue';
  className?: string;
}

export const QueueOverlay: React.FC<QueueOverlayProps> = ({
  queue = [],
  table = [],
  structureType = 'priorityQueue',
  className = '',
}) => {
  // Normalize queue items
  const items: QueueItem[] = queue.map((item) => {
    if (typeof item === 'string') {
      return { id: item, label: item };
    }
    return item;
  });

  const structureTitle =
    structureType === 'stack'
      ? 'Call Stack'
      : structureType === 'priorityQueue'
      ? 'Min-Heap (Priority Queue)'
      : 'Queue (FIFO)';

  return (
    <div
      className={`flex flex-col md:flex-row gap-3 pointer-events-auto select-none ${className}`}
      data-testid="queue-overlay"
    >
      {/* 1. Live Queue / Stack Container */}
      <div className="flex-1 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl p-3 shadow-lg min-w-[180px]">
        <div className="flex items-center gap-1.5 pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
          <Layers className="w-3.5 h-3.5 text-amber-500" />
          <span>{structureTitle}</span>
          <span className="ml-auto text-[10px] font-mono text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
            {items.length}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-2 min-h-[44px] items-center">
          {items.length === 0 ? (
            <span className="text-[11px] text-zinc-400 italic">Empty</span>
          ) : (
            <AnimatePresence mode="popLayout" initial={false}>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ scale: 0.6, opacity: 0, y: -8 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.6, opacity: 0, y: 8 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 text-amber-900 dark:text-amber-200 text-xs font-mono font-semibold shadow-xs"
                >
                  <span>{item.label}</span>
                  {item.priority !== undefined && (
                    <span className="text-[10px] font-normal px-1 py-0.2 rounded bg-amber-200/60 dark:bg-amber-800/60 text-amber-800 dark:text-amber-100">
                      {item.priority === Infinity ? '∞' : item.priority}
                    </span>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* 2. Real-time Distance Table */}
      {table.length > 0 && (
        <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl p-3 shadow-lg min-w-[200px] max-w-xs">
          <div className="flex items-center gap-1.5 pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
            <Table2 className="w-3.5 h-3.5 text-violet-500" />
            <span>Distance Table</span>
          </div>

          <div className="pt-2 max-h-36 overflow-y-auto">
            <table className="w-full text-[11px] font-mono text-left">
              <thead>
                <tr className="text-zinc-400 border-b border-zinc-200/40 dark:border-zinc-800/40">
                  <th className="pb-1 font-medium">Node</th>
                  <th className="pb-1 font-medium">Dist</th>
                  <th className="pb-1 font-medium">Prev</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/40">
                {table.map((row) => (
                  <tr key={row.node} className="text-zinc-700 dark:text-zinc-300">
                    <td className="py-1 font-semibold">{row.node}</td>
                    <td className="py-1">
                      {row.dist === Infinity ? (
                        <span className="text-zinc-400">∞</span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          {row.dist}
                        </span>
                      )}
                    </td>
                    <td className="py-1 text-zinc-500 dark:text-zinc-400">
                      {row.prev ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default QueueOverlay;

