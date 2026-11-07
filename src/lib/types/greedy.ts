/**
 * Types for Greedy algorithm visualizations.
 *
 * Greedy algorithms make locally optimal choices at each step
 * with the hope of finding a global optimum.
 */

export type GreedyItemState =
  | 'available'    // item available for selection
  | 'considering'  // currently being evaluated
  | 'selected'     // chosen by greedy criterion
  | 'rejected'     // not chosen
  | 'optimal';     // part of final solution

export interface GreedyItem {
  id: string;
  label: string;
  value: number;
  weight?: number;
  deadline?: number;
  profit?: number;
  start?: number;
  end?: number;
  state: GreedyItemState;
  sortKey?: number; // for displaying sorting criterion
}

export interface GreedyData {
  /** List of items/choices in current state */
  items: GreedyItem[];
  /** Currently selected items */
  selected: GreedyItem[];
  /** Current decision/choice being made */
  currentChoice?: string;
  /** Total value/profit accumulated */
  totalValue: number;
  /** Current capacity/resource remaining (for knapsack-like problems) */
  remainingCapacity?: number;
  /** Sorting criterion being used */
  criterion?: string;
  /** Phase of algorithm */
  phase: 'init' | 'sorting' | 'selecting' | 'done';
  /** Algorithm-specific extra data */
  extra?: Record<string, any>;
}

// ─── Input types for various greedy algorithms ────────────────────────────────

export interface ActivitySelectionInput {
  activities: Array<{ start: number; end: number; name?: string }>;
}

export interface FractionalKnapsackInput {
  items: Array<{ weight: number; value: number; name?: string }>;
  capacity: number;
}

export interface HuffmanCodingInput {
  text: string;
}

export interface JobSequencingInput {
  jobs: Array<{ id: string; deadline: number; profit: number }>;
}

export interface MinCoinChangeInput {
  coins: number[];
  amount: number;
}

export interface KruskalInput {
  vertices: number;
  edges: Array<{ from: number; to: number; weight: number }>;
}

export interface PrimInput {
  vertices: number;
  edges: Array<{ from: number; to: number; weight: number }>;
}

export interface IntervalSchedulingInput {
  intervals: Array<{ start: number; end: number; name?: string }>;
}

export interface EgyptianFractionInput {
  numerator: number;
  denominator: number;
}

export interface WaterConnectionInput {
  houses: number;
  pipes: Array<{ from: number; to: number; diameter: number; length: number }>;
}

export interface TaskSchedulingInput {
  tasks: Array<{ id: string; deadline: number; duration: number }>;
}

export interface GraphColoringGreedyInput {
  vertices: number;
  edges: Array<[number, number]>;
}

export interface MinPlatformsInput {
  arrivals: number[];
  departures: number[];
}

export interface ConnectRopesInput {
  ropes: number[];
}

export interface BuyMaxItemsInput {
  prices: number[];
  budget: number;
}
