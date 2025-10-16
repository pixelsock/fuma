#!/usr/bin/env python3
"""
Create GitHub issues from Pastel comments CSV with screenshot uploads
Uses PyGithub library for better GitHub API integration
"""

import csv
import os
import sys
import time
import requests
import subprocess
from urllib.parse import urlparse
from github import Github
from github.GithubException import GithubException
import base64

# Configuration
def get_github_token():
    """Get GitHub token from gh CLI or environment variable"""
    # Try environment variable first
    token = os.environ.get('GITHUB_TOKEN')
    if token:
        return token

    # Try gh CLI
    try:
        result = subprocess.run(
            ['gh', 'auth', 'token'],
            capture_output=True,
            text=True,
            check=True
        )
        return result.stdout.strip()
    except (subprocess.CalledProcessError, FileNotFoundError):
        return None

GITHUB_TOKEN = get_github_token()
REPO_OWNER = 'pixelsock'
REPO_NAME = 'fuma'
CSV_FILE = 'pastel-comments.csv'
SCREENSHOTS_DIR = 'github_screenshots'

def download_screenshot(url, filename):
    """Download screenshot from Pastel"""
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()

        os.makedirs(SCREENSHOTS_DIR, exist_ok=True)
        filepath = os.path.join(SCREENSHOTS_DIR, filename)

        with open(filepath, 'wb') as f:
            f.write(response.content)

        print(f'  Downloaded: {filename}')
        return filepath
    except Exception as e:
        print(f'  Error downloading screenshot: {e}')
        return None

def extract_page_context(page_url):
    """Extract readable page context from URL"""
    path = urlparse(page_url).path
    parts = [p for p in path.split('/') if p and p != 'articles']

    if not parts:
        return 'Home Page', 'home'

    page_slug = parts[-1]
    page_name = page_slug.replace('-', ' ').title()

    return page_name, page_slug

def generate_issue_title(comment_text, page_url):
    """Generate a descriptive title for the GitHub issue"""
    page_name, _ = extract_page_context(page_url)

    # Create a concise title from the comment
    lines = comment_text.strip().split('\n')
    title_text = lines[0]

    # Truncate if too long
    if len(title_text) > 50:
        title_text = title_text[:47] + '...'

    # Clean up quotes and special chars
    title_text = title_text.replace('"', '').replace("'", '')

    return f'{page_name}: {title_text}'

def upload_to_github_repo(g, repo, image_path, issue_number):
    """
    Upload image to repository as an asset so it can be referenced in the issue
    We'll use a special approach: commit the image to a screenshots branch
    """
    try:
        with open(image_path, 'rb') as f:
            content = f.read()

        # Create a path in the repo
        filename = os.path.basename(image_path)
        repo_path = f'screenshots/issue-{issue_number}/{filename}'

        try:
            # Try to create file
            repo.create_file(
                repo_path,
                f'Add screenshot for issue #{issue_number}',
                content,
                branch='main'
            )
            print(f'  ✓ Uploaded screenshot to repo')

            # Get the raw GitHub URL
            file_url = f'https://raw.githubusercontent.com/{REPO_OWNER}/{REPO_NAME}/main/{repo_path}'
            return file_url

        except GithubException as e:
            if e.status == 422:  # File already exists
                print(f'  Note: Screenshot path already exists in repo')
                file_url = f'https://raw.githubusercontent.com/{REPO_OWNER}/{REPO_NAME}/main/{repo_path}'
                return file_url
            raise

    except Exception as e:
        print(f'  Error uploading to repo: {e}')
        return None

