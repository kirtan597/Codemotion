# VisualDSA Pro - Complete Project Structure

## 📁 Root Directory Structure

```
d:\Projects\Visualizedsa\
└── visualdsa-pro/                    # Main application directory
    ├── .next/                        # Next.js build output (auto-generated)
    ├── node_modules/                 # Dependencies (auto-generated)
    ├── public/                       # Static assets
    ├── src/                          # Source code
    ├── tests/                        # Test suites
    ├── docs/                         # Documentation
    ├── .env.example                  # Environment template
    ├── .env.local.example            # Local environment template
    ├── .gitignore                    # Git ignore rules
    ├── drizzle.config.ts             # Database configuration
    ├── eslint.config.mjs             # ESLint configuration
    ├── next.config.ts                # Next.js configuration
    ├── next-env.d.ts                 # Next.js TypeScript declarations
    ├── package.json                  # Dependencies and scripts
    ├── pnpm-lock.yaml                # Lock file for pnpm
    ├── pnpm-workspace.yaml           # Workspace configuration
    ├── tsconfig.json                 # TypeScript configuration
    ├── tsconfig.tsbuildinfo          # TypeScript build cache
    ├── vitest.config.mts             # Vitest test configuration
    ├── README.md                     # Project overview
    ├── QUICK_START.md                # Quick start guide
    └── PROJECT_STRUCTURE.md          # This file
```

---

## 📦 Source Code (`src/`)

### Application Routes (`src/app/`)
```
src/app/
├── api/                              # Backend API routes
│   └── share/                        # Share visualization endpoints
│       ├── route.ts                  # POST: Create share link
│       └── [id]/
│           └── route.ts              # GET: Retrieve shared visualization
├── s/                                # Shared visualization pages
│   └── [id]/
│       └── page.tsx                  # Display shared visualization
├── visualize/                        # Main algorithm pages
│   └── [category]/
│       └── [algorithm]/
│           ├── page.tsx              # Algorithm visualization page
│           ├── error.tsx             # Error boundary
│           └── loading.tsx           # Loading state
├── favicon.ico                       # Site favicon
├── globals.css                       # Global styles
├── layout.tsx                        # Root layout
├── not-found.tsx                     # 404 page
└── page.tsx                          # Home page (redirects to bubble-sort)
```

### Components (`src/components/`)
```
src/components/
├── inspector/                        # Algorithm inspection panels
│   ├── CodeViewer.tsx                # Legacy code viewer (unused)
│   ├── InfoTab.tsx                   # Algorithm info & complexity
│   ├── InputPanel.tsx                # Input configuration panel
│   ├── LogTab.tsx                    # Execution log viewer
│   ├── OperationPanel.tsx            # Data structure operations
│   └── PseudocodeTab.tsx             # Pseudocode with highlighting
├── layout/                           # Layout components
│   ├── CommandPalette.tsx            # Search palette (⌘K)
│   ├── CompareMode.tsx               # Side-by-side comparison
│   └── Sidebar.tsx                   # Category navigation
├── player/                           # Playback controls
│   └── PlayerControls.tsx            # Play/pause/step/speed controls
├── shared/                           # Reusable components
│   ├── ExportButton.tsx              # Export JSON/PNG
│   ├── LiveRegion.tsx                # ARIA live announcements
│   └── ShareButton.tsx               # Share functionality
├── ui/                               # UI primitives (empty - reserved)
└── visualizers/                      # Algorithm visualizers
    ├── AdvancedVisualizer.tsx        # Advanced structures & geometry
    ├── ArrayBars.tsx                 # Sorting visualization (bars)
    ├── ArrayVisualizer.tsx           # Searching visualization
    ├── BacktrackingVisualizer.tsx    # Backtracking decision tree
    ├── CallStackVisualizer.tsx       # Recursion call stack
    ├── DivConquerVisualizer.tsx      # Divide & conquer splits
    ├── DPMatrix.tsx                  # DP table cells
    ├── DPVisualizer.tsx              # DP wrapper with formula bar
    ├── FormulaBar.tsx                # Live recurrence formula
    ├── GraphBuilder.tsx              # Interactive graph editor
    ├── GraphCanvas.tsx               # Graph visualization (SVG)
    ├── GraphVisualizer.tsx           # Graph wrapper
    ├── MathVisualizer.tsx            # Math & bitwise operations
    ├── NodeChain.tsx                 # Linked list visualization
    ├── QueueOverlay.tsx              # Queue/priority queue display
    ├── StringVisualizer.tsx          # String algorithm visualizations
    ├── SummaryCard.tsx               # DP summary (items chosen)
    ├── TreeCanvas.tsx                # Binary tree visualization (SVG)
    ├── VisualizerView.tsx            # Main visualizer container
    └── index.tsx                     # Visualizer registry & exports
```

