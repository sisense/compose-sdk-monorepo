#!/bin/bash

# Script to get git log changes since the last release
# Usage: ./scripts/release-git-log.sh

set -e

# Function to get the latest release tag
get_latest_release_tag() {
    git describe --tags --abbrev=0 --match="v*" 2>/dev/null
}

# Get the latest release tag
LAST_TAG=$(get_latest_release_tag)

if [ -z "$LAST_TAG" ]; then
    echo "No release tags found. Using first commit as baseline."
    LAST_TAG=$(git rev-list --max-parents=0 HEAD)
fi

echo -e "\n\x1b[1;34m📋 Changes since last release (\x1b[1;32m$LAST_TAG\x1b[1;34m):\x1b[0m"
echo -e "\x1b[1;34m═══════════════════════════════════════════════════════════════\x1b[0m"
echo ""

# Create temporary files for each commit type
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

# Process commits and group by type
git --no-pager log ${LAST_TAG}..HEAD --no-merges --pretty=format:"%s" | while IFS= read -r line; do
    # Extract commit type using simple pattern matching
    if echo "$line" | grep -qE '^[a-z]+(\([^)]*\))?:'; then
        commit_type=$(echo "$line" | sed 's/^\([a-z]*\).*/\1/')

        # Format the commit message with colors
        formatted_line=$(echo "$line" | sed -E \
            -e 's/^([a-z]+)(\([^)]*\):)/\x1b[1;36m\1\x1b[0m\x1b[1;35m\2\x1b[0m/g' \
            -e 's/^([a-z]+)(:)/\x1b[1;36m\1\x1b[0m\x1b[1;35m\2\x1b[0m/g' \
            -e 's/(\([A-Z]+-[0-9]+\))/\x1b[1;33m\1\x1b[0m/g')

        # Append to type-specific file
        echo "  $formatted_line" >> "$TEMP_DIR/$commit_type"
    else
        # Handle commits that don't match conventional format
        formatted_line=$(echo "$line" | sed -E 's/(\([A-Z]+-[0-9]+\))/\x1b[1;33m\1\x1b[0m/g')
        echo "  $formatted_line" >> "$TEMP_DIR/other"
    fi
done

# Function to get type info with emojis
get_type_info() {
    case "$1" in
        feat) echo "✨ Features" ;;
        fix) echo "🐛 Bug Fixes" ;;
        chore) echo "🔧 Chores" ;;
        refactor) echo "♻️  Refactoring" ;;
        docs) echo "📚 Documentation" ;;
        style) echo "💄 Styling" ;;
        test) echo "🧪 Tests" ;;
        perf) echo "⚡ Performance" ;;
        ci) echo "👷 CI/CD" ;;
        build) echo "📦 Build" ;;
        revert) echo "⏪ Reverts" ;;
        other) echo "📝 Other" ;;
        *) echo "📝 ${1^}" ;;
    esac
}

# Output grouped commits in logical order
for commit_type in feat fix refactor chore docs style test perf ci build revert other; do
    if [[ -f "$TEMP_DIR/$commit_type" && -s "$TEMP_DIR/$commit_type" ]]; then
        echo -e "\n\x1b[1;34m$(get_type_info $commit_type)\x1b[0m"
        echo -e "\x1b[90m────────────────────────────────────────────────────────────────\x1b[0m"

        # Output each commit in the group with arrow bullets
        while IFS= read -r commit_line; do
            echo -e "\x1b[90m▸\x1b[0m$commit_line"
        done < "$TEMP_DIR/$commit_type"
    fi
done

echo ""
echo -e "\x1b[1;34m═══════════════════════════════════════════════════════════════\x1b[0m"
echo -e "\x1b[1;36m📊 Summary:\x1b[0m"
echo -e "   \x1b[90m├─\x1b[0m Range: \x1b[33m${LAST_TAG}\x1b[0m..\x1b[33mHEAD\x1b[0m"
echo -e "   \x1b[90m└─\x1b[0m Total commits: \x1b[1;32m$(git rev-list --count ${LAST_TAG}..HEAD --no-merges)\x1b[0m"
