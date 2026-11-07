import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { OperationPanel } from '@/components/inspector/OperationPanel';
import { NodeChain } from '@/components/visualizers/NodeChain';
import { ListNode } from '@/lib/types/linear';
import { Snapshot } from '@/lib/types/algorithm';

describe('OperationPanel component', () => {
  it('renders operation buttons for Stack and handles Push, Pop, Peek', () => {
    const onOpsChange = vi.fn();
    const onReset = vi.fn();

    render(
      <OperationPanel
        structure="stack"
        ops={[]}
        onOpsChange={onOpsChange}
        onReset={onReset}
      />
    );

    expect(screen.getByText('Stack Operations')).toBeInTheDocument();
    const pushBtn = screen.getByRole('button', { name: /Push/i });
    const popBtn = screen.getByRole('button', { name: /Pop/i });
    const peekBtn = screen.getByRole('button', { name: /Peek/i });

    // Push should be disabled when value input is empty
    expect(pushBtn).toBeDisabled();
    // Pop and Peek should be enabled
    expect(popBtn).not.toBeDisabled();
    expect(peekBtn).not.toBeDisabled();

    // Type a value
    const input = screen.getByTestId('op-value-input');
    fireEvent.change(input, { target: { value: '42' } });
    expect(pushBtn).not.toBeDisabled();

    // Click Push
    fireEvent.click(pushBtn);
    expect(onOpsChange).toHaveBeenCalledWith([{ type: 'push', value: 42 }]);

    // Click Pop
    fireEvent.click(popBtn);
    expect(onOpsChange).toHaveBeenCalledWith([{ type: 'pop' }]);
  });

  it('chains operations across multiple actions', () => {
    let currentOps: any[] = [];
    const onOpsChange = vi.fn((newOps) => {
      currentOps = newOps;
    });

    const { rerender } = render(
      <OperationPanel
        structure="queue"
        ops={currentOps}
        onOpsChange={onOpsChange}
        onReset={vi.fn()}
      />
    );

    // Enqueue 10
    const input = screen.getByTestId('op-value-input');
    fireEvent.change(input, { target: { value: '10' } });
    fireEvent.click(screen.getByRole('button', { name: /Enqueue/i }));
    expect(onOpsChange).toHaveBeenLastCalledWith([{ type: 'enqueue', value: 10 }]);

    // Update props to simulate state update in parent
    rerender(
      <OperationPanel
        structure="queue"
        ops={currentOps}
        onOpsChange={onOpsChange}
        onReset={vi.fn()}
      />
    );

    // Enqueue 20
    fireEvent.change(input, { target: { value: '20' } });
    fireEvent.click(screen.getByRole('button', { name: /Enqueue/i }));
    expect(onOpsChange).toHaveBeenLastCalledWith([
      { type: 'enqueue', value: 10 },
      { type: 'enqueue', value: 20 },
    ]);

    // Dequeue
    rerender(
      <OperationPanel
        structure="queue"
        ops={currentOps}
        onOpsChange={onOpsChange}
        onReset={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /Dequeue/i }));
    expect(onOpsChange).toHaveBeenLastCalledWith([
      { type: 'enqueue', value: 10 },
      { type: 'enqueue', value: 20 },
      { type: 'dequeue' },
    ]);
  });

  it('calls onReset when reset button clicked', () => {
    const onReset = vi.fn();
    render(
      <OperationPanel
        structure="linked-list"
        ops={[{ type: 'insertHead', value: 5 }]}
        onOpsChange={vi.fn()}
        onReset={onReset}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Reset/i }));
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});

describe('NodeChain component', () => {
  it('renders node list with pointers and labels', () => {
    const mockNodes: ListNode[] = [
      { id: 'node-1', value: 10, state: 'default', pointers: ['head'] },
      { id: 'node-2', value: 20, state: 'active', pointers: ['curr'] },
      { id: 'node-3', value: 30, state: 'found', pointers: ['tail'] },
    ];

    const snapshot: Snapshot<ListNode[]> = {
      id: 'snap-1',
      step: 1,
      description: 'Test node chain step',
      data: mockNodes,
      variables: { size: 3, operation: 'search', result: 'found' },
    };

    render(<NodeChain snapshot={snapshot} structureLabel="Linked List" />);

    expect(screen.getByText('Test node chain step')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('head')).toBeInTheDocument();
    expect(screen.getByText('curr')).toBeInTheDocument();
    expect(screen.getByText('tail')).toBeInTheDocument();
    expect(screen.getByText(/size: 3/)).toBeInTheDocument();
  });

  it('renders empty message when no nodes in snapshot', () => {
    const emptySnap: Snapshot<ListNode[]> = {
      id: 'empty-snap',
      step: 0,
      description: 'Empty list',
      data: [],
    };
    render(<NodeChain snapshot={emptySnap} />);
    expect(screen.getByText(/Empty structure/i)).toBeInTheDocument();
  });
});

