# API Endpoints Reference

## Verified Endpoints

### ✅ POST `/api/share`
**Location**: `src/app/api/share/route.ts`

**Purpose**: Create shareable visualization link

**Request Body**:
```typescript
{
  algorithmId: string;      // e.g., "bubble-sort"
  input: any;               // Algorithm input (array, graph, etc.)
  expiresAt?: string;       // ISO 8601 datetime (optional)
}
```

**Validation**:
- Zod schema validation
- 50KB payload size limit
- Rate limiting: 10 requests/minute per IP

**Success Response (201)**:
```json
{
  "id": "abc123xyz7"
}
```

**Error Responses**:
- `400` - Invalid input with Zod error details
- `413` - Payload exceeds 50KB
- `429` - Rate limit exceeded
- `500` - Internal server error

---

### ✅ GET `/api/share/[id]`
**Location**: `src/app/api/share/[id]/route.ts`

**Purpose**: Retrieve shared visualization and increment view counter

**Path Parameters**:
- `id`: Share ID (10-character nanoid)

**Success Response (200)**:
```json
{
  "id": "abc123xyz7",
  "algorithmId": "bubble-sort",
  "input": { "array": [5, 2, 8, 1, 9] },
  "createdAt": "2024-01-15T10:30:00Z",
  "views": 42
}
```

**Atomicity**: View counter incremented via SQL `UPDATE ... RETURNING`

**Error Responses**:
- `404` - Share not found or expired
- `500` - Internal server error

---

## Frontend Routes

### ✅ `/`
**Location**: `src/app/page.tsx`
**Type**: Static
**Purpose**: Home page

### ✅ `/visualize/[category]/[algorithm]`
**Location**: `src/app/visualize/[category]/[algorithm]/page.tsx`
**Type**: Partial Prerender
**Purpose**: Algorithm visualization page
**Examples**:
- `/visualize/sorting/bubble-sort`
- `/visualize/graph/dijkstra`
- `/visualize/dp/knapsack-01`

**Features**:
- OpenGraph metadata
- URL state parsing (input, speed, step)
- Error boundary (`error.tsx`)
- Loading state (`loading.tsx`)

### ✅ `/s/[id]`
**Location**: `src/app/s/[id]/page.tsx`
**Type**: Dynamic
**Purpose**: Shared visualization viewer
**Example**: `/s/abc123xyz7`

**Features**:
- Server-side data fetching
- View counter display
- 404 for expired/invalid shares

### ✅ `/not-found`
**Location**: `src/app/not-found.tsx`
**Type**: Static
**Purpose**: 404 error page

---

## Database Schema

**Table**: `shares`

```sql
CREATE TABLE shares (
  id TEXT PRIMARY KEY,              -- nanoid(10)
  algorithm_id TEXT NOT NULL,
  input JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  views INTEGER NOT NULL DEFAULT 0
);
```

**Indexes** (recommended for production):
```sql
CREATE INDEX idx_shares_created_at ON shares(created_at);
CREATE INDEX idx_shares_expires_at ON shares(expires_at) WHERE expires_at IS NOT NULL;
```

---

## Rate Limiting

**Implementation**: Token bucket (in-memory)

**Configuration**:
- `maxTokens`: 10
- `refillRate`: 1 token/minute
- `refillInterval`: 60 seconds

**Identifier**: Client IP from headers:
1. `x-forwarded-for` (first IP)
2. `x-real-ip`
3. Fallback: `"unknown"`

**Production**: Replace with Redis/Upstash for distributed systems

---

## Testing Endpoints

### Manual Testing

**Create Share**:
```bash
curl -X POST http://localhost:3000/api/share \
  -H "Content-Type: application/json" \
  -d '{
    "algorithmId": "bubble-sort",
    "input": {"array": [5,2,8,1,9]}
  }'
```

**Retrieve Share**:
```bash
curl http://localhost:3000/api/share/{id}
```

### Unit Tests

**Location**: `tests/unit/share.test.ts`

**Coverage**:
- Schema validation (valid/invalid inputs)
- Payload size limits
- Zod error formatting
- Share expiration logic

### E2E Tests

**Location**: `tests/e2e/share.spec.ts` (to be created)

**Flow**:
1. Create share via POST
2. Verify ID returned
3. Retrieve via GET
4. Verify data matches
5. Verify view counter incremented

---

## Debugging

### Common Issues

**1. "DATABASE_URL not set"**
- Solution: Create `.env` with `DATABASE_URL=postgresql://...`

**2. 404 on `/api/share/[id]`**
- Check database connection
- Verify share ID exists
- Check expiration date

**3. Rate limit triggered immediately**
- In-memory store persists between requests
- Restart server or wait 1 minute

**4. Share URL not working**
- Set `NEXT_PUBLIC_BASE_URL` in production
- Verify HTTPS enabled

### Development Tools

**Database inspection**:
```bash
npx drizzle-kit studio
```

**API testing**:
- Postman/Insomnia collections
- Thunder Client (VS Code)
- cURL scripts

**Logging**:
```typescript
// Enable in route handlers
console.log('Share created:', { id, algorithmId });
```
