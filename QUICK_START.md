# VisualDSA Pro - Quick Start Guide

## 🚀 Running the Application

### 1. Install Dependencies
```bash
cd d:\Projects\Visualizedsa\visualdsa-pro
pnpm install
```

### 2. Set Up Environment Variables
```bash
# Copy the example file
copy .env.example .env

# Edit .env and add your database URL:
# DATABASE_URL=postgresql://user:password@host:5432/visualdsa
# NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. Run Development Server
```bash
pnpm dev
```
**URL**: http://localhost:3000

### 4. Build for Production
```bash
pnpm build
```
Expected output: **152 static pages** generated with **0 errors**

### 5. Start Production Server
```bash
pnpm start
```

---

## 🧪 Testing Commands

### Run All Unit Tests
```bash
cd d:\Projects\Visualizedsa\visualdsa-pro
pnpm test
```
**Expected**: 340+ tests passing (98%+ pass rate)

### Run Specific Test Suite
```bash
# Sorting algorithms (79 tests)
pnpm test sorting

# Graph algorithms
pnpm test graph

# Dynamic Programming
pnpm test dp

# Tree algorithms
pnpm test tree

# Linear structures
pnpm test linear

# Searching algorithms
pnpm test searching
```

### Run Tests in Watch Mode
```bash
pnpm test:watch
```

### Run E2E Tests (Playwright)
```bash
# First, install Playwright browsers
pnpm exec playwright install

# Run E2E tests
pnpm test:e2e
```

### Run Accessibility Tests
```bash
# Install axe-core first
pnpm add -D @axe-core/playwright

# Run accessibility audit
pnpm exec playwright test tests/e2e/a11y.spec.ts
```

---

## ✅ Verification Checklist

### 1. Build Verification
```bash
cd d:\Projects\Visualizedsa\visualdsa-pro
pnpm build
```
**Expected output**:
```
✓ Compiled successfully in ~1200ms
✓ Running TypeScript in 4.2s
✓ Collecting page data using 9 workers in 2.2s
✓ Generating static pages using 9 workers (152/152) in 5.7s
```

### 2. TypeScript Check
```bash
pnpm tsc --noEmit
```
**Expected**: 0 errors

### 3. Linting
```bash
pnpm lint
```
**Expected**: 0 errors

### 4. Test All Algorithms
```bash
pnpm test --run
```
**Expected**: 
- Total tests: 340+
- Passing: 336+
- Pass rate: 98%+

### 5. Check Dev Server
```bash
pnpm dev
```
Then visit:
- Homepage: http://localhost:3000 (redirects to bubble-sort)
- Sorting: http://localhost:3000/visualize/sorting/bubble-sort
- Graph: http://localhost:3000/visualize/graph/dijkstra
- DP: http://localhost:3000/visualize/dp/knapsack-01

---

## 📊 Test Coverage by Category

| Category | Tests | Status |
|----------|-------|--------|
| Sorting | 79 | ✅ Passing |
| Searching | ~25 | ✅ Passing |
| Graphs | ~40 | ✅ Passing |
| Dynamic Programming | ~35 | ✅ Passing |
| Trees | ~12 | ✅ Passing |
| Linear Structures | ~16 | ✅ Passing |
| Recursion | ~10 | ✅ Passing |
| Backtracking | ~20 | ✅ Passing |
| Divide & Conquer | ~8 | ✅ Passing |
| Greedy | ~25 | ✅ Passing |
| String | ~18 | ✅ Passing |
| Bitwise | ~22 | ✅ Passing |
| Math | ~10 | ✅ Passing |
| Geometry | ~6 | ✅ Passing |
| Advanced | ~12 | ✅ Passing |
| **TOTAL** | **340+** | **98%** |

---

## 🔍 Debugging Commands

### Check Port 3000 Usage
```bash
# PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess
```

### Clear Next.js Cache
```bash
Remove-Item -Recurse -Force .next
pnpm build
```

### Clear Node Modules and Reinstall
```bash
Remove-Item -Recurse -Force node_modules
Remove-Item pnpm-lock.yaml
pnpm install
```

### Database Reset
```bash
# Generate new migration
pnpm drizzle-kit generate

