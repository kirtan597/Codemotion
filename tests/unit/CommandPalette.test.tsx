import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CommandPalette } from '@/components/layout/CommandPalette';

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('CommandPalette component', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('opens and closes via Ctrl+K and Cmd+K', () => {
    render(<CommandPalette />);

    // Initially closed
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Trigger Ctrl+K
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Trigger Cmd+K to close
    fireEvent.keyDown(window, { key: 'k', metaKey: true });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders algorithms and fuzzy searches registry', () => {
    render(<CommandPalette open={true} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search algorithms/i)).toBeInTheDocument();

    // Search input
    const input = screen.getByPlaceholderText(/search algorithms/i);
    fireEvent.change(input, { target: { value: 'Quick' } });

    expect(screen.getByText('Quick Sort')).toBeInTheDocument();
  });

  it('navigates to route when algorithm is selected', () => {
    render(<CommandPalette open={true} />);

    const item = screen.getByText('Bubble Sort');
    fireEvent.click(item);

    expect(mockPush).toHaveBeenCalledWith('/visualize/sorting/bubble-sort');
  });

  it('closes on Escape key press', () => {
    const onOpenChange = vi.fn();
    render(<CommandPalette open={true} onOpenChange={onOpenChange} />);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
