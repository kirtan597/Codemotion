'use client';

import React, { useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Gauge,
  AlertTriangle,
} from 'lucide-react';
import { usePlayerStore } from '@/store/usePlayerStore';

export const PlayerControls: React.FC = () => {
  const currentFrame = usePlayerStore((s) => s.currentFrame);
  const totalFrames = usePlayerStore((s) => s.totalFrames);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const speed = usePlayerStore((s) => s.speed);
  const warning = usePlayerStore((s) => s.warning);

  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const reset = usePlayerStore((s) => s.reset);
  const stepForward = usePlayerStore((s) => s.stepForward);
  const stepBackward = usePlayerStore((s) => s.stepBackward);
  const goToFrame = usePlayerStore((s) => s.goToFrame);
  const setSpeed = usePlayerStore((s) => s.setSpeed);
  const pause = usePlayerStore((s) => s.pause);

  // Playback timer loop
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying) {
      // Calculate delay in ms based on speed multiplier
      // Base delay 300ms. speed 0.5x -> 600ms, 1x -> 300ms, 2x -> 150ms, 4x -> 75ms
      const delay = Math.max(25, Math.round(300 / speed));

      timerRef.current = setInterval(() => {
        const state = usePlayerStore.getState();
        if (state.currentFrame < state.totalFrames - 1) {
          state.stepForward();
        } else {
          state.pause();
        }
      }, delay);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, speed]);

  const maxIndex = Math.max(0, totalFrames - 1);
  const progressPercent = totalFrames > 1 ? (currentFrame / maxIndex) * 100 : 0;

  return (
    <div className="w-full p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-md space-y-3">
      {/* Warning banner if snapshot cap reached */}
      {warning && (
        <div
          role="alert"
          className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-medium"
        >
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
          <span className="truncate">{warning}</span>
        </div>
      )}

      {/* Progress Scrubber Slider */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs font-mono text-zinc-500 dark:text-zinc-400">
          <span>
            Frame <span className="font-semibold text-zinc-900 dark:text-zinc-100">{totalFrames > 0 ? currentFrame + 1 : 0}</span> / {totalFrames}
          </span>
          <span>{Math.round(progressPercent)}%</span>
        </div>

        <input
          type="range"
          min={0}
          max={maxIndex}
          value={currentFrame}
          disabled={totalFrames <= 1}
          onChange={(e) => {
            pause();
            goToFrame(Number(e.target.value));
          }}
          className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-violet-600 disabled:opacity-40"
        />
      </div>

      {/* Controls toolbar */}
      <div className="flex items-center justify-between pt-1">
        {/* Reset & Step controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={reset}
            className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors active:scale-95 cursor-pointer"
            title="Reset playback to start (R)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={stepBackward}
            disabled={currentFrame <= 0}
            className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 transition-colors active:scale-95 cursor-pointer"
            title="Step backward (←)"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {/* Primary Play/Pause Button */}
          <button
            type="button"
            onClick={togglePlay}
            disabled={totalFrames === 0}
            className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium text-xs flex items-center gap-2 shadow-md shadow-violet-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-40"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-white" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Play</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={stepForward}
            disabled={currentFrame >= maxIndex}
            className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 transition-colors active:scale-95 cursor-pointer"
            title="Step forward (→)"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Playback speed selector */}
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60">
          <Gauge className="w-3.5 h-3.5 text-zinc-400 ml-1.5 mr-0.5" />
          {[0.5, 1, 2, 4].map((spd) => (
            <button
              key={spd}
              type="button"
              onClick={() => setSpeed(spd)}
              className={`px-2 py-1 text-[11px] font-mono rounded-lg transition-colors cursor-pointer ${
                speed === spd
                  ? 'bg-white dark:bg-zinc-700 font-bold text-violet-600 dark:text-violet-300 shadow-xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlayerControls;
