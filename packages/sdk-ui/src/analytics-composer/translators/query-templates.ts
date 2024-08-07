export const QUERY_TEMPLATE = `# This is your query - you can modify it directly and click Run to see new results.
# Try uncommenting the elements below
# To learn more about the query syntax, visit [Doc URL]
---
model: {{dataSourceTitle}}
# metadata:
#   - jaql:
#       dim: "[DimTable1.SomeTextColumn]"
#       title: Dimension1
#   - jaql:
#       dim: "[Table2.SomeDateColumn]"
#       level: years
#       title: Dimension2
#     format:
#       mask:
#         years: yyyy
#   - jaql:
#       dim: "[FactTable1.Column1]"
#       agg: sum
#       title: Measure1
#   - jaql:
#       type: measure
#       formula: (SUM([Column1]) - SUM([Column2])) / SUM([Column1])
#       context:
#         "[Column1]":
#           dim: "[FactTable1.Column1]"
#         "[Column2]":
#           dim: "[FactTable1.Column2]"
#       title: Measure2
#   - jaql:
#       dim: "[FactTable1.Column1]"
#       filter:
#         fromNotEqual: 1000
#     panel: scope
# chart:
#   chartType: table
#   dataOptions:
#     columns:
#       - name: Dimension1
#       - name: Dimension2
#       - name: Measure1
#       - name: Measure2`;
