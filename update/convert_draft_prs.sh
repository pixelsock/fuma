#!/bin/bash
# Convert all draft PRs to ready for review

REPO="pixelsock/fuma"

# Get list of draft PR numbers
draft_prs=$(gh pr list --repo "$REPO" --draft --json number --jq '.[].number')

# Convert each draft PR
for pr in $draft_prs; do
    echo "Converting PR #$pr to ready for review"
    gh pr ready "$pr" --repo "$REPO"
done

echo "Converted $(echo "$draft_prs" | wc -l) draft PRs to ready for review."