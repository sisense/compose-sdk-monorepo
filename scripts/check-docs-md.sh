#! /usr/bin/env bash
#
# This script checks if there are any changes to the API Doc after running 'yarn docs:gen:md'

set -o errexit

git add -N ./docs-md/
FILES_CHANGED=$(git diff --name-only ./docs-md/)

# If there are changes to docs-md, exit with error
if [ -n "$FILES_CHANGED" ]; then
  echo "Error: Commit has caused the API Doc changes below. Please run 'yarn docs:gen:md' locally and include those changes in this commit or a separate commit." >&2
  echo "$FILES_CHANGED"
  exit 1
fi

echo "No API Doc changes found"

# Check for changes to the doc tag usage report
git add -N ./.reports/doc-tag-usage-report/
TAG_REPORT_CHANGED=$(git diff --name-only ./.reports/doc-tag-usage-report/)

if [ -n "$TAG_REPORT_CHANGED" ]; then
  echo "Error: Commit has caused the Doc tag report changes below. Please run 'yarn docs:gen:md' locally to regenerate the doc-tag-usage-report and include those changes in this commit or a separate commit." >&2
  echo "$TAG_REPORT_CHANGED"
  exit 1
fi

echo "No doc tag usage changes found"
exit 0
