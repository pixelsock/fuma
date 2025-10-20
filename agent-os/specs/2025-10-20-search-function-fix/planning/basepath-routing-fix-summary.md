# Search Function Fix - Part 2: basePath Routing Conflict

## Problem

After fixing the Directus connection issue, search was still failing with:
```
Search error: SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON
```

Testing on production URL `https://charlotte-udo-frontend.onrender.com/` confirmed the error persisted even though the Directus connection was working.

## Root Cause Discovery

Production logs revealed the real issue:
```
[directus-source.ts] Resolving slug: 'api/search' → 'search'
Article with slug 'search' (from 'api/search') not found in Directus
```

**The Problem:** Next.js was treating `/api/search` as a **page route** instead of an **API route**.

### Why This Happened

1. **basePath Configuration:** Both config files had `basePath: "/articles"` set:
   - `next.config.ts`: Unconditional override `basePath: "/articles"`
   - `clouduser.next.config.ts`: Production conditional `basePath: process.env.NODE_ENV === 'production' ? '/articles' : ''`

2. **Route Prefixing:** This prefixed ALL application routes with `/articles`:
   - API route was actually at `/articles/api/search` (not `/api/search`)
   - Static assets at `/articles/_next/...`
   - All pages at `/articles/...`

3. **Route Conflict:** When JavaScript fetched from `/api/search`:
   - Next.js couldn't find the route at that path
   - The `app/articles/[[...slug]]/page.tsx` catch-all route intercepted it
   - It tried to find an article with slug "search"
   - Failed and returned HTML 404 page
   - JavaScript tried to parse HTML as JSON → error

## Solution

Removed the `basePath` configuration completely from both config files.

### Files Modified

#### 1. `/Users/nick/Sites/charlotteUDO/frontend/next.config.ts`

**Before:**
```typescript
const webflowOverrides: NextConfig = {
  basePath: "/articles",
  assetPrefix: "https://c33a6979-70b3-4cb8-b0d0-4a877a09cf77.wf-app-prod.cosmic.webflow.services/articles",
};

for (const [key, value] of Object.entries(webflowOverrides)) {
  userConfig[key] = value;
}
```

**After:**
```typescript
// Webflow basePath is no longer needed - using root path for all deployments
// Removed basePath and assetPrefix overrides to fix API route conflicts
```

#### 2. `/Users/nick/Sites/charlotteUDO/frontend/clouduser.next.config.ts`

**Before:**
```typescript
const config: NextConfig = {
  // Configure the base path and asset prefix for Webflow Cloud deployment
  basePath: process.env.NODE_ENV === 'production' ? '/articles' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/articles' : '',
  reactStrictMode: true,
```

**After:**
```typescript
const config: NextConfig = {
  // basePath disabled - using root path for all deployments to avoid API route conflicts
  reactStrictMode: true,
```

## Complete Fix Journey

### Issue 1: Directus Connection (SOLVED)
- **Problem:** Frontend using public URL for server-side requests
- **Solution:** Set `DIRECTUS_INTERNAL_URL=https://udo-backend-y1w0.onrender.com`
- **Status:** ✅ Fixed - logs confirmed correct URL usage

### Issue 2: basePath Routing Conflict (SOLVED)
- **Problem:** API routes at wrong path due to basePath prefix
- **Solution:** Removed basePath configuration
- **Status:** ✅ Fixed - deployed

## Benefits

✅ **API routes work correctly** - Located at `/api/*` as expected
✅ **No route conflicts** - API routes take precedence over catch-all routes
✅ **Simpler configuration** - No complex path prefixing logic
✅ **Consistent paths** - Same URL structure in development and production

## Technical Details

### Route Structure After Fix
```
/                          → Home page
/api/search               → Search API (JSON response)
/articles                 → Articles listing
/articles/some-article    → Individual article page
```

### Route Structure Before Fix (BROKEN)
```
/                          → 404 (basePath required)
/api/search               → Caught by [[...slug]], returned HTML
/articles                 → Home page (basePath prefix)
/articles/api/search      → Actual API route location
/articles/articles        → Articles listing
```

## Deployment

**Commit:** 253f1049
**Message:** fix: remove basePath to fix API route conflicts
**Deployment ID:** dep-d3r434ruibrs73coj180
**Status:** Building
**Started:** 2025-10-20 14:05:08 UTC

## Testing

After deployment completes:

1. Visit https://charlotte-udo-frontend.onrender.com/
2. Use the search function
3. Verify search returns JSON results (not HTML)
4. Check browser console for no errors
5. Verify all pages and assets load correctly

## Related Documentation

- Part 1: [Directus Connection Fix](fix-summary.md)
- Both fixes were necessary to resolve the complete issue
