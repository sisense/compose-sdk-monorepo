---
title: ScatterChartDataOptions
---

# Interface ScatterChartDataOptions

Configuration for how to query aggregate data and assign data
to axes of a [Scatter chart](../type-aliases/type-alias.ScatterChartType.md).

These charts can include data points scattered on X-Y plane further broken down by categories
and encoded by bubble sizes.

## Properties

### breakByColor

> **breakByColor**?: [`CalculatedMeasureColumn`](../../sdk-data/interfaces/interface.CalculatedMeasureColumn.md) \| [`Column`](../../sdk-data/interfaces/interface.Column.md) \| [`MeasureColumn`](../../sdk-data/interfaces/interface.MeasureColumn.md) \| [`StyledColumn`](interface.StyledColumn.md) \| [`StyledMeasureColumn`](interface.StyledMeasureColumn.md)

Select a column by which to break (group) the columns in the chart.
This must be a descriptive column. If you select descriptive data,
then the points in the chart are grouped into the members of the column.
Each member is represented by a different color.

OR

Select a column by which to color the columns in the chart.
This must be a numeric column. If you select numeric data,
then the point color is a gradient where the highest value is
the darkest color and the lowest value is the lightest color.

***

### breakByPoint

> **breakByPoint**?: [`Column`](../../sdk-data/interfaces/interface.Column.md) \| [`StyledColumn`](interface.StyledColumn.md)

A column to be scattered across the chart as circles;
one point (circle) appears on the chart for each member of this column.
These columns must be descriptive data (not numeric data).

You can only add a break-by point if either the X-axis or the Y-axis was defined to represent numeric data.

***

### seriesToColorMap

> **seriesToColorMap**?: [`ValueToColorMap`](../type-aliases/type-alias.ValueToColorMap.md)

Optional mapping of each of the series created by [breakByColor](interface.ScatterChartDataOptions.md#breakbycolor) to colors.

***

### size

> **size**?: [`CalculatedMeasureColumn`](../../sdk-data/interfaces/interface.CalculatedMeasureColumn.md) \| [`MeasureColumn`](../../sdk-data/interfaces/interface.MeasureColumn.md) \| [`StyledMeasureColumn`](interface.StyledMeasureColumn.md)

Column that determines the size of the circle. It must be numeric data.

***

### x

> **x**?: [`CalculatedMeasureColumn`](../../sdk-data/interfaces/interface.CalculatedMeasureColumn.md) \| [`Column`](../../sdk-data/interfaces/interface.Column.md) \| [`MeasureColumn`](../../sdk-data/interfaces/interface.MeasureColumn.md) \| [`StyledColumn`](interface.StyledColumn.md) \| [`StyledMeasureColumn`](interface.StyledMeasureColumn.md)

A column or measure column whose values are placed on the X-axis.

Typically, the X-axis of a Scatter Chart is used to represent numeric data.
Alternatively, Descriptive data is also supported. At most one column is allowed.

***

### y

> **y**?: [`CalculatedMeasureColumn`](../../sdk-data/interfaces/interface.CalculatedMeasureColumn.md) \| [`Column`](../../sdk-data/interfaces/interface.Column.md) \| [`MeasureColumn`](../../sdk-data/interfaces/interface.MeasureColumn.md) \| [`StyledColumn`](interface.StyledColumn.md) \| [`StyledMeasureColumn`](interface.StyledMeasureColumn.md)

A column or measure column whose values are placed on the Y-axis.

Typically, the Y-axis of a Scatter Chart is used to represent numeric data.
Alternatively, Descriptive data is also supported. At most one column is allowed.