### Core Logic (`src/lib/`)
```
src/lib/
├── algorithms/                       # 144 algorithm implementations
│   ├── advanced/                     # Advanced data structures (5)
│   │   ├── fenwickTree.ts
│   │   ├── index.ts
│   │   ├── segmentTree.ts
│   │   └── trie.ts
│   ├── backtracking/                 # Backtracking algorithms (8)
│   │   ├── combinationSum.ts
│   │   ├── generateParentheses.ts
│   │   ├── graphColoring.ts
│   │   ├── index.ts
│   │   ├── nQueens.ts
│   │   ├── permutations.ts
│   │   ├── ratInMaze.ts
│   │   ├── subsetSum.ts
│   │   └── sudoku.ts
│   ├── bitwise/                      # Bit manipulation (11)
│   │   ├── basicOperations.ts        # AND, XOR, shifts
│   │   ├── bitManipulation.ts        # Count bits, Brian Kernighan, etc.
│   │   └── index.ts
│   ├── divconquer/                   # Divide & conquer (3)
│   │   ├── binarySearch.ts
│   │   ├── index.ts
│   │   ├── maximumSubarray.ts
│   │   └── minMax.ts
│   ├── dp/                           # Dynamic programming (28)
│   │   ├── catalanNumber.ts
│   │   ├── climbingStairs.ts
│   │   ├── coinChange.ts
│   │   ├── decodeWays.ts
│   │   ├── distinctSubsequences.ts
│   │   ├── editDistance.ts
│   │   ├── fibonacci.ts
│   │   ├── houseRobber.ts
│   │   ├── index.ts
│   │   ├── interleavingString.ts
│   │   ├── jumpGame.ts
│   │   ├── knapsack01.ts
│   │   ├── lcs.ts
│   │   ├── longestCommonSubstring.ts
│   │   ├── longestIncreasingSubsequence.ts
│   │   ├── longestPalindromicSubsequence.ts
│   │   ├── matrixChainMultiplication.ts
│   │   ├── maxSubarraySum.ts
│   │   ├── maximalSquare.ts
│   │   ├── minCostClimbingStairs.ts
│   │   ├── minPathSum.ts
│   │   ├── palindromePartitioning.ts
│   │   ├── partitionEqualSubset.ts
│   │   ├── regularExpressionMatching.ts
│   │   ├── rodCutting.ts
│   │   ├── subsetSum.ts
│   │   ├── uniquePaths.ts
│   │   ├── wildcardMatching.ts
│   │   └── wordBreak.ts
│   ├── geometry/                     # Computational geometry (2)
│   │   ├── closestPair.ts
│   │   ├── convexHull.ts
│   │   └── index.ts
│   ├── graph/                        # Graph algorithms (27)
│   │   ├── articulation.ts           # Articulation points
│   │   ├── astar.ts                  # A* search
│   │   ├── bellmanFord.ts            # Bellman-Ford SSSP
│   │   ├── bfs.ts                    # Breadth-first search
│   │   ├── bidirectionalBFS.ts       # Bidirectional BFS
│   │   ├── bipartite.ts              # Bipartite check
│   │   ├── bridges.ts                # Find bridges
│   │   ├── components.ts             # Connected components
│   │   ├── cycleDetection.ts         # Cycle detection (DFS & Union-Find)
│   │   ├── dfs.ts                    # Depth-first search (iterative)
│   │   ├── dijkstra.ts               # Dijkstra's SSSP
│   │   ├── edmondsKarp.ts            # Edmonds-Karp max flow
│   │   ├── eulerian.ts               # Eulerian path & Hierholzer
│   │   ├── floydWarshall.ts          # Floyd-Warshall APSP
│   │   ├── fordFulkerson.ts          # Ford-Fulkerson max flow
│   │   ├── index.ts
│   │   ├── kosaraju.ts               # Kosaraju's SCC
│   │   ├── kruskal.ts                # Kruskal's MST
│   │   ├── prim.ts                   # Prim's MST
│   │   ├── recursiveDFS.ts           # Recursive DFS
│   │   ├── tarjan.ts                 # Tarjan's SCC
│   │   ├── topologicalSort.ts        # Topological sort (DFS & Kahn)
│   │   └── zeroOneBFS.ts             # 0-1 BFS
│   ├── greedy/                       # Greedy algorithms (16)
│   │   ├── activitySelection.ts
│   │   ├── buyMaxItems.ts
│   │   ├── coinChange.ts
│   │   ├── connectRopes.ts
│   │   ├── egyptianFraction.ts
│   │   ├── fractionalKnapsack.ts
│   │   ├── graphColoring.ts
│   │   ├── huffmanCoding.ts
│   │   ├── index.ts
│   │   ├── intervalScheduling.ts
│   │   ├── jobSequencing.ts
│   │   ├── kruskal.ts
│   │   ├── maximizeSum.ts
│   │   ├── minPlatforms.ts
│   │   ├── prim.ts
│   │   ├── taskScheduling.ts
│   │   └── waterConnection.ts
│   ├── heap/                         # Heap operations (2)
│   │   ├── index.ts
│   │   ├── maxHeap.ts
│   │   └── minHeap.ts
│   ├── linear/                       # Linear structures (3)
│   │   ├── index.ts
│   │   ├── linkedList.ts             # Linked list operations
│   │   ├── queue.ts                  # Queue operations
│   │   └── stack.ts                  # Stack operations
│   ├── math/                         # Mathematical algorithms (4)
│   │   ├── fastExponentiation.ts
│   │   ├── gcd.ts                    # Euclidean GCD
│   │   ├── index.ts
│   │   ├── pascalTriangle.ts
│   │   └── sieve.ts                  # Sieve of Eratosthenes
│   ├── recursion/                    # Recursion algorithms (3)
│   │   ├── factorial.ts
│   │   ├── fibonacci.ts
│   │   ├── hanoi.ts                  # Tower of Hanoi
│   │   └── index.ts
│   ├── searching/                    # Searching algorithms (2)
│   │   ├── binary.ts
│   │   ├── index.ts
│   │   └── linear.ts
│   ├── sorting/                      # Sorting algorithms (9)
│   │   ├── bubble.ts
│   │   ├── heap.ts
│   │   ├── index.ts
│   │   ├── insertion.ts
│   │   ├── merge.ts
│   │   ├── non-comparison.ts         # Counting, Radix, Bucket
│   │   ├── quick.ts
│   │   └── selection.ts
│   ├── string/                       # String algorithms (9)
│   │   ├── boyerMoore.ts
│   │   ├── index.ts
│   │   ├── kmp.ts
│   │   ├── levenshtein.ts
│   │   ├── longestPalindrome.ts
│   │   ├── manacher.ts
│   │   ├── naive.ts
│   │   ├── rabinKarp.ts
│   │   ├── suffixArray.ts
│   │   └── zAlgorithm.ts
│   ├── tree/                         # Tree algorithms (1)
│   │   ├── bst.ts                    # BST with 7 operations
│   │   └── index.ts
│   └── registry.ts                   # Algorithm registry & lookup
├── presets/
│   └── arrayPresets.ts               # Preset array inputs
├── schemas/                          # Zod validation schemas
│   ├── inputSchemas.ts
│   ├── share.ts
│   └── url-state.ts
├── types/                            # TypeScript type definitions
│   ├── advanced.ts                   # Advanced structure types
│   ├── algorithm.ts                  # Core algorithm types
│   ├── backtracking.ts               # Backtracking types
│   ├── divconquer.ts                 # Divide & conquer types
│   ├── dp.ts                         # Dynamic programming types
│   ├── graph.ts                      # Graph types
│   ├── greedy.ts                     # Greedy types
│   ├── linear.ts                     # Linear structure types
│   ├── math.ts                       # Math & bitwise types
│   ├── player.ts                     # Player types
│   ├── recursion.ts                  # Recursion types
│   └── string.ts                     # String types
├── utils/                            # Utility functions
│   ├── minHeap.ts                    # Min heap utility
│   └── treeLayout.ts                 # Tree layout algorithm
└── rate-limit.ts                     # Rate limiting logic
```

