#! /usr/bin/env bash
#
# This script checks if there are any changes to the API Doc after running 'yarn docs:gen:md'

set -o errexit

git add -N ./docs-md/
FILES_CHANGED=$(git diff --name-only ./docs-md/)

# If there are no changes, exit successfully
if [ -z "$FILES_CHANGED" ]; then
  echo "No API Doc changes found"
  exit 0
fi

# If there are changes, exit with error
echo "Error: Commit has caused the API Doc changes below. Please run 'yarn docs:gen:md' locally and include those changes in this commit or a separate commit." >&2
echo "$FILES_CHANGED"

exit 1
