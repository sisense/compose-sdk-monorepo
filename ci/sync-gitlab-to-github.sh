#! /usr/bin/env bash
#
# Using SSH credentials, tag the HEAD of the current branch and push it to
# the GitHub mirror.
#
# The external GitHub branch is determined based on the current Gitlab branch.
# If the current branch is "external-main", it updates the "main" branch on GitHub.
# If the current branch is "external-v1.x", it updates the "v1.x" branch on GitHub, and so on.

# Get current GitLab branch name
current_branch=$(git rev-parse --abbrev-ref HEAD)

# Determine the target GitHub branch
if [[ "$current_branch" == "external-main" ]]; then
  target_github_branch="main"
elif [[ "$current_branch" =~ ^external-v[0-9]+\.x$ ]]; then
  # Strip the 'external-' prefix to get the target branch
  target_github_branch="${current_branch#external-}"
else
  echo "Error: Unrecognized branch name pattern: $current_branch."
  echo "Supported branches: external-main, external-v1.x, external-v2.x, etc."
  exit 1
fi

set -o errexit
set -o xtrace

# Set up SSH.
eval $(ssh-agent -s)
chmod 400 ${GITHUB_DEPLOY_KEY}
ssh-add ${GITHUB_DEPLOY_KEY}
mkdir -p ~/.ssh
# https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/githubs-ssh-key-fingerprints
cat ${GITHUB_KNOWN_HOSTS} >> ~/.ssh/known_hosts

# Remove .gitlab-ci.yml from the repo.
rm -f .gitlab-ci.yml
git add .

# Re-commit with compose-sdk-release-bot's author metadata.
git commit --amend --no-edit --reset-author

# Run script with node directly instead of yarn version:current so we avoid
# installing dependencies.
current_version=$(node ./scripts/current-version.cjs)
new_published_tag="v${current_version}-external"

# Push tag to GitLab
git tag -f ${new_published_tag}
git push -f origin ${new_published_tag}

# Configure GitHub remote
if [ ! -z $(git remote | grep -w external) ]; then
  git remote remove external
fi

git remote add external ${GITHUB_URL}
git fetch external

# Push to GitHub target branch
git push external HEAD:${target_github_branch} -f

# Force update GitLab source branch (since the bot amended the last commit)
git push -f origin ${current_branch}
