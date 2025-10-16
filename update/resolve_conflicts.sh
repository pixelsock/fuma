#!/bin/bash
# Resolve conflicts for remaining PRs by updating with master

REPO="pixelsock/fuma"
cd /Users/nick/Sites/charlotteUDO/frontend

# Get list of conflicting PR numbers
conflicting_prs=$(gh pr list --repo "$REPO" --state open --json number,mergeable --jq '.[] | select(.mergeable == "CONFLICTING") | .number')

echo "Found conflicting PRs: $conflicting_prs"
echo ""

for pr in $conflicting_prs; do
    echo "==================================================================="
    echo "Processing PR #$pr"
    echo "==================================================================="

    # Get PR branch name
    branch=$(gh pr view "$pr" --repo "$REPO" --json headRefName --jq '.headRefName')
    echo "Branch: $branch"

    # Fetch the branch
    git fetch origin "$branch"

    # Checkout the branch
    git checkout "$branch"

    # Try to merge master
    echo "Attempting to merge master into $branch..."
    if git merge origin/master --no-edit; then
        echo "✓ Merge successful for PR #$pr"

        # Push the updated branch
        git push origin "$branch"
        echo "✓ Pushed updated branch"

        # Try to merge the PR
        echo "Attempting to merge PR #$pr..."
        gh pr merge "$pr" --repo "$REPO" --squash --delete-branch || echo "⚠ PR #$pr still not mergeable"
    else
        echo "✗ Merge conflicts detected for PR #$pr"
        echo "Conflicts in:"
        git diff --name-only --diff-filter=U

        # Abort the merge
        git merge --abort
        echo "Merge aborted. Manual resolution needed."
    fi

    echo ""
done

# Return to master
git checkout master

echo "==================================================================="
echo "Conflict resolution complete"
echo "==================================================================="