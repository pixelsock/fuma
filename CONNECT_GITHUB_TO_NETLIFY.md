# Connect Netlify to GitHub for Continuous Deployment

## Why This is Better
- ✅ Automatic deployments on every git push
- ✅ Deploy previews for pull requests
- ✅ Fresh builds every time (no cache issues)
- ✅ Git-based deployment history
- ✅ Easy rollbacks to previous versions

## Steps to Connect GitHub

### 1. Go to Netlify Site Settings
Visit: https://app.netlify.com/sites/charlotte-udo-docs/settings/deploys

### 2. Connect to GitHub
1. Scroll down to "**Build & deploy**" section
2. Click on "**Link repository**" or "**Link site to Git**"
3. Choose "**GitHub**"
4. Authorize Netlify to access your GitHub account (if not already done)
5. Select your repository: **pixelsock/fuma** (or whatever your repo is named)
6. Select the branch: **master** (or **main**)

### 3. Configure Build Settings
When prompted, use these settings:

- **Base directory**: (leave empty or set to root)
- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Branch to deploy**: `master` (or `main`)

### 4. Advanced Build Settings (Already Configured)
These environment variables are already set, so you don't need to add them again:
- All Directus URLs and tokens ✅
- Webflow keys ✅
- Orama search keys ✅

### 5. Trigger First Deployment
Once connected, Netlify will automatically start a fresh build from your GitHub repo. This will:
- Clone your repository
- Install dependencies
- Build with the correct environment variables
- Deploy fresh static pages with real Directus data

## Quick Alternative: Make a Small Commit

If you prefer to keep manual deployments for now, you can force a fresh build by making a small commit:

```bash
cd /Users/nick/Sites/charlotteUDO/directus/frontend-fumadocs/fuma

# Make a small change to force rebuild
echo "" >> README.md

# Commit and note the change
git add README.md
git commit -m "Force fresh build - clear Netlify cache"

# If you connect to GitHub, push it:
# git push origin master
```

After pushing, Netlify will automatically detect the change and build from scratch.

## What Happens After Connection

1. **Every `git push`** triggers a new deployment
2. **Pull requests** get preview deployments
3. **No more manual uploads** - everything is automated
4. **Build cache is managed properly** by Netlify's CI/CD

## Verify After First Build

Once the GitHub-triggered build completes, check:
- https://charlotte-udo-docs.netlify.app/api/search (should show real articles)
- https://charlotte-udo-docs.netlify.app/api/debug-env (should show udo-backend-y1w0.onrender.com)
- https://charlotte-udo-docs.netlify.app/articles-listing (should show full list)

## Recommendation

**Connect to GitHub!** It's the standard workflow and will prevent these cache issues in the future. Manual deployments via MCP are useful for quick tests, but GitHub integration is the proper way to deploy production sites on Netlify.
