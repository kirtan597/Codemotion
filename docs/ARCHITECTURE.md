# Architecture Overview

## Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript 5
- **UI**: React 19
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Validation**: Zod

### Backend
- **Runtime**: Node.js (Next.js API Routes)
- **Database**: PostgreSQL (Neon Serverless)
- **ORM**: Drizzle
- **ID Generation**: nanoid

### Testing
- **Unit Tests**: Vitest
- **E2E Tests**: Playwright
- **Accessibility**: Axe Core

---

## Directory Structure

```
src/
├── app/                          Next.js App Router
│   ├── api/share/               Backend API endpoints
│   ├── s/[id]/                  Shared visualization pages
│   ├── visualize/[category]/    Algorithm pages
│   └── (root pages)
│
├── components/
│   ├── inspector/               Code viewer, logs, algorithm info
│   ├── layout/                  Sidebar, command palette, compare mode
│   ├── player/                  Playback controls
│   ├── shared/                  Share button, export, live region
│   └── visualizers/             Algorithm visualizations
│
├── hooks/                        Custom React hooks
│   ├── useAlgorithm.ts          Algorithm state management
│   ├── useGraphEditor.ts        Graph editing logic
│   └── useLocalStorage.ts       SSR-safe localStorage
│
├── lib/
│   ├── algorithms/              Algorithm implementations
│   │   ├── sorting/            Bubble, selection, insertion, merge, quick, heap
│   │   ├── searching/          Linear, binary
│   │   ├── graph/              Dijkstra, BFS, DFS
│   │   ├── tree/               BST operations
│   │   ├── dp/                 Knapsack, LCS
│   │   └── linear/             Stack, queue, linked list
│   ├── schemas/                 Zod validation
│   └── types/                   TypeScript definitions
│
├── server/
│   └── db/                      Database layer
│       ├── schema.ts           Drizzle schema (shares table)
│       └── client.ts           Database connection
│
└── store/                       Zustand stores
    └── usePlayerStore.ts       Playback state
```

---

## Data Flow

### Visualization Flow
1. User selects algorithm → Route to `/visualize/[category]/[algorithm]`
2. `useAlgorithm` hook loads definition and generates snapshots
3. Snapshots stored in `usePlayerStore` (Zustand)
4. Player controls update `currentFrame`
5. Active snapshot drives visualizer component
6. Inspector tabs (code, log, info) react to frame changes

### Share Flow
1. User clicks Share → `ShareButton` component
2. Try POST `/api/share` with current state
3. Backend validates (Zod), rate-limits, stores in DB
4. Return short ID (nanoid 10)
5. Copy `{origin}/s/{id}` to clipboard
6. Share page fetches via GET `/api/share/[id]`
7. Server atomically increments views
8. Hydrate `VisualizerView` with shared state

### URL State Flow
1. URL params parsed with `parseUrlState` (Zod)
2. Applied to algorithm input, speed, step on mount
3. Falls back to defaults if invalid
4. Share button serializes state to URL params as backup

---

## State Management

### Global State (Zustand)
- `usePlayerStore`: currentFrame, snapshots, speed, playback controls
- Persisted: speed in localStorage (SSR-safe)

### Local State (React)
- Component UI state (tabs, modals, focus)
- Form inputs before submission
- Transient animations

### URL State
- Algorithm selection (route params)
- Playback state (search params)
- Shareable links (database + URL fallback)

---

## Performance Optimizations

1. **Virtualization**: LogTab renders only visible rows (5,000+ snapshots)
2. **Memoization**: Algorithm snapshots cached until input changes
3. **Code Splitting**: Dynamic imports for visualizer components
4. **Lazy DB Init**: Database connection on first use
5. **Static Generation**: Algorithm pages pre-rendered at build
6. **Partial Prerendering**: Next.js PPR for instant navigation

---

## Accessibility

- **ARIA live regions**: Screen reader announcements for step changes
- **Keyboard navigation**: Full operability without mouse
- **Focus management**: Visible focus indicators, logical tab order
- **Reduced motion**: Respects `prefers-reduced-motion`
- **Color blindness**: Icon/pattern overlays (future enhancement)
- **Semantic HTML**: Proper heading hierarchy, landmarks
- **Axe compliance**: Automated accessibility testing

---

## Security

### Frontend
- No secrets in client code
- XSS protection via React escaping
- CSRF protection via SameSite cookies (Next.js default)

### Backend
- SQL injection prevented by Drizzle ORM
- Input validation with Zod schemas
- Rate limiting (token bucket)
- Payload size limits (50KB)
- No authentication required (stateless API)

### Production Hardening
- HTTPS required for production
- CSP headers recommended
- Rate limiting with Redis/Upstash
- Database connection pooling
- Error handling without stack traces

---

## Deployment

### Vercel (Recommended)
1. Connect GitHub repository
2. Set environment variables
3. Deploy (automatic builds on push)

### Self-Hosted
1. Build: `npm run build`
2. Set `DATABASE_URL` and `NEXT_PUBLIC_BASE_URL`
3. Run migrations: `npx drizzle-kit migrate`
4. Start: `npm start`
5. Reverse proxy (Nginx/Caddy) for HTTPS

### Database
- Neon (serverless, recommended)
- Railway, Supabase, AWS RDS
- Self-hosted PostgreSQL 14+

---

## Testing Strategy

### Unit Tests (Vitest)
- Zod schema validation
- Algorithm correctness
- Pure function logic
- Mock database operations

### E2E Tests (Playwright)
- User flows (select algorithm → visualize → export)
- Share link creation and retrieval
- Keyboard navigation
- Accessibility (Axe)

### Manual Testing
- Visual regression (Percy/Chromatic)
- Mobile responsiveness
- Screen reader compatibility
- Performance profiling
