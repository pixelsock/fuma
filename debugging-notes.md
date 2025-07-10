# Debugging Notes - Next.js 500 Error Analysis

## Task: Step 1 - Reproduce Failure and Capture Stack Trace

**Date:** 2025-06-27  
**Server:** Next.js 15.3.2 (Turbopack)  
**Port:** http://localhost:3002

## Testing Results

### URL Testing Results:
- `/` - ✅ 200 OK (works fine)
- `/docs` - ✅ 200 OK (loads but with Directus errors in console)  
- `/docs/test` - ❌ 500 Internal Server Error  
- `/docs/my-article` - ❌ 500 Internal Server Error (expected)

## 🚨 CRITICAL ERROR FOUND - Status 500

### Stack Trace Details

**Error Location:** `./node_modules/fumadocs-mdx/dist/chunk-7SSA5RCV.js:2:1`

**Root Cause:** Module resolution error in fumadocs-mdx package

```
⨯ ./node_modules/fumadocs-mdx/dist/chunk-7SSA5RCV.js:2:1
Module not found: Can't resolve 'fs'
  1 | // src/runtime/index.ts
> 2 | import fs from "fs";
    | ^^^^^^^^^^^^^^^^^^^^
  3 | var _runtime = {
  4 |   doc(files) {
  5 |     return files.map((file) => {
```

**Reference:** https://nextjs.org/docs/messages/module-not-found

### Error Analysis

1. **Primary Issue:** The `fumadocs-mdx` package is trying to import the Node.js `fs` module in client-side code
2. **Trigger:** When accessing dynamic docs routes like `/docs/test` or `/docs/[slug]`
3. **Framework Issue:** Next.js cannot resolve the `fs` module in the browser environment
4. **Package:** fumadocs-mdx runtime attempting to use server-side Node.js APIs in client bundle

### Secondary Issues Observed

**Directus API Error (Non-blocking):**
```
Error generating article params from Directus: {
  errors: [
    {
      message: `Invalid query. You can't filter for an empty string in "_neq". Use "_empty" or "_nempty" instead.`,
      extensions: [Object]
    }
  ],
  response: Response {
    status: 400,
    statusText: 'Bad Request',
    ...
    url: 'http://localhost:8055/items/articles?fields=id%2Cslug%2Cstatus&filter=%7B%22slug%22%3A%7B%22_nnull%22%3Atrue%2C%22_neq%22%3A%22%22%7D%2C%22status%22%3A%7B%22_in%22%3A%5B%22publish%22%2C%22published%22%5D%7D%7D'
  }
}
```

**Directus API Issue:** Invalid query filter using `_neq` with empty string instead of `_nempty`

### HTTP Response Summary
- `/docs/test GET 500 in 1111ms` (First compilation attempt)
- `/docs/test GET 500 in 51ms` (Subsequent requests)
- Multiple compilation errors repeating the same `fs` module resolution issue

### Next Steps for Resolution
1. **Fix fumadocs-mdx bundling** - Ensure `fs` imports are properly configured for server-side only
2. **Fix Directus query filter** - Replace `_neq: ""` with `_nempty: true` in article queries
3. **Verify Next.js configuration** - Check webpack/bundling config for proper server/client separation

---

**Status:** ✅ COMPLETED - Stack trace captured and root cause identified
**Location:** `./node_modules/fumadocs-mdx/dist/chunk-7SSA5RCV.js:2:1`
**Error Type:** Module resolution error (Node.js `fs` module in client bundle)

---

## NEW ERROR - Array.at() TypeError (2025-07-01)

### Error Details
```
TypeError: items.at is not a function
    at SearchResults (http://localhost:3000/_next/static/chunks/node_modules_064b1ca3._.js:9600:48)
    at SearchDialog (http://localhost:3000/_next/static/chunks/node_modules_064b1ca3._.js:9568:254)
    at DefaultSearchDialog (http://localhost:3000/_next/static/chunks/node_modules_064b1ca3._.js:9816:190)
    at SearchProvider (http://localhost:3000/_next/static/chunks/node_modules_d5ce5dca._.js:607:215)
    at RootProvider (http://localhost:3000/_next/static/chunks/node_modules_d5ce5dca._.js:752:221)
    at RootProvider (http://localhost:3000/_next/static/chunks/node_modules_d5ce5dca._.js:5281:197)
    at Layout
```

### Analysis
- **Issue:** Fumadocs UI components are using `Array.prototype.at()` which is ES2022
- **Browser Support:** Not available in older browsers or certain environments
- **Location:** SearchResults component in fumadocs-ui
- **Current Solution:** Polyfill exists but may not be loading early enough

### Current Polyfill Setup
- ✅ `/public/array-at-polyfill.js` exists
- ✅ Layout includes Script with `beforeInteractive` strategy
- ❌ Still getting the error - timing issue likely

### Status
🔍 **INVESTIGATING** - Polyfill timing or loading issue
