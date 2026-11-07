/**
 * src/lib/types/trie.ts
 *
 * Type definitions for Trie (Prefix Tree) data structure
 */

import { Snapshot } from './algorithm';

export type TrieNodeState =
  | 'default'
  | 'active'
  | 'searching'
  | 'found'
  | 'inserting'
  | 'deleting'
  | 'prefix-match'
  | 'end-of-word';

export interface TrieNode {
  id: string;
  char: string; // Character at this node (empty string for root)
  isEndOfWord: boolean;
  children: TrieNode[];
  state: TrieNodeState;
  depth: number; // Level in the tree
  parent?: string; // Parent node ID
  wordCount?: number; // Number of words passing through this node
}

export interface TrieData {
  root: TrieNode;
  totalWords: number;
  totalNodes: number;
}

export type TrieOp =
  | { type: 'insert'; word: string }
  | { type: 'search'; word: string }
  | { type: 'startsWith'; prefix: string }
  | { type: 'delete'; word: string }
  | { type: 'countWordsWithPrefix'; prefix: string }
  | { type: 'autocomplete'; prefix: string };

export interface TrieMetadata {
  totalWords: number;
  totalNodes: number;
  operation: string;
  result?: string | boolean | string[];
  word?: string;
  prefix?: string;
}

export type TrieSnapshot = Snapshot<TrieData>;