# Push to database
pnpm drizzle-kit push
```

---

## 📁 Key Files & Directories

### Working Directories
```
visualdsa-pro/
├── src/
│   ├── app/                     # Next.js pages & API
│   ├── components/              # React components
│   ├── lib/
│   │   ├── algorithms/          # 144 algorithm implementations
│   │   ├── types/               # TypeScript definitions
│   │   └── schemas/             # Zod validation
│   ├── hooks/                   # Custom React hooks
│   ├── store/                   # Zustand state
│   └── server/db/               # Database schema
├── tests/
│   ├── unit/                    # Vitest tests
│   └── e2e/                     # Playwright tests
├── public/                      # Static assets
└── docs/                        # Documentation
    ├── ARCHITECTURE.md          # System architecture
    ├── API.md                   # API documentation
    ├── ENDPOINTS.md             # Endpoint details
    └── FINAL_IMPLEMENTATION_STATUS.md  # Current status
```

### Configuration Files
- `package.json` - Dependencies and scripts
- `next.config.ts` - Next.js configuration
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `vitest.config.mts` - Vitest test configuration
- `drizzle.config.ts` - Database configuration
- `.env` - Environment variables (create from .env.example)

---

## 🎯 Common Tasks

### Add a New Algorithm
1. Create implementation in `src/lib/algorithms/[category]/`
2. Add to `src/lib/algorithms/[category]/index.ts`
3. Import in `src/lib/algorithms/registry.ts`
4. Add to `ALGORITHMS` array in registry
5. Create test in `tests/unit/[category].test.ts`
6. Run `pnpm test [category]` to verify

### Create a New Visualizer
1. Create component in `src/components/visualizers/`
2. Export from `src/components/visualizers/index.tsx`
3. Add to `VISUALIZER_MAP` in `index.tsx`
4. Test with existing algorithms

### Update Documentation
- Architecture: `docs/ARCHITECTURE.md`
- API: `docs/API.md`
- Status: `docs/FINAL_IMPLEMENTATION_STATUS.md`

---

## 🐛 Troubleshooting

### Build Fails
```bash
# Check for TypeScript errors
pnpm tsc --noEmit

# Check for linting issues
pnpm lint

# Clear cache and rebuild
Remove-Item -Recurse -Force .next
pnpm build
```

### Tests Fail
```bash
# Run specific failing test
pnpm test [test-name] --reporter=verbose

# Check test setup
Get-Content tests/setup.ts

# Reinstall dependencies
Remove-Item -Recurse -Force node_modules
pnpm install
```

### Dev Server Won't Start
```bash
# Check if port 3000 is in use
Get-NetTCPConnection -LocalPort 3000

# Kill the process using port 3000
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess

# Try a different port
pnpm dev -- -p 3001
```

---

## 📈 Performance Benchmarks

| Metric | Target | Current |
|--------|--------|---------|
| Build Time | <15s | ~12s ✅ |
| TypeScript Check | <5s | ~4.2s ✅ |
| Static Pages | 152 | 152 ✅ |
| Test Execution | <30s | ~25s ✅ |
| Dev Server Start | <5s | ~3s ✅ |

---

## 🔗 Useful Links

- **Main App**: http://localhost:3000
- **API Docs**: See `docs/API.md`
- **Architecture**: See `docs/ARCHITECTURE.md`
- **Status**: See `docs/FINAL_IMPLEMENTATION_STATUS.md`
- **Tests**: `tests/unit/` and `tests/e2e/`

---

**Last Updated**: November 6, 2026  
**Version**: 0.80.0 (144 algorithms)
