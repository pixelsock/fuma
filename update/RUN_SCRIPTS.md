# GitHub Issues Automation - Run Instructions

## Current Status

✅ **Updated Format:** Scripts now properly format issues with:
- Screenshot embedded directly in body as `<img>` tag
- Assigned to `@copilot`
- Comment about purple circle indicator

## What's Been Done

- ✅ Issues #4-48 created (45 issues)
- ⚠️ Some existing issues need screenshot updates
- ⏳ Issues for comments #49-56 still need to be created (8 more)

## Run the Scripts

### 1. Update Existing Issues (Issues #4-48)

This updates the 45 existing issues to add screenshots and @copilot assignment:

```bash
source venv/bin/activate
python update_existing_issues.py
```

**Note:** This will take about 2-3 minutes (2 sec delay × 45 issues)

### 2. Create Remaining Issues (Comments #49-56)

This creates the final 8 issues for comments that haven't been processed yet:

```bash
source venv/bin/activate
python create_github_issues_improved.py
```

**Note:** The script automatically skips existing issues, so it will only create the missing ones.

## Expected Output

### For update_existing_issues.py:
```
✓ GitHub authenticated (using gh CLI)
✓ Connected to pixelsock/fuma
Loaded 56 comments from CSV
Fetching existing issues...
Found 45 issues to update

Updating issue #48: Add link to: https://publicinput.com/udo-comment-hub...
  ✓ Updated body with screenshot
  ✓ Assigned to @copilot
  ✓ Added instruction comment

...

✓ Complete! Updated 45 issues
```

### For create_github_issues_improved.py:
```
✓ GitHub authenticated (using gh CLI)
✓ Connected to pixelsock/fuma
Found 45 existing issues from Pastel comments

[1] Skipping comment #1 (already exists as issue #4)
...
[49] Processing comment #49...
  Downloaded: comment_49.jpg
✓ Created issue #49: ...
  ✓ Assigned to @copilot
  ✓ Added instruction comment

...

✓ Complete!
  Created: 8 new issues
  Skipped: 48 existing issues
  Total: 56 comments processed
```

## Verify Results

Check the issues on GitHub:
```bash
gh issue list --repo pixelsock/fuma --limit 60
```

Or view in browser:
https://github.com/pixelsock/fuma/issues

## Issue Format Example

Each issue will have:

**Title:** `Page Name: Brief description...`

**Body:**
```
Comment text here...

<img width="1605" height="851" alt="Image" src="https://user-assets.usepastel.com/screenshot/xxx.jpg" />
```

**Assigned to:** @copilot

**Comment:** "The area requiring changes is highlighted with a light purple circle indicator in the screenshot."

## Troubleshooting

### Script Times Out
- This is normal for large batches
- The script makes progress before timing out
- Just run it again - it will resume where it left off

### "Issue already exists"
- The script automatically skips existing issues
- This is expected and safe

### Rate Limiting
- Scripts include 2-3 second delays between requests
- If you hit rate limits, wait a few minutes and retry
