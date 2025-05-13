#! /usr/bin/env bash
#
# Run this script locally to update the external-main branch in the remote repo
# with the all the changes since the last published tag.
#
# The external branch is determined based on the current branch.
# If the current branch is "master", it updates the "external-main" branch.
# If the current branch is "v1.x", it updates the "external-v1.x" branch, and so on.
#
# Run with an argument to specify the end point (this defaults to HEAD of origin/master):
# $ ./scripts/update-external-main.sh v0.6.0

# Get the current branch name
current_branch=$(git symbolic-ref --short HEAD)

# Determine the external branch name based on the current branch
if [[ "$current_branch" == "master" ]]; then
    external_branch="external-main"
elif [[ "$current_branch" =~ ^v[0-9]+\.x$ ]]; then
    external_branch="external-${current_branch}"
else
    echo "Unsupported branch: ${current_branch}. Supported branches: master, v1.x, v2.x, etc."
    exit 1
fi

set -o errexit
set -o xtrace

# Clean untracked files and directories
git clean -df

# Fetch the latest changes from the remote
git fetch origin

# Checkout the corresponding external branch
git checkout -B "$external_branch" "origin/$external_branch"

# Get latest tag on this branch. If no tag is found, then the commit hash of
# HEAD is returned.
last_published_tag=$(git describe --tags --abbrev=0 --always)

# Check if origin/$current_branch exists, else fallback to local branch
if git show-ref --verify --quiet "refs/remotes/origin/$current_branch"; then
    diff_target="origin/$current_branch"
else
    diff_target="$current_branch"
fi

# Reset your local external-* branch to the specified ref and stage changes.
git diff ${last_published_tag} ${1:-$diff_target} --binary | git apply --whitespace=fix

# Remove sensitive or irrelevant information
rm -f CONTRIBUTING.md

# Remove internal scripts
rm -f ./scripts/get-mrs.cjs

# Remove internal examples, internal packages, and test helpers
rm -rf ./examples
rm -rf ./packages/internal
rm -rf ./packages/sdk-query-client/src/__test-helpers__

# Remove e2e tests
rm -rf ./e2e

# Remove code for features that are under development.
rm -rf packages/sdk-ui/src/__exclude__

# Remove demo app with POC code.
rm -rf packages/sdk-ui/src/__demo__

# need to regenerate the yarn.lock file after all the changes
yarn install

git add .

# Run script with node directly instead of yarn version:current so we avoid
# installing dependencies.
current_version=$(node ./scripts/current-version.cjs)
target_tag="v${current_version}"

# Commit changes using current package.json.
git commit -m "Release ${target_tag}" --no-verify

# Push to the destination branch. This should be a fast-forward update, so no
# force is needed.
git push origin HEAD:"$external_branch"
