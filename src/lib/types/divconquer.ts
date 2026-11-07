/**
 * Types for Divide-and-Conquer visualizations.
 *
 * Each D&C snapshot shows:
 *  - the full array / problem state (reuses ArrayElement[])
 *  - the recursive division tree structure
 *  - the active sub-range being worked on
 */
import { Snapshot } from './algorithm';
import { ArrayElement } from './algorithm';

// ─── Division tree (shows sub-problems) ───────────────────────────────────────

export type DivNodeState =
  | 'idle'
  | 'dividing'
  | 'solving'
  | 'merging'
  | 'done';

export interface DivTreeNode {
  id: string;
  label: string;      // e.g. "[2,8]" or "f(3)"
  state: DivNodeState;
  depth: number;
  lo: number;
  hi: number;
  children?: DivTreeNode[];
  result?: string;
}

// ─── D&C snapshot data ────────────────────────────────────────────────────────

export interface DivConquerData {
  /** The array in its current state */
  elements: ArrayElement[];
  /** Active sub-range [lo, hi] being processed */
  activeRange?: [number, number];
  /** Sub-ranges that are "done" (sorted/solved) */
  doneRanges?: Array<[number, number]>;
  /** Left sub-problem range */
  leftRange?: [number, number];
  /** Right sub-problem range */
  rightRange?: [number, number];
  /** Optional division tree */
  divTree?: DivTreeNode;
  /** Phase */
  phase?: 'divide' | 'solve' | 'merge' | 'combine' | 'done';
  /** Algorithm-specific extra fields */
  extra?: Record<string, any>;
}

export type DivConquerSnapshot = Snapshot<DivConquerData>;
