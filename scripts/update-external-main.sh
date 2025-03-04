#! /usr/bin/env bash
#
# Run this script locally to update the external-main branch in the remote repo
# with the all the changes since the last published tag.
#
# Run with an argument to specify the end point (this defaults to HEAD of origin/master):
# $ ./scripts/update-external-main.sh v0.6.0

set -o errexit
set -o xtrace

git clean -df

git fetch origin
git checkout -B external-main origin/external-main

# Get latest tag on this branch. If no tag is found, then the commit hash of
# HEAD is returned.
last_published_tag=$(git describe --tags --abbrev=0 --always)

# Reset your local external-main branch to the specified ref and stage changes.
git diff ${last_published_tag} ${1:-'origin/master'} --binary | git apply --whitespace=fix

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
git push origin HEAD:external-main
