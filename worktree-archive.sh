#!/bin/bash
set -e

# Worktree Archive Script
# Fast-forwards the root clone's master branch so the main checkout stays fresh
# when a Conductor workspace is archived.

WORKTREE_PATH="$(pwd)"
ROOT_PATH="$(git worktree list --porcelain 2>/dev/null | head -1 | cut -d' ' -f2 || echo "")"

if [ -z "$ROOT_PATH" ] || [ "$ROOT_PATH" = "$WORKTREE_PATH" ]; then
    echo "No separate root clone to sync"
    exit 0
fi

echo "Syncing root clone at $ROOT_PATH..."

if ! git -C "$ROOT_PATH" fetch origin master 2>/dev/null; then
    echo "  Fetch failed; skipping sync"
    exit 0
fi

ROOT_BRANCH=$(git -C "$ROOT_PATH" branch --show-current 2>/dev/null || echo "")

if [ "$ROOT_BRANCH" != "master" ]; then
    echo "  Root is on '$ROOT_BRANCH', not master — fetched only, leaving working copy alone"
    exit 0
fi

if [ -n "$(git -C "$ROOT_PATH" status --porcelain 2>/dev/null)" ]; then
    echo "  Root master has uncommitted changes — fetched only, leaving working copy alone"
    exit 0
fi

if git -C "$ROOT_PATH" merge --ff-only origin/master 2>/dev/null; then
    echo "  Fast-forwarded root master to origin/master"
else
    echo "  Root master has diverged from origin/master — fetched only"
fi
