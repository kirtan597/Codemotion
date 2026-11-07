/**
 * src/lib/types/heap.ts
 *
 * Type definitions for heap data structures
 */

import { Snapshot } from './algorithm';

export type HeapNodeState =
  | 'default'
  | 'inserting'
  | 'comparing'
  | 'swapping'
  | 'bubbling-up'
  | 'bubbling-down'
  | 'extracting'
  | 'root'
  | 'active'
  | 'found';   // used for peek highlight

export interface HeapNode {
  id: string;
  value: number;
  arrayIndex: number; // Position in array representation
  state: HeapNodeState;
  parent?: number; // Parent array index
  leftChild?: number; // Left child array index
  rightChild?: number; // Right child array index
}

export interface HeapData {
  tree: HeapNode[]; // Tree representation
  array: number[]; // Array representation
  type: 'min' | 'max';
  size: number;
}

export type HeapOp =
  | { type: 'insert'; value: number }
  | { type: 'extractMin' }
  | { type: 'extractMax' }
  | { type: 'peek' }
  | { type: 'heapify'; array: number[] }
  | { type: 'delete'; index: number }
  | { type: 'decreaseKey'; index: number; newValue: number }
  | { type: 'increaseKey'; index: number; newValue: number };

export interface HeapMetadata {
  size: number;
  operation: string;
  result?: string | number;
  comparisons?: number;
  swaps?: number;
  height?: number;
}

export type HeapSnapshot = Snapshot<HeapData>;
