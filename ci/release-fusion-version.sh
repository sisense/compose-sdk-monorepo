#! /usr/bin/env bash

# Automates versioning and publishing of Fusion-related CSDK releases to Sisense artifactory.
# Supports `master` and `release/lX.Y.Z` branches (e.g. `release/l2025.1.0`).
#
# - From `master`, suffix is `internal`, dist-tag is `latest-internal`
# - From `release/lX.Y.Z`, suffix is `X.Y.Z`, dist-tag is `lX.Y.Z`
#
# Version format: <base-version>-<suffix>.<index>
# Example: 2.1.0-internal.3 or 2.1.0-2025.1.0.4

set -o errexit
set -o xtrace
set -euo pipefail

# Refference package name
ref_pkg_name="@sisense/sdk-ui"

# Get current Git branch
get_current_branch() {
  git rev-parse --abbrev-ref HEAD
}

# Derive version suffix based on branch
get_version_suffix() {
  local branch="$1"
  if [[ "$branch" == "master" ]]; then
    echo "internal"
  elif [[ "$branch" =~ ^release/l([0-9]+\.[0-9]+\.[0-9]+)$ ]]; then
    echo "${BASH_REMATCH[1]}"
  else
    echo "Error: Unsupported branch '$branch'. Must be 'master' or 'release/lX.Y.Z'."
    exit 1
  fi
}

# Get dist-tag based on branch
get_dist_tag() {
  local branch="$1"
  if [[ "$branch" == "master" ]]; then
    echo "latest-internal"
  elif [[ "$branch" =~ ^release/l([0-9]+\.[0-9]+\.[0-9]+)$ ]]; then
    echo "l${BASH_REMATCH[1]}"
  else
    echo "Error: Unsupported branch '$branch'."
    exit 1
  fi
}

# Get base version from root package.json
get_base_version() {
  node -p "require('./package.json').version"
}

# Get next version index
get_next_index() {
  local base="$1"
  local suffix="$2"
  local dist_tag="$3"

  version_line=$(npm dist-tag ls "$ref_pkg_name" 2>/dev/null | grep "^$dist_tag:" || true)
  existing_version=$(echo "$version_line" | awk '{print $2}' || true)

  if [[ "$existing_version" =~ ^$base-$suffix\.([0-9]+)$ ]]; then
    echo $((BASH_REMATCH[1] + 1))
  else
    echo 1
  fi
}

main() {
  branch=$(get_current_branch)

  suffix=$(get_version_suffix "$branch")

  base_version=$(get_base_version)

  dist_tag=$(get_dist_tag "$branch")

  index=$(get_next_index "$base_version" "$suffix" "$dist_tag")
  new_version="${base_version}-${suffix}.${index}"

  yarn workspaces foreach --all --no-private version "$new_version" --deferred
  yarn version apply --all

  yarn nx:build:prod

  yarn workspace @sisense/sdk-ui-preact publish:prepare
  yarn workspaces foreach --all --no-private npm publish --tolerate-republish --tag "$dist_tag"

  echo -e "\n✅ Fusion release complete. Published versions:"
  yarn workspaces foreach --all --no-private exec node -p "require('./package.json').name + ' - ' + require('./package.json').version"
  echo -e "\n📦 Published with dist-tag: '$dist_tag'"
}

main "$@"