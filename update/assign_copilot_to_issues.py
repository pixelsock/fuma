#!/usr/bin/env python3
"""
Assign existing GitHub issues to copilot-swe-agent using GraphQL
"""

import subprocess
import sys
import time
import requests

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

def get_issue_id(issue_number):
    """Get GraphQL ID for an issue"""
    query = '''
    query($owner: String!, $name: String!, $number: Int!) {
      repository(owner: $owner, name: $name) {
        issue(number: $number) {
          id
          title
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
        'owner': REPO_OWNER,
        'name': REPO_NAME,
        'number': issue_number
    }

    result = graphql_query(query, variables)
    return result['data']['repository']['issue']

def assign_copilot_to_issue(issue_id):
    """Assign copilot-swe-agent to an issue"""
    mutation = '''
    mutation($issueId: ID!, $actorIds: [ID!]!) {
      replaceActorsForAssignable(input: {
        assignableId: $issueId,
        actorIds: $actorIds
      }) {
        assignable {
          ... on Issue {
            id
            title
            assignees(first: 10) {
              nodes {
                login
              }
            }
          }
        }
      }
    }
    '''

    variables = {
        'issueId': issue_id,
        'actorIds': [COPILOT_BOT_ID]
    }

    result = graphql_query(mutation, variables)
    return result

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

def main():
    if not GITHUB_TOKEN:
        print('Error: GitHub authentication not found')
        sys.exit(1)

    print(f'✓ GitHub authenticated (using gh CLI)\n')

    # Get issue numbers to update (issues 4-48)
    issue_numbers = list(range(4, 49))  # 4 to 48 inclusive

    print(f'Assigning copilot-swe-agent to {len(issue_numbers)} issues...\n')

    updated_count = 0
    failed_count = 0

    for issue_num in issue_numbers:
        try:
            print(f'[{issue_num - 3}/{len(issue_numbers)}] Processing issue #{issue_num}...')

            # Get issue details
            issue_data = get_issue_id(issue_num)
            issue_id = issue_data['id']
            title = issue_data['title']
            current_assignees = [a['login'] for a in issue_data['assignees']['nodes']]

            # Check if already assigned
            if 'copilot-swe-agent' in current_assignees:
                print(f'  ✓ Already assigned to copilot-swe-agent')
                updated_count += 1
                continue

            # Assign to copilot
            result = assign_copilot_to_issue(issue_id)

            if 'errors' in result:
                print(f'  ✗ Error: {result["errors"]}')
                failed_count += 1
                continue

            print(f'  ✓ Assigned to copilot-swe-agent')

            # Add instruction comment if not already present
            # (We'll assume it needs to be added for all)
            instruction = 'The area requiring changes is highlighted with a light purple circle indicator in the screenshot.'
            if add_comment_to_issue(issue_id, instruction):
                print(f'  ✓ Added instruction comment')

            updated_count += 1
            print('')

            # Rate limiting
            time.sleep(2)

        except Exception as e:
            print(f'  ✗ Error: {e}')
            failed_count += 1
            print('')
            continue

    print(f'═══════════════════════════════════════')
    print(f'✓ Complete!')
    print(f'  Updated: {updated_count} issues')
    print(f'  Failed: {failed_count} issues')
    print(f'  Repository: https://github.com/{REPO_OWNER}/{REPO_NAME}/issues')

if __name__ == '__main__':
    main()
