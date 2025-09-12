#!/bin/bash
set -e

echo "🚀 Deploying Charlotte UDO to Webflow Cloud..."

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "📝 Committing TypeScript fixes..."
    git add .
    git commit -m "fix: add missing DirectusSchema collections for TypeScript compatibility"
else
    echo "✅ Working directory is clean"
fi

# Push to remote to trigger deployment
echo "📤 Pushing to remote repository..."
git push origin HEAD

echo "✅ Deployment triggered! Monitor status in Webflow Cloud dashboard."
echo "🔗 Check deployment status at: https://webflow.com/dashboard/sites/charlotte-udo/hosting"
