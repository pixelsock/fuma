#!/usr/bin/env python3
"""
Auto Merge Monitor - Automatically merges PRs as they become ready
"""

import subprocess
import json
import time
from datetime import datetime
from typing import List, Dict
import sys

REPO = "pixelsock/fuma"
CHECK_INTERVAL = 60  # Check every 60 seconds
MAX_ITERATIONS = 120  # Run for max 2 hours (120 * 60 seconds)

class AutoMergeMonitor:
    def __init__(self):
        self.merged_prs: List[int] = []
        self.conflicting_prs: List[int] = []
        self.iterations = 0

    def log(self, message: str, level: str = "INFO"):
        """Log message with timestamp"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"[{timestamp}] [{level}] {message}")
        sys.stdout.flush()

    def run_gh_command(self, cmd: List[str]) -> str:
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
            return ""

    def get_open_prs(self) -> List[Dict]:
        """Get all open PRs with their mergeable status"""
        output = self.run_gh_command([
            'gh', 'pr', 'list',
            '--repo', REPO,
            '--state', 'open',
            '--json', 'number,title,mergeable',
            '--limit', '100'
        ])

        if not output:
            return []

        return json.loads(output)

    def merge_pr(self, pr_number: int, pr_title: str) -> bool:
        """Attempt to merge a PR"""
        self.log(f"Merging PR #{pr_number}: {pr_title}")

        result = self.run_gh_command([
            'gh', 'pr', 'merge', str(pr_number),
            '--repo', REPO,
            '--squash',
            '--delete-branch'
        ])

        if result or result == "":  # gh pr merge returns empty on success
            self.log(f"✓ Successfully merged PR #{pr_number}", "SUCCESS")
            return True
        else:
            self.log(f"✗ Failed to merge PR #{pr_number}", "ERROR")
            return False

    def monitor_and_merge(self):
        """Main monitoring loop"""
        self.log("Starting auto-merge monitor...")
        self.log(f"Will check every {CHECK_INTERVAL} seconds for up to {MAX_ITERATIONS} iterations")

        while self.iterations < MAX_ITERATIONS:
            self.iterations += 1
            self.log(f"\n{'='*80}")
            self.log(f"Iteration {self.iterations}/{MAX_ITERATIONS}")
            self.log(f"{'='*80}\n")

            # Get current PR status
            open_prs = self.get_open_prs()

            if not open_prs:
                self.log("No open PRs remaining. All done! 🎉", "SUCCESS")
                break

            mergeable_prs = [pr for pr in open_prs if pr['mergeable'] == 'MERGEABLE']
            conflicting_prs = [pr for pr in open_prs if pr['mergeable'] == 'CONFLICTING']
            unknown_prs = [pr for pr in open_prs if pr['mergeable'] == 'UNKNOWN']

            self.log(f"Status: {len(open_prs)} open PRs")
            self.log(f"  - Mergeable: {len(mergeable_prs)}")
            self.log(f"  - Conflicting: {len(conflicting_prs)}")
            self.log(f"  - Unknown: {len(unknown_prs)}")

            # Merge all mergeable PRs
            if mergeable_prs:
                self.log(f"\nFound {len(mergeable_prs)} mergeable PRs:")
                for pr in mergeable_prs:
                    if self.merge_pr(pr['number'], pr['title']):
                        self.merged_prs.append(pr['number'])
                    time.sleep(2)  # Brief delay between merges
            else:
                self.log("\nNo mergeable PRs at this time")

            # Update conflicting list
            self.conflicting_prs = [pr['number'] for pr in conflicting_prs]

            # Check if we're done
            remaining_open = self.get_open_prs()
            if not remaining_open:
                self.log("\n🎉 All PRs have been merged!", "SUCCESS")
                break

            # Wait before next check
            if self.iterations < MAX_ITERATIONS:
                self.log(f"\nWaiting {CHECK_INTERVAL} seconds before next check...")
                time.sleep(CHECK_INTERVAL)

        # Final summary
        self.print_summary()

    def print_summary(self):
        """Print final summary"""
        self.log("\n" + "="*80)
        self.log("AUTO-MERGE MONITOR - FINAL SUMMARY")
        self.log("="*80)

        self.log(f"\nTotal PRs Merged: {len(self.merged_prs)}")
        if self.merged_prs:
            self.log(f"Merged PRs: {self.merged_prs}")

        remaining = self.get_open_prs()
        if remaining:
            self.log(f"\nRemaining Open PRs: {len(remaining)}")
            for pr in remaining:
                self.log(f"  - PR #{pr['number']}: {pr['title']} ({pr['mergeable']})")

        self.log("\n" + "="*80)

if __name__ == "__main__":
    monitor = AutoMergeMonitor()
    try:
        monitor.monitor_and_merge()
    except KeyboardInterrupt:
        monitor.log("\n\nMonitor interrupted by user", "WARNING")
        monitor.print_summary()
        sys.exit(1)
    except Exception as e:
        monitor.log(f"\n\nFatal error: {str(e)}", "ERROR")
        monitor.print_summary()
        sys.exit(1)
