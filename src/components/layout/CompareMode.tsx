'use client';

/**
 * src/components/layout/CompareMode.tsx
 *
 * Compare Mode running two algorithms on identical input with:
 * - Synchronized playback (shared master index)
 * - Dual side-by-side visualizers
 * - Comparative counters table (Total Steps, Comparisons, Swaps/Writes, Complexity)
 * - Live performance winner verdict
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Gauge,
  X,
  Shuffle,
  Trophy,
  CheckCircle2,
  Zap,
  GitCompare,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';
import { ALGORITHMS, getAlgorithm } from '@/lib/algorithms/registry';
import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { ArrayBars } from '@/components/visualizers/ArrayBars';
import { ArrayVisualizer } from '@/components/visualizers/ArrayVisualizer';
import { getVisualizer } from '@/components/visualizers';

export interface CompareModeProps {
  onClose?: () => void;
  defaultAlgoA?: string;
  defaultAlgoB?: string;
}

// Generate deterministic array of numbers
function generateArray(size: number, type: 'random' | 'nearly-sorted' | 'reversed' | 'duplicates'): number[] {
  switch (type) {
    case 'nearly-sorted': {
      const arr = Array.from({ length: size }, (_, i) => (i + 1) * 3);
      // Swap a couple of adjacent elements
      for (let i = 0; i < Math.floor(size / 4); i++) {
        const idx = Math.floor((i / size) * (size - 1));
        const temp = arr[idx];
        arr[idx] = arr[idx + 1];
        arr[idx + 1] = temp;
      }
      return arr;
    }
    case 'reversed':
      return Array.from({ length: size }, (_, i) => (size - i) * 3);
    case 'duplicates': {
      const pool = [10, 25, 40, 60, 85];
      return Array.from({ length: size }, (_, i) => pool[i % pool.length]);
    }
    case 'random':
    default: {
      // Deterministic pseudo-random distribution
      return Array.from({ length: size }, (_, i) => {
        const seed = ((i * 37 + 17) % 91) + 10;
        return seed;
      });
    }
  }
}

export const CompareMode: React.FC<CompareModeProps> = ({
  onClose,
  defaultAlgoA = 'bubble-sort',
  defaultAlgoB = 'quick-sort',
}) => {
  // Available algorithms for comparison (sorting and searching are the natural candidates)
  const sortingAlgorithms = useMemo(
    () => ALGORITHMS.filter((a) => a.category === 'sorting'),
    []
  );

  const [algoIdA, setAlgoIdA] = useState<string>(defaultAlgoA);
  const [algoIdB, setAlgoIdB] = useState<string>(defaultAlgoB);

  // Common input state
  const [arraySize, setArraySize] = useState<number>(18);
  const [presetType, setPresetType] = useState<'random' | 'nearly-sorted' | 'reversed' | 'duplicates'>('random');
  const [seedOffset, setSeedOffset] = useState<number>(0);

  // Synchronized playback state
  const [masterFrame, setMasterFrame] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Retrieve algorithm definitions
  const algoA = useMemo<AlgorithmDefinition>(
    () => getAlgorithm(algoIdA) || sortingAlgorithms[0],
    [algoIdA, sortingAlgorithms]
  );
  const algoB = useMemo<AlgorithmDefinition>(
    () => getAlgorithm(algoIdB) || sortingAlgorithms[4] || sortingAlgorithms[1],
    [algoIdB, sortingAlgorithms]
  );

  // Generate common input
  const commonInput = useMemo(() => {
    const base = generateArray(arraySize, presetType);
    if (seedOffset === 0) return base;
    return base.map((v, i) => Math.max(5, (v + seedOffset * 7 + i * 3) % 100));
  }, [arraySize, presetType, seedOffset]);

  // Generate snapshots for Algo A and Algo B on identical input
  const snapshotsA = useMemo<Snapshot[]>(() => {
    try {
      if (algoA && typeof algoA.generate === 'function') {
        return algoA.generate(commonInput);
      }
    } catch (e) {
      console.error('Error generating snapshots for Algo A:', e);
    }
    return [];
  }, [algoA, commonInput]);

  const snapshotsB = useMemo<Snapshot[]>(() => {
    try {
      if (algoB && typeof algoB.generate === 'function') {
        return algoB.generate(commonInput);
      }
    } catch (e) {
      console.error('Error generating snapshots for Algo B:', e);
    }
    return [];
  }, [algoB, commonInput]);

  const totalFramesA = snapshotsA.length;
  const totalFramesB = snapshotsB.length;
  const maxMasterFrame = Math.max(0, Math.max(totalFramesA - 1, totalFramesB - 1));

  // Reset playback whenever algorithms or input changes
  useEffect(() => {
    setMasterFrame(0);
    setIsPlaying(false);
  }, [algoIdA, algoIdB, commonInput]);

  // Synchronized playback loop
  useEffect(() => {
    if (isPlaying) {
      const delay = Math.max(25, Math.round(240 / speed));
      timerRef.current = setInterval(() => {
        setMasterFrame((prev) => {
          if (prev < maxMasterFrame) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, delay);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speed, maxMasterFrame]);

  // Playback handlers
  const handleTogglePlay = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (masterFrame >= maxMasterFrame) {
        setMasterFrame(0);
      }
      setIsPlaying(true);
    }
  }, [isPlaying, masterFrame, maxMasterFrame]);

  const handleStepForward = useCallback(() => {
    setIsPlaying(false);
    setMasterFrame((prev) => Math.min(maxMasterFrame, prev + 1));
  }, [maxMasterFrame]);

  const handleStepBackward = useCallback(() => {
    setIsPlaying(false);
    setMasterFrame((prev) => Math.max(0, prev - 1));
  }, []);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setMasterFrame(0);
  }, []);

  const handleSeek = useCallback(
    (targetFrame: number) => {
      setIsPlaying(false);
      setMasterFrame(Math.max(0, Math.min(targetFrame, maxMasterFrame)));
    },
    [maxMasterFrame]
  );

  // Active snapshots clamped to each algorithm's total frames
  const frameIndexA = Math.min(masterFrame, Math.max(0, totalFramesA - 1));
  const frameIndexB = Math.min(masterFrame, Math.max(0, totalFramesB - 1));

  const activeSnapshotA = snapshotsA[frameIndexA] || snapshotsA[0];
  const activeSnapshotB = snapshotsB[frameIndexB] || snapshotsB[0];

  const isDoneA = totalFramesA > 0 && masterFrame >= totalFramesA - 1;
  const isDoneB = totalFramesB > 0 && masterFrame >= totalFramesB - 1;

  // Live counters extraction
  const comparisonsA = activeSnapshotA?.variables?.comparisons ?? 0;
  const swapsA = activeSnapshotA?.variables?.swaps ?? 0;

  const comparisonsB = activeSnapshotB?.variables?.comparisons ?? 0;
  const swapsB = activeSnapshotB?.variables?.swaps ?? 0;

  // Determine Visualizer components
  const VizComponentA = getVisualizer(algoA.category);
  const VizComponentB = getVisualizer(algoB.category);

  // Faster algorithm in total steps
  const fewerStepsAlgo =
    totalFramesA < totalFramesB ? 'A' : totalFramesB < totalFramesA ? 'B' : 'TIE';

  return (
    <div
      className="flex-1 flex flex-col h-full overflow-hidden bg-zinc-950 text-zinc-100 font-sans"
      data-testid="compare-mode"
    >
      {/* Top Header / Mode Banner */}
      <header className="h-14 shrink-0 px-6 border-b border-zinc-800 bg-zinc-900/90 backdrop-blur-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-600/20 text-violet-400 border border-violet-500/30">
            <GitCompare className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
              Side-by-Side Comparison
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                Synchronized
              </span>
            </h2>
            <p className="text-[11px] text-zinc-400">
              Running {algoA.name} vs. {algoB.name} on the exact same dataset
            </p>
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-3">
          {onClose && (
            <button
              onClick={onClose}
              data-testid="compare-close-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors cursor-pointer border border-zinc-700"
            >
              <X className="w-3.5 h-3.5" />
              <span>Exit Compare</span>
            </button>
          )}
        </div>
      </header>

      {/* Control Bar: Algorithm Selectors & Shared Input Configuration */}
      <div className="px-6 py-3 border-b border-zinc-800/80 bg-zinc-900/40 flex flex-wrap items-center justify-between gap-4 text-xs">
        {/* Left: Dual Algorithm Selectors */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-violet-400">Algo A:</span>
            <select
              value={algoIdA}
              onChange={(e) => setAlgoIdA(e.target.value)}
              data-testid="select-algo-a"
              className="px-2.5 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-medium focus:outline-none focus:border-violet-500 cursor-pointer"
            >
              {sortingAlgorithms.map((algo) => (
                <option key={algo.id} value={algo.id}>
                  {algo.name}
                </option>
              ))}
            </select>
          </div>

          <span className="text-zinc-600 font-bold">vs</span>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-emerald-400">Algo B:</span>
            <select
              value={algoIdB}
              onChange={(e) => setAlgoIdB(e.target.value)}
              data-testid="select-algo-b"
              className="px-2.5 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {sortingAlgorithms.map((algo) => (
                <option key={algo.id} value={algo.id}>
                  {algo.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: Input presets and randomizer */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-zinc-800/80 p-1 rounded-lg border border-zinc-700/60">
            {(['random', 'nearly-sorted', 'reversed', 'duplicates'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setPresetType(type)}
                className={`px-2 py-1 rounded text-[11px] font-medium capitalize transition-colors ${
                  presetType === type
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {type.replace('-', ' ')}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-zinc-400 text-[11px]">n={arraySize}</span>
            <input
              type="range"
              min={8}
              max={40}
              value={arraySize}
              onChange={(e) => setArraySize(Number(e.target.value))}
              className="w-20 accent-violet-500 cursor-pointer"
            />
          </div>

          <button
            onClick={() => setSeedOffset((s) => s + 1)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors border border-zinc-700 cursor-pointer"
            title="Randomize data"
          >
            <Shuffle className="w-3.5 h-3.5 text-zinc-400" />
            <span>Shuffle</span>
          </button>
        </div>
      </div>

      {/* Main Content Area: Side-by-Side Visualizers + Comparative Counters */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        {/* Dual Canvas Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[380px]">
          {/* Left Canvas: Algorithm A */}
          <div className="flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden shadow-lg">
            {/* Algo A Sub-header */}
            <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-500" />
                <h3 className="font-bold text-sm text-white tracking-tight">{algoA.name}</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20">
                  Step {frameIndexA + 1}/{totalFramesA}
                </span>
              </div>
              {isDoneA ? (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" />
                  Finished ({totalFramesA} steps)
                </span>
              ) : (
                <span className="text-[11px] text-zinc-400 font-mono">
                  Active
                </span>
              )}
            </div>

            {/* Description Banner */}
            <div className="px-4 py-2 bg-zinc-950/40 text-xs text-zinc-300 border-b border-zinc-800/60 line-clamp-1">
              {activeSnapshotA?.description || 'Ready to start'}
            </div>

            {/* Visualizer Body */}
            <div className="flex-1 p-4 flex items-center justify-center min-h-[260px] bg-zinc-950/60">
              <VizComponentA snapshot={activeSnapshotA} />
            </div>

            {/* Quick Live Stats Footer */}
            <div className="px-4 py-2.5 border-t border-zinc-800 bg-zinc-900/40 grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="text-zinc-400">
                Comparisons: <span className="text-zinc-100 font-bold">{comparisonsA}</span>
              </div>
              <div className="text-zinc-400 text-right">
                Swaps/Writes: <span className="text-zinc-100 font-bold">{swapsA}</span>
              </div>
            </div>
          </div>

          {/* Right Canvas: Algorithm B */}
          <div className="flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden shadow-lg">
            {/* Algo B Sub-header */}
            <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h3 className="font-bold text-sm text-white tracking-tight">{algoB.name}</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Step {frameIndexB + 1}/{totalFramesB}
                </span>
              </div>
              {isDoneB ? (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" />
                  Finished ({totalFramesB} steps)
                </span>
              ) : (
                <span className="text-[11px] text-zinc-400 font-mono">
                  Active
                </span>
              )}
            </div>

            {/* Description Banner */}
            <div className="px-4 py-2 bg-zinc-950/40 text-xs text-zinc-300 border-b border-zinc-800/60 line-clamp-1">
              {activeSnapshotB?.description || 'Ready to start'}
            </div>

            {/* Visualizer Body */}
            <div className="flex-1 p-4 flex items-center justify-center min-h-[260px] bg-zinc-950/60">
              <VizComponentB snapshot={activeSnapshotB} />
            </div>

            {/* Quick Live Stats Footer */}
            <div className="px-4 py-2.5 border-t border-zinc-800 bg-zinc-900/40 grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="text-zinc-400">
                Comparisons: <span className="text-zinc-100 font-bold">{comparisonsB}</span>
              </div>
              <div className="text-zinc-400 text-right">
                Swaps/Writes: <span className="text-zinc-100 font-bold">{swapsB}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Master Synchronized Player Controls */}
        <div className="w-full p-4 rounded-2xl border border-zinc-800 bg-zinc-900/90 backdrop-blur-xl shadow-lg space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-mono">
              Master Frame: <span className="text-zinc-200 font-semibold">{masterFrame}</span> /{' '}
              {maxMasterFrame}
            </span>
            <span className="font-mono text-zinc-400">
              {Math.round(maxMasterFrame > 0 ? (masterFrame / maxMasterFrame) * 100 : 0)}% Complete
            </span>
          </div>

          {/* Master Timeline Scrubber */}
          <div className="relative w-full flex items-center">
            <input
              type="range"
              min={0}
              max={maxMasterFrame}
              value={masterFrame}
              onChange={(e) => handleSeek(Number(e.target.value))}
              data-testid="compare-scrubber"
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-violet-500 focus:outline-none"
            />
          </div>

          {/* Buttons Row */}
          <div className="flex items-center justify-between pt-1">
            {/* Speed Selector */}
            <div className="flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-zinc-500 mr-1" />
              {[0.5, 1, 2, 4, 8].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-2 py-1 rounded text-[11px] font-mono font-medium transition-colors cursor-pointer ${
                    speed === s
                      ? 'bg-violet-600 text-white font-bold'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>

            {/* Main Playback Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                title="Reset to start"
                className="p-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={handleStepBackward}
                disabled={masterFrame === 0}
                title="Step backward"
                className="p-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <SkipBack className="w-4 h-4" />
              </button>
              <button
                onClick={handleTogglePlay}
                data-testid="compare-play-btn"
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-violet-600 hover:bg-violet-500 text-white shadow-md transition-transform active:scale-95 cursor-pointer"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>
              <button
                onClick={handleStepForward}
                disabled={masterFrame >= maxMasterFrame}
                title="Step forward"
                className="p-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            <div className="w-24 text-right text-xs text-zinc-500 font-mono">
              {isPlaying ? 'Playing' : 'Paused'}
            </div>
          </div>
        </div>

        {/* Comparative Counters Table */}
        <div
          className="rounded-2xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-xl overflow-hidden shadow-lg p-5 space-y-4"
          data-testid="compare-counters-table"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white tracking-tight">
                Head-to-Head Comparative Metrics
              </h3>
            </div>

            {/* Verdict Chip */}
            {fewerStepsAlgo !== 'TIE' && (
              <span className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                {fewerStepsAlgo === 'A' ? algoA.name : algoB.name} finished in fewer total steps!
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Metric</th>
                  <th className="py-2.5 px-3 text-violet-400 font-bold">{algoA.name}</th>
                  <th className="py-2.5 px-3 text-emerald-400 font-bold">{algoB.name}</th>
                  <th className="py-2.5 px-3 text-right">Performance Difference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {/* Total Steps */}
                <tr>
                  <td className="py-2.5 px-3 font-sans font-medium text-zinc-300">
                    Total Operations / Steps
                  </td>
                  <td className="py-2.5 px-3 font-bold text-zinc-100">
                    {totalFramesA}
                    {totalFramesA < totalFramesB && (
                      <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300">
                        Fewer
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-zinc-100">
                    {totalFramesB}
                    {totalFramesB < totalFramesA && (
                      <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                        Fewer
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right text-zinc-400">
                    {totalFramesA === totalFramesB
                      ? 'Equal'
                      : `${Math.abs(totalFramesA - totalFramesB)} steps diff (${(
                          (Math.max(totalFramesA, totalFramesB) /
                            Math.min(totalFramesA, totalFramesB))
                        ).toFixed(1)}x)`}
                  </td>
                </tr>

                {/* Live Comparisons */}
                <tr>
                  <td className="py-2.5 px-3 font-sans font-medium text-zinc-300">
                    Comparisons (Current / Final)
                  </td>
                  <td className="py-2.5 px-3 text-zinc-200">
                    {comparisonsA} /{' '}
                    <span className="text-zinc-400">
                      {snapshotsA[snapshotsA.length - 1]?.variables?.comparisons ?? comparisonsA}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-zinc-200">
                    {comparisonsB} /{' '}
                    <span className="text-zinc-400">
                      {snapshotsB[snapshotsB.length - 1]?.variables?.comparisons ?? comparisonsB}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-zinc-400">
                    {comparisonsA <= comparisonsB ? (
                      <span className="text-violet-400 font-semibold">{algoA.name} ≤</span>
                    ) : (
                      <span className="text-emerald-400 font-semibold">{algoB.name} ≤</span>
                    )}
                  </td>
                </tr>

                {/* Live Swaps */}
                <tr>
                  <td className="py-2.5 px-3 font-sans font-medium text-zinc-300">
                    Swaps / Overwrites (Current / Final)
                  </td>
                  <td className="py-2.5 px-3 text-zinc-200">
                    {swapsA} /{' '}
                    <span className="text-zinc-400">
                      {snapshotsA[snapshotsA.length - 1]?.variables?.swaps ?? swapsA}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-zinc-200">
                    {swapsB} /{' '}
                    <span className="text-zinc-400">
                      {snapshotsB[snapshotsB.length - 1]?.variables?.swaps ?? swapsB}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-zinc-400">
                    {swapsA <= swapsB ? (
                      <span className="text-violet-400 font-semibold">{algoA.name} ≤</span>
                    ) : (
                      <span className="text-emerald-400 font-semibold">{algoB.name} ≤</span>
                    )}
                  </td>
                </tr>

                {/* Time Complexity Best */}
                <tr>
                  <td className="py-2.5 px-3 font-sans font-medium text-zinc-300">
                    Best Case Time
                  </td>
                  <td className="py-2.5 px-3 text-emerald-400 font-semibold">
                    {algoA.timeComplexity.best}
                  </td>
                  <td className="py-2.5 px-3 text-emerald-400 font-semibold">
                    {algoB.timeComplexity.best}
                  </td>
                  <td className="py-2.5 px-3 text-right text-zinc-400">Theoretical</td>
                </tr>

                {/* Time Complexity Average */}
                <tr>
                  <td className="py-2.5 px-3 font-sans font-medium text-zinc-300">
                    Average Case Time
                  </td>
                  <td className="py-2.5 px-3 text-amber-400 font-semibold">
                    {algoA.timeComplexity.average}
                  </td>
                  <td className="py-2.5 px-3 text-amber-400 font-semibold">
                    {algoB.timeComplexity.average}
                  </td>
                  <td className="py-2.5 px-3 text-right text-zinc-400">Theoretical</td>
                </tr>

                {/* Time Complexity Worst */}
                <tr>
                  <td className="py-2.5 px-3 font-sans font-medium text-zinc-300">
                    Worst Case Time
                  </td>
                  <td className="py-2.5 px-3 text-rose-400 font-semibold">
                    {algoA.timeComplexity.worst}
                  </td>
                  <td className="py-2.5 px-3 text-rose-400 font-semibold">
                    {algoB.timeComplexity.worst}
                  </td>
                  <td className="py-2.5 px-3 text-right text-zinc-400">Theoretical</td>
                </tr>

                {/* Space Complexity */}
                <tr>
                  <td className="py-2.5 px-3 font-sans font-medium text-zinc-300">
                    Auxiliary Space
                  </td>
                  <td className="py-2.5 px-3 text-cyan-400 font-semibold">
                    {algoA.spaceComplexity}
                  </td>
                  <td className="py-2.5 px-3 text-cyan-400 font-semibold">
                    {algoB.spaceComplexity}
                  </td>
                  <td className="py-2.5 px-3 text-right text-zinc-400">Theoretical</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompareMode;

