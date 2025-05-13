#! /usr/bin/env bash
#
# This script bumps all versions across workspaces to the desired semver
# version. This includes the package.json in the root workspace.
# The script commits the version bump into the branch and creates/pushes a new
# git tag that points to this commit.

# Input argument
BUMP_STRATEGY="$1"

# Allowed values
allowed=("major" "minor" "patch")

# Validate argument
is_valid=false
for val in "${allowed[@]}"; do
  if [[ "$BUMP_STRATEGY" == "$val" ]]; then
    is_valid=true
    break
  fi
done

if [[ "$is_valid" == false ]]; then
  echo "Error: Invalid BUMP_STRATEGY argument '${BUMP_STRATEGY}'. Must be one of: ${allowed[*]}"
  exit 1
fi

set -o errexit
set -o xtrace

# Use the "--deferred" flag and "version apply" to consume all generated YAML
# files in ".yarn/versions". Running without the "--deferred" flag seems to
# leave behind unused YAML files.
yarn workspaces foreach --no-private version --deferred "$BUMP_STRATEGY"
yarn version --deferred "$BUMP_STRATEGY"
yarn version apply --all

new_tag="v$(yarn version:current)"

git add .
git commit -m "chore(release): bump all packages to ${new_tag} [skip ci]"

yarn build:prod
token=$(curl -u${NEW_ARTIFACTORY_USERNAME}:${NEW_ARTIFACTORY_PASSWORD} ${NPM_REGISTRY_AUTH_URL} | grep _auth | awk '{print $NF}')
yarn config set npmPublishRegistry "${NPM_REGISTRY_URL}"
yarn config set npmAuthIdent "${token}"
yarn publish

git push origin HEAD:${CI_COMMIT_BRANCH}
git tag ${new_tag}
git push origin ${new_tag}
