#! /usr/bin/env bash
#
# Run this script locally to update the external-main branch in the remote repo
# with the all the changes since the last published tag.
#
# Run with an argument to specify the end point (this defaults to HEAD of origin/master):
# $ ./scripts/update-external-main.sh v0.6.0

set -o errexit
set -o xtrace

git checkout external-main
git clean -df

# Get latest tag on this branch. If no tag is found, then the commit hash of
# HEAD is returned.
last_published_tag=$(git describe --tags --abbrev=0 --always)

# Reset your local external-main branch to the specified ref and stage changes.
git diff ${last_published_tag} ${1:-'origin/master'} | git apply --whitespace=fix
git add .

# Run script with node directly instead of yarn version:current so we avoid
# installing dependencies.
current_version=$(node ./scripts/current-version.cjs)
target_tag="v${current_version}"

# Commit changes usinng current package.json.
git commit -m "Release ${target_tag}"

# Push to the destination branch. This should be a fast-forward update, so no
# force is needed.
git push origin HEAD:external-main
