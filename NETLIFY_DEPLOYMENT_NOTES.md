# Netlify Deployment Notes

## Current Status
- ✅ Netlify site created: `charlotte-udo-docs`
- ✅ Environment variables configured
- ✅ Build succeeds
- ❌ Articles not loading (using fallback data)

## Issue: Directus Connection During Build

### Problem
The Next.js build process on Netlify cannot connect to the Directus server at `https://admin.charlotteudo.org`. This results in fallback/placeholder content being displayed instead of real articles.

### Root Cause
Directus server is likely blocking requests from Netlify's build infrastructure due to:
1. **IP restrictions** - Directus may have firewall rules blocking Netlify's IP ranges
2. **CORS settings** - Directus CORS configuration may not allow Netlify's build servers
3. **Authentication issues** - Credentials may not be working during build time

### Solution Required on Directus Side

You need to configure your Directus instance to allow API requests from Netlify's build servers:

#### Option 1: Allow Netlify IP Ranges (Recommended for Security)
Add Netlify's build server IP ranges to your Directus firewall allowlist:
- Netlify build IPs can vary, so the best approach is to allow the entire AWS us-east region if your Directus is hosted elsewhere
- Contact Netlify support for current IP ranges if needed

#### Option 2: Temporarily Disable IP Restrictions
If Directus has IP-based access restrictions, temporarily disable them to test if this is the issue:
1. Log into your Directus server admin panel
2. Navigate to Settings → Security
3. Check if there are any IP allowlists configured
4. Add Netlify's IP ranges or temporarily disable restrictions

#### Option 3: Check CORS Configuration
Ensure Directus CORS settings allow API requests:
1. Check your Directus `.env` file for `CORS_ENABLED` and `CORS_ORIGIN`
2. Set `CORS_ENABLED=true`
3. Set `CORS_ORIGIN=*` temporarily to test, or add Netlify domains:
   ```
   CORS_ORIGIN=https://charlotte-udo-docs.netlify.app,https://*.netlify.app
   ```

#### Option 4: Check Directus Authentication
Verify that the token we're using has the correct permissions:
1. Log into Directus admin
2. Go to Settings → Access Tokens
3. Find the token being used (check your environment variables)
4. Ensure it has `read` permissions for:
   - `articles` collection
   - `article_categories` collection
   - `settings` collection

### Testing the Connection

Once Directus is configured, trigger a new Netlify deployment:
1. Go to: https://app.netlify.com/projects/charlotte-udo-docs
2. Click "Trigger deploy" → "Deploy site"
3. Wait for build to complete
4. Check https://charlotte-udo-docs.netlify.app/api/search for real articles

### Alternative: Use Netlify Build Hooks
If IP restrictions cannot be relaxed, you could:
1. Keep IP restrictions on Directus
2. Pre-generate content using a separate sync script
3. Commit generated content to the repository
4. Deploy the static content

This would require modifying the build process to use local content files instead of fetching from Directus at build time.

## Environment Variables Set in Netlify

```
DEPLOYMENT_ENV=production
PRODUCTION_DIRECTUS_URL=https://admin.charlotteudo.org
DIRECTUS_TOKEN=[REDACTED - Set in Netlify Environment Variables]
PRODUCTION_DIRECTUS_EMAIL=[REDACTED - Set in Netlify Environment Variables]
PRODUCTION_DIRECTUS_PASSWORD=[REDACTED - Set in Netlify Environment Variables]
WEBFLOW_SITE_ID=6882658c808a4019ebb9aeb7
WEBFLOW_SITE_API_TOKEN=[REDACTED - Set in Netlify Environment Variables]
WEBFLOW_WORKSPACE_API_TOKEN=[REDACTED - Set in Netlify Environment Variables]
NEXT_PUBLIC_DIRECTUS_URL=https://admin.charlotteudo.org
NEXT_PUBLIC_ORAMA_ENDPOINT=https://cloud.orama.run/v1/indexes/articles-dw8k5s
NEXT_PUBLIC_ORAMA_API_KEY=[REDACTED - Set in Netlify Environment Variables]
```

## Files Modified
- `netlify.toml` - Created with Next.js configuration
- `tsconfig.json` - Excluded `*.webflow.tsx` files from TypeScript build to fix build errors

## Next Steps
1. ✅ Fix Directus access restrictions (see above)
2. Trigger new Netlify deployment
3. Verify articles load correctly
4. Set up continuous deployment from Git (optional)
