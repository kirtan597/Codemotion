/**
 * Type definitions for advanced data structures and computational geometry
 */

// ─── Computational Geometry ───────────────────────────────────────────────────

export interface Point2D {
  x: number;
  y: number;
  id?: string;
  label?: string;
  state?: 'default' | 'active' | 'selected' | 'hull' | 'closest' | 'checking';
}

export interface LineSegment {
  p1: Point2D;
  p2: Point2D;
  state?: 'default' | 'active' | 'intersecting' | 'sweep';
}

export interface ConvexHullData {
  points: Point2D[];
  hull: Point2D[];
  currentPoint?: Point2D;
  consideredPoints?: Point2D[];
  algorithm: string;
}

export interface ClosestPairData {
  points: Point2D[];
  closestPair?: [Point2D, Point2D];
  distance: number;
  divideLine?: number;
  currentChecking?: [Point2D, Point2D];
}

export interface GeometryInput {
  points: Point2D[];
}

// ─── Advanced Trees ───────────────────────────────────────────────────────────

export interface SegmentTreeNode {
  id: string;
  start: number;
  end: number;
  value: number;
  lazy?: number;
  left?: SegmentTreeNode;
  right?: SegmentTreeNode;
  state: 'default' | 'active' | 'queried' | 'updated';
}

export interface SegmentTreeData {
  root?: SegmentTreeNode;
  array: number[];
  query?: { left: number; right: number; result?: number };
  operation: string;
}

export interface SegmentTreeInput {
  array: number[];
  operation?: 'build' | 'query' | 'update';
  left?: number;
  right?: number;
  value?: number;
}

export interface TrieNode {
  id: string;
  char: string;
  children: Map<string, TrieNode>;
  isEndOfWord: boolean;
  state: 'default' | 'active' | 'path' | 'word';
  depth: number;
}

export interface TrieData {
  root: TrieNode;
  words: string[];
  currentWord?: string;
  operation: string;
}

export interface TrieInput {
  words: string[];
  operation?: 'insert' | 'search' | 'delete';
  word?: string;
}

export interface FenwickTreeData {
  tree: number[];
  originalArray: number[];
  index?: number;
  operation: string;
  sum?: number;
}

export interface FenwickTreeInput {
  array: number[];
  operation?: 'build' | 'query' | 'update';
  index?: number;
  value?: number;
}

export interface IntervalTreeNode {
  id: string;
  interval: [number, number];
  max: number;
  left?: IntervalTreeNode;
  right?: IntervalTreeNode;
  state: 'default' | 'active' | 'overlapping';
}

export interface IntervalTreeData {
  root?: IntervalTreeNode;
  intervals: [number, number][];
  query?: [number, number];
  overlapping?: [number, number][];
  operation: string;
}

export interface KDTreeNode {
  id: string;
  point: Point2D;
  axis: 'x' | 'y';
  left?: KDTreeNode;
  right?: KDTreeNode;
  state: 'default' | 'active' | 'nearest' | 'checking';
}

export interface KDTreeData {
  root?: KDTreeNode;
  points: Point2D[];
  query?: Point2D;
  nearest?: Point2D;
  distance?: number;
  operation: string;
}

export interface SparseTableData {
  table: number[][];
  array: number[];
  query?: { left: number; right: number; result?: number };
  k?: number;
  operation: string;
}

// ─── Heaps ────────────────────────────────────────────────────────────────────

export interface FibonacciHeapNode {
  id: string;
  key: number;
  degree: number;
  marked: boolean;
  parent?: string;
  child?: string;
  left: string;
  right: string;
  state: 'default' | 'active' | 'min' | 'merging' | 'cutting';
}

export interface FibonacciHeapData {
  nodes: FibonacciHeapNode[];
  minNode?: string;
  rootList: string[];
  operation: string;
}

// ─── Union Types ──────────────────────────────────────────────────────────────

export type AdvancedDataUnion =
  | ConvexHullData
  | ClosestPairData
  | SegmentTreeData
  | TrieData
  | FenwickTreeData
  | IntervalTreeData
  | KDTreeData
  | SparseTableData
  | FibonacciHeapData;

export interface AdvancedSnapshot<T = AdvancedDataUnion> {
  id: string;
  step: number;
  description: string;
  data: T;
  currentLine?: number;
  variables?: Record<string, any>;
  formula?: string;
}
