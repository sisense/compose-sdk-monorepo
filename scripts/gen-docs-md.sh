#! /usr/bin/env bash
#
# This script generates API Doc in Markdown format.
# It runs typedoc with typedoc-plugin-markdown to generate the markdown files
# and runs additional ad-hoc steps to adjust the file contents as required by developer.sisense.com.

ORANGE=$'\e[0;33m'
NC=$'\e[0m'
echo "${ORANGE}** NOTE: TYPEDOC WARNINGS ARE TREATED AS ERRORS AND MUST BE FIXED FOR THE CI JOB TO PASS **${NC}"

set -o errexit

# Build typedoc-plugin-markdown
yarn nx run @sisense/typedoc-plugin-markdown:build

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

# Synthesize a "General" group page.
# Its sub-sections (Formatting/Styling/Primitives) are emitted by TypeDoc as regular
# top-level groups; the dev-docs sidebar nests them under this General page (see
# dev-docs scripts/nav.js). Here we generate the General page that they nest under. Only
# sub-sections that actually exist for a package are linked.
general_subgroups=(
  "Formatting:formatting:Utilities for formatting numbers, dates, and query result data sets."
  "Styling:styling:Utilities for creating and inspecting color gradients used in chart styling."
  "Primitives:primitives:General-purpose presentational primitive components."
  "Helpers:helpers:General-purpose hooks and utilities for building custom components and plugins."
)
for pkg in sdk-ui sdk-ui-angular sdk-ui-vue; do
  pkg_dir="${docs_path}/modules/${pkg}"
  [ -d "${pkg_dir}" ] || continue
  general_body=""
  for entry in "${general_subgroups[@]}"; do
    title="${entry%%:*}"
    rest="${entry#*:}"
    slug="${rest%%:*}"
    description="${rest#*:}"
    if [ -d "${pkg_dir}/${slug}" ]; then
      general_body="${general_body}- [${title}](../${slug}/index.md) - ${description}\n"
    fi
  done
  if [ -n "${general_body}" ]; then
    mkdir -p "${pkg_dir}/general"
    printf -- '---\ntitle: General\n---\n\n# General\n\nGeneral-purpose utilities and primitives.\n\n%b' "${general_body}" > "${pkg_dir}/general/index.md"
  fi
done

# Post-process each package's module index page (e.g. sdk-ui/index.md) so the
# flat ## Formatting / ## Styling / ## Primitives sections are replaced by a
# single ## General section whose bullet list links to the real sub-group pages.
# This aligns the overview page with the sidebar hierarchy where those three
# groups live under a "General" umbrella.  Only sub-groups whose folders were
# actually emitted by TypeDoc are included.
for pkg in sdk-ui sdk-ui-angular sdk-ui-vue; do
  pkg_dir="${docs_path}/modules/${pkg}"
  index_file="${pkg_dir}/index.md"
  [ -f "${index_file}" ] || continue

  # Build the ## General replacement section in a temp file
  general_idx_tmp=$(mktemp)
  has_sub=false
  printf '## General\n\nGeneral-purpose utilities and primitives for formatting, styling, and common UI components\n\n' > "${general_idx_tmp}"
  for entry in "${general_subgroups[@]}"; do
    title="${entry%%:*}"
    rest="${entry#*:}"
    slug="${rest%%:*}"
    description="${rest#*:}"
    if [ -d "${pkg_dir}/${slug}" ]; then
      printf -- '- [%s](%s/index.md) - %s\n' "${title}" "${slug}" "${description}" >> "${general_idx_tmp}"
      has_sub=true
    fi
  done

  if [ "${has_sub}" = "true" ]; then
    printf '\n' >> "${general_idx_tmp}"
    # Inject the General section where ## Formatting was; skip ## Styling / ## Primitives.
    # Each removed section spans from its ## heading to just before the next ## or EOF.
    awk -v gsf="${general_idx_tmp}" '
      BEGIN { skip=0; injected=0 }
      /^## Formatting$/ {
        if (!injected) { while ((getline line < gsf) > 0) print line; injected=1 }
        skip=1; next
      }
      /^## (Styling|Primitives|Helpers)$/ { skip=1; next }
      /^## / && skip              { skip=0 }
      !skip                       { print }
    ' "${index_file}" > "${index_file}.tmp"
    mv "${index_file}.tmp" "${index_file}"
  fi
  rm -f "${general_idx_tmp}"
done

# Copy CHANGELOG.md from the root directory to the docs-md so it can be published to developer.sisense.com
cp -Rf ./CHANGELOG.md ${docs_path}/
