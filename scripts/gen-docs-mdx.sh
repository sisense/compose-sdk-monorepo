#! /usr/bin/env bash
#
# This script generates API docs in MDX-safe Markdown format for Docusaurus.
# It runs typedoc with convertHtmlToJsxInComments so iframes in TSDoc comments
# are emitted as valid JSX and remain functional.

ORANGE=$'\e[0;33m'
NC=$'\e[0m'
echo "${ORANGE}** NOTE: TYPEDOC WARNINGS ARE TREATED AS ERRORS AND MUST BE FIXED FOR THE CI JOB TO PASS **${NC}"

set -o errexit
set -o xtrace

# Build typedoc-plugin-markdown
yarn nx run @sisense/typedoc-plugin-markdown:build

# Run typedoc with MDX format (convertHtmlToJsxInComments + useHTMLEncodedBrackets)
TYPEDOC_MODE=PUBLIC TYPEDOC_FORMAT=MDX typedoc --options typedoc.config.cjs

docs_path="./docs-mdx/compose-sdk"

# https://stackoverflow.com/questions/43171648/sed-gives-sed-cant-read-no-such-file-or-directory
sed_option=(-i)
case "$(uname)" in
  Darwin*) sed_option=(-i "")
esac

# Replace modules/index.md with a customized version (from local docs-mdx)
cp -f ./docs-mdx/index-modules.md "${docs_path}/modules/index.md"

# Copy media files
mkdir -p "${docs_path}/img"
cp -Rf ./media/* "${docs_path}/img/" 2>/dev/null || true

# Adjust the links in the markdown files of sdk-ui-angular to point to objects in sdk-ui
find "${docs_path}/modules/sdk-ui-angular" \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed "${sed_option[@]}" -e 's|sdk-ui-preact|sdk-ui|g'
find "${docs_path}/modules/sdk-ui-angular" \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed "${sed_option[@]}" -e 's|-1.md|.md|g'
rm -rf "${docs_path}/modules/sdk-ui-preact"

# Adjust the links in the markdown files of sdk-ui-vue
find "${docs_path}/modules/sdk-ui-vue" \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed "${sed_option[@]}" -e 's|sdk-ui-preact|sdk-ui|g'
find "${docs_path}/modules/sdk-ui-vue" \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed "${sed_option[@]}" -e 's|-1.md|.md|g'

# Adjust the media paths in the markdown files
find "${docs_path}/modules" \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed "${sed_option[@]}" -e 's|media://|../../../img/|g'
# Replace img require placeholder so Docusaurus/Webpack bundle images (src={require('__MEDIA_PREFIX__file.png').default} -> require('../../../img/file.png'))
find "${docs_path}/modules" \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed "${sed_option[@]}" -e 's|__MEDIA_PREFIX__|../../../img/|g'

# Keep ```tsx in MDX output so Docusaurus can highlight JSX/TSX examples correctly

# Copy CHANGELOG.md
cp -Rf ./CHANGELOG.md "${docs_path}/"
