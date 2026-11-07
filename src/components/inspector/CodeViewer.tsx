'use client';

import React from 'react';
import { Code2 } from 'lucide-react';

export interface CodeViewerProps {
  code?: string[];
  activeLine?: number;
  variables?: Record<string, any>;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({
  code,
  activeLine,
  variables,
}) => {
  if (!code || code.length === 0) return null;

  return (
    <div className="w-full p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-sm space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-violet-500" />
          <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
            Pseudocode & Trace
          </h4>
        </div>
      </div>

      {/* Code Lines */}
      <div className="font-mono text-[11px] leading-5 bg-zinc-950 text-zinc-300 p-3 rounded-lg overflow-x-auto border border-zinc-800">
        {code.map((line, idx) => {
          const isCurrent = activeLine === idx;
          return (
            <div
              key={idx}
              className={`flex items-center px-2 py-0.5 rounded transition-colors ${
                isCurrent
                  ? 'bg-violet-600/30 text-violet-200 border-l-2 border-violet-500 font-semibold'
                  : 'hover:bg-zinc-850 opacity-80'
              }`}
            >
              <span className="w-6 shrink-0 text-zinc-500 select-none text-[10px]">
                {idx + 1}
              </span>
              <pre className="whitespace-pre">{line}</pre>
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
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(variables).map(([key, val]) => (
              <span
                key={key}
                className="px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/60"
              >
                <span className="text-violet-600 dark:text-violet-400 font-medium">{key}</span>: {String(val)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeViewer;
