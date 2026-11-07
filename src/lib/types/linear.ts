/**
 * src/lib/types/linear.ts
 *
 * Shared types for Stack, Queue, and Linked-List operation-based generators.
 * These structures are "interactive" — they don't have a single input and run
 * to completion. Instead, a sequence of operations is replayed into snapshots.
 */

import { Snapshot } from './algorithm';

// ─── Node ────────────────────────────────────────────────────────────────────
export type NodeState =
  | 'default'   // idle node
  | 'active'    // currently being operated on (push/enqueue/insert target)
  | 'removing'  // about to be removed (pop/dequeue/delete)
  | 'searching' // being examined during search
  | 'found'     // matched during search
  | 'head'      // marks the head pointer
  | 'tail'      // marks the tail pointer
  | 'sorted'    // finalized (used for reversed portion during reverse op)
  ;

export interface ListNode {
  /** Stable unique ID for framer-motion layoutId */
  id: string;
  value: number | string;
  state: NodeState;
  /** Extra pointer labels to render beneath the node (e.g. 'head', 'tail', 'prev', 'curr') */
  pointers?: string[];
}

// ─── Operation types ─────────────────────────────────────────────────────────

export type StackOp =
  | { type: 'push'; value: number }
  | { type: 'pop' }
  | { type: 'peek' };

export type QueueOp =
  | { type: 'enqueue'; value: number }
  | { type: 'dequeue' }
  | { type: 'peek' };

export type LinkedListOp =
  | { type: 'insertHead'; value: number }
  | { type: 'insertTail'; value: number }
  | { type: 'delete'; value: number }
  | { type: 'search'; value: number }
  | { type: 'reverse' };

// ─── Snapshot meta for linear structures ─────────────────────────────────────
export interface LinearMeta {
  size: number;
  operation: string;
  result?: string;
  [key: string]: string | number | boolean | null | undefined;
}

/** Convenience alias */
export type LinearSnapshot = Snapshot<ListNode[]>;

