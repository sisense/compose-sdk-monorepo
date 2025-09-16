---
title: CalendarHeatmapStyleOptions
---

# Interface CalendarHeatmapStyleOptions <Badge type="alpha" text="Alpha" />

Configuration options that define functional style of the various elements of CalendarHeatmapChart

## Properties

### height

> **height**?: `number`

Total height of the component, which is considered in the following order of priority:

1. Value passed to this property (in pixels).
2. Height of the container wrapping this component
3. Default value of 400px (for component without header) or 425px (for component with header).

***

### viewType

> **viewType**?: [`CalendarHeatmapViewType`](../type-aliases/type-alias.CalendarHeatmapViewType.md)

View type determines how many months to display: 'month' (1), 'quarter' (3), 'half-year' (6), 'year' (12)

***

### width

> **width**?: `number`

Total width of the component, which is considered in the following order of priority:

1. Value passed to this property (in pixels)
2. Width of the container wrapping this component
3. Default value of 400px