### Hooks (`src/hooks/`)
```
src/hooks/
├── useAlgorithm.ts                   # Algorithm execution hook
├── useGraphEditor.ts                 # Graph editing state
└── useLocalStorage.ts                # SSR-safe localStorage
```

### Server (`src/server/`)
```
src/server/
└── db/
    ├── client.ts                     # Drizzle client
    └── schema.ts                     # Database schema (shares table)
```

### State Management (`src/store/`)
```
src/store/
└── usePlayerStore.ts                 # Zustand player state
```

---

## 🧪 Tests (`tests/`)

### Unit Tests (`tests/unit/`)
```
tests/unit/
├── CommandPalette.test.tsx           # Command palette tests
├── dp.test.ts                        # DP algorithm tests
├── DPAndTreeVisualizers.test.tsx     # Visualizer tests
├── graph.test.ts                     # Graph algorithm tests
├── GraphVisualizer.test.tsx          # Graph visualizer tests
├── InputPanel.test.tsx               # Input panel tests
├── linear.test.ts                    # Linear structure tests
├── minHeap.test.ts                   # Min heap tests
├── OperationPanel.test.tsx           # Operation panel tests
├── searching.test.ts                 # Searching algorithm tests
├── share.test.ts                     # Share API tests
├── Sidebar.test.tsx                  # Sidebar tests
├── sorting.test.ts                   # Sorting algorithm tests (79 tests)
├── tree.test.ts                      # Tree algorithm tests
└── useAlgorithm.test.ts              # useAlgorithm hook tests
```

