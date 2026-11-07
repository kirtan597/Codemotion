/**
 * Types for Backtracking visualizations.
 *
 * Two parallel views:
 *  1. A **grid / board** showing the current state.
 *  2. A **decision tree** that records tried / pruned / valid branches.
 */
import { Snapshot } from './algorithm';

// ─── Decision-tree node ───────────────────────────────────────────────────────

export type DecisionNodeState =
  | 'active'   // currently being explored
  | 'valid'    // satisfies constraints so far
  | 'invalid'  // constraint violated — will backtrack
  | 'pruned'   // entire branch cut off
  | 'solution' // complete valid solution
  | 'idle';    // not yet visited

export interface DecisionNode {
  id: string;
  label: string;         // short text: column index, element, etc.
  state: DecisionNodeState;
  depth: number;         // 0 = root
  children?: DecisionNode[];
  parentId?: string;
  choiceIndex?: number;  // which sibling (0-based) this node is
}

// ─── Cell states (used by grid / board) ──────────────────────────────────────

export type CellState =
  | 'empty'
  | 'placed'      // queen, number, path-step
  | 'trying'      // currently being tested
  | 'conflict'    // violates a constraint
  | 'blocked'     // not traversable (wall in maze, given sudoku value, etc.)
  | 'path'        // part of a valid path (maze, knight's tour)
  | 'backtrack'   // being removed via backtracking
  | 'solution';   // confirmed part of a solution

// ─── Generic board / grid cell ───────────────────────────────────────────────

export interface BoardCell {
  row: number;
  col: number;
  value: string | number | null;
  state: CellState;
}

// ─── Main backtracking data ───────────────────────────────────────────────────

export interface BacktrackingData {
  /** Flat list of cells (board/grid representation) */
  board: BoardCell[][];
  /** Current partial solution info */
  current?: string;
  /** All complete solutions found so far */
  solutions: Array<string | number[][]>;
  /** Number of backtracks performed */
  backtracks: number;
  /** Constraint checks performed */
  checks: number;
  /** Optional decision tree (may be omitted for performance) */
  decisionTree?: DecisionNode;
  /** Phase label */
  phase?: 'placing' | 'checking' | 'backtracking' | 'solution' | 'done';
  /** Algorithm-specific extra fields */
  extra?: Record<string, any>;
}

export type BacktrackingSnapshot = Snapshot<BacktrackingData>;

// ─── Input types ─────────────────────────────────────────────────────────────

export interface NQueensInput { n: number }

export interface SudokuInput {
  /**
   * 9×9 grid as flat array of 81 numbers (0 = empty cell).
   * Provide the classic easy/medium/hard puzzles or custom ones.
   */
  board: number[];
}

export interface MazeInput {
  /** Row-major 2D boolean grid: true = open, false = wall */
  grid: boolean[][];
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

export interface GraphColoringInput {
  n: number;         // number of vertices
  edges: [number, number][];
  colors: number;    // max colors allowed
}

export interface SubsetSumInput {
  set: number[];
  target: number;
}

export interface CombinationSumInput {
  candidates: number[];
  target: number;
}

export interface PermutationsInput {
  elements: number[];
}

export interface NQueensOp { type: 'solve' }
