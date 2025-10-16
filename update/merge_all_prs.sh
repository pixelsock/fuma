#!/bin/bash
# Merge all ready-for-review (non-draft) PRs

REPO="pixelsock/fuma"

# Get list of non-draft PR numbers
non_draft_prs=$(gh pr list --repo "$REPO" --state open --json number,isDraft --jq '.[] | select(.isDraft == false) | .number')

echo "Found $(echo "$non_draft_prs" | wc -l) non-draft PRs to merge"

# Merge each PR
for pr in $non_draft_prs; do
    echo "Merging PR #$pr"
    gh pr merge "$pr" --repo "$REPO" --squash --auto
done

echo "Completed merge process for all non-draft PRs."