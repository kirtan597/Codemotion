import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAlgorithm, MAX_SNAPSHOT_CAP } from '@/hooks/useAlgorithm';
import { usePlayerStore } from '@/store/usePlayerStore';
import * as registry from '@/lib/algorithms/registry';

describe('useAlgorithm hook', () => {
  beforeEach(() => {
    usePlayerStore.setState({
      currentFrame: 8,
      isPlaying: true,
      totalFrames: 20,
      snapshots: [],
      warning: null,
    });
  });

  it('loads algorithm definition and initial input state', () => {
    const { result } = renderHook(() => useAlgorithm('bubble-sort'));

    expect(result.current.definition.id).toBe('bubble-sort');
    expect(result.current.definition.name).toBe('Bubble Sort');
    expect(Array.isArray(result.current.input)).toBe(true);
    expect(result.current.snapshots.length).toBeGreaterThan(0);
    expect(result.current.warning).toBeNull();
  });

  it('memoizes snapshot generation and updates player store', () => {
    const { result } = renderHook(() => useAlgorithm('quick-sort'));

    const initialSnapshots = result.current.snapshots;
    expect(initialSnapshots.length).toBeGreaterThan(0);

    // Player store should receive the snapshots and reset frame to 0
    expect(usePlayerStore.getState().snapshots).toBe(initialSnapshots);
    expect(usePlayerStore.getState().currentFrame).toBe(0);
    expect(usePlayerStore.getState().isPlaying).toBe(false);
  });

  it('resets playback cleanly when input is modified', () => {
    const { result } = renderHook(() => useAlgorithm('bubble-sort'));

    // Simulate user playing
    usePlayerStore.setState({ currentFrame: 5, isPlaying: true });

    act(() => {
      result.current.setInput([50, 40, 30, 20, 10]);
    });

    // Input updated
    expect(result.current.input).toEqual([50, 40, 30, 20, 10]);

    // Playback reset cleanly
    expect(usePlayerStore.getState().currentFrame).toBe(0);
    expect(usePlayerStore.getState().isPlaying).toBe(false);
  });

  it('resets playback cleanly when switching algorithms', () => {
    let currentId = 'bubble-sort';
    const { result, rerender } = renderHook(() => useAlgorithm(currentId));

    expect(result.current.definition.id).toBe('bubble-sort');

    // Simulate playback state
    usePlayerStore.setState({ currentFrame: 12, isPlaying: true });

    // Switch algorithm
    currentId = 'quick-sort';
    rerender();

    expect(result.current.definition.id).toBe('quick-sort');
    expect(usePlayerStore.getState().currentFrame).toBe(0);
    expect(usePlayerStore.getState().isPlaying).toBe(false);
  });

  it('triggers snapshot cap warning above 5,000 frames and caps at 5,000', () => {
    // Mock algorithm with >5000 frames
    const mockAlgo = {
      id: 'huge-algo',
      name: 'Huge Algorithm',
      category: 'sorting' as const,
      categoryName: 'Sorting',
      description: 'Generates too many frames',
      difficulty: 'Hard' as const,
      timeComplexity: { best: 'O(1)', average: 'O(n)', worst: 'O(n)' },
      spaceComplexity: 'O(1)',
      defaultInput: [1, 2, 3],
      inputConfig: { type: 'array' as const },
      generate: () => {
        // Return 6,000 snapshots
        return Array.from({ length: 6000 }, (_, i) => ({
          id: `step-${i}`,
          step: i,
          description: `Step ${i}`,
          data: [],
        }));
      },
    };

    vi.spyOn(registry, 'getAlgorithm').mockReturnValue(mockAlgo);

    const { result } = renderHook(() => useAlgorithm('huge-algo'));

    expect(result.current.snapshots.length).toBe(MAX_SNAPSHOT_CAP);
    expect(result.current.snapshots.length).toBe(5000);
    expect(result.current.warning).toContain('Snapshot cap reached (5,000 frames)');
    expect(usePlayerStore.getState().warning).toContain('5,000');

    vi.restoreAllMocks();
  });
});
