#! /usr/bin/env bash
#
# This script generates API Doc in Markdown format.
# It runs typedoc with typedoc-plugin-markdown to generate the markdown files
# and runs additional ad-hoc steps to adjust the file contents as required by developer.sisense.com.

ORANGE=$'\e[0;33m'
NC=$'\e[0m'
echo "${ORANGE}** NOTE: TYPEDOC WARNINGS ARE TREATED AS ERRORS AND MUST BE FIXED FOR THE CI JOB TO PASS **${NC}"

set -o errexit
set -o xtrace

# Build typedoc-plugin-markdown
yarn nx run @ethings-os/typedoc-plugin-markdown:build

# Run typedoc with typedoc-plugin-markdown to generate the markdown files
TYPEDOC_MODE=PUBLIC TYPEDOC_FORMAT=MD typedoc --options typedoc.config.cjs

docs_path="./docs-md/sdk"

# https://stackoverflow.com/questions/43171648/sed-gives-sed-cant-read-no-such-file-or-directory
# Default case for Linux sed, just use "-i"
sed_option=(-i)
case "$(uname)" in
  # For macOS, use two parameters
  Darwin*) sed_option=(-i "")
esac

# Replace modules/index.md with a customized version
cp -f ${docs_path}/../index-modules.md ${docs_path}/modules/index.md

# Copy media files. This is to work around a bug in typedoc-plugin-markdown 4.x
# that media files are not copied to the output directory.
cp -Rf ./media/* ${docs_path}/img/

# Adjust the links in the markdown files of sdk-ui-angular to point to objects in sdk-ui, instead of sdk-ui-preact
find ${docs_path}/modules/sdk-ui-angular \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed "${sed_option[@]}" -e 's|sdk-ui-preact|sdk-ui|g'
find ${docs_path}/modules/sdk-ui-angular \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed "${sed_option[@]}" -e 's|-1.md|.md|g'
rm -rf ${docs_path}/modules/sdk-ui-preact

# Adjust the links in the markdown files of sdk-ui-vue to point to objects in sdk-ui, instead of sdk-ui-preact
find ${docs_path}/modules/sdk-ui-vue \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed "${sed_option[@]}" -e 's|sdk-ui-preact|sdk-ui|g'
find ${docs_path}/modules/sdk-ui-vue \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed "${sed_option[@]}" -e 's|-1.md|.md|g'

# Adjust the media paths in the markdown files
find ${docs_path}/modules \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed "${sed_option[@]}" -e 's|media://|../../../img/|g'

# Replace tsx code blocks with ts as required by developer.sisense.com
find ${docs_path}/modules \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed "${sed_option[@]}" -e 's|```tsx|```ts|g'

# Copy CHANGELOG.md from the root directory to the docs-md so it can be published to developer.sisense.com
cp -Rf ./CHANGELOG.md ${docs_path}/