### E2E Tests (`tests/e2e/`)
```
tests/e2e/
└── a11y.spec.ts                      # Accessibility tests (Playwright + Axe)
```

### Test Configuration
```
tests/
├── fixtures/                         # Test fixtures (if any)
└── setup.ts                          # Vitest setup file
```

---

## 📚 Documentation (`docs/`)

```
docs/
├── API.md                            # API endpoint documentation
├── ARCHITECTURE.md                   # System architecture overview
├── ENDPOINTS.md                      # Detailed endpoint specs
├── FINAL_IMPLEMENTATION_STATUS.md    # Current implementation status
└── README.md                         # Documentation index
```

---

## 🎨 Public Assets (`public/`)

```
public/
├── file.svg                          # File icon
├── globe.svg                         # Globe icon
├── next.svg                          # Next.js logo
├── og-image.svg                      # Open Graph image
├── vercel.svg                        # Vercel logo
└── window.svg                        # Window icon
```

---

## 🔧 Configuration Files (Root)

| File | Purpose |
|------|---------|
| `.env.example` | Environment variables template |
| `.env.local.example` | Local development env template |
| `.gitignore` | Git ignore patterns |
| `drizzle.config.ts` | Drizzle ORM configuration |
| `eslint.config.mjs` | ESLint rules |
| `next.config.ts` | Next.js configuration |
| `next-env.d.ts` | Next.js TypeScript types |
| `package.json` | Dependencies & scripts |
| `pnpm-lock.yaml` | Package lock file |
| `pnpm-workspace.yaml` | Workspace configuration |
| `tsconfig.json` | TypeScript compiler options |
| `vitest.config.mts` | Vitest test configuration |

---

## 📊 File Counts by Directory

| Directory | Files | Purpose |
|-----------|-------|---------|
| `src/algorithms/` | 144+ | Algorithm implementations |
| `src/components/` | 30+ | React UI components |
| `src/types/` | 12 | TypeScript definitions |
| `tests/unit/` | 15 | Unit tests (340+ test cases) |
| `tests/e2e/` | 1 | E2E tests (4 test cases) |
| `docs/` | 5 | Documentation |

---

## 🗂️ Category Organization

### Algorithms are organized by category:
1. **Sorting** → `src/lib/algorithms/sorting/`
2. **Searching** → `src/lib/algorithms/searching/`
3. **Recursion** → `src/lib/algorithms/recursion/`
4. **Backtracking** → `src/lib/algorithms/backtracking/`
5. **Divide & Conquer** → `src/lib/algorithms/divconquer/`
6. **Linear** → `src/lib/algorithms/linear/`
7. **Heaps** → `src/lib/algorithms/heap/`
8. **Graphs** → `src/lib/algorithms/graph/`
9. **Dynamic Programming** → `src/lib/algorithms/dp/`
10. **Trees** → `src/lib/algorithms/tree/`
11. **Greedy** → `src/lib/algorithms/greedy/`
12. **String** → `src/lib/algorithms/string/`
13. **Bitwise** → `src/lib/algorithms/bitwise/`
14. **Math** → `src/lib/algorithms/math/`
15. **Geometry** → `src/lib/algorithms/geometry/`
16. **Advanced** → `src/lib/algorithms/advanced/`

---

## 🎯 Key Entry Points

| Entry Point | File | Purpose |
|-------------|------|---------|
| Home Page | `src/app/page.tsx` | Redirects to bubble-sort |
| Algorithm Page | `src/app/visualize/[category]/[algorithm]/page.tsx` | Main algorithm view |
| Share Page | `src/app/s/[id]/page.tsx` | Shared visualization |
| API Create Share | `src/app/api/share/route.ts` | POST endpoint |
| API Get Share | `src/app/api/share/[id]/route.ts` | GET endpoint |
| Algorithm Registry | `src/lib/algorithms/registry.ts` | Central registry |

---

**Last Updated**: November 6, 2026  
**Total Files**: 250+ working files (excluding node_modules, .next)  
**Total Algorithms**: 144 fully implemented
