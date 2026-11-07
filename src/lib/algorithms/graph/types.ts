export type NodeVisualState = 'default' | 'active' | 'visited' | 'queued' | 'path';
export type EdgeVisualState = 'default' | 'active' | 'relaxed' | 'traversed' | 'path';

export interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
  state: NodeVisualState;
  distance?: number;
  prev?: string | null;
}

export interface GraphEdge {
  from: string;
  to: string;
  weight?: number;
  state: EdgeVisualState;
  directed?: boolean;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  directed?: boolean;
}

export interface DistanceEntry {
  node: string;
  dist: number;
  prev: string | null;
}

export interface QueueItem {
  id: string;
  label: string;
  priority?: number;
}

export interface GraphSnapshotVariables {
  current?: string | null;
  neighbor?: string | null;
  edge?: string | null;
  queue?: QueueItem[] | string[];
  stack?: QueueItem[] | string[];
  minHeap?: QueueItem[];
  distances?: Record<string, number>;
  previous?: Record<string, string | null>;
  table?: DistanceEntry[];
  relaxed?: boolean;
  path?: string[];
  phase?: string;
  [key: string]: any;
}

export interface GraphAlgorithmInput {
  graph?: GraphData;
  startNode?: string;
  targetNode?: string;
}

export class NegativeWeightError extends Error {
  readonly fromNode: string;
  readonly toNode: string;
  readonly weight: number;

  constructor(fromNode: string, toNode: string, weight: number) {
    super(`Dijkstra algorithm does not support negative weights. Found edge (${fromNode} -> ${toNode}) with weight ${weight}.`);
    this.name = 'NegativeWeightError';
    this.fromNode = fromNode;
    this.toNode = toNode;
    this.weight = weight;
    Object.setPrototypeOf(this, NegativeWeightError.prototype);
  }
}

export const DEFAULT_GRAPH_DATA: GraphData = {
  directed: false,
  nodes: [
    { id: 'A', label: 'A', x: 120, y: 80, state: 'default' },
    { id: 'B', label: 'B', x: 260, y: 70, state: 'default' },
    { id: 'C', label: 'C', x: 80, y: 220, state: 'default' },
    { id: 'D', label: 'D', x: 240, y: 200, state: 'default' },
    { id: 'E', label: 'E', x: 380, y: 130, state: 'default' },
    { id: 'F', label: 'F', x: 370, y: 280, state: 'default' },
  ],
  edges: [
    { from: 'A', to: 'B', weight: 4, state: 'default' },
    { from: 'A', to: 'C', weight: 2, state: 'default' },
    { from: 'B', to: 'C', weight: 1, state: 'default' },
    { from: 'B', to: 'D', weight: 5, state: 'default' },
    { from: 'C', to: 'D', weight: 8, state: 'default' },
    { from: 'C', to: 'E', weight: 10, state: 'default' },
    { from: 'D', to: 'E', weight: 2, state: 'default' },
    { from: 'D', to: 'F', weight: 6, state: 'default' },
    { from: 'E', to: 'F', weight: 3, state: 'default' },
  ],
};

