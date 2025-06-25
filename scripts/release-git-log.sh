#!/bin/bash

# Script to get git log changes since the last release
# Usage: ./scripts/release-git-log.sh

set -e

# ANSI Color Constants
readonly RESET='\x1b[0m'
readonly BOLD_BLUE='\x1b[1;34m'
readonly BOLD_GREEN='\x1b[1;32m'
readonly BOLD_CYAN='\x1b[1;36m'
readonly BOLD_MAGENTA='\x1b[1;35m'
readonly BOLD_YELLOW='\x1b[1;33m'
readonly YELLOW='\x1b[33m'
readonly DARK_GRAY='\x1b[90m'

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

echo -e "\n${BOLD_BLUE}📋 Changes since last release (${BOLD_GREEN}$LAST_TAG${BOLD_BLUE}):${RESET}"
echo -e "${BOLD_BLUE}═══════════════════════════════════════════════════════════════${RESET}"
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
            -e "s/^([a-z]+)(\([^)]*\):)/${BOLD_CYAN}\1${RESET}${BOLD_MAGENTA}\2${RESET}/g" \
            -e "s/^([a-z]+)(:)/${BOLD_CYAN}\1${RESET}${BOLD_MAGENTA}\2${RESET}/g" \
            -e "s/(\([A-Z]+-[0-9]+\))/${BOLD_YELLOW}\1${RESET}/g")

        # Append to type-specific file
        echo "  $formatted_line" >> "$TEMP_DIR/$commit_type"
    else
        # Handle commits that don't match conventional format
        formatted_line=$(echo "$line" | sed -E "s/(\([A-Z]+-[0-9]+\))/${BOLD_YELLOW}\1${RESET}/g")
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
        echo -e "\n${BOLD_BLUE}$(get_type_info $commit_type)${RESET}"
        echo -e "${DARK_GRAY}────────────────────────────────────────────────────────────────${RESET}"

        # Output each commit in the group with arrow bullets
        while IFS= read -r commit_line; do
            echo -e "${DARK_GRAY}▸${RESET}$commit_line"
        done < "$TEMP_DIR/$commit_type"
    fi
done

echo ""
echo -e "${BOLD_BLUE}═══════════════════════════════════════════════════════════════${RESET}"
echo -e "${BOLD_CYAN}📊 Summary:${RESET}"
echo -e "   ${DARK_GRAY}├─${RESET} Range: ${YELLOW}${LAST_TAG}${RESET}..${YELLOW}HEAD${RESET}"
echo -e "   ${DARK_GRAY}└─${RESET} Total commits: ${BOLD_GREEN}$(git rev-list --count ${LAST_TAG}..HEAD --no-merges)${RESET}"
