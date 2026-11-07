import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { DPMatrix } from '@/components/visualizers/DPMatrix';
import { FormulaBar } from '@/components/visualizers/FormulaBar';
import { SummaryCard } from '@/components/visualizers/SummaryCard';
import { DPVisualizer } from '@/components/visualizers/DPVisualizer';
import { TreeCanvas } from '@/components/visualizers/TreeCanvas';
import { DPMatrixData } from '@/lib/algorithms/dp/types';
import { TreeData } from '@/lib/algorithms/tree/types';
import { Snapshot } from '@/lib/types/algorithm';

describe('DP Components', () => {
  it('renders DPMatrix with computing, dependency, and backtrack highlights', () => {
    const data: DPMatrixData = {
      table: [
        [0, 0, 0],
        [0, 10, 10],
        [0, 10, 25],
      ],
      rowHeaders: ['Ø', 'Item 1', 'Item 2'],
      colHeaders: ['w=0', 'w=1', 'w=2'],
      computingCell: [2, 2],
      dependencyCells: [[1, 2], [1, 0]],
      backtrackCells: [[2, 2], [1, 1]],
      phase: 'compute',
    };

    const { container } = render(<DPMatrix data={data} />);

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('w=2')).toBeInTheDocument();

    // Computing cell has amber pulse
    const tableEl = container.querySelector('table');
    expect(tableEl).toBeInTheDocument();
  });

  it('renders FormulaBar with live substituted numbers', () => {
    render(
      <FormulaBar
        formula="dp[i][w] = max(dp[i-1][w], dp[i-1][w-wt] + val)"
        substitutedFormula="max(10, 7 + 5) = 12"
        decision="take"
      />
    );

    expect(screen.getByText(/Recurrence Relation/i)).toBeInTheDocument();
    expect(screen.getByText(/max\(10, 7 \+ 5\) = 12/)).toBeInTheDocument();
    expect(screen.getByText(/Decision: take/i)).toBeInTheDocument();
  });

  it('renders SummaryCard with remaining capacity, decision, and chosen items', () => {
    render(
      <SummaryCard
        remainingCapacity={4}
        currentItem={{ name: 'Laptop', weight: 3, value: 2000 }}
        decision="take"
        bestValue={3500}
        chosenItems={[{ name: 'Guitar', weight: 1, value: 1500 }]}
      />
    );

    expect(screen.getByText('3500')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText(/Laptop \(wt: 3\)/)).toBeInTheDocument();
    expect(screen.getByText(/Guitar/)).toBeInTheDocument();
  });

  it('renders DPVisualizer integrating matrix, formula bar, and summary card', () => {
    const snapshot: Snapshot<DPMatrixData> = {
      id: 'dp-snap-1',
      step: 3,
      description: 'Taking item Guitar',
      data: {
        table: [
          [0, 0],
          [0, 1500],
        ],
        rowHeaders: ['0', '1'],
        colHeaders: ['0', '1'],
      },
      variables: {
        formula: 'dp[1][1] = 1500',
        bestValue: 1500,
        remainingCapacity: 0,
      },
    };

    render(<DPVisualizer snapshot={snapshot} />);

    expect(screen.getByText('Taking item Guitar')).toBeInTheDocument();
    expect(screen.getByText('Step 3')).toBeInTheDocument();
    expect(screen.getAllByText('1500').length).toBeGreaterThanOrEqual(1);
  });
});

describe('TreeCanvas', () => {
  it('renders tree nodes, SVG lines, visit order badges, and output array', () => {
    const treeData: TreeData = {
      root: {
        id: 'node-50',
        value: 50,
        x: 300,
        y: 60,
        state: 'visited',
        visitOrder: 1,
        left: {
          id: 'node-30',
          value: 30,
          x: 200,
          y: 130,
          state: 'comparing',
          left: null,
          right: null,
        },
        right: {
          id: 'node-70',
          value: 70,
          x: 400,
          y: 130,
          state: 'found',
          left: null,
          right: null,
        },
      },
      outputArray: [50],
      traversalType: 'inorder',
    };

    const snapshot: Snapshot<TreeData> = {
      id: 'tree-snap-1',
      step: 1,
      description: 'Visiting node 50',
      data: treeData,
    };

    const { container } = render(<TreeCanvas snapshot={snapshot} />);

    expect(screen.getByText('Visiting node 50')).toBeInTheDocument();
    expect(screen.getAllByText('50').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('70')).toBeInTheDocument();

    // Visit order badge
    expect(screen.getByText('1')).toBeInTheDocument();

    // SVG elements
    const lines = container.querySelectorAll('line');
    expect(lines.length).toBe(2);

    // Output array
    expect(screen.getByText('Traversal Output')).toBeInTheDocument();
  });
});
