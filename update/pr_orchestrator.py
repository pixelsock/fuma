#!/usr/bin/env python3
"""
PR Orchestrator - Manages completion of draft PRs via GitHub Copilot

This orchestrator:
- Processes up to 3 draft PRs in parallel
- Triggers Copilot to complete each PR
- Monitors status and handles conflicts
- Marks PRs for review if issues arise
- Continues until all PRs are complete
"""

import subprocess
import json
import time
from datetime import datetime
from typing import List, Dict, Optional
import sys

REPO = "pixelsock/fuma"
MAX_WORKERS = 3
CHECK_INTERVAL = 60  # Check status every 60 seconds
COMMENT_DELAY = 3    # Delay between comments to avoid rate limits

class PROrchestrator:
    def __init__(self):
        self.draft_prs: List[Dict] = []
        self.active_workers: List[int] = []  # PR numbers being processed
        self.completed_prs: List[int] = []
        self.failed_prs: List[Dict] = []

    def log(self, message: str, level: str = "INFO"):
        """Log message with timestamp"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"[{timestamp}] [{level}] {message}")
        sys.stdout.flush()

    def run_gh_command(self, cmd: List[str]) -> Optional[str]:
        """Run gh CLI command and return output"""
        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                check=True
            )
            return result.stdout.strip()
        except subprocess.CalledProcessError as e:
            self.log(f"Command failed: {' '.join(cmd)}", "ERROR")
            self.log(f"Error: {e.stderr}", "ERROR")
            return None

    def get_draft_prs(self) -> List[Dict]:
        """Get all draft PRs from the repository"""
        self.log("Fetching all draft PRs...")

        output = self.run_gh_command([
            'gh', 'pr', 'list',
            '--repo', REPO,
            '--state', 'open',
            '--json', 'number,title,isDraft,headRefName',
            '--limit', '100'
        ])

        if not output:
            return []

        all_prs = json.loads(output)
        draft_prs = [pr for pr in all_prs if pr['isDraft']]

        self.log(f"Found {len(draft_prs)} draft PRs out of {len(all_prs)} total open PRs")
        return draft_prs

    def get_pr_status(self, pr_number: int) -> Dict:
        """Get detailed status of a specific PR"""
        output = self.run_gh_command([
            'gh', 'pr', 'view', str(pr_number),
            '--repo', REPO,
            '--json', 'number,title,isDraft,state,mergeable,statusCheckRollup,comments'
        ])

        if not output:
            return {}

        return json.loads(output)

    def trigger_copilot_completion(self, pr_number: int, pr_title: str):
        """Add comment to PR to trigger Copilot to complete the work"""
        self.log(f"Triggering Copilot completion for PR #{pr_number}: {pr_title}")

        comment = """@copilot please complete this PR and mark it ready for review.

**Instructions:**
1. Review the issue requirements carefully
2. Implement all necessary changes
3. Ensure all checks pass
4. Remove [WIP] from the title when complete
5. Mark the PR as ready for review (convert from draft)
6. If you encounter any conflicts, please resolve them
7. If you're unsure about any requirements, add a comment asking for clarification

The area requiring changes is highlighted with a light purple circle indicator in the screenshot (if applicable).

