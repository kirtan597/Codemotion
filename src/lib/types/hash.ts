/**
 * src/lib/types/hash.ts
 *
 * Type definitions for hash-based data structures
 */

import { Snapshot } from './algorithm';

export type BucketState =
  | 'default'
  | 'hashing'
  | 'collision'
  | 'inserting'
  | 'searching'
  | 'found'
  | 'deleting';

export type EntryState =
  | 'default'
  | 'active'
  | 'found'
  | 'deleted'
  | 'tombstone';

export interface HashEntry {
  key: string;
  value: any;
  state: EntryState;
  hash?: number;
}

export interface HashBucket {
  index: number;
  entries: HashEntry[]; // For separate chaining
  state: BucketState;
  probeSequence?: number[]; // For open addressing
}

export interface HashTableData {
  buckets: HashBucket[];
  size: number;
  capacity: number;
  loadFactor: number;
  collisionMethod: 'chaining' | 'linear' | 'quadratic' | 'double';
  hashFunction: string;
}

export type HashOp =
  | { type: 'insert'; key: string; value: any }
  | { type: 'search'; key: string }
  | { type: 'delete'; key: string }
  | { type: 'rehash' };

export interface HashMetadata {
  size: number;
  capacity: number;
  loadFactor: number;
  operation: string;
  result?: string;
  collisions?: number;
  probes?: number;
}

export type HashSnapshot = Snapshot<HashTableData>;
