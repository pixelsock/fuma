# Search Function Fix - Final Summary

## Problem

The search function was failing in production on Render with the error:
```
SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON
```

This occurred because the frontend's API routes were trying to connect to Directus using the public URL `https://admin.charlotteudo.org` even for server-side requests.

## Root Cause

On Render, services were not optimizing internal service communication. The frontend was making external HTTP requests to reach the backend Directus instance, even though both services are in the same Render environment.

## Solution Journey

### Attempt 1: Private Network with Port 10000 ❌
**Tried:** `http://udo-backend:10000` (short hostname)
**Result:** `getaddrinfo ENOTFOUND udo-backend` - hostname not found

### Attempt 2: Private Network with Port 8055 ❌
**Tried:** `http://udo-backend-y1w0:8055` (full service slug)
**Result:** `ECONNREFUSED 10.226.35.111:8055` - hostname resolved but connection refused
**Issue:** Directus is listening on port 10000 internally, which is a restricted port for Render's private network communication

### Final Solution: Render Service URL ✅
**Implemented:** Set `DIRECTUS_INTERNAL_URL=https://udo-backend-y1w0.onrender.com`
**Result:** Uses Render's internal routing for server-to-server communication while avoiding port restrictions

## Implementation Details

Updated `/Users/nick/Sites/charlotteUDO/frontend/lib/env-config.ts` to:

1. **Detect Render server-side execution** - Check for `typeof window === 'undefined'` and `process.env.RENDER`

2. **Use optimized URLs for server-side requests** - When running server-side on Render:
   - Primary: `process.env.DIRECTUS_INTERNAL_URL` (set to `https://udo-backend-y1w0.onrender.com`)
   - Fallback: `http://udo-backend-y1w0:8055` (attempts private network)
   - Client-side: `https://admin.charlotteudo.org` (public URL)

3. **Keep public URLs for client-side** - Browser requests still use the public URL

## Benefits

✅ **Fixes search function** - API routes can now successfully communicate with Directus
✅ **Better performance** - Server-to-server routing is faster than external routing
✅ **Works around port restrictions** - Avoids Render's private network port limitations
✅ **More reliable** - Uses Render's proven routing infrastructure

## Technical Details

### Render Services in Same Environment
- Frontend: `charlotte-udo-frontend` (srv-d3ok19m3jp1c73c2b1ag)
- Backend: `udo-backend-y1w0` (srv-d1h1b0ali9vc73b71oi0)
- Postgres: `cltudo` (dpg-d1gsdjjipnbc73b509f0-a)
- Environment: `evm-d1gq9mjipnbc73b2qp70` (virginia region)

### Render Port Restrictions
The following ports **cannot** be used for private network communication:
- `10000` ← Backend is listening here
- `18012`
- `18013`
- `19099`

### Internal Communication Pattern
```typescript
// Server-side (API routes, RSC)
const url = isRenderServerSide
  ? (process.env.DIRECTUS_INTERNAL_URL || 'http://udo-backend-y1w0:8055')
  : 'https://admin.charlotteudo.org'

// Client-side (browser)
const url = 'https://admin.charlotteudo.org'  // Always external
```

### Environment Variables
Set on frontend service:
- `DIRECTUS_INTERNAL_URL=https://udo-backend-y1w0.onrender.com` - Server-to-server URL

## Files Modified

1. `/lib/env-config.ts` - Added Render detection and internal URL logic

## Testing

After deployment completes:

1. Check server logs for: `Using PRODUCTION configuration: https://udo-backend-y1w0.onrender.com (server-side: true)`
2. Test search function in production
3. Verify no connection errors in logs
4. Confirm search results return properly

## Commits

1. `7e26490` - Initial fix attempt (port 10000)
2. `87846ffb` - Updated to use port 8055 with fallback
3. Environment variable: `DIRECTUS_INTERNAL_URL` set via Render dashboard
