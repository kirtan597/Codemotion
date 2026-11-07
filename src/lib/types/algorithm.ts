export type AlgorithmCategory = 
  | 'sorting' 
  | 'searching' 
  | 'graph' 
  | 'tree' 
  | 'dp'
  | 'linear'        // Stack, Queue, LinkedList
  | 'heap'          // Heap operations
  | 'hash'          // Hash tables, maps, sets
  | 'trie'          // Trie operations
  | 'advanced-tree' // AVL, RB, Segment, Fenwick
  | 'array'         // Array operations
  | 'specialized'   // DSU, Monotonic structures
  | 'spatial'       // KD-tree, Quadtree
  | 'recursion'     // Recursion with call-stack visualization
  | 'backtracking'  // Backtracking with decision-tree visualization
  | 'divconquer'    // Divide & Conquer with split/merge visualization
  | 'greedy'        // Greedy algorithms with step-by-step choice visualization
  | 'string'        // String pattern matching and manipulation algorithms
  | 'math'          // Mathematical algorithms and number theory
  | 'bitwise'       // Bit manipulation operations
  | 'geometry'      // Computational geometry algorithms
  | 'advanced';     // Advanced data structures and algorithms

export interface CategoryInfo {
  id: AlgorithmCategory;
  name: string;
  description: string;
  icon?: string;
}

export type ElementState = 
  | 'default'
  | 'comparing'
  | 'swapping'
  | 'sorted'
  | 'pivot'
  | 'active'
  | 'found'
  | 'visited'
  | 'target'
  | 'counting'   // for counting sort
  | 'radix'      // for radix sort
  | 'bucket';    // for bucket sort

export interface ArrayElement {
  id: string | number;
  value: number;
  state: ElementState;
}

export interface Snapshot<TData = any> {
  id: string;
  step: number;
  description: string;
  data: TData;
  highlightIndices?: number[];
  comparingIndices?: number[];
  swapIndices?: number[];
  sortedIndices?: number[];
  currentLine?: number;
  variables?: Record<string, any>;
}

export interface AlgorithmInputConfig {
  type: 'array' | 'array-target' | 'graph' | 'tree' | 'dp' | 'operations' | 'heap' | 'hash' | 'trie';
  minSize?: number;
  maxSize?: number;
  defaultSize?: number;
  supportsCustomInput?: boolean;
}

export interface AlgorithmDefinition<TInput = any, TData = any> {
  id: string;
  name: string;
  category: AlgorithmCategory;
  categoryName: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeComplexity: {
    best: string;
    average: string;
    worst: string;
  };
  spaceComplexity: string;
  code?: string[];
  defaultInput: TInput;
  inputConfig: AlgorithmInputConfig;
  generate: (input: TInput) => Snapshot<TData>[];
}
