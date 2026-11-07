'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { getAlgorithm, getDefaultAlgorithm } from '@/lib/algorithms/registry';
import { usePlayerStore } from '@/store/usePlayerStore';

export const MAX_SNAPSHOT_CAP = 5000;

export interface UseAlgorithmResult<TInput = any, TData = any> {
  definition: AlgorithmDefinition<TInput, TData>;
  input: TInput;
  setInput: (newInput: TInput) => void;
  resetInput: () => void;
  snapshots: Snapshot<TData>[];
  warning: string | null;
  totalFrames: number;
  generateSnapshots: () => Snapshot<TData>[];
}

/**
 * useAlgorithm hook:
 * - Loads the algorithm definition from registry by id
 * - Manages input state (initializing to definition defaults)
 * - Memoizes snapshot generation from algorithm.generate(input)
 * - Caps frames at 5,000 with a performance warning if exceeded
 * - Resets playback cleanly whenever algorithm or inputs change
 */
export function useAlgorithm<TInput = any, TData = any>(
  algorithmId: string
): UseAlgorithmResult<TInput, TData> {
  const setStoreSnapshots = usePlayerStore((s) => s.setSnapshots);
  const resetPlayer = usePlayerStore((s) => s.reset);

  // 1. Load Definition
  const definition = useMemo<AlgorithmDefinition<TInput, TData>>(() => {
    const found = getAlgorithm(algorithmId);
    return (found as AlgorithmDefinition<TInput, TData>) || (getDefaultAlgorithm() as unknown as AlgorithmDefinition<TInput, TData>);
  }, [algorithmId]);

  // 2. Input State (re-initialized when algorithm definition changes)
  const [input, setInputState] = useState<TInput>(() => {
    return structuredClone(definition.defaultInput);
  });

  // Track current algorithm id to detect algorithm switching
  const prevAlgoIdRef = useRef<string>(definition.id);

  // When switching algorithms, reset input to definition defaults and reset player cleanly
  useEffect(() => {
    if (prevAlgoIdRef.current !== definition.id) {
      prevAlgoIdRef.current = definition.id;
      resetPlayer();
      setInputState(structuredClone(definition.defaultInput));
    }
  }, [definition.id, definition.defaultInput, resetPlayer]);

  // 3. Memoized Snapshot Generation with 5,000 Frames Snapshot Cap Warning
  const { snapshots, warning } = useMemo(() => {
    try {
      const rawSnapshots = definition.generate(input);
      const totalRaw = rawSnapshots.length;

      if (totalRaw > MAX_SNAPSHOT_CAP) {
        const capped = rawSnapshots.slice(0, MAX_SNAPSHOT_CAP);
        const warningMsg = `Warning: Snapshot cap reached (${MAX_SNAPSHOT_CAP.toLocaleString()} frames). Generated ${totalRaw.toLocaleString()} frames, capped at ${MAX_SNAPSHOT_CAP.toLocaleString()} to ensure browser performance.`;
        return {
          snapshots: capped,
          warning: warningMsg,
        };
      }

      return {
        snapshots: rawSnapshots,
        warning: null,
      };
    } catch (err) {
      console.error(`Failed to generate snapshots for ${definition.id}:`, err);
      return {
        snapshots: [],
        warning: `Error during snapshot generation: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  }, [definition, input]);

  // 4. Synchronize snapshots to Player Store & Cleanly Reset Playback
  useEffect(() => {
    // Whenever snapshots change (from switching algorithm or input), cleanly reset playback to frame 0 and stop
    setStoreSnapshots(snapshots, warning);
  }, [snapshots, warning, setStoreSnapshots]);

  // Input mutation handlers
  const setInput = useCallback(
    (newInput: TInput) => {
      resetPlayer();
      setInputState(newInput);
    },
    [resetPlayer]
  );

  const resetInput = useCallback(() => {
    resetPlayer();
    setInputState(structuredClone(definition.defaultInput));
  }, [definition.defaultInput, resetPlayer]);

  const generateSnapshots = useCallback(() => {
    return snapshots;
  }, [snapshots]);

  return {
    definition,
    input,
    setInput,
    resetInput,
    snapshots,
    warning,
    totalFrames: snapshots.length,
    generateSnapshots,
  };
}

export default useAlgorithm;
