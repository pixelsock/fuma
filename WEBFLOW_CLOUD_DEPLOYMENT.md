# Webflow Cloud Deployment Guide

## Overview

This project is now configured for deployment to Webflow Cloud using OpenNext and Cloudflare Workers. The configuration has been optimized for the Charlotte UDO documentation system.

## Configuration Files

### 1. `webflow.json`
```json
{
  "cloud": {
    "framework": "nextjs",
    "nodeVersion": "20",
    "buildCommand": "npm run build:cloudflare",
    "buildDir": ".open-next",
    "mountPath": "/articles",
    "environmentVariables": {
      "DEPLOYMENT_ENV": "production"
    }
  }
}
```

### 2. `open-next.config.ts`
```typescript
import { defineConfig } from '@opennextjs/cloudflare';

export default defineConfig({
  cloudflare: {
    // Cloudflare-specific configuration
  }
});
```

### 3. `wrangler.jsonc`
```json
{
  "name": "charlotte-udo-frontend",
  "compatibility_date": "2024-01-01",
  "compatibility_flags": ["nodejs_compat"],
  "main": ".open-next/worker.js",
  "env": {
    "NODE_ENV": "production"
  }
}
```

## Build Process

### Local Development
```bash
npm run dev          # Development server on port 3002
npm run build        # Standard Next.js build
```

### Webflow Cloud Build
```bash
npm run build:cloudflare  # OpenNext build for Cloudflare
npm run preview           # Preview the Cloudflare build
```

## Environment Configuration

The project uses an intelligent environment configuration system:

### Local Development
- Uses `LOCAL_DIRECTUS_*` environment variables
- Connects to local Directus instance at `http://localhost:8056`
- Set `DEPLOYMENT_ENV=local` to force local mode

### Production (Webflow Cloud)
- Uses `PRODUCTION_DIRECTUS_*` environment variables
- Connects to production Directus instance at `https://admin.charlotteudo.org`
- Automatically detected when `DEPLOYMENT_ENV=production`

### Environment Variables Required

#### Local Development (.env.local)
```bash
# Local Directus Configuration
LOCAL_DIRECTUS_URL=http://localhost:8056
LOCAL_DIRECTUS_TOKEN=your_local_token
LOCAL_DIRECTUS_EMAIL=admin@example.com
LOCAL_DIRECTUS_PASSWORD=admin

# Production Directus Configuration
PRODUCTION_DIRECTUS_URL=https://admin.charlotteudo.org
PRODUCTION_DIRECTUS_TOKEN=your_production_token
PRODUCTION_DIRECTUS_EMAIL=admin@example.com
PRODUCTION_DIRECTUS_PASSWORD=admin

# Deployment Environment
DEPLOYMENT_ENV=local  # or 'production'
```

#### Webflow Cloud Environment Variables
Set these in your Webflow Cloud dashboard:
```bash
DEPLOYMENT_ENV=production
PRODUCTION_DIRECTUS_URL=https://admin.charlotteudo.org
PRODUCTION_DIRECTUS_TOKEN=your_production_token
PRODUCTION_DIRECTUS_EMAIL=admin@example.com
PRODUCTION_DIRECTUS_PASSWORD=admin
```

## Deployment Steps

### 1. Prepare Your Repository
- Ensure all changes are committed
- Verify the build works locally: `npm run build:cloudflare`

### 2. Connect to Webflow Cloud
- Go to your Webflow Cloud dashboard
- Connect your GitHub repository
- Configure the build settings:
  - **Framework**: Next.js
  - **Node Version**: 20
  - **Build Command**: `npm run build:cloudflare`
  - **Build Directory**: `.open-next`
  - **Mount Path**: `/articles`

### 3. Set Environment Variables
In your Webflow Cloud dashboard, add these environment variables:
- `DEPLOYMENT_ENV=production`
- `PRODUCTION_DIRECTUS_URL=https://admin.charlotteudo.org`
- `PRODUCTION_DIRECTUS_TOKEN=your_actual_token`
- `PRODUCTION_DIRECTUS_EMAIL=your_email`
- `PRODUCTION_DIRECTUS_PASSWORD=your_password`

### 4. Deploy
- Trigger a deployment from the Webflow Cloud dashboard
- Monitor the build logs for any issues
- The application will be available at your Webflow Cloud domain

## Key Features

### 1. Intelligent Environment Detection
- Automatically switches between local and production configurations
- Fallback to local development if production credentials are missing
- Debug endpoint at `/debug-env` to verify configuration

### 2. API Routes
All API routes are configured for Cloudflare Workers:
- `/api/search` - Article search functionality
- `/api/search-articles` - Content-based article search
- `/api/debug-env` - Environment configuration debug
- `/api/articles/[slug]/pdf` - PDF generation endpoint
- `/api/test-article` - Article testing endpoint
- `/api/test-directus-auth` - Authentication testing

### 3. Static Generation
- Static pages are pre-rendered for optimal performance
- Dynamic routes use server-side rendering
- API routes run on Cloudflare Workers

### 4. Base Path Configuration
- Application is mounted at `/articles` path
- All assets and routes are properly prefixed
- Compatible with Webflow Cloud's subdirectory deployment

## Troubleshooting

### Build Issues
1. **Edge Runtime Errors**: Removed edge runtime directives from API routes
2. **Import Errors**: Fixed import paths for Directus modules
3. **Environment Issues**: Verify environment variables are set correctly

### Runtime Issues
1. **Authentication Errors**: Check Directus credentials
2. **API Failures**: Verify Directus instance is accessible
3. **Environment Detection**: Use `/debug-env` endpoint to verify configuration

### Performance Optimization
1. **Static Generation**: Most pages are statically generated
2. **API Caching**: Implement caching for frequently accessed data
3. **Asset Optimization**: Images and assets are optimized during build

## Monitoring

### Debug Endpoints
- `/debug-env` - Environment configuration status
- `/api/test-directus-auth` - Directus authentication test
- `/api/test-article` - Article fetching test

### Logs
- Check Webflow Cloud build logs for deployment issues
- Monitor Cloudflare Workers logs for runtime errors
- Use browser developer tools for client-side debugging

## Security Considerations

1. **Environment Variables**: Never commit sensitive credentials to version control
2. **API Tokens**: Use read-only tokens for production when possible
3. **CORS**: Configure CORS settings in Directus for production domain
4. **Rate Limiting**: Implement rate limiting for API endpoints if needed

## Support

For issues with:
- **Webflow Cloud**: Contact Webflow support
- **OpenNext**: Check the [OpenNext documentation](https://opennext.js.org/)
- **Directus**: Refer to [Directus documentation](https://docs.directus.io/)
- **Project-specific**: Check the project documentation and issues 