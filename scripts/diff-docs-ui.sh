#! /usr/bin/env bash
#
# This script generates a diff report for sdk-ui-* packages.
# It uses TypeDoc with the typedoc-plugin-diff-packages plugin to create the report.

# run 'sh diff-docs-ui.sh' from the docs-diff-ui directory

ORANGE=$'\e[0;33m'
NC=$'\e[0m'
echo "${ORANGE}** NOTE: TYPEDOC WARNINGS CAN BE IGNORED FOR NOW **${NC}"

set -o errexit
set -o xtrace

# Build typedoc-plugin-diff-packages
yarn nx run @ethings-os/typedoc-plugin-diff-packages:build

# Run TypeDoc with the typedoc-plugin-diff-packages plugin to create the report
typedoc --options typedoc.diff.config.cjs