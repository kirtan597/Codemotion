# API Documentation

## Share API Endpoints

### POST `/api/share`

Create a shareable visualization link.

**Request:**
```json
{
  "algorithmId": "bubble-sort",
  "input": { "array": [5, 2, 8, 1, 9] },
  "expiresAt": "2024-12-31T23:59:59Z" // optional
}
```

**Response (201):**
```json
{
  "id": "abc123xyz7"
}
```

**Error Responses:**
- `400` - Invalid input (Zod validation errors)
- `413` - Payload exceeds 50KB limit
- `429` - Rate limit exceeded
- `500` - Internal server error

**Rate Limits:**
- 10 requests per minute per IP
- Token bucket refill: 1 token/minute

---

### GET `/api/share/[id]`

Retrieve a shared visualization and increment view counter.

**Response (200):**
```json
{
  "id": "abc123xyz7",
  "algorithmId": "bubble-sort",
  "input": { "array": [5, 2, 8, 1, 9] },
  "createdAt": "2024-01-15T10:30:00Z",
  "views": 42
}
```

**Error Responses:**
- `404` - Share not found or expired
- `500` - Internal server error

**Notes:**
- View counter is atomically incremented on each GET request
- Expired shares return 404
- Views are permanent and cannot be reset

---

## Implementation Notes

### Database Schema

```typescript
shares {
  id: string (nanoid 10, primary key)
  algorithmId: string
  input: jsonb
  createdAt: timestamp
  expiresAt: timestamp (nullable)
  views: integer (default 0)
}
```

### Security

- No secrets exposed to client
- Rate limiting prevents abuse
- Payload size validation prevents DOS
- Input validation with Zod schemas
- SQL injection protected by Drizzle ORM

### Production Considerations

- Replace in-memory rate limiter with Redis/Upstash for distributed systems
- Set `NEXT_PUBLIC_BASE_URL` for correct share URLs
- Configure `DATABASE_URL` for production Postgres
- Enable HTTPS for share links
- Consider CDN caching for GET requests
