# Directus on Render.com - Netlify Access Configuration

## Current Setup
- **Directus URL**: https://directus-latest-s0n8.onrender.com
- **Database**: PostgreSQL on Render.com (dpg-d1gsdjjipnbc73b509f0-a)
- **Frontend**: Netlify (charlotte-udo-docs.netlify.app)

## Issue
Netlify's build servers cannot access your Directus API during the build process, causing articles to fail loading.

## Solutions

### Option 1: Configure Directus Environment Variables on Render.com

Log into your Render.com dashboard and add/update these environment variables for your Directus service:

```bash
# Allow CORS from Netlify
CORS_ENABLED=true
CORS_ORIGIN=https://charlotte-udo-docs.netlify.app,https://*.netlify.app,http://localhost:3002

# Ensure public URL is set correctly
PUBLIC_URL=https://directus-latest-s0n8.onrender.com

# Rate limiting (if enabled, may block Netlify build servers)
RATE_LIMITER_ENABLED=false

# Or increase rate limits if needed
RATE_LIMITER_POINTS=100
RATE_LIMITER_DURATION=1
```

### Option 2: Check Render.com IP Access Control

1. Log into Render.com
2. Go to your Directus service
3. Check if there are any IP allowlists configured
4. If yes, you need to allow Netlify's IP ranges (or disable IP restrictions)

### Option 3: Verify API Token Permissions

The token `rHa0ZdV_t7ZJMHZHs2ANtXzHHOkS-AB7` needs permissions for:
- `articles` collection (read)
- `article_categories` collection (read)
- `settings` collection (read)
- `global_settings` collection (read)

To check/fix:
1. Log into Directus at https://directus-latest-s0n8.onrender.com
2. Go to Settings → Access Control → Tokens
3. Find or create a token with read permissions for all collections
4. Update the token in Netlify environment variables if needed

### Option 4: Test Directus Accessibility

Run this locally to verify Directus is accessible:

```bash
curl -H "Authorization: Bearer rHa0ZdV_t7ZJMHZHs2ANtXzHHOkS-AB7" \
  https://directus-latest-s0n8.onrender.com/items/articles?limit=1
```

If this returns articles, Directus is working. If it returns an error, there's an authentication or permission issue.

### Option 5: Alternative - Pre-fetch Content Locally

If you can't modify Directus settings, you could:

1. **Add a build script** that fetches content before build:
   ```json
   {
     "scripts": {
       "prebuild": "npm run sync",
       "sync": "tsx scripts/sync-directus.ts",
       "build": "next build"
     }
   }
   ```

2. **Sync content to local files** during build
3. **Use local content files** instead of fetching from Directus at build time

## Recommended Hosting Alternatives for Directus

If you want to move away from Render.com, consider:

1. **Railway.app** - Similar to Render, good Directus support
2. **DigitalOcean App Platform** - Managed PostgreSQL + Node.js
3. **Fly.io** - Good for Directus with PostgreSQL
4. **AWS Lightsail** - Cheap VPS option
5. **Self-hosted VPS** (DigitalOcean Droplet, Linode, etc.)

But Render.com is fine! You just need to configure CORS and access permissions.

## Next Steps

1. ✅ Add CORS environment variables to Render.com Directus service
2. ✅ Verify API token has correct permissions
3. ✅ Test with curl command above
4. ✅ Trigger new Netlify build once Directus is configured
