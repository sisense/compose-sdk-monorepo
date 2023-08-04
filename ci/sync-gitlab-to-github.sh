#! /usr/bin/env bash
#
# Using SSH credentials, tag the HEAD of the current branch and push it to
# the GitHub mirror.

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

# Push external-main to GitHub's main branch
if [ ! -z $(git remote | grep -w external) ]; then
  git remote remove external
fi

git remote add external ${GITHUB_URL}
git fetch external
git push external HEAD:main -f

# Force update external-main in GitLab (since the bot amended the last commit)
git push -f origin external-main
