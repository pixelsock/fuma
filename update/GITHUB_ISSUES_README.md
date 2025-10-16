# Pastel to GitHub Issues Automation

This script reads comments from `pastel-comments.csv` and automatically creates GitHub issues with screenshots.

## Setup

### 1. Create a GitHub Personal Access Token

1. Go to https://github.com/settings/tokens/new
2. Give it a name like "Pastel Issue Creator"
3. Select scope: **`repo`** (Full control of private repositories)
4. Click "Generate token"
5. **Copy the token** (you won't see it again!)

### 2. Set the Environment Variable

```bash
export GITHUB_TOKEN=your_token_here
```

### 3. Activate Virtual Environment

```bash
source venv/bin/activate
```

## Usage

### Run the Script

```bash
python create_github_issues_improved.py
```

The script will:
1. Read all comments from `pastel-comments.csv`
2. For each comment:
   - Create a GitHub issue with a descriptive title
   - Download the screenshot from Pastel
   - Upload the screenshot to the repository
   - Add the screenshot as a comment on the issue
   - Add a comment mentioning @claude
3. Save screenshots locally to `github_screenshots/`

### Output

The script will show progress for each issue:

```
[1] Processing comment #1...
  Downloaded: comment_1.jpg
✓ Created issue #4: Home Page: Move this one to the top...
  URL: https://github.com/pixelsock/fuma/issues/4
  ✓ Uploaded screenshot to repo
  ✓ Added screenshot to issue
  ✓ Added @claude comment

[2] Processing comment #2...
...
```

## Configuration

Edit these variables in the script if needed:

```python
REPO_OWNER = 'pixelsock'
REPO_NAME = 'fuma'
CSV_FILE = 'pastel-comments.csv'
```

## What Gets Created

For each Pastel comment, a GitHub issue is created with:

**Title:** `Page Name: Comment preview`

**Body:**
- Full comment text
- Page URL reference
- Link back to original Pastel comment

**Comments:**
1. Screenshot image (uploaded to repo and embedded)
2. `@claude please review and implement this change`

## Rate Limiting

The script includes a 3-second delay between issues to respect GitHub's API rate limits.

## Troubleshooting

### "GITHUB_TOKEN environment variable not set"
- Make sure you ran `export GITHUB_TOKEN=your_token`
- Or add it to your shell profile (~/.zshrc or ~/.bash_profile)

### "Could not access repository"
- Verify your token has `repo` scope
- Check that REPO_OWNER and REPO_NAME are correct

### "File already exists in repo"
- The script tries to upload screenshots to the repo
- If it fails, it will note this but continue

## Files Created

- `github_screenshots/` - Downloaded screenshots
- Issues in GitHub with screenshots and @claude mentions