Please proceed with completing this work."""

        result = self.run_gh_command([
            'gh', 'pr', 'comment', str(pr_number),
            '--repo', REPO,
            '--body', comment
        ])

        if result is not None:
            self.log(f"✓ Comment added to PR #{pr_number}")
            return True
        else:
            self.log(f"✗ Failed to add comment to PR #{pr_number}", "ERROR")
            return False

    def check_pr_completion(self, pr_number: int) -> str:
        """
        Check if PR is complete
        Returns: 'completed', 'in_progress', 'failed', 'needs_review'
        """
        status = self.get_pr_status(pr_number)

        if not status:
            return 'failed'

        # Check if still draft
        if not status['isDraft']:
            self.log(f"PR #{pr_number} is no longer a draft - completed!")
            return 'completed'

        # Check for recent Copilot activity
        comments = status.get('comments', [])
        recent_copilot_comments = [
            c for c in comments
            if c.get('author', {}).get('login') == 'copilot-swe-agent'
        ]

        if recent_copilot_comments:
            latest_comment = recent_copilot_comments[-1].get('body', '')

            # Check for completion indicators
            if 'ready for review' in latest_comment.lower():
                return 'completed'
            elif 'clarification' in latest_comment.lower() or 'unsure' in latest_comment.lower():
                return 'needs_review'
            elif 'error' in latest_comment.lower() or 'failed' in latest_comment.lower():
                return 'failed'

        return 'in_progress'

    def process_batch(self, batch: List[Dict]):
        """Process a batch of PRs (up to MAX_WORKERS)"""
        self.log(f"\n{'='*80}")
        self.log(f"Processing batch of {len(batch)} PRs")
        self.log(f"{'='*80}\n")

        # Trigger Copilot for each PR in the batch
        for pr in batch:
            pr_number = pr['number']
            pr_title = pr['title']

            if self.trigger_copilot_completion(pr_number, pr_title):
                self.active_workers.append(pr_number)
            else:
                self.failed_prs.append({
                    'number': pr_number,
                    'title': pr_title,
                    'reason': 'Failed to trigger Copilot'
                })

            # Delay between comments to avoid rate limits
            time.sleep(COMMENT_DELAY)

        # Monitor the batch until all complete or fail
        self.monitor_batch()

    def monitor_batch(self):
        """Monitor active PRs until they complete or need review"""
        self.log(f"\nMonitoring {len(self.active_workers)} active PRs...")

        while self.active_workers:
            self.log(f"\nActive PRs: {self.active_workers}")
            self.log(f"Checking status in {CHECK_INTERVAL} seconds...")
            time.sleep(CHECK_INTERVAL)

            still_active = []

            for pr_number in self.active_workers:
                status = self.check_pr_completion(pr_number)

                if status == 'completed':
                    self.log(f"✓ PR #{pr_number} completed!", "SUCCESS")
                    self.completed_prs.append(pr_number)

                elif status == 'needs_review':
                    self.log(f"⚠ PR #{pr_number} needs review - marking for user", "WARNING")
                    self.mark_for_review(pr_number)
                    self.completed_prs.append(pr_number)  # Count as handled

                elif status == 'failed':
                    self.log(f"✗ PR #{pr_number} failed", "ERROR")
                    pr_info = self.get_pr_status(pr_number)
                    self.failed_prs.append({
                        'number': pr_number,
                        'title': pr_info.get('title', 'Unknown'),
                        'reason': 'Processing failed'
                    })

                else:  # in_progress
                    still_active.append(pr_number)

            self.active_workers = still_active

            if self.active_workers:
                self.log(f"Still in progress: {len(self.active_workers)} PRs")

    def mark_for_review(self, pr_number: int):
        """Mark a PR for user review by adding a comment"""
        comment = """🔍 **Needs User Review**

This PR requires clarification or review from the repository owner. Copilot has encountered an issue or is unsure about the requirements.

Please review the latest comments and provide guidance."""

        self.run_gh_command([
            'gh', 'pr', 'comment', str(pr_number),
            '--repo', REPO,
            '--body', comment
        ])

    def run(self):
        """Main orchestration loop"""
        self.log("="*80)
        self.log("PR Orchestrator Starting")
        self.log("="*80)

        # Get all draft PRs
        self.draft_prs = self.get_draft_prs()

        if not self.draft_prs:
            self.log("No draft PRs found. Exiting.")
            return

        total_prs = len(self.draft_prs)
        self.log(f"\nTotal draft PRs to process: {total_prs}")

        # Process PRs in batches of MAX_WORKERS
        for i in range(0, total_prs, MAX_WORKERS):
            batch = self.draft_prs[i:i+MAX_WORKERS]
            batch_num = (i // MAX_WORKERS) + 1
            total_batches = (total_prs + MAX_WORKERS - 1) // MAX_WORKERS

            self.log(f"\n{'='*80}")
            self.log(f"Starting Batch {batch_num}/{total_batches}")
            self.log(f"{'='*80}")

            self.process_batch(batch)

            # Brief pause between batches
            if i + MAX_WORKERS < total_prs:
                self.log(f"\nWaiting 10 seconds before next batch...")
                time.sleep(10)

        # Final report
        self.print_summary()

    def print_summary(self):
        """Print final summary of processing"""
        self.log("\n" + "="*80)
        self.log("PR ORCHESTRATOR - FINAL SUMMARY")
        self.log("="*80)

        total = len(self.draft_prs)
        completed = len(self.completed_prs)
        failed = len(self.failed_prs)

        self.log(f"\nTotal PRs Processed: {total}")
        self.log(f"✓ Completed: {completed}")
        self.log(f"✗ Failed: {failed}")

        if self.completed_prs:
            self.log(f"\n✓ Completed PRs: {self.completed_prs}")

        if self.failed_prs:
            self.log("\n✗ Failed PRs:")
            for pr in self.failed_prs:
                self.log(f"  - PR #{pr['number']}: {pr['title']}")
                self.log(f"    Reason: {pr['reason']}")

        self.log("\n" + "="*80)

if __name__ == "__main__":
    orchestrator = PROrchestrator()
    try:
        orchestrator.run()
    except KeyboardInterrupt:
        orchestrator.log("\n\nOrchestrator interrupted by user", "WARNING")
        orchestrator.print_summary()
        sys.exit(1)
    except Exception as e:
        orchestrator.log(f"\n\nFatal error: {str(e)}", "ERROR")
        orchestrator.print_summary()
        sys.exit(1)
