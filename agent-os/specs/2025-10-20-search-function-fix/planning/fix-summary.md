# Search Function Fix - Summary

## Problem

The search function was failing in production on Render with the error:
```
SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON
```

This occurred because the frontend's API routes were trying to connect to Directus using the public URL `https://admin.charlotteudo.org` even for server-side requests.

## Root Cause

On Render, services were not using internal service communication. The frontend was making external HTTP requests to reach the backend Directus instance, even though both services are in the same Render environment.

## Solution

Updated `/Users/nick/Sites/charlotteUDO/frontend/lib/env-config.ts` to:

1. **Detect Render server-side execution** - Check for `typeof window === 'undefined'` and `process.env.RENDER`

2. **Use internal URLs for server-side requests** - When running server-side on Render:
   - Use: `http://udo-backend:10000` (internal Render service URL)
   - Instead of: `https://admin.charlotteudo.org` (public URL)

3. **Keep public URLs for client-side** - Browser requests still use the public URL

## Benefits

✅ **Fixes search function** - API routes can now successfully communicate with Directus
✅ **Better performance** - Internal communication is faster (no external routing)
✅ **Lower costs** - Internal traffic doesn't count against bandwidth limits
✅ **More reliable** - No dependency on external DNS or SSL for internal communication

## Technical Details

### Render Services in Same Environment
- Frontend: `charlotte-udo-frontend` (srv-d3ok19m3jp1c73c2b1ag)
- Backend: `udo-backend` (srv-d1h1b0ali9vc73b71oi0)
- Postgres: `cltudo` (dpg-d1gsdjjipnbc73b509f0-a)
- Environment: `evm-d1gq9mjipnbc73b2qp70` (virginia region)

### Internal Communication Pattern
```typescript
// Server-side (API routes, RSC)
const url = isRenderServerSide
  ? 'http://udo-backend:10000'  // Internal
  : 'https://admin.charlotteudo.org'  // External

// Client-side (browser)
const url = 'https://admin.charlotteudo.org'  // Always external
```

### Environment Variables
The fix uses a new optional environment variable:
- `DIRECTUS_INTERNAL_URL` (optional) - Override default internal URL
- Default: `http://udo-backend:10000`

## Files Modified

1. `/lib/env-config.ts` - Added Render detection and internal URL logic

## Testing

To verify the fix works:

1. Check server logs for: `Using PRODUCTION configuration: http://udo-backend:10000 (server-side: true)`
2. Test search function in production
3. Verify faster response times for search queries

## Next Steps

1. Commit and push changes to GitHub
2. Render will auto-deploy from the master branch
3. Monitor deployment logs
4. Test search function after deployment
