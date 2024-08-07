---
title: RangeChartDataOptions
---

# Interface RangeChartDataOptions

Configuration for how to query aggregate data and assign data
to axes of a Range chart.

## Properties

### breakBy

> **breakBy**: ([`StyledColumn`](interface.StyledColumn.md) \| [`Column`](../../sdk-data/interfaces/interface.Column.md))[]

Columns (or attributes) by which to break (group) the data represented in the chart.

Each group is represented by a different visual encoding - for example, color of bars in a bar chart,
and is automatically added to the chart's legend.

***

### category

> **category**: ([`StyledColumn`](interface.StyledColumn.md) \| [`Column`](../../sdk-data/interfaces/interface.Column.md))[]

Columns (or attributes) whose values are placed on the X-axis.

Typically, the X-axis represents descriptive data.

***

### seriesToColorMap

> **seriesToColorMap**?: [`ValueToColorMap`](../type-aliases/type-alias.ValueToColorMap.md)

Optional mapping of each of the series to colors.

***

### value

> **value**: ([`CalculatedMeasureColumn`](../../sdk-data/interfaces/interface.CalculatedMeasureColumn.md) \| [`StyledMeasureColumn`](interface.StyledMeasureColumn.md) \| [`AreaRangeMeasureColumn`](interface.AreaRangeMeasureColumn.md))[]

An array of measure columns used to represent the target numeric values for computing the metrics
in an area range chart.

Each measure column defines the range of values by specifying a lower and an upper bound,
providing the necessary data to visualize the area range on the chart.
