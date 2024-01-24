---
title: IndicatorChartDataOptions
---

# Interface IndicatorChartDataOptions

Configuration for how to query aggregate data and assign data
to a [Indicator chart](../type-aliases/type-alias.IndicatorChartType.md).

## Properties

### max

> **max**?: ([`MeasureColumn`](../../sdk-data/interfaces/interface.MeasureColumn.md) \| [`CalculatedMeasureColumn`](../../sdk-data/interfaces/interface.CalculatedMeasureColumn.md) \| [`StyledMeasureColumn`](interface.StyledMeasureColumn.md))[]

Measure columns (or measures) whose values are used for max value of indicator.

***

### min

> **min**?: ([`MeasureColumn`](../../sdk-data/interfaces/interface.MeasureColumn.md) \| [`CalculatedMeasureColumn`](../../sdk-data/interfaces/interface.CalculatedMeasureColumn.md) \| [`StyledMeasureColumn`](interface.StyledMeasureColumn.md))[]

Measure columns (or measures) whose values are used for min value of indicator.

***

### secondary

> **secondary**?: ([`MeasureColumn`](../../sdk-data/interfaces/interface.MeasureColumn.md) \| [`CalculatedMeasureColumn`](../../sdk-data/interfaces/interface.CalculatedMeasureColumn.md) \| [`StyledMeasureColumn`](interface.StyledMeasureColumn.md))[]

Measure columns (or measures) whose values are used for secondary value of indicator.

***

### value

> **value**?: ([`MeasureColumn`](../../sdk-data/interfaces/interface.MeasureColumn.md) \| [`CalculatedMeasureColumn`](../../sdk-data/interfaces/interface.CalculatedMeasureColumn.md) \| [`StyledMeasureColumn`](interface.StyledMeasureColumn.md))[]

Measure columns (or measures) whose values are used for main value of indicator.
