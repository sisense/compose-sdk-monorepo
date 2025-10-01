#! /usr/bin/env bash
#
# Generate license report in Markdown format for the sdk and related packages.
# Run 'npm install -g license-report' to install license-report globally
# Then run 'sh generate-license-reports.sh' from the license-report directory

report_name="license-report-generated.md"
echo "# License Report" > $report_name
{
  echo "License report of third-party dependencies used by Compose SDK and related packages."
  echo ""
  echo "Date: $(date +%F)"
}  >> $report_name

gen_report () {
  echo "Generating license report for $1"
    {
      echo "### @ethings-os/$1"
      echo " "
      license-report --config license-report-config.json --only "dev,prod,peer" --package="$2/package.json"
    } >> $report_name
}

echo "## Compose SDK Packages" >> $report_name
echo "" >> $report_name
for file_path in ../packages/*
do
  file_name=${file_path##*/}
  gen_report "$file_name" "$file_path"
done

echo "## Other Sisense Packages Used By Compose SDK Packages" >> $report_name
echo "" >> $report_name
for file_name in "sisense-charts" "task-manager"
do
  file_path="../node_modules/@ethings-os/$file_name"
  gen_report "$file_name" "$file_path"
done
