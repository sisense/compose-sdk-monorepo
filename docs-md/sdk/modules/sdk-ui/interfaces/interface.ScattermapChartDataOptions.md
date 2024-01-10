---
title: ScattermapChartDataOptions
---

# Interface ScattermapChartDataOptions

Configuration for how to query aggregate data and assign data
to axes of a Scattermap chart.

## Properties

### colorBy

> **colorBy**?: [`MeasureColumn`](../../sdk-data/interfaces/interface.MeasureColumn.md) \| [`CalculatedMeasureColumn`](../../sdk-data/interfaces/interface.CalculatedMeasureColumn.md) \| [`StyledMeasureColumn`](interface.StyledMeasureColumn.md)

Measure column (or measure) representing the color of the points on the map.

***

### details

> **details**?: [`StyledColumn`](interface.StyledColumn.md) \| [`Column`](../../sdk-data/interfaces/interface.Column.md) \| [`MeasureColumn`](../../sdk-data/interfaces/interface.MeasureColumn.md) \| [`CalculatedMeasureColumn`](../../sdk-data/interfaces/interface.CalculatedMeasureColumn.md) \| [`StyledMeasureColumn`](interface.StyledMeasureColumn.md)

Column or measure column representing the additional details for the points on the map.

***

### geo

> **geo**: ([`StyledColumn`](interface.StyledColumn.md) \| [`Column`](../../sdk-data/interfaces/interface.Column.md) \| [`ScattermapColumn`](interface.ScattermapColumn.md))[]

Columns (or attributes) whose values represent locations on the map.

***

### size

> **size**?: [`MeasureColumn`](../../sdk-data/interfaces/interface.MeasureColumn.md) \| [`CalculatedMeasureColumn`](../../sdk-data/interfaces/interface.CalculatedMeasureColumn.md) \| [`StyledMeasureColumn`](interface.StyledMeasureColumn.md)

Measure column (or measure) representing the size of the points on the map.
