# Render Environment Variables - Frontend Service

This document outlines the environment variables that must be configured in Render for the Charlotte UDO frontend service deployment.

## Required Environment Variables

### 1. Deployment Environment

```
DEPLOYMENT_ENV=production
NEXT_PUBLIC_DEPLOYMENT_ENV=production
```

**Purpose:** Tells the application to use production configuration instead of local development settings.

### 2. Production Directus Configuration

```
PRODUCTION_DIRECTUS_URL=https://admin.charlotteudo.org
PRODUCTION_DIRECTUS_TOKEN=wUw63PfALJJmVLXQNooe2wgfVSopCISO
```

**Purpose:** Public URL for Directus CMS used for:
- Client-side API calls (browser requests)
- Asset URLs (images, PDFs, files)
- Admin UI access

### 3. Internal Network Configuration (Server-Side Optimization)

```
DIRECTUS_INTERNAL_URL=http://udo-backend-y1w0:10000
```

**Purpose:** Render's private network URL for server-side API calls. This provides significantly faster performance (~10-50x) for Server-Side Rendering (SSR) by avoiding public internet routing.

**Format:** `http://[service-slug]:[port]`
- Service slug: `udo-backend-y1w0` (your Directus backend service)
- Port: `10000` (Render's standard internal port)

### 4. Next.js Public Variables (Optional but Recommended)

```
NEXT_PUBLIC_DIRECTUS_URL=https://admin.charlotteudo.org
```

**Purpose:** Fallback public URL accessible from client-side code.

## How It Works

The application uses a dual URL strategy:

### Server-Side (SSR)
- Uses `DIRECTUS_INTERNAL_URL` (`http://udo-backend-y1w0:10000`)
- Faster API calls via Render's private network
- Only accessible between services in same region/workspace

### Client-Side & Assets
- Uses `PRODUCTION_DIRECTUS_URL` (`https://admin.charlotteudo.org`)
- Public internet access for browser requests
- Required for asset downloads (images, PDFs)
- Required for admin UI access

## Configuration Steps in Render

1. Navigate to your frontend service in Render dashboard
2. Go to **Environment** tab
3. Add the following environment variables:
   - `DEPLOYMENT_ENV` = `production`
   - `NEXT_PUBLIC_DEPLOYMENT_ENV` = `production`
   - `PRODUCTION_DIRECTUS_URL` = `https://admin.charlotteudo.org`
   - `PRODUCTION_DIRECTUS_TOKEN` = `[your-production-token]`
   - `DIRECTUS_INTERNAL_URL` = `http://udo-backend-y1w0:10000`
   - `NEXT_PUBLIC_DIRECTUS_URL` = `https://admin.charlotteudo.org`

4. Save changes
5. Redeploy your service

## Verification

After deployment, you can verify the configuration is working correctly by:

1. Checking the deployment logs for messages like:
   ```
   [env-config] Using PRODUCTION configuration: http://udo-backend-y1w0:10000 (server-side: true)
   ```

2. Testing that:
   - Pages load correctly (SSR using internal network)
   - Images and PDFs display (using public URLs)
   - Admin UI is accessible at `https://admin.charlotteudo.org`

## Security Notes

- The internal network URL (`http://udo-backend-y1w0:10000`) is only accessible between Render services in the same region and workspace
- Public token in `PRODUCTION_DIRECTUS_TOKEN` should have appropriate read-only permissions
- Never commit production tokens to version control
- Store sensitive values in Render's environment variable settings

## Related Files

- `/lib/env-config.ts` - Environment detection and URL selection logic
- `/lib/directus-server.ts` - Server-side Directus client (uses internal URL)
- `/lib/directus-asset-url.ts` - Asset URL utilities (always use public URL)
- `/lib/directus-source.ts` - Data fetching functions

## Troubleshooting

### Assets not loading
- Verify `PRODUCTION_DIRECTUS_URL` is set to public URL
- Check that asset URLs in browser DevTools use `https://admin.charlotteudo.org`

### Slow SSR performance
- Verify `DIRECTUS_INTERNAL_URL` is set correctly
- Check deployment logs confirm server-side requests use internal URL

### Authentication errors
- Verify `PRODUCTION_DIRECTUS_TOKEN` is valid
- Check token has appropriate permissions in Directus
