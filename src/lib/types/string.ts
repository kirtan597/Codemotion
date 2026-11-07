/**
 * Type definitions for string algorithm visualizations
 */

// Character state in text/pattern
export type CharState = 
  | 'default'
  | 'comparing'
  | 'match'
  | 'mismatch'
  | 'pattern-position'
  | 'text-position'
  | 'current'
  | 'found'
  | 'processed'
  | 'active'
  | 'highlight';

// Character with visualization state
export interface StringChar {
  char: string;
  index: number;
  state: CharState;
  label?: string;
}

// Pattern matching visualization data
export interface PatternMatchData {
  text: StringChar[];
  pattern: StringChar[];
  textPointer: number;
  patternPointer: number;
  matches: number[];
  comparisons: number;
  algorithm: string;
  // Algorithm-specific data
  lps?: number[];           // For KMP
  zArray?: number[];        // For Z-Algorithm
  badChar?: Map<string, number>;  // For Boyer-Moore
  goodSuffix?: number[];    // For Boyer-Moore
  hashValues?: {            // For Rabin-Karp
    textHash?: number;
    patternHash?: number;
    currentHash?: number;
  };
}

// Suffix structure visualization
export interface SuffixData {
  text: string;
  suffixes: Suffix[];
  suffixArray?: number[];
  lcpArray?: number[];
  currentIndex?: number;
  highlightIndices?: number[];
}

export interface Suffix {
  index: number;
  suffix: string;
  rank?: number;
  state: 'default' | 'comparing' | 'sorted' | 'active';
}

// Suffix tree node
export interface SuffixTreeNode {
  id: string;
  start: number;
  end: number;
  label: string;
  children: SuffixTreeNode[];
  suffixLink?: string;
  state: 'default' | 'active' | 'visited';
}

export interface SuffixTreeData {
  root: SuffixTreeNode;
  text: string;
  currentNode?: string;
  activePath?: string[];
}

// Trie node
export interface TrieNode {
  id: string;
  char: string;
  children: TrieNode[];
  isEnd: boolean;
  failureLink?: string;  // For Aho-Corasick
  output?: string[];     // For Aho-Corasick
  state: 'default' | 'active' | 'visited' | 'match';
  depth: number;
}

export interface TrieData {
  root: TrieNode;
  patterns: string[];
  currentNode?: string;
  activePath?: string[];
  text?: string;
  textIndex?: number;
}

// Distance algorithm visualization
export interface DistanceMatrixData {
  text1: string;
  text2: string;
  matrix: DistanceCell[][];
  currentRow: number;
  currentCol: number;
  distance: number;
  operations: EditOperation[];
}

export interface DistanceCell {
  value: number;
  operation?: 'insert' | 'delete' | 'replace' | 'match' | 'transpose';
  state: 'default' | 'active' | 'computed' | 'path' | 'comparing';
}

export interface EditOperation {
  type: 'insert' | 'delete' | 'replace' | 'match' | 'transpose';
  position: number;
  char?: string;
}

// Palindrome visualization
export interface PalindromeData {
  text: StringChar[];
  center: number;
  left: number;
  right: number;
  lengths?: number[];      // For Manacher's
  longestStart: number;
  longestEnd: number;
  currentPalindrome: string;
}

// String algorithm input types
export interface PatternMatchInput {
  text: string;
  pattern: string;
}

export interface SuffixInput {
  text: string;
}

export interface TrieInput {
  patterns: string[];
  text?: string;
}

export interface DistanceInput {
  text1: string;
  text2: string;
}

export interface PalindromeInput {
  text: string;
}

// String algorithm snapshot
export interface StringSnapshot<T = any> {
  id: string;
  step: number;
  description: string;
  data: T;
  currentLine?: number;
  variables?: Record<string, any>;
}
