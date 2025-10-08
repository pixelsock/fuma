# Manual Steps to Fix Netlify Deployment

## Issue Summary
The Netlify builds are reusing cached static assets that were generated with the wrong Directus URL. Even though we've updated the environment variables, the cached pages still have the old fallback data.

## Solution: Clear Build Cache and Rebuild

### Option 1: Clear Cache via Netlify Dashboard (Recommended)
1. Go to https://app.netlify.com/projects/charlotte-udo-docs
2. Click on "Deploys" in the sidebar
3. Click "Trigger deploy" button (dropdown)
4. Select "**Clear cache and deploy site**"
5. Wait for the build to complete (~2-3 minutes)

This will force Netlify to rebuild everything from scratch using the correct environment variables.

### Option 2: Make a Small Code Change
Alternatively, make any small change to your code and commit+push to force a fresh build:

```bash
cd /Users/nick/Sites/charlotteUDO/directus/frontend-fumadocs/fuma
echo "# Build cache cleared" >> README.md
git add README.md
git commit -m "Force cache clear"
git push origin master
```

Then Netlify will automatically detect the change and trigger a new build from scratch.

## What We Fixed

### 1. Directus CORS on Render ✅
Added these environment variables to your Directus service on Render:
- `CORS_ENABLED=true`
- `CORS_ORIGIN=https://charlotte-udo-docs.netlify.app,https://*.netlify.app,http://localhost:3002,http://localhost:3000`
- `RATE_LIMITER_ENABLED=false`

### 2. Netlify Environment Variables ✅
Updated all Directus URLs in Netlify to point to the correct Render instance:
- `LOCAL_DIRECTUS_URL=https://udo-backend-y1w0.onrender.com`
- `PRODUCTION_DIRECTUS_URL=https://udo-backend-y1w0.onrender.com`
- `NEXT_PUBLIC_DIRECTUS_URL=https://udo-backend-y1w0.onrender.com`
- `DIRECTUS_URL=https://udo-backend-y1w0.onrender.com`

All tokens and credentials are properly configured.

### 3. Verification ✅
Tested Directus API directly with curl - it's working perfectly and returning real article data.

## Expected Result After Cache Clear
Once you clear the build cache and rebuild, the site should:
- ✅ Fetch real articles from Directus during build
- ✅ Display actual UDO content instead of fallback
- ✅ Show all articles in the search/listing pages
- ✅ Have proper navigation and content

## Test After Rebuild
After the cache-clear rebuild completes, test these URLs:
- https://charlotte-udo-docs.netlify.app/api/search (should show real articles)
- https://charlotte-udo-docs.netlify.app/api/debug-env (should show udo-backend-y1w0.onrender.com)
- https://charlotte-udo-docs.netlify.app/articles-listing (should show full article list)

## Summary
Everything is configured correctly now! The only remaining step is to clear Netlify's build cache so it rebuilds the static pages with the correct Directus URL.
