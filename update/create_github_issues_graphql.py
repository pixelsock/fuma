#!/usr/bin/env python3
"""
Create GitHub issues from Pastel comments CSV with Copilot agent assignment
Uses GraphQL API for copilot-swe-agent assignments
"""

import csv
import os
import sys
import time
import requests
import subprocess
import re
from urllib.parse import urlparse

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
SCREENSHOTS_DIR = 'github_screenshots'
COPILOT_BOT_ID = 'BOT_kgDOC9w8XQ'

def graphql_query(query, variables=None):
    """Execute GraphQL query"""
    headers = {
        'Authorization': f'bearer {GITHUB_TOKEN}',
        'Content-Type': 'application/json'
    }

    payload = {'query': query}
    if variables:
        payload['variables'] = variables

    response = requests.post(
        'https://api.github.com/graphql',
        json=payload,
        headers=headers
    )
    response.raise_for_status()
    return response.json()

def get_repository_id():
    """Get repository GraphQL ID"""
    query = '''
    query {
      repository(owner: "%s", name: "%s") {
        id
      }
    }
    ''' % (REPO_OWNER, REPO_NAME)

    result = graphql_query(query)
    return result['data']['repository']['id']

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

def create_issue_with_copilot(repo_id, title, body, screenshot_url, screen_size):
    """Create issue and assign to copilot-swe-agent using GraphQL"""

    # Parse screen size
    width, height = '1605', '851'
    if screen_size and 'x' in screen_size:
        try:
            w, h = screen_size.split(' x ')
            width, height = w.strip(), h.strip()
        except:
            pass

    # Build issue body with screenshot
    issue_body = f'{body}\\n\\n'
    issue_body += f'<img width="{width}" height="{height}" alt="Image" src="{screenshot_url}" />'

    # Create issue with copilot-swe-agent assigned
    mutation = '''
    mutation($repoId: ID!, $title: String!, $body: String!, $assigneeIds: [ID!]!) {
      createIssue(input: {
        repositoryId: $repoId,
        title: $title,
        body: $body,
        assigneeIds: $assigneeIds
      }) {
        issue {
          id
          number
          title
          url
          assignees(first: 10) {
            nodes {
              login
            }
          }
        }
      }
    }
    '''

    variables = {
        'repoId': repo_id,
        'title': title,
        'body': issue_body,
        'assigneeIds': [COPILOT_BOT_ID]
    }

    result = graphql_query(mutation, variables)

    if 'errors' in result:
        print(f'  ✗ GraphQL Error: {result["errors"]}')
        return None

    issue_data = result['data']['createIssue']['issue']
    return issue_data

def add_comment_to_issue(issue_id, comment_body):
    """Add comment to issue using GraphQL"""
    mutation = '''
    mutation($issueId: ID!, $body: String!) {
      addComment(input: {
        subjectId: $issueId,
        body: $body
      }) {
        commentEdge {
          node {
            id
          }
        }
      }
    }
    '''

    variables = {
        'issueId': issue_id,
        'body': comment_body
    }

    result = graphql_query(mutation, variables)
    return 'errors' not in result

def get_existing_issues():
    """Get existing issues from repository"""
    query = '''
    query($owner: String!, $name: String!, $cursor: String) {
      repository(owner: $owner, name: $name) {
        issues(first: 100, after: $cursor) {
          pageInfo {
            hasNextPage
            endCursor
          }
          nodes {
            number
            body
          }
        }
      }
    }
    '''

    existing = {}
    cursor = None

    while True:
        variables = {
            'owner': REPO_OWNER,
            'name': REPO_NAME,
            'cursor': cursor
        }

        result = graphql_query(query, variables)
        issues = result['data']['repository']['issues']

        for issue in issues['nodes']:
            if issue['body'] and 'usepastel.com' in issue['body']:
                match = re.search(r'/comment/(\d+)/', issue['body'])
                if match:
                    comment_id = match.group(1)
                    existing[comment_id] = issue['number']

        if not issues['pageInfo']['hasNextPage']:
            break

        cursor = issues['pageInfo']['endCursor']

    return existing

def main():
    if not GITHUB_TOKEN:
        print('Error: GitHub authentication not found')
        print('Please authenticate with: gh auth login')
        sys.exit(1)

    print(f'✓ GitHub authenticated (using gh CLI)')

    # Check if CSV file exists
    if not os.path.exists(CSV_FILE):
        print(f'Error: CSV file not found: {CSV_FILE}')
        sys.exit(1)

    print(f'Getting repository ID...')
    repo_id = get_repository_id()
    print(f'✓ Repository ID: {repo_id}')

    # Get existing issues to avoid duplicates
    print('Checking for existing issues...')
    existing_issues = get_existing_issues()
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

            # Download screenshot
            screenshot_filename = f'comment_{comment_number}.jpg'
            download_screenshot(screenshot_url, screenshot_filename)

            # Generate issue title
            title = generate_issue_title(comment_text, original_url)

            # Create the issue with copilot assigned
            try:
                issue_data = create_issue_with_copilot(
                    repo_id=repo_id,
                    title=title,
                    body=comment_text,
                    screenshot_url=screenshot_url,
                    screen_size=screen_size
                )

                if issue_data:
                    issue_number = issue_data['number']
                    issue_url = issue_data['url']
                    assignees = [a['login'] for a in issue_data['assignees']['nodes']]

                    print(f'✓ Created issue #{issue_number}: {title}')
                    print(f'  URL: {issue_url}')
                    print(f'  ✓ Assigned to: {", ".join(assignees)}')

                    # Add instruction comment
                    instruction = 'The area requiring changes is highlighted with a light purple circle indicator in the screenshot.'
                    if add_comment_to_issue(issue_data['id'], instruction):
                        print(f'  ✓ Added instruction comment')

                    created_count += 1
                    print('')

            except Exception as e:
                print(f'  ✗ Error: {e}')
                print('')

            # Rate limiting
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
