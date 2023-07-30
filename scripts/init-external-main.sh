#! /usr/bin/env bash
#
# This script is designed to be run locally. This initializes the target branch
# branch by checking out the "master" branch, squashing all commits since the
# very first commit into 1 commit, and pushes it up to the target branch.
#
# Run with a specific ref as an optional argument (otherwise, this defaults to HEAD of origin/master):
# $ ./scripts/init-external-main.sh v0.5.4

set -o errexit
set -o xtrace

# Check for clean working directory
if [ -n "$(git status --porcelain)" ]; then 
  echo "Your current working directory is not clean, please commit/stash your changes before rerunning this script."
  exit 1
fi

# Get up-to-date source branch and create a new branch from it
git fetch origin
git checkout -B external-main ${1:-'origin/master'} --no-track

# Reset all changes since the very first commit (exclusive) and stage them for
# the next commit
git reset --soft $(git log --reverse --format=%H | head -n 1)

tag="v$(yarn version:current)"

# Amend all staged changes to the first commit and reset author metadata
git commit -m "Release ${tag}" --amend --reset-author

# Push to the destination branch
git push -f origin external-main
