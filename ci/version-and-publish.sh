#! /usr/bin/env bash
#
# This script bumps all versions across workspaces to the desired semver
# version. This includes the package.json in the root workspace.
# The script commits the version bump into the branch and creates/pushes a new
# git tag that points to this commit.

set -o errexit
set -o xtrace

# Use the "--deferred" flag and "version apply" to consume all generated YAML
# files in ".yarn/versions". Running without the "--deferred" flag seems to
# leave behind unused YAML files.
yarn workspaces foreach --no-private version --deferred $@
yarn version --deferred $@
yarn version apply --all

new_tag="v$(yarn version:current)"

git add .
git commit -m "chore(release): bump all packages to ${new_tag} [skip ci]"

yarn build:prod
yarn config set npmPublishRegistry "${NPM_REGISTRY_URL}"
yarn config set npmAuthIdent "${NPM_REGISTRY_AUTH_TOKEN}"
yarn publish

git push origin HEAD:${CI_COMMIT_BRANCH}
git tag ${new_tag}
git push origin ${new_tag}
