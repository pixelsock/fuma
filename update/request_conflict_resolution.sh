#!/bin/bash
# Request Copilot to resolve conflicts for all open PRs

REPO="pixelsock/fuma"

# Get list of open PR numbers
open_prs=$(gh pr list --repo "$REPO" --state open --json number --jq '.[].number')

echo "Requesting conflict resolution for $(echo "$open_prs" | wc -l) PRs"

# Request conflict resolution for each PR
for pr in $open_prs; do
    echo "Requesting conflict resolution for PR #$pr"
    gh pr comment "$pr" --repo "$REPO" --body "@copilot please update this branch with the latest changes from master and resolve any merge conflicts. Once resolved, the PR will be automatically merged."
    sleep 1
done

echo "Completed requesting conflict resolution for all open PRs."