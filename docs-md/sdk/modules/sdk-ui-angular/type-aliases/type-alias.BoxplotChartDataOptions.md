---
title: BoxplotChartDataOptions
---

# Type alias BoxplotChartDataOptions

> **BoxplotChartDataOptions**: `object`

Configuration for how to query aggregate data and assign data
to axes of a Boxplot chart.

The Boxplot chart can receive a singular numeric column, which is utilized internally to calculate multiple metrics
such as `whisker max`, `whisker min`, `box max`, `box median`, and `box min`.

## Type declaration

### `boxType`

**boxType**: [`BoxWhiskerType`](type-alias.BoxWhiskerType.md)

The type of box whisker data algorithm to be used.

***

### `category`

**category**: [(Column \| StyledColumn)?]

Columns (or attributes) whose values represent categories in the chart.

***

### `outliersEnabled`

**outliersEnabled**?: `boolean`

Toggle flag whether outliers should be enabled in the boxplot chart.

***

### `value`

**value**: [[`Column`](../../sdk-data/interfaces/interface.Column.md) \| [`StyledColumn`](../interfaces/interface.StyledColumn.md)]

Columns (or attributes) whose values represent the target numeric value column for computing boxplot metrics according to the selected `boxType`
