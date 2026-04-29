#! /usr/bin/env bash
#
# Generate license report in Markdown format for the sdk and related packages.
# Run from this directory: `bash generate-license-reports.sh`
# Uses Node 20 (via npx) because license-report >= 6.8 requires Node >= 20.

set -euo pipefail

report_name="license-report-generated.md"
echo "# License Report" > $report_name
{
  echo "License report of third-party dependencies used by Compose SDK and related packages."
  echo ""
  echo "Date: $(date +%F)"
}  >> $report_name
echo "" >> $report_name

gen_report () {
  echo "Generating license report for $1"
    {
      echo "### @sisense/$1"
      echo " "
      npx --yes -p node@20.18.0 -p license-report@6.8.2 license-report --config license-report-config.json --only "dev,prod,peer" --package="$2/package.json"
    } >> $report_name
}

echo "## Compose SDK Packages" >> $report_name
echo "" >> $report_name
for file_path in ../../packages/*
do
  file_name=${file_path##*/}
  if [[ ! -f "$file_path/package.json" ]]; then
    echo "Skipping $file_name (no package.json)"
    continue
  fi
  gen_report "$file_name" "$file_path"
done

echo "## Other Sisense Packages Used By Compose SDK Packages" >> $report_name
echo "" >> $report_name
for file_name in "sisense-charts" "task-manager"
do
  file_path="../../node_modules/@sisense/$file_name"
  if [[ ! -f "$file_path/package.json" ]]; then
    echo "Skipping $file_name (not installed under node_modules)"
    continue
  fi
  gen_report "$file_name" "$file_path"
done
