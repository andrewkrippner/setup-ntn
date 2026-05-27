#!/bin/bash
set -e

# Worktree Setup Script
# Syncs the worktree with origin/master so we're always on the latest code,
# then installs npm dependencies.

WORKTREE_PATH="$(pwd)"

echo "Syncing with remote..."
git fetch --force --tags origin

CURRENT_BRANCH=$(git branch --show-current)
if [ -n "$CURRENT_BRANCH" ]; then
    # Fast-forward to origin/master when the branch hasn't diverged
    if git merge-base --is-ancestor HEAD origin/master 2>/dev/null; then
        git merge --ff-only origin/master 2>/dev/null && echo "Fast-forwarded to origin/master" || true
    fi
    # Set upstream so Conductor can map the worktree to its PR. Never fall back
    # to origin/master for feature branches without a matching remote.
    if [ "$CURRENT_BRANCH" = "master" ]; then
        git branch --set-upstream-to=origin/master 2>/dev/null && echo "Set upstream to origin/master" || true
    elif git rev-parse --verify "origin/$CURRENT_BRANCH" >/dev/null 2>&1; then
        git branch --set-upstream-to="origin/$CURRENT_BRANCH" 2>/dev/null && echo "Set upstream to origin/$CURRENT_BRANCH" || true
    fi
fi

echo ""
echo "Installing dependencies..."
npm install

echo ""
echo "Setup complete!"
