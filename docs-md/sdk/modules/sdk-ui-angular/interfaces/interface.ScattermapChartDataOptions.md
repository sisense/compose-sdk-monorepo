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

> **details**?: [`Column`](../../sdk-data/interfaces/interface.Column.md) \| [`StyledColumn`](interface.StyledColumn.md) \| [`MeasureColumn`](../../sdk-data/interfaces/interface.MeasureColumn.md) \| [`CalculatedMeasureColumn`](../../sdk-data/interfaces/interface.CalculatedMeasureColumn.md) \| [`StyledMeasureColumn`](interface.StyledMeasureColumn.md)

Column or measure column representing the additional details for the points on the map.

***

### geo

> **geo**: ([`Column`](../../sdk-data/interfaces/interface.Column.md) \| [`StyledColumn`](interface.StyledColumn.md) \| [`ScattermapColumn`](interface.ScattermapColumn.md))[]

Columns (or attributes) whose values represent locations on the map.
Support field(s) that contain geographic data (Country, City, State/Province, etc)
To visualize latitude and longitude data, you have to add one field containing latitude data, and another field containing longitude data, in this order.

***

### size

> **size**?: [`MeasureColumn`](../../sdk-data/interfaces/interface.MeasureColumn.md) \| [`CalculatedMeasureColumn`](../../sdk-data/interfaces/interface.CalculatedMeasureColumn.md) \| [`StyledMeasureColumn`](interface.StyledMeasureColumn.md)

Measure column (or measure) representing the size of the points on the map.
