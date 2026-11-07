'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronDown,
  ChevronRight,
  Search,
  Sparkles,
  ArrowDownUp,
  Network,
  Activity,
  Layers,
  BarChart3,
  Flame,
  RefreshCcw,
  GitBranch,
  Scissors,
  List,
  Triangle,
  Grid2X2,
  Binary,
} from 'lucide-react';
import { CATEGORIES, ALGORITHMS } from '@/lib/algorithms/registry';
import { usePlayerStore } from '@/store/usePlayerStore';

import { Logo } from '@/components/shared/Logo';

export interface SidebarProps {
  onOpenSearch?: () => void;
  className?: string;
}

const CATEGORY_ICONS: Record<string, React.FC<{ className?: string }>> = {
  sorting:      ArrowDownUp,
  searching:    Search,
  graph:        Network,
  recursion:    RefreshCcw,
  backtracking: GitBranch,
  divconquer:   Scissors,
  linear:       List,
  heap:         Triangle,
  dp:           Grid2X2,
  tree:         Binary,
};

export const Sidebar: React.FC<SidebarProps> = ({ onOpenSearch, className = '' }) => {
  const pathname = usePathname();
  const resetPlayer = usePlayerStore((s) => s.reset);

  // Track expanded state for categories (all open by default)
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    CATEGORIES.forEach((cat) => {
      initial[cat.id] = true;
    });
    return initial;
  });

  const toggleCategory = (categoryId: string) => {
    setExpanded((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const handleAlgorithmClick = () => {
    // Reset player cleanly whenever switching algorithms
    resetPlayer();
  };

  return (
    <aside
      className={`w-64 shrink-0 flex flex-col h-full border-r bg-white dark:bg-zinc-950/70 select-none ${className}`}
      style={{ borderColor: 'var(--border)' }}
      data-testid="sidebar"
    >
      {/* Brand Header with Gradient Background */}
      <div
        className="border-b"
        style={{
          background: 'linear-gradient(180deg, #F5F3FF 0%, #FFFFFF 100%)',
          borderBottomColor: '#EDE9FE',
          borderBottomWidth: '1px',
          padding: '20px 20px 16px',
        }}
      >
        <Logo onClick={handleAlgorithmClick} />
      </div>

      {/* Quick Search Bar Trigger */}
      <div className="p-3">
        <button
          type="button"
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:border-violet-400/50 dark:hover:border-violet-600/50 shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-zinc-400 group-hover:text-violet-500 transition-colors" />
            <span className="text-zinc-500 dark:text-zinc-400 text-xs font-normal">
              Quick search...
            </span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded shadow-xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Categories & Algorithms Tree */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-3 focus:outline-none">
        {CATEGORIES.map((category) => {
          const isCategoryExpanded = expanded[category.id] ?? true;
          const CategoryIcon = CATEGORY_ICONS[category.id] || Layers;
          const algorithmsInCategory = ALGORITHMS.filter((a) => a.category === category.id);

          return (
            <div key={category.id} className="space-y-1">
              {/* Category Header (Collapsible) */}
              <button
                type="button"
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900/60 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <CategoryIcon className="w-3.5 h-3.5 text-zinc-400 group-hover:text-violet-500 transition-colors" />
                  <span className="tracking-wide uppercase text-[11px] font-bold">
                    {category.name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-zinc-400 font-mono px-1.5 py-0.2 rounded-full bg-zinc-100 dark:bg-zinc-800">
                    {algorithmsInCategory.length}
                  </span>
                  {isCategoryExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                  )}
                </div>
              </button>

              {/* Algorithms in Category */}
              {isCategoryExpanded && (
                <div className="pl-2 space-y-0.5 border-l border-zinc-200/60 dark:border-zinc-800/60 ml-3 mt-1">
                  {algorithmsInCategory.map((algo) => {
                    const route = `/visualize/${category.id}/${algo.id}`;
                    const isActive = pathname === route;

                    return (
                      <Link
                        key={algo.id}
                        href={route}
                        onClick={handleAlgorithmClick}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                          isActive
                            ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400 font-medium shadow-xs border border-violet-500/20'
                            : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100/70 dark:hover:bg-zinc-900/50 hover:text-zinc-900 dark:hover:text-zinc-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {isActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0 animate-pulse" />
                          )}
                          <span className="truncate">{algo.name}</span>
                        </div>

                        <span
                          className={`text-[9px] px-1 py-0.2 rounded font-mono shrink-0 ${
                            algo.difficulty === 'Easy'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : algo.difficulty === 'Medium'
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {algo.difficulty}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-3 border-t border-zinc-200/70 dark:border-zinc-800/70 bg-zinc-50/40 dark:bg-zinc-950/40">
        <div className="flex items-center justify-between text-[11px] text-zinc-400">
          <span className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
            <span>Ready</span>
          </span>
          <span className="font-mono text-[10px] text-zinc-500">v1.0.0</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
