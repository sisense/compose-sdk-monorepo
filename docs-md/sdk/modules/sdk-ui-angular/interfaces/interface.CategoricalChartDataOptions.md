---
title: CategoricalChartDataOptions
---

# Interface CategoricalChartDataOptions

Configuration for how to query aggregate data and assign data
to a [Categorical chart](../type-aliases/type-alias.CategoricalChartType.md).

## Properties

### category

> **category**: ([`Column`](../../sdk-data/interfaces/interface.Column.md) \| [`StyledColumn`](interface.StyledColumn.md))[]

Columns (or attributes) whose values represent categories in the chart.

***

### seriesToColorMap

> **seriesToColorMap**?: [`MultiColumnValueToColorMap`](../type-aliases/type-alias.MultiColumnValueToColorMap.md) \| [`ValueToColorMap`](../type-aliases/type-alias.ValueToColorMap.md)

Optional mapping of each of the series to colors.
([MultiColumnValueToColorMap](../type-aliases/type-alias.MultiColumnValueToColorMap.md) used only for the Sunburst Chart component)

***

### value

> **value**: ([`CalculatedMeasureColumn`](../../sdk-data/interfaces/interface.CalculatedMeasureColumn.md) \| [`MeasureColumn`](../../sdk-data/interfaces/interface.MeasureColumn.md) \| [`StyledMeasureColumn`](interface.StyledMeasureColumn.md))[]

Measure columns (or measures) whose values are scaled to visual elements of the chart.
For example, the size of the pie slices of a pie chart.

Values are typically used to represent numeric data.
