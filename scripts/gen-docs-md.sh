#! /usr/bin/env bash
#
# This script generates API Doc in Markdown format.
# It runs typedoc with typedoc-plugin-markdown to generate the markdown files
# and runs additional ad-hoc steps to adjust the file contents as required by sisense.dev.

set -o errexit
set -o xtrace

# Run typedoc with typedoc-plugin-markdown to generate the markdown files
TYPEDOC_MODE=PUBLIC TYPEDOC_FORMAT=MD typedoc --options typedoc.config.cjs

docs_path="./docs-md/sdk"

# Replace modules/index.md with a customized version
cp -f ${docs_path}/../index-modules.md ${docs_path}/modules/index.md

# Copy media files. This is to work around a bug in typedoc-plugin-markdown 4.x
# that media files are not copied to the output directory.

cp -Rf ./media/* ${docs_path}/img/

# Adjust the media paths in the markdown files
find ${docs_path}/modules \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i '' -e 's|media://|../../../img/|g'

# Replace tsx code blocks with ts as required by sisense.dev
find ${docs_path}/modules \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i '' -e 's|```tsx|```ts|g'