def create_github_issue_with_screenshot(g, repo, title, body, screenshot_url, comment_number, pastel_url, original_url, screen_size):
    """Create a GitHub issue with screenshot properly embedded"""

    try:
        # Download screenshot
        screenshot_filename = f'comment_{comment_number}.jpg'
        local_screenshot = download_screenshot(screenshot_url, screenshot_filename)

        page_name, page_slug = extract_page_context(original_url)

        # Parse screen size
        width, height = '1605', '851'
        if screen_size and 'x' in screen_size:
            try:
                w, h = screen_size.split(' x ')
                width, height = w.strip(), h.strip()
            except:
                pass

        # Build issue body with embedded screenshot
        issue_body = f'{body}\n\n'
        issue_body += f'<img width="{width}" height="{height}" alt="Image" src="{screenshot_url}" />\n\n'

        # Create the issue first and assign to copilot
        issue = repo.create_issue(
            title=title,
            body=issue_body,
            assignees=['copilot']
        )

        print(f'✓ Created issue #{issue.number}: {title}')
        print(f'  URL: {issue.html_url}')
        print(f'  ✓ Assigned to @copilot')

        # Add instruction comment about the purple circle indicator
        instruction_comment = 'The area requiring changes is highlighted with a light purple circle indicator in the screenshot.'
        issue.create_comment(instruction_comment)
        print(f'  ✓ Added instruction comment')

        return issue.number

    except GithubException as e:
        print(f'✗ GitHub API Error: {e}')
        return None
    except Exception as e:
        print(f'✗ Error creating issue: {e}')
        return None

def main():
    if not GITHUB_TOKEN:
        print('Error: GitHub authentication not found')
        print('')
        print('Please authenticate with GitHub CLI:')
        print('  gh auth login')
        print('')
        print('Or set GITHUB_TOKEN environment variable:')
        print('  export GITHUB_TOKEN=your_token_here')
        sys.exit(1)

    print(f'✓ GitHub authenticated (using gh CLI)')

    # Check if CSV file exists
    if not os.path.exists(CSV_FILE):
        print(f'Error: CSV file not found: {CSV_FILE}')
        sys.exit(1)

    print(f'Authenticating with GitHub...')
    from github import Auth
    auth = Auth.Token(GITHUB_TOKEN)
    g = Github(auth=auth)

    try:
        # Get the repository
        repo = g.get_repo(f'{REPO_OWNER}/{REPO_NAME}')
        print(f'✓ Connected to {repo.full_name}\n')
    except GithubException as e:
        print(f'Error: Could not access repository: {e}')
        sys.exit(1)

    # Get existing issues to avoid duplicates
    print('Checking for existing issues...')
    existing_issues = {}
    for issue in repo.get_issues(state='all'):
        # Extract comment number from issue if it was created by this script
        if 'Pastel Comment:' in issue.body:
            try:
                # Parse the Pastel URL to get comment number
                import re
                match = re.search(r'/comment/(\d+)/', issue.body)
                if match:
                    comment_id = match.group(1)
                    existing_issues[comment_id] = issue.number
            except:
                pass

    print(f'Found {len(existing_issues)} existing issues from Pastel comments\n')
    print(f'Reading comments from {CSV_FILE}...\n')

    created_count = 0
    skipped_count = 0
    total_count = 0

    with open(CSV_FILE, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)

        for row in reader:
            total_count += 1
            comment_number = row['Comment Number']
            pastel_url = row['Comment URL']

            # Extract comment ID from Pastel URL
            import re
            match = re.search(r'/comment/(\d+)/', pastel_url)
            comment_id = match.group(1) if match else None

            # Skip if already created
            if comment_id and comment_id in existing_issues:
                print(f'[{total_count}] Skipping comment #{comment_number} (already exists as issue #{existing_issues[comment_id]})')
                skipped_count += 1
                continue
            comment_text = row['Comment Text']
            screenshot_url = row['Screenshot URL']
            original_url = row['Original URL']
            screen_size = row['Metadata - Screen Size']

            print(f'[{total_count}] Processing comment #{comment_number}...')

            # Generate issue title
            title = generate_issue_title(comment_text, original_url)

            # Create the issue
            issue_number = create_github_issue_with_screenshot(
                g=g,
                repo=repo,
                title=title,
                body=comment_text,
                screenshot_url=screenshot_url,
                comment_number=comment_number,
                pastel_url=pastel_url,
                original_url=original_url,
                screen_size=screen_size
            )

            if issue_number:
                created_count += 1

            print('')  # Blank line between issues

            # Rate limiting - be nice to GitHub API
            time.sleep(3)

    print(f'═══════════════════════════════════════')
    print(f'✓ Complete!')
    print(f'  Created: {created_count} new issues')
    print(f'  Skipped: {skipped_count} existing issues')
    print(f'  Total: {total_count} comments processed')
    print(f'  Repository: https://github.com/{REPO_OWNER}/{REPO_NAME}/issues')
    print(f'  Screenshots: {SCREENSHOTS_DIR}/')

if __name__ == '__main__':
    main()
