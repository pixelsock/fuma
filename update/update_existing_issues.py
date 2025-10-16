#!/usr/bin/env python3
"""
Update existing GitHub issues to add screenshots and copilot assignment
"""

import csv
import subprocess
import sys
import time
import re
from github import Github, Auth
from github.GithubException import GithubException

# Configuration
def get_github_token():
    """Get GitHub token from gh CLI"""
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

def main():
    if not GITHUB_TOKEN:
        print('Error: GitHub authentication not found')
        sys.exit(1)

    print(f'✓ GitHub authenticated (using gh CLI)')

    auth = Auth.Token(GITHUB_TOKEN)
    g = Github(auth=auth)

    try:
        repo = g.get_repo(f'{REPO_OWNER}/{REPO_NAME}')
        print(f'✓ Connected to {repo.full_name}\n')
    except GithubException as e:
        print(f'Error: Could not access repository: {e}')
        sys.exit(1)

    # Load CSV data
    csv_data = {}
    with open(CSV_FILE, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            pastel_url = row['Comment URL']
            match = re.search(r'/comment/(\d+)/', pastel_url)
            if match:
                comment_id = match.group(1)
                csv_data[comment_id] = row

    print(f'Loaded {len(csv_data)} comments from CSV')

    # Get existing issues
    print('Fetching existing issues...')
    issues_to_update = []

    for issue in repo.get_issues(state='open'):
        # Check if it's a Pastel comment issue
        if 'Pastel Comment:' in issue.body or 'usepastel.com' in issue.body:
            # Extract comment ID
            match = re.search(r'/comment/(\d+)/', issue.body)
            if match:
                comment_id = match.group(1)
                if comment_id in csv_data:
                    issues_to_update.append((issue, csv_data[comment_id]))

    print(f'Found {len(issues_to_update)} issues to update\n')

    updated_count = 0

    for issue, data in issues_to_update:
        try:
            print(f'Updating issue #{issue.number}: {issue.title[:50]}...')

            comment_text = data['Comment Text']
            screenshot_url = data['Screenshot URL']
            screen_size = data['Metadata - Screen Size']

            # Parse screen size
            width, height = '1605', '851'
            if screen_size and 'x' in screen_size:
                try:
                    w, h = screen_size.split(' x ')
                    width, height = w.strip(), h.strip()
                except:
                    pass

            # Build new issue body with screenshot
            new_body = f'{comment_text}\n\n'
            new_body += f'<img width="{width}" height="{height}" alt="Image" src="{screenshot_url}" />'

            # Update issue body
            issue.edit(body=new_body)
            print(f'  ✓ Updated body with screenshot')

            # Assign to copilot if not already assigned
            assignees = [a.login for a in issue.assignees]
            if 'copilot' not in assignees:
                issue.add_to_assignees('copilot')
                print(f'  ✓ Assigned to @copilot')

            # Check if instruction comment already exists
            has_instruction = False
            for comment in issue.get_comments():
                if 'light purple circle indicator' in comment.body:
                    has_instruction = True
                    break

            if not has_instruction:
                # Add instruction comment
                instruction = 'The area requiring changes is highlighted with a light purple circle indicator in the screenshot.'
                issue.create_comment(instruction)
                print(f'  ✓ Added instruction comment')

            updated_count += 1
            print('')

            # Rate limiting
            time.sleep(2)

        except GithubException as e:
            print(f'  ✗ Error: {e}')
            print('')
            continue

    print(f'═══════════════════════════════════════')
    print(f'✓ Complete! Updated {updated_count} issues')
    print(f'  Repository: https://github.com/{REPO_OWNER}/{REPO_NAME}/issues')

if __name__ == '__main__':
    main()
