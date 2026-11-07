import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { InputPanel } from '@/components/inspector/InputPanel';
import { bubbleSort } from '@/lib/algorithms/sorting';
import { usePlayerStore } from '@/store/usePlayerStore';

describe('InputPanel component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    usePlayerStore.setState({
      currentFrame: 5,
      isPlaying: true,
      totalFrames: 10,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders array size slider with range 5 to 60', () => {
    const onInputChange = vi.fn();
    render(
      <InputPanel
        algorithm={bubbleSort}
        currentInput={[10, 20, 30, 40, 50]}
        onInputChange={onInputChange}
      />
    );

    const slider = screen.getByRole('slider') as HTMLInputElement;
    expect(slider).toBeInTheDocument();
    expect(slider.min).toBe('5');
    expect(slider.max).toBe('60');
  });

  it('resets player and calls onInputChange debounced by 150ms on slider change', async () => {
    const onInputChange = vi.fn();
    render(
      <InputPanel
        algorithm={bubbleSort}
        currentInput={[10, 20, 30, 40, 50]}
        onInputChange={onInputChange}
      />
    );

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '20' } });

    // Immediately before 150ms, callback shouldn't have fired
    expect(onInputChange).not.toHaveBeenCalled();

    // Advance timers by 150ms
    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(onInputChange).toHaveBeenCalledTimes(1);
    const updatedArray = onInputChange.mock.calls[0][0];
    expect(Array.isArray(updatedArray)).toBe(true);
    expect(updatedArray.length).toBe(20);

    // Player state must be reset
    expect(usePlayerStore.getState().currentFrame).toBe(0);
    expect(usePlayerStore.getState().isPlaying).toBe(false);
  });

  it('updates array when preset dropdown is changed', () => {
    const onInputChange = vi.fn();
    render(
      <InputPanel
        algorithm={bubbleSort}
        currentInput={[10, 20, 30, 40, 50]}
        onInputChange={onInputChange}
      />
    );

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'sorted' } });

    expect(onInputChange).toHaveBeenCalled();
    const arr = onInputChange.mock.calls[0][0];
    // Check array is sorted ascending
    for (let i = 0; i < arr.length - 1; i++) {
      expect(arr[i]).toBeLessThanOrEqual(arr[i + 1]);
    }
  });

  it('validates custom comma-separated input with Zod and shows inline errors', () => {
    const onInputChange = vi.fn();
    render(
      <InputPanel
        algorithm={bubbleSort}
        currentInput={[10, 20, 30, 40, 50]}
        onInputChange={onInputChange}
      />
    );

    const textarea = screen.getByPlaceholderText(/e\.g\./i);

    // Test invalid: non-numeric string
    fireEvent.change(textarea, { target: { value: '10, abc, 30, 40, 50' } });

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/not a valid number/i)).toBeInTheDocument();
    expect(onInputChange).not.toHaveBeenCalled();

    // Test invalid: fewer than 5 elements
    fireEvent.change(textarea, { target: { value: '10, 20' } });
    expect(screen.getByText(/at least 5 elements/i)).toBeInTheDocument();

    // Test valid: valid comma-separated numbers
    fireEvent.change(textarea, { target: { value: '12, 24, 36, 48, 60' } });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(onInputChange).toHaveBeenCalledWith([12, 24, 36, 48, 60]);
    expect(usePlayerStore.getState().currentFrame).toBe(0);
  });

  it('generates random array and resets playback on Randomize button click', () => {
    const onInputChange = vi.fn();
    render(
      <InputPanel
        algorithm={bubbleSort}
        currentInput={[10, 20, 30, 40, 50]}
        onInputChange={onInputChange}
      />
    );

    const randomizeBtn = screen.getByRole('button', { name: /randomize/i });
    fireEvent.click(randomizeBtn);

    expect(onInputChange).toHaveBeenCalled();
    const generated = onInputChange.mock.calls[0][0];
    expect(Array.isArray(generated)).toBe(true);
    expect(generated.length).toBe(5);
    expect(usePlayerStore.getState().currentFrame).toBe(0);
  });
});
