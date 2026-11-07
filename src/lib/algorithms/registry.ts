import { AlgorithmDefinition, CategoryInfo } from '../types/algorithm';
import { bubbleSort }    from './sorting/bubble';
import { selectionSort } from './sorting/selection';
import { insertionSort } from './sorting/insertion';
import { mergeSort }     from './sorting/merge';
import { quickSort }     from './sorting/quick';
import { heapSort }      from './sorting/heap';
import { countingSort, radixSort, bucketSort } from './sorting/non-comparison';
import { linearSearch }  from './searching/linear';
import { binarySearch }  from './searching/binary';
import {
  // Traversal
  bfs,
  dfs,
  recursiveDFS,
  bidirectionalBFS,
  zeroOneBFS,
  connectedComponents,
  // Shortest Path
  dijkstra,
  bellmanFord,
  floydWarshall,
  astar,
  // MST
  kruskalMST,
  primMST,
  // Topological Sort
  topologicalSortKahn,
  topologicalSortDFS,
  // Cycle Detection
  cycleDetectionDFS,
  cycleDetectionUnionFind,
  // SCC
  kosarajuSCC,
  tarjanSCC,
  // Connectivity
  findBridges,
  findArticulationPoints,
  // Bipartite
  bipartiteCheck,
  // Eulerian
  eulerianPath,
  hierholzer,
  // Network Flow
  fordFulkerson,
  edmondsKarp,
} from './graph/index';
import { 
  knapsack01, 
  lcs,
  coinChangeDP,
  editDistance,
  maxSubarraySum,
  climbingStairs,
  longestIncreasingSubsequence,
  matrixChainMultiplication,
  rodCutting,
  subsetSumDP,
  longestPalindromicSubsequence,
  houseRobber,
  partitionEqualSubset,
  minPathSum,
  wordBreak,
  decodeWays,
  uniquePaths,
  jumpGame,
  palindromePartitioning,
  longestCommonSubstring,
  distinctSubsequences,
  regularExpressionMatching,
  interleavingString,
  wildcardMatching,
  maximalSquare,
  fibonacciDP,
  minCostClimbingStairs,
  catalanNumber,
} from './dp/index';
import { bst } from './tree/index';
import { stackAlgorithm }      from './linear/stack';
import { queueAlgorithm }      from './linear/queue';
import { linkedListAlgorithm } from './linear/linkedList';
import { minHeap, maxHeap }    from './heap/index';

// ─── New families ─────────────────────────────────────────────────────────────
import { factorial, fibonacci, hanoi }    from './recursion/index';
import {
  nqueens,
  sudokuSolver,
  subsetSum,
  permutations,
  ratInMaze,
  combinationSum,
  graphColoring,
  generateParentheses,
} from './backtracking/index';
import { binarySearchDC, maximumSubarray, minMaxDC } from './divconquer/index';
import {
  activitySelection,
  jobSequencing,
  fractionalKnapsack,
  huffmanCoding,
  coinChangeGreedy,
  kruskal,
  prim,
  minPlatforms,
  intervalScheduling,
  connectRopes,
  buyMaxItems,
  taskScheduling,
  graphColoringGreedy,
  waterConnection,
  maximizeSum,
  egyptianFraction,
} from './greedy/index';

// ─── String Algorithms ────────────────────────────────────────────────────────
import {
  naiveStringMatch,
  kmpStringMatch,
  rabinKarpStringMatch,
  boyerMooreStringMatch,
  zAlgorithmStringMatch,
  manacherAlgorithm,
  longestPalindromicSubstring,
  levenshteinDistance,
  suffixArrayConstruction,
} from './string/index';

// ─── Bitwise Operations ───────────────────────────────────────────────────────
import {
  bitwiseAND,
  bitwiseXOR,
  leftShift,
  rightShift,
  countSetBits,
  brianKernighan,
  powerOfTwo,
  checkKthBit,
  setKthBit,
  clearKthBit,
  toggleKthBit,
} from './bitwise/index';

