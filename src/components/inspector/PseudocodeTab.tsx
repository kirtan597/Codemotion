'use client';

/**
 * src/components/inspector/PseudocodeTab.tsx
 *
 * Pseudocode viewer with:
 * - Animated gutter marker gliding to the active highlighted line
 * - Auto-scroll keeping the active line within view
 * - Syntax highlighting & line numbers
 * - Live variable watcher
 */

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Code2, ChevronRight } from 'lucide-react';

export interface PseudocodeTabProps {
  code?: string[];
  highlightedLine?: number;
  variables?: Record<string, any>;
  className?: string;
}

export const PseudocodeTab: React.FC<PseudocodeTabProps> = ({
  code = [],
  highlightedLine,
  variables,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Auto-scroll: keep the active line visible within the container
  useEffect(() => {
    if (
      highlightedLine !== undefined &&
      highlightedLine >= 0 &&
      lineRefs.current[highlightedLine]
    ) {
      lineRefs.current[highlightedLine]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [highlightedLine]);

  if (!code || code.length === 0) {
    return (
      <div className="p-4 text-xs text-zinc-400 italic text-center">
        No pseudocode available for this algorithm.
      </div>
    );
  }

  return (
    <div
      className={`w-full flex flex-col p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-sm space-y-3 ${className}`}
      data-testid="pseudocode-tab"
    >
      {/* Tab Header */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-violet-500" />
          <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
            Pseudocode & Trace
          </h4>
        </div>
        {highlightedLine !== undefined && highlightedLine >= 0 && (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 font-semibold border border-violet-200 dark:border-violet-800/60">
            Line {highlightedLine + 1}
          </span>
        )}
      </div>

      {/* Code Container with Auto-Scroll */}
      <div
        ref={containerRef}
        className="relative font-mono text-[11px] leading-6 bg-zinc-950 text-zinc-300 p-2.5 rounded-lg overflow-y-auto max-h-[300px] border border-zinc-800 select-none"
      >
        {code.map((lineText, idx) => {
          const isCurrent = highlightedLine === idx;

          return (
            <div
              key={idx}
              ref={(el) => {
                lineRefs.current[idx] = el;
              }}
              className={`relative flex items-center px-1.5 py-0.5 rounded transition-colors ${
                isCurrent
                  ? 'bg-violet-600/25 text-violet-100 font-medium'
                  : 'hover:bg-zinc-900/80 text-zinc-400'
              }`}
            >
              {/* Animated Gutter Marker */}
              <div className="w-6 shrink-0 flex items-center justify-center relative">
                {isCurrent && (
                  <motion.div
                    layoutId="gutter-marker"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    className="absolute inset-y-0 left-0 flex items-center text-violet-400"
                    data-testid="gutter-marker"
                  >
                    <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
                  </motion.div>
                )}
                <span
                  className={`text-[10px] select-none ${
                    isCurrent ? 'text-violet-400 font-bold' : 'text-zinc-600'
                  }`}
                >
                  {idx + 1}
                </span>
              </div>

              {/* Code text */}
              <pre className="whitespace-pre pl-2 font-mono">{lineText}</pre>
            </div>
          );
        })}
      </div>

      {/* Variable Watcher */}
      {variables && Object.keys(variables).length > 0 && (
        <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60">
          <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
            Variables Watcher
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            {Object.entries(variables)
              .filter(([_, val]) => typeof val !== 'object' || val === null)
              .map(([key, val]) => (
                <span
                  key={key}
                  className="px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/60"
                >
                  <span className="text-violet-600 dark:text-violet-400 font-medium">
                    {key}
                  </span>
                  : {String(val)}
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PseudocodeTab;

