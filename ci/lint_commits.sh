#!/usr/bin/env bash

set -o xtrace

if [[ "$CI_COMMIT_REF_NAME" == "" ]]; then
	echo '$CI_COMMIT_REF_NAME missing'
	exit 1
fi

MERGE_TARGET=$CI_MERGE_REQUEST_TARGET_BRANCH_NAME
git fetch origin $MERGE_TARGET
git fetch origin $CI_COMMIT_REF_NAME


if [[ "$CI_COMMIT_REF_NAME" == "$MERGE_TARGET" ]]; then
	echo "Skipping check on ${MERGE_TARGET} branch because commits merged to origin/${MERGE_TARGET} are out of scope of this merge request"
	exit 0
fi

COMMITS=`git cherry origin/$MERGE_TARGET origin/$CI_COMMIT_REF_NAME`
ALL_COMMITS_ARE_CORRECT=true

for COMMIT in ${COMMITS//+ }; do
    MESSAGE=`git log --format=%B -n 1 $COMMIT`
    if ! echo "$MESSAGE" | npx commitlint; then
        ALL_COMMITS_ARE_CORRECT=false
        break
    fi
done

if [ "$ALL_COMMITS_ARE_CORRECT" = true ] ; then
    exit 0
else
    echo "Commit messages don't meet requirements. All of your branch's commit messages must meet requirements of 'commitlint' to pass this check."
    exit 1
fi