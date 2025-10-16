#!/usr/bin/env python3
"""
Create GitHub issues from Pastel comments CSV
Downloads screenshots and uploads them to GitHub issues
"""

import csv
import os
import sys
import time
import requests
from urllib.parse import urlparse

# Configuration
GITHUB_TOKEN = os.environ.get('GITHUB_TOKEN')
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

        return filepath
    except Exception as e:
        print(f'Error downloading screenshot: {e}')
        return None

def generate_issue_title(comment_text, page_url):
    """Generate a descriptive title for the GitHub issue"""
    # Extract page name from URL
    path = urlparse(page_url).path
    page_name = path.rstrip('/').split('/')[-1] or 'Home Page'
    page_name = page_name.replace('-', ' ').title()

    # Create a concise title from the comment
    title = comment_text.split('\n')[0]  # Take first line
    if len(title) > 60:
        title = title[:57] + '...'

    return f'{page_name}: {title}'

def upload_image_to_github(image_path, repo_owner, repo_name, token):
    """Upload image to GitHub using the issue attachment API"""
    # GitHub's API for uploading images requires special handling
    # We'll use the asset upload endpoint that's used when creating issues via the web UI

    # For simplicity, we'll embed the image using base64 in the markdown
    # Or we can use GitHub'susercontent domain if we upload via issues

    # Actually, the easiest way is to create the issue first, then add the image
    # by uploading it via the comment API which supports file uploads

    return None  # We'll handle this differently

def create_github_issue(title, body, screenshot_url, comment_number, pastel_url, token, repo_owner, repo_name):
    """Create a GitHub issue with screenshot"""

    # Download screenshot
    screenshot_filename = f'comment_{comment_number}.jpg'
    local_screenshot = download_screenshot(screenshot_url, screenshot_filename)

    if not local_screenshot:
        print(f'Warning: Could not download screenshot for comment {comment_number}')

    # Prepare issue body with context
    issue_body = f'{body}\n\n'

    if local_screenshot:
        # We'll need to upload the image first, then reference it
        # For now, let's create the issue and we'll add the image via comment
        issue_body += f'**Screenshot:** _(uploading...)_\n\n'

    issue_body += f'**Source:** [Pastel Comment]({pastel_url})\n'

    # Create the issue using GitHub API
    api_url = f'https://api.github.com/repos/{repo_owner}/{repo_name}/issues'
    headers = {
        'Authorization': f'token {token}',
        'Accept': 'application/vnd.github.v3+json'
    }

    payload = {
        'title': title,
        'body': issue_body
    }

    try:
        response = requests.post(api_url, json=payload, headers=headers)
        response.raise_for_status()
        issue_data = response.json()
        issue_number = issue_data['number']
        issue_url = issue_data['html_url']

        print(f'✓ Created issue #{issue_number}: {title}')
        print(f'  URL: {issue_url}')

        # Now upload the screenshot if we have it
        if local_screenshot:
            upload_screenshot_to_issue(issue_number, local_screenshot, token, repo_owner, repo_name)

        # Add a comment mentioning @claude
        add_claude_comment(issue_number, token, repo_owner, repo_name)

        return issue_number

    except requests.exceptions.RequestException as e:
        print(f'✗ Error creating issue: {e}')
        if hasattr(e.response, 'text'):
            print(f'  Response: {e.response.text}')
        return None

def upload_screenshot_to_issue(issue_number, image_path, token, repo_owner, repo_name):
    """Upload screenshot to existing issue by editing it"""

    # Read the image file
    try:
        with open(image_path, 'rb') as f:
            image_data = f.read()

        # Upload using GitHub's asset upload API
        # This requires us to post to a special endpoint
        # Actually, the easiest way is to use the issue update API and include the image in markdown

        # GitHub allows drag-and-drop image uploads which creates a special URL
        # We need to use the legacy upload method or include as base64

        # Let's use a comment with the uploaded file
        comment_api_url = f'https://api.github.com/repos/{repo_owner}/{repo_name}/issues/{issue_number}/comments'
        headers = {
            'Authorization': f'token {token}',
            'Accept': 'application/vnd.github.v3+json'
        }

        # We need to upload the file first to get a URL
        # GitHub's API for file uploads in issues/comments requires special handling
        # The web interface uses a separate upload endpoint

        # For this script, we'll provide instructions to manually add screenshots
        # Or we can use a service like imgur or GitHub's asset CDN

        print(f'  Screenshot saved locally: {image_path}')
        print(f'  Note: Please manually upload screenshot to issue #{issue_number}')

    except Exception as e:
        print(f'  Error handling screenshot: {e}')

def add_claude_comment(issue_number, token, repo_owner, repo_name):
    """Add a comment mentioning @claude to the issue"""

    api_url = f'https://api.github.com/repos/{repo_owner}/{repo_name}/issues/{issue_number}/comments'
    headers = {
        'Authorization': f'token {token}',
        'Accept': 'application/vnd.github.v3+json'
    }

    payload = {
        'body': '@claude please review and implement this change'
    }

    try:
        response = requests.post(api_url, json=payload, headers=headers)
        response.raise_for_status()
        print(f'  ✓ Added comment mentioning @claude')
    except requests.exceptions.RequestException as e:
        print(f'  ✗ Error adding comment: {e}')

def main():
    if not GITHUB_TOKEN:
        print('Error: GITHUB_TOKEN environment variable not set')
        print('Please set it with: export GITHUB_TOKEN=your_github_token')
        sys.exit(1)

    # Check if CSV file exists
    if not os.path.exists(CSV_FILE):
        print(f'Error: CSV file not found: {CSV_FILE}')
        sys.exit(1)

    print(f'Reading comments from {CSV_FILE}...')
    print(f'Creating issues in {REPO_OWNER}/{REPO_NAME}...\n')

    created_count = 0

    with open(CSV_FILE, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)

        for row in reader:
            comment_number = row['Comment Number']
            user_name = row['User Name']
            comment_text = row['Comment Text']
            screenshot_url = row['Screenshot URL']
            original_url = row['Original URL']
            pastel_url = row['Comment URL']

            # Generate issue title
            title = generate_issue_title(comment_text, original_url)

            # Create the issue
            issue_number = create_github_issue(
                title=title,
                body=comment_text,
                screenshot_url=screenshot_url,
                comment_number=comment_number,
                pastel_url=pastel_url,
                token=GITHUB_TOKEN,
                repo_owner=REPO_OWNER,
                repo_name=REPO_NAME
            )

            if issue_number:
                created_count += 1

            # Rate limiting - be nice to GitHub API
            time.sleep(2)

    print(f'\n✓ Done! Created {created_count} issues.')
    print(f'Note: Screenshots have been downloaded to {SCREENSHOTS_DIR}/')
    print('You may need to manually upload screenshots to each issue.')

if __name__ == '__main__':
    main()
