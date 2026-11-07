'use client';

/**
 * src/components/inspector/LogTab.tsx
 *
 * Virtualized execution log tab supporting up to 5,000 snapshots:
 * - Windowed virtualization for buttery 60fps scrolling
 * - Click row to call seek(i) instantly
 * - Active row highlighted and auto-scrolled into center
 * - Filter chips: All, Comparisons, Swaps, Pivots
 * - Full keyboard navigation: Up/Down arrow keys + Enter to seek
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Snapshot } from '@/lib/types/algorithm';
import { usePlayerStore } from '@/store/usePlayerStore';
import { ListFilter, Search, ArrowUpDown, ChevronRight } from 'lucide-react';

export type LogFilterType = 'all' | 'comparisons' | 'swaps' | 'pivots';

export interface LogTabProps {
  snapshots?: Snapshot[];
  currentFrame?: number;
  onSeek?: (frameIndex: number) => void;
  className?: string;
}

const ITEM_HEIGHT = 44; // px
const CONTAINER_HEIGHT = 320; // px
const OVERSCAN = 5;

export const LogTab: React.FC<LogTabProps> = ({
  snapshots: explicitSnapshots,
  currentFrame: explicitCurrentFrame,
  onSeek,
  className = '',
}) => {
  const storeSnapshots = usePlayerStore((s) => s.snapshots);
  const storeCurrentFrame = usePlayerStore((s) => s.currentFrame);
  const storeGoToFrame = usePlayerStore((s) => s.goToFrame);

  const snapshots = explicitSnapshots ?? storeSnapshots;
  const currentFrame = explicitCurrentFrame ?? storeCurrentFrame;
  const seek = onSeek ?? storeGoToFrame;

  const [filter, setFilter] = useState<LogFilterType>('all');
  const [scrollTop, setScrollTop] = useState(0);
  const [focusedIndex, setFocusedIndex] = useState<number>(currentFrame);

  const containerRef = useRef<HTMLDivElement>(null);
  const isUserScrollingRef = useRef(false);
  const userScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Filtered list with original snapshot indices preserved
  const filteredList = useMemo(() => {
    return snapshots
      .map((snap, originalIndex) => ({ snap, originalIndex }))
      .filter(({ snap }) => {
        if (filter === 'all') return true;

        const desc = snap.description.toLowerCase();
        if (filter === 'comparisons') {
          return (
            (snap.comparingIndices && snap.comparingIndices.length > 0) ||
            desc.includes('compar') ||
            desc.includes('check')
          );
        }
        if (filter === 'swaps') {
          return (
            (snap.swapIndices && snap.swapIndices.length > 0) ||
            desc.includes('swap') ||
            desc.includes('shift') ||
            desc.includes('relax')
          );
        }
        if (filter === 'pivots') {
          return (
            desc.includes('pivot') ||
            desc.includes('min') ||
            snap.variables?.pivot !== undefined ||
            desc.includes('partition')
          );
        }
        return true;
      });
  }, [snapshots, filter]);

  // Index within filteredList that corresponds to the active currentFrame
  const activeFilteredIndex = useMemo(() => {
    return filteredList.findIndex((item) => item.originalIndex === currentFrame);
  }, [filteredList, currentFrame]);

  // Sync focused index with active frame
  useEffect(() => {
    if (activeFilteredIndex >= 0) {
      setFocusedIndex(activeFilteredIndex);
    }
  }, [activeFilteredIndex]);

  // 2. Auto-scroll: smooth scroll to active row when frame changes
  useEffect(() => {
    if (activeFilteredIndex < 0 || !containerRef.current) return;
    if (isUserScrollingRef.current) return;

    const targetTop =
      activeFilteredIndex * ITEM_HEIGHT - CONTAINER_HEIGHT / 2 + ITEM_HEIGHT / 2;
    containerRef.current.scrollTo({
      top: Math.max(0, targetTop),
      behavior: 'smooth',
    });
  }, [activeFilteredIndex]);

  // Handle scroll events for virtualization
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);

    isUserScrollingRef.current = true;
    if (userScrollTimeoutRef.current) clearTimeout(userScrollTimeoutRef.current);
    userScrollTimeoutRef.current = setTimeout(() => {
      isUserScrollingRef.current = false;
    }, 1000);
  };

  // 3. Virtualization window calculation
  const totalCount = filteredList.length;
  const totalHeight = totalCount * ITEM_HEIGHT;

  const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN);
  const endIndex = Math.min(
    totalCount - 1,
    Math.ceil((scrollTop + CONTAINER_HEIGHT) / ITEM_HEIGHT) + OVERSCAN
  );

  const visibleItems = useMemo(() => {
    const items: Array<{
      item: (typeof filteredList)[0];
      index: number;
      top: number;
    }> = [];
    for (let i = startIndex; i <= endIndex && i < totalCount; i++) {
      items.push({
        item: filteredList[i],
        index: i,
        top: i * ITEM_HEIGHT,
      });
    }
    return items;
  }, [filteredList, startIndex, endIndex, totalCount]);

  // 4. Keyboard Navigation (Up/Down + Enter)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (filteredList.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex((prev) => {
          const next = Math.min(filteredList.length - 1, prev + 1);
          return next;
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex((prev) => {
          const next = Math.max(0, prev - 1);
          return next;
        });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < filteredList.length) {
          seek(filteredList[focusedIndex].originalIndex);
        }
      }
    },
    [filteredList, focusedIndex, seek]
  );

  const filterChips: Array<{ id: LogFilterType; label: string }> = [
    { id: 'all', label: `All (${snapshots.length})` },
    { id: 'comparisons', label: 'Comparisons' },
    { id: 'swaps', label: 'Swaps' },
    { id: 'pivots', label: 'Pivots / Min' },
  ];

  return (
    <div
      className={`w-full flex flex-col p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-sm space-y-3 ${className}`}
      data-testid="log-tab"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label="Execution Log list. Use Up and Down arrow keys to navigate and Enter to jump."
    >
      {/* Header & Filter Chips */}
      <div className="flex flex-col gap-2 pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListFilter className="w-4 h-4 text-violet-500" />
            <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
              Execution Log
            </h4>
          </div>
          <span className="text-[10px] font-mono text-zinc-400">
            {filteredList.length} / {snapshots.length} steps
          </span>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {filterChips.map((chip) => {
            const isActive = filter === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => setFilter(chip.id)}
                className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-violet-600 text-white font-semibold shadow-2xs'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Virtualized Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        style={{ height: CONTAINER_HEIGHT }}
        className="relative w-full overflow-y-auto overflow-x-hidden rounded-lg bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800/60"
        data-testid="virtualized-log-container"
      >
        {totalCount === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-zinc-400 italic">
            No snapshots match this filter.
          </div>
        ) : (
          <div style={{ height: totalHeight, position: 'relative', width: '100%' }}>
            {visibleItems.map(({ item, index, top }) => {
              const isCurrent = item.originalIndex === currentFrame;
              const isFocused = index === focusedIndex;

              return (
                <div
                  key={item.snap.id}
                  style={{
                    position: 'absolute',
                    top,
                    left: 0,
                    right: 0,
                    height: ITEM_HEIGHT,
                  }}
                  onClick={() => {
                    setFocusedIndex(index);
                    seek(item.originalIndex);
                  }}
                  data-testid={`log-row-${item.originalIndex}`}
                  className={`flex items-center justify-between px-3 text-xs font-mono border-b border-zinc-200/40 dark:border-zinc-800/40 cursor-pointer transition-colors ${
                    isCurrent
                      ? 'bg-violet-500/15 text-violet-900 dark:text-violet-100 font-bold border-l-4 border-l-violet-600'
                      : isFocused
                      ? 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200'
                      : 'hover:bg-zinc-100/60 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400'
                  }`}
                  title={item.snap.description}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.2 rounded shrink-0 ${
                        isCurrent
                          ? 'bg-violet-600 text-white'
                          : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'
                      }`}
                    >
                      #{item.originalIndex}
                    </span>
                    <span className="truncate text-[11px] leading-tight">
                      {item.snap.description}
                    </span>
                  </div>

                  {isCurrent && (
                    <ChevronRight className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Keyboard navigation helper */}
      <div className="text-[10px] text-zinc-400 flex items-center justify-between pt-1">
        <span>Click row to jump instantly</span>
        <span className="font-mono">▲/▼ navigate · ↵ seek</span>
      </div>
    </div>
  );
};

export default LogTab;

