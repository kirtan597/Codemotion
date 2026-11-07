import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from '@/components/layout/Sidebar';
import { usePlayerStore } from '@/store/usePlayerStore';

let mockPathname = '/visualize/sorting/bubble-sort';
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

describe('Sidebar component', () => {
  beforeEach(() => {
    mockPathname = '/visualize/sorting/bubble-sort';
    usePlayerStore.setState({
      currentFrame: 10,
      isPlaying: true,
    });
  });

  it('renders all category sections and algorithms', () => {
    render(<Sidebar />);

    expect(screen.getByText(/sorting/i)).toBeInTheDocument();
    expect(screen.getByText(/searching/i)).toBeInTheDocument();
    expect(screen.getByText(/graphs/i)).toBeInTheDocument();

    expect(screen.getByText('Bubble Sort')).toBeInTheDocument();
    expect(screen.getByText('Quick Sort')).toBeInTheDocument();
    expect(screen.getByText('Binary Search')).toBeInTheDocument();
  });

  it('collapses and expands categories on toggle', () => {
    render(<Sidebar />);

    // Initially Bubble Sort is visible
    expect(screen.getByText('Bubble Sort')).toBeInTheDocument();

    // Click on Sorting category header to collapse
    const sortingHeader = screen.getByText(/sorting/i).closest('button')!;
    fireEvent.click(sortingHeader);

    // Bubble Sort should now be hidden
    expect(screen.queryByText('Bubble Sort')).not.toBeInTheDocument();

    // Click again to expand
    fireEvent.click(sortingHeader);
    expect(screen.getByText('Bubble Sort')).toBeInTheDocument();
  });

  it('highlights the active route based on current pathname', () => {
    mockPathname = '/visualize/sorting/bubble-sort';
    render(<Sidebar />);

    const bubbleSortLink = screen.getByText('Bubble Sort').closest('a')!;
    expect(bubbleSortLink).toHaveClass('text-violet-600');

    const quickSortLink = screen.getByText('Quick Sort').closest('a')!;
    expect(quickSortLink).not.toHaveClass('text-violet-600');
  });

  it('resets player state cleanly on algorithm link click', () => {
    render(<Sidebar />);

    const quickSortLink = screen.getByText('Quick Sort').closest('a')!;
    fireEvent.click(quickSortLink);

    expect(usePlayerStore.getState().currentFrame).toBe(0);
    expect(usePlayerStore.getState().isPlaying).toBe(false);
  });
});
