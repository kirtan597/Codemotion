# CodeMotion - Interactive Algorithm Visualizer

🚀 Experience algorithms in motion with beautiful, interactive visualizations.

![Algorithms](https://img.shields.io/badge/algorithms-144-success)
![Coverage](https://img.shields.io/badge/coverage-80%25-blue)
![Build](https://img.shields.io/badge/build-passing-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)
![Tests](https://img.shields.io/badge/tests-340%2B-green)

**144 algorithms** across **16 categories** with interactive visualizations, step-by-step execution, and real-time complexity analysis.

🌐 **Website**: [codemotion.dev](https://codemotion.dev)

---

## Project Structure

```
visualdsa-pro/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # Backend API routes
│   │   │   └── share/            # Share link endpoints
│   │   ├── s/[id]/               # Shared visualization pages
│   │   ├── visualize/            # Algorithm visualization pages
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   ├── not-found.tsx
│   │   └── error.tsx
│   ├── components/               # React components
│   │   ├── inspector/            # Code viewer, logs, info tabs
│   │   ├── layout/               # Sidebar, command palette, compare mode
│   │   ├── player/               # Playback controls
│   │   ├── shared/               # Reusable UI components
│   │   └── visualizers/          # Algorithm-specific visualizations
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # Core logic
│   │   ├── algorithms/           # Algorithm implementations
│   │   │   ├── sorting/
│   │   │   ├── searching/
│   │   │   ├── graph/
│   │   │   ├── tree/
│   │   │   ├── dp/
│   │   │   └── linear/
│   │   ├── schemas/              # Zod validation schemas
│   │   ├── types/                # TypeScript types
│   │   └── rate-limit.ts         # Rate limiting logic
│   ├── server/                   # Backend logic
│   │   └── db/                   # Database layer
│   │       ├── schema.ts         # Drizzle ORM schema
│   │       └── client.ts         # Database client
│   └── store/                    # Zustand state management
├── tests/                        # Test suites
│   ├── e2e/                      # Playwright E2E tests
│   └── unit/                     # Vitest unit tests
├── drizzle/                      # Database migrations
├── public/                       # Static assets
├── .env.example                  # Environment variables template
├── drizzle.config.ts             # Drizzle configuration
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── vitest.config.ts              # Vitest configuration
├── playwright.config.ts          # Playwright configuration
└── package.json
```

## Algorithm Categories (144 total)

### 🔢 Sorting (9)
Bubble, Selection, Insertion, Merge, Quick, Heap, Counting, Radix, Bucket

### 🔍 Searching (2)
Linear, Binary

### 🔄 Recursion (3)
Factorial, Fibonacci, Tower of Hanoi

### 🔙 Backtracking (8)
N-Queens, Sudoku Solver, Subset Sum, Permutations, Rat in Maze, Combination Sum, Graph Coloring, Generate Parentheses

### ✂️ Divide & Conquer (3)
Binary Search (DC), Maximum Subarray, Min-Max

### 📊 Linear Structures (3)
Stack (Push/Pop/Peek), Queue (Enqueue/Dequeue/Peek), Linked List (Insert/Delete/Search/Reverse)

### 🏔️ Heaps (2)
Min Heap, Max Heap

### 🕸️ Graphs (27)
**Traversal**: BFS, DFS, Recursive DFS, Bidirectional BFS, 0-1 BFS, Connected Components  
**Shortest Path**: Dijkstra, Bellman-Ford, Floyd-Warshall, A*  
**MST**: Kruskal, Prim  
**Topological Sort**: Kahn's, DFS-based  
**Cycle Detection**: DFS-based, Union-Find  
**SCC**: Kosaraju, Tarjan  
**Connectivity**: Bridges, Articulation Points  
**Bipartite**: Bipartite Check  
**Eulerian**: Eulerian Path, Hierholzer  
**Network Flow**: Ford-Fulkerson, Edmonds-Karp

### 🧩 Dynamic Programming (28)
0/1 Knapsack, LCS, Coin Change, Edit Distance, Max Subarray Sum, Climbing Stairs, LIS, Matrix Chain, Rod Cutting, Subset Sum, LPS, House Robber, Partition Equal, Min Path Sum, Word Break, Decode Ways, Unique Paths, Jump Game, Palindrome Partition, Longest Common Substring, Distinct Subsequences, Regex Matching, Interleaving String, Wildcard Matching, Maximal Square, Fibonacci (DP), Min Cost Stairs, Catalan Number

### 🌲 Trees (1)
Binary Search Tree (Insert/Search/Delete/Inorder/Preorder/Postorder/Level-order)

### 🎯 Greedy (16)
Activity Selection, Job Sequencing, Fractional Knapsack, Huffman Coding, Coin Change (Greedy), Kruskal, Prim, Min Platforms, Interval Scheduling, Connect Ropes, Buy Max Items, Task Scheduling, Graph Coloring (Greedy), Water Connection, Maximize Sum, Egyptian Fraction

### 📝 String Algorithms (9)
Naive, KMP, Rabin-Karp, Boyer-Moore, Z-Algorithm, Manacher's, Longest Palindromic Substring, Levenshtein Distance, Suffix Array

### 🔢 Bit Manipulation (11)
AND, XOR, Left Shift, Right Shift, Count Set Bits, Brian Kernighan, Power of Two, Check/Set/Clear/Toggle Kth Bit

### 🔬 Mathematical (4)
Sieve of Eratosthenes, Euclidean GCD, Fast Exponentiation, Pascal's Triangle

### 📐 Computational Geometry (2)
Graham Scan (Convex Hull), Closest Pair of Points

### 🏗️ Advanced Structures (5)
Segment Tree, Trie, Fenwick Tree, Bidirectional BFS, 0-1 BFS

---

## Features

### Frontend
- **Algorithm Visualizations**: Sorting, searching, graph, tree, and DP algorithms
- **Interactive Inspector**: Code viewer with syntax highlighting, execution logs, algorithm info
- **Playback Controls**: Step-by-step execution with speed control
- **Compare Mode**: Side-by-side algorithm comparison with synchronized playback
- **Share & Export**: URL state sharing, JSON export, PNG frame export
- **Accessibility**: ARIA live regions, keyboard navigation, reduced motion support, axe compliance

### Backend
- **Share API**: Create and retrieve shareable visualization links
- **Database**: PostgreSQL with Drizzle ORM (Neon serverless)
- **Rate Limiting**: Token bucket algorithm (in-memory, production-ready for Upstash)
- **Validation**: Zod schemas with 50KB payload cap

## Setup

### Prerequisites
- Node.js 20+
- PostgreSQL database (Neon recommended)

### Installation

```bash
npm install
```

### Environment Variables

Create `.env` file:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/visualdsa
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Database Setup

```bash
# Generate migration
npx drizzle-kit generate

# Run migration
npx drizzle-kit migrate
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

## Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Accessibility Check
```bash
npx playwright test tests/e2e/a11y.spec.ts
```

## API Endpoints

### POST `/api/share`
Create shareable link
- **Body**: `{ algorithmId: string, input: any, expiresAt?: string }`
- **Response**: `{ id: string }`
- **Limits**: 50KB payload, rate limited

### GET `/api/share/[id]`
Retrieve shared visualization
- **Response**: `{ id, algorithmId, input, createdAt, views }`
- **Status**: 404 if expired or not found

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State**: Zustand
- **Animations**: Framer Motion
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod
- **Testing**: Vitest + Playwright + Axe
- **Icons**: Lucide React

## License

MIT © CodeMotion Team

---

**CodeMotion** - Where algorithms come to life 🎬✨
