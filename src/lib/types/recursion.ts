/**
 * Types for Recursion visualizations.
 *
 * The central metaphor is a **call stack**: a list of frames where
 * frame[0] is the MOST RECENT call (top of stack), descending to the
 * initial call at the end.
 */
import { Snapshot } from './algorithm';

// ─── Call Frame ──────────────────────────────────────────────────────────────

export type FrameState =
  | 'active'     // currently executing
  | 'calling'    // about to make a recursive call
  | 'returning'  // about to return a value
  | 'returned'   // finished, value bubbling up
  | 'base-case'; // reached a base case

export interface CallFrame {
  /** Unique id stable across snapshots (e.g. "frame-fact-5") */
  id: string;
  /** Function name, e.g. "factorial" */
  fnName: string;
  /** Display of arguments, e.g. "n = 5" */
  args: string;
  /** If the frame has produced a return value yet */
  returnValue?: string | number | null;
  /** Visual state */
  state: FrameState;
  /** Depth/nesting level (0 = first call) */
  depth: number;
}

// ─── Recursion Snapshot Data ─────────────────────────────────────────────────

export interface RecursionData {
  /** Stack frames — index 0 is top (most recent) */
  frames: CallFrame[];
  /** Single line of formatted expression shown above the stack, e.g. "5! = 5 × 4!" */
  expression?: string;
  /** Final result once recursion fully unwinds */
  result?: string | number | null;
  /** Phase label shown in header */
  phase?: 'calling' | 'base-case' | 'returning' | 'done';
  /** For Tree/Fibonacci: extra info nodes to display */
  extra?: Record<string, any>;
}

export type RecursionSnapshot = Snapshot<RecursionData>;

// ─── Hanoi-specific ──────────────────────────────────────────────────────────

export interface HanoiDisk {
  id: number;   // unique disk id (also encodes size: larger id = larger disk)
  size: number; // 1 = smallest
}

export interface HanoiData {
  /** Three pegs: 'A', 'B', 'C' */
  pegs: { A: HanoiDisk[]; B: HanoiDisk[]; C: HanoiDisk[] };
  frames: CallFrame[];
  totalMoves: number;
  currentMove: number;
  phase?: 'calling' | 'base-case' | 'returning' | 'done';
}

export type HanoiSnapshot = Snapshot<HanoiData>;