// ─── Mathematical Algorithms ──────────────────────────────────────────────────
import {
  sieveOfEratosthenes,
  euclideanGCD,
  fastExponentiation,
  pascalTriangle,
} from './math/index';

// ─── Computational Geometry ───────────────────────────────────────────────────
import {
  grahamScanConvexHull,
  closestPairOfPoints,
} from './geometry/index';

// ─── Advanced Data Structures ─────────────────────────────────────────────────
import {
  segmentTreeRangeSum,
  trieDataStructure,
  fenwickTreeBIT,
} from './advanced/index';

// ─── Categories ───────────────────────────────────────────────────────────────

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'sorting',
    name: 'Sorting',
    description: 'Comparison-based and non-comparison sorting algorithms — animated bar chart.',
    icon: 'ArrowDownUp',
  },
  {
    id: 'searching',
    name: 'Searching',
    description: 'Algorithms for locating specific values or keys within data structures.',
    icon: 'Search',
  },
  {
    id: 'recursion',
    name: 'Recursion',
    description: 'Visualize call-stack frames, base cases, recursive calls, and return values.',
    icon: 'RefreshCcw',
  },
  {
    id: 'backtracking',
    name: 'Backtracking',
    description: 'Explore decision trees, constraint checking, and backtrack on failure.',
    icon: 'GitBranch',
  },
  {
    id: 'divconquer',
    name: 'Divide & Conquer',
    description: 'Split problems into subproblems, solve independently, combine results.',
    icon: 'Scissors',
  },
  {
    id: 'linear',
    name: 'Linear Structures',
    description: 'Stack, Queue, and Linked List data structures with interactive operations.',
    icon: 'List',
  },
  {
    id: 'heap',
    name: 'Heaps',
    description: 'Min/Max heap operations, priority queues, and heap-based applications.',
    icon: 'Triangle',
  },
  {
    id: 'graph',
    name: 'Graphs',
    description: 'Traversal and pathfinding algorithms operating on networks of vertices and edges.',
    icon: 'Network',
  },
  {
    id: 'dp',
    name: 'Dynamic Programming',
    description: 'Optimal substructure algorithms with memoization and state matrix reconstruction.',
    icon: 'Grid',
  },
  {
    id: 'tree',
    name: 'Trees',
    description: 'Hierarchical data structures including Binary Search Tree operations and traversals.',
    icon: 'Binary',
  },
  {
    id: 'greedy',
    name: 'Greedy',
    description: 'Algorithms making locally optimal choices at each step for global optimization.',
    icon: 'Target',
  },
  {
    id: 'string',
    name: 'String Algorithms',
    description: 'Pattern matching, palindromes, edit distance, and suffix structures for text processing.',
    icon: 'Text',
  },
  {
    id: 'math',
    name: 'Mathematical Algorithms',
    description: 'Number theory, combinatorics, GCD, primes, exponentiation, and mathematical transformations.',
    icon: 'Calculator',
  },
  {
    id: 'bitwise',
    name: 'Bit Manipulation',
    description: 'Bitwise operations, bit counting, masking, and binary arithmetic for efficient computations.',
    icon: 'Binary',
  },
  {
    id: 'geometry',
    name: 'Computational Geometry',
    description: 'Convex hull, closest pair, line intersection, and spatial algorithms for 2D/3D problems.',
    icon: 'Shapes',
  },
  {
    id: 'advanced',
    name: 'Advanced Data Structures',
    description: 'Segment trees, tries, Fenwick trees, and specialized structures for complex operations.',
    icon: 'Layers',
  },
];

// ─── Algorithm Registry ───────────────────────────────────────────────────────

