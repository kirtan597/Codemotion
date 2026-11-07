'use client';

/**
 * src/components/visualizers/GraphVisualizer.tsx
 *
 * Wrapper around GraphBuilder and GraphCanvas for graph category visualization.
 */

import React from 'react';
import { Snapshot } from '@/lib/types/algorithm';
import { GraphData } from '@/lib/algorithms/graph/types';
import { GraphBuilder } from './GraphBuilder';

export interface GraphVisualizerProps {
  snapshot?: Snapshot<GraphData>;
  onGraphChange?: (newGraph: GraphData, startNode: string, targetNode?: string) => void;
}

export const GraphVisualizer: React.FC<GraphVisualizerProps> = ({
  snapshot,
  onGraphChange,
}) => {
  return (
    <GraphBuilder
      snapshot={snapshot}
      onGraphChange={onGraphChange}
    />
  );
};

export default GraphVisualizer;
