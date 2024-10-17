---
title: CartesianChartDataOptions
---

# Interface CartesianChartDataOptions

Configuration for how to query aggregate data and assign data
to axes of a [Cartesian chart](../type-aliases/type-alias.CartesianChartType.md).

These charts can include multiple values on both the X and Y-axis,
as well as a break-down by categories displayed on the Y-axis.

## Properties

### breakBy

> **breakBy**: ([`Column`](../../sdk-data/interfaces/interface.Column.md) \| [`StyledColumn`](interface.StyledColumn.md))[]

Columns (or attributes) by which to break (group) the data represented in the chart.

Each group is represented by a different visual encoding - for example, color of bars in a bar chart,
and is automatically added to the chart's legend.

***

### category

> **category**: ([`Column`](../../sdk-data/interfaces/interface.Column.md) \| [`StyledColumn`](interface.StyledColumn.md))[]

Columns (or attributes) whose values are placed on the X-axis.

Typically, the X-axis represents descriptive data.

***

### seriesToColorMap

> **seriesToColorMap**?: [`ValueToColorMap`](../type-aliases/type-alias.ValueToColorMap.md)

Optional mapping of each of the series to colors.

***

### value

> **value**: ([`CalculatedMeasureColumn`](../../sdk-data/interfaces/interface.CalculatedMeasureColumn.md) \| [`MeasureColumn`](../../sdk-data/interfaces/interface.MeasureColumn.md) \| [`StyledMeasureColumn`](interface.StyledMeasureColumn.md))[]

Measure columns (or measures) whose values are scaled to the Y-axis of the chart.

Each measure is represented as a series in the chart.