export const ALGORITHMS: AlgorithmDefinition[] = [
  // Sorting — Comparison
  bubbleSort,
  selectionSort,
  insertionSort,
  mergeSort,
  quickSort,
  heapSort,
  // Sorting — Non-Comparison
  countingSort,
  radixSort,
  bucketSort,

  // Searching
  binarySearch,
  linearSearch,

  // Recursion
  factorial,
  fibonacci,
  hanoi,

  // Backtracking
  nqueens,
  sudokuSolver,
  subsetSum,
  permutations,
  ratInMaze,
  combinationSum,
  graphColoring,
  generateParentheses,

  // Divide & Conquer
  binarySearchDC,
  maximumSubarray,
  minMaxDC,

  // Linear Structures
  stackAlgorithm,
  queueAlgorithm,
  linkedListAlgorithm,

  // Heaps
  minHeap,
  maxHeap,

  // Graph - Traversal
  bfs,
  dfs,
  recursiveDFS,
  bidirectionalBFS,
  zeroOneBFS,
  connectedComponents,
  
  // Graph - Shortest Path
  dijkstra,
  bellmanFord,
  floydWarshall,
  astar,
  
  // Graph - MST
  kruskalMST,
  primMST,
  
  // Graph - Topological Sort
  topologicalSortKahn,
  topologicalSortDFS,
  
  // Graph - Cycle Detection
  cycleDetectionDFS,
  cycleDetectionUnionFind,
  
  // Graph - SCC
  kosarajuSCC,
  tarjanSCC,
  
  // Graph - Connectivity
  findBridges,
  findArticulationPoints,
  
  // Graph - Bipartite
  bipartiteCheck,
  
  // Graph - Eulerian
  eulerianPath,
  hierholzer,
  
  // Graph - Network Flow
  fordFulkerson,
  edmondsKarp,

  // Dynamic Programming
  knapsack01,
  lcs,
  coinChangeDP,
  editDistance,
  maxSubarraySum,
  climbingStairs,
  longestIncreasingSubsequence,
  matrixChainMultiplication,
  rodCutting,
  subsetSumDP,
  longestPalindromicSubsequence,
  houseRobber,
  partitionEqualSubset,
  minPathSum,
  wordBreak,
  decodeWays,
  uniquePaths,
  jumpGame,
  palindromePartitioning,
  longestCommonSubstring,
  distinctSubsequences,
  regularExpressionMatching,
  interleavingString,
  wildcardMatching,
  maximalSquare,
  fibonacciDP,
  minCostClimbingStairs,
  catalanNumber,

  // Trees
  bst,

  // Greedy
  activitySelection,
  jobSequencing,
  fractionalKnapsack,
  huffmanCoding,
  coinChangeGreedy,
  kruskal,
  prim,
  minPlatforms,
  intervalScheduling,
  connectRopes,
  buyMaxItems,
  taskScheduling,
  graphColoringGreedy,
  waterConnection,
  maximizeSum,
  egyptianFraction,

  // String Algorithms
  naiveStringMatch,
  kmpStringMatch,
  rabinKarpStringMatch,
  boyerMooreStringMatch,
  zAlgorithmStringMatch,
  manacherAlgorithm,
  longestPalindromicSubstring,
  levenshteinDistance,
  suffixArrayConstruction,

  // Bitwise Operations
  bitwiseAND,
  bitwiseXOR,
  leftShift,
  rightShift,
  countSetBits,
  brianKernighan,
  powerOfTwo,
  checkKthBit,
  setKthBit,
  clearKthBit,
  toggleKthBit,

  // Mathematical Algorithms
  sieveOfEratosthenes,
  euclideanGCD,
  fastExponentiation,
  pascalTriangle,

  // Computational Geometry
  grahamScanConvexHull,
  closestPairOfPoints,

  // Advanced Data Structures
  segmentTreeRangeSum,
  trieDataStructure,
  fenwickTreeBIT,
];

// ─── Lookup helpers ───────────────────────────────────────────────────────────

const algorithmMap = new Map<string, AlgorithmDefinition>(
  ALGORITHMS.map((algo) => [algo.id, algo])
);

export function getAlgorithm(id: string): AlgorithmDefinition | undefined {
  return algorithmMap.get(id);
}

export function getAllAlgorithms(): AlgorithmDefinition[] {
  return ALGORITHMS;
}

export function getAlgorithmsByCategory(category: string): AlgorithmDefinition[] {
  return ALGORITHMS.filter((algo) => algo.category === category);
}

export function getDefaultAlgorithm(): AlgorithmDefinition {
  return bubbleSort;
}
