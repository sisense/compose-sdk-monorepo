---
title: CalendarHeatmapChartDataOptions
---

# Interface CalendarHeatmapChartDataOptions <Badge type="alpha" text="Alpha" />

Configuration for how to query aggregate data and assign data
to a Calendar Heatmap chart.

## Properties

### date

> **date**: [`Column`](../../sdk-data/interfaces/interface.Column.md) \| [`StyledColumn`](interface.StyledColumn.md)

Date column representing dates on the calendar heatmap.

***

### value

> **value**: [`CalculatedMeasureColumn`](../../sdk-data/interfaces/interface.CalculatedMeasureColumn.md) \| [`MeasureColumn`](../../sdk-data/interfaces/interface.MeasureColumn.md) \| [`StyledMeasureColumn`](interface.StyledMeasureColumn.md)

Measure column (or measure) assigned to the calendar cells.
