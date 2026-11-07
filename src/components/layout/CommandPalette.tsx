'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import {
  Search,
  Sparkles,
  ArrowRight,
  Play,
  RotateCcw,
  StepForward,
  StepBack,
  Sliders,
  Layers,
  Code2,
  X,
} from 'lucide-react';
import { ALGORITHMS, CATEGORIES } from '@/lib/algorithms/registry';
import { usePlayerStore } from '@/store/usePlayerStore';

export interface CommandPaletteProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  open: controlledOpen,
  onOpenChange,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const router = useRouter();

  // Player controls
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const reset = usePlayerStore((s) => s.reset);
  const stepForward = usePlayerStore((s) => s.stepForward);
  const stepBackward = usePlayerStore((s) => s.stepBackward);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const setOpen = useCallback(
    (value: boolean) => {
      if (onOpenChange) {
        onOpenChange(value);
      }
      if (!isControlled) {
        setInternalOpen(value);
      }
    },
    [isControlled, onOpenChange]
  );

  // Global Ctrl/Cmd + K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!isOpen);
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        setOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setOpen]);

  // Navigate to algorithm route
  const handleSelectAlgorithm = (category: string, id: string) => {
    setOpen(false);
    reset();
    router.push(`/visualize/${category}/${id}`);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 bg-black/60 backdrop-blur-sm transition-all"
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 shadow-2xl backdrop-blur-xl animate-in fade-in-0 zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <Command
          className="w-full flex flex-col"
          loop
          label="Search algorithms and commands"
        >
          {/* Header Input with Icon & Esc badge */}
          <div className="flex items-center px-4 py-3 border-b border-zinc-200/80 dark:border-zinc-800">
            <Search className="w-5 h-5 text-zinc-400 mr-3 shrink-0" />
            <Command.Input
              autoFocus
              placeholder="Search algorithms, categories, actions... (Ctrl+K)"
              className="w-full bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none"
            />
            <div className="flex items-center gap-1.5 ml-2">
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-medium text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded">
                ESC
              </kbd>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                aria-label="Close command palette"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List with Items */}
          <Command.List className="max-h-[360px] overflow-y-auto p-2 scroll-py-2 focus:outline-none">
            <Command.Empty className="py-10 text-center text-xs text-zinc-500 dark:text-zinc-400">
              <Sparkles className="w-6 h-6 mx-auto mb-2 text-zinc-400 opacity-60" />
              No matching algorithms or actions found.
            </Command.Empty>

            {/* Quick Actions Group */}
            <Command.Group
              heading="Playback Controls"
              className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 px-2 py-1.5 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1"
            >
              <Command.Item
                value="play pause toggle playback"
                onSelect={() => {
                  togglePlay();
                  setOpen(false);
                }}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:bg-violet-500/10 hover:text-violet-600 dark:hover:text-violet-400 cursor-pointer transition-colors aria-selected:bg-violet-500/10 aria-selected:text-violet-600 dark:aria-selected:text-violet-400"
              >
                <div className="flex items-center gap-2.5">
                  <Play className="w-4 h-4 text-violet-500" />
                  <span>Toggle Play / Pause</span>
                </div>
                <span className="text-[10px] text-zinc-400 font-mono">Space</span>
              </Command.Item>

              <Command.Item
                value="reset restart player"
                onSelect={() => {
                  reset();
                  setOpen(false);
                }}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:bg-violet-500/10 hover:text-violet-600 dark:hover:text-violet-400 cursor-pointer transition-colors aria-selected:bg-violet-500/10 aria-selected:text-violet-600 dark:aria-selected:text-violet-400"
              >
                <div className="flex items-center gap-2.5">
                  <RotateCcw className="w-4 h-4 text-amber-500" />
                  <span>Reset Playback to Step 0</span>
                </div>
                <span className="text-[10px] text-zinc-400 font-mono">R</span>
              </Command.Item>

              <Command.Item
                value="step next forward frame"
                onSelect={() => {
                  stepForward();
                  setOpen(false);
                }}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:bg-violet-500/10 hover:text-violet-600 dark:hover:text-violet-400 cursor-pointer transition-colors aria-selected:bg-violet-500/10 aria-selected:text-violet-600 dark:aria-selected:text-violet-400"
              >
                <div className="flex items-center gap-2.5">
                  <StepForward className="w-4 h-4 text-zinc-500" />
                  <span>Step Forward</span>
                </div>
                <span className="text-[10px] text-zinc-400 font-mono">→</span>
              </Command.Item>

              <Command.Item
                value="step prev back frame"
                onSelect={() => {
                  stepBackward();
                  setOpen(false);
                }}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:bg-violet-500/10 hover:text-violet-600 dark:hover:text-violet-400 cursor-pointer transition-colors aria-selected:bg-violet-500/10 aria-selected:text-violet-600 dark:aria-selected:text-violet-400"
              >
                <div className="flex items-center gap-2.5">
                  <StepBack className="w-4 h-4 text-zinc-500" />
                  <span>Step Backward</span>
                </div>
                <span className="text-[10px] text-zinc-400 font-mono">←</span>
              </Command.Item>
            </Command.Group>

            {/* Algorithms Group */}
            <Command.Group
              heading="Algorithms Registry"
              className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 px-2 py-1.5 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1"
            >
              {ALGORITHMS.map((algo) => (
                <Command.Item
                  key={algo.id}
                  value={`${algo.name} ${algo.category} ${algo.categoryName} ${algo.description} ${algo.difficulty}`}
                  onSelect={() => handleSelectAlgorithm(algo.category, algo.id)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg text-xs text-zinc-800 dark:text-zinc-200 hover:bg-violet-500/10 hover:text-violet-600 dark:hover:text-violet-400 cursor-pointer transition-colors aria-selected:bg-violet-500/10 aria-selected:text-violet-600 dark:aria-selected:text-violet-400"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                      <Code2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {algo.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border border-zinc-200 dark:border-zinc-700">
                          {algo.categoryName}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                        {algo.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        algo.difficulty === 'Easy'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : algo.difficulty === 'Medium'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {algo.difficulty}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
                  </div>
                </Command.Item>
              ))}
            </Command.Group>

            {/* Categories Quick Nav */}
            <Command.Group
              heading="Categories"
              className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 px-2 py-1.5 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1"
            >
              {CATEGORIES.map((cat) => (
                <Command.Item
                  key={cat.id}
                  value={`category ${cat.name} ${cat.description}`}
                  onSelect={() => {
                    const firstInCat = ALGORITHMS.find((a) => a.category === cat.id);
                    if (firstInCat) {
                      handleSelectAlgorithm(cat.id, firstInCat.id);
                    }
                  }}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-violet-500/10 hover:text-violet-600 cursor-pointer transition-colors aria-selected:bg-violet-500/10 aria-selected:text-violet-600"
                >
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4 text-zinc-400" />
                    <span>Browse all {cat.name} algorithms</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>

          {/* Footer hint */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-[11px] text-zinc-400">
            <div className="flex items-center gap-3">
              <span>Navigate with <kbd className="font-mono text-[10px] bg-zinc-200/60 dark:bg-zinc-800 px-1 py-0.5 rounded">↑</kbd> <kbd className="font-mono text-[10px] bg-zinc-200/60 dark:bg-zinc-800 px-1 py-0.5 rounded">↓</kbd></span>
              <span>Select with <kbd className="font-mono text-[10px] bg-zinc-200/60 dark:bg-zinc-800 px-1 py-0.5 rounded">↵</kbd></span>
            </div>
            <span>Press <kbd className="font-mono text-[10px] bg-zinc-200/60 dark:bg-zinc-800 px-1 py-0.5 rounded">ESC</kbd> to exit</span>
          </div>
        </Command>
      </div>
    </div>
  );
};

export default CommandPalette;
