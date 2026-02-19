---
title: CalendarHeatmapStyleOptions
---

# Interface CalendarHeatmapStyleOptions

Configuration options that define functional style of the various elements of calendar-heatmap chart

## Properties

### cellLabels

> **cellLabels**?: [`CalendarHeatmapCellLabels`](../../sdk-ui/type-aliases/type-alias.CalendarHeatmapCellLabels.md)

Configuration for day numbers (1-31) in calendar cells

***

### dayLabels

> **dayLabels**?: `object`

Configuration for weekday names in the header

#### Type declaration

> ##### `dayLabels.enabled`
>
> **enabled**?: `boolean`
>
> Boolean flag that defines if calendar weekday names should be shown
>
> ###### Default
>
> ```ts
> true
> ```
>
> ##### `dayLabels.style`
>
> **style**?: [`TextStyle`](../../sdk-ui/type-aliases/type-alias.TextStyle.md)
>
> Style configuration for calendar weekday names
>
> ::: warning Deprecated
> Please use `textStyle` instead
> :::
>
> ##### `dayLabels.textStyle`
>
> **textStyle**?: [`TextStyle`](../../sdk-ui/type-aliases/type-alias.TextStyle.md)
>
> Style configuration for calendar weekday names
>
>

***

### height

> **height**?: `number`

Total height of the component, which is considered in the following order of priority:

1. Value passed to this property (in pixels).
2. Height of the container wrapping this component
3. Default value of 400px (for component without header) or 425px (for component with header).

***

### monthLabels

> **monthLabels**?: `object`

Configuration for month names in multi-month view types

#### Type declaration

> ##### `monthLabels.enabled`
>
> **enabled**?: `boolean`
>
> Boolean flag that defines if month names should be shown
>
> ###### Default
>
> ```ts
> true
> ```
>
> ##### `monthLabels.style`
>
> **style**?: [`TextStyle`](../../sdk-ui/type-aliases/type-alias.TextStyle.md)
>
> Style configuration for month names
>
> ::: warning Deprecated
> Please use `textStyle` instead
> :::
>
> ##### `monthLabels.textStyle`
>
> **textStyle**?: [`TextStyle`](../../sdk-ui/type-aliases/type-alias.TextStyle.md)
>
> Style configuration for month names
>
>

***

### pagination

> **pagination**?: `object`

Configuration for pagination controls in multi-month view types

#### Type declaration

> ##### `pagination.enabled`
>
> **enabled**?: `boolean`
>
> Boolean flag that defines if pagination controls should be shown
>
> ###### Default
>
> ```ts
> true
> ```
>
> ##### `pagination.startMonth`
>
> **startMonth**?: `Date`
>
> Start month to display when the chart is first rendered
>
> ##### `pagination.textStyle`
>
> **textStyle**?: [`TextStyle`](../../sdk-ui/type-aliases/type-alias.TextStyle.md)
>
> Style configuration for pagination controls text
>
>

***

### startOfWeek

> **startOfWeek**?: [`CalendarDayOfWeek`](../type-aliases/type-alias.CalendarDayOfWeek.md)

Determines which day of the week to start the calendar with

#### Default

```ts
'sunday'
```

***

### subtype

> **subtype**?: [`CalendarHeatmapSubtype`](../type-aliases/type-alias.CalendarHeatmapSubtype.md)

Calendar heatmap chart subtype

#### Default

```ts
'calendar-heatmap/split'
```

***

### viewType

> **viewType**?: [`CalendarHeatmapViewType`](../type-aliases/type-alias.CalendarHeatmapViewType.md)

View type determines how many months to display: 'month' (1), 'quarter' (3), 'half-year' (6), 'year' (12)

***

### weekends

> **weekends**?: `object`

Configuration for weekend days

#### Type declaration

> ##### `weekends.cellColor`
>
> **cellColor**?: `string`
>
> Calendar cell color for weekend days
>
> ###### Default
>
> ```ts
> '#e6e6e6'
> ```
>
> ##### `weekends.days`
>
> **days**?: [`CalendarDayOfWeek`](../type-aliases/type-alias.CalendarDayOfWeek.md)[]
>
> Weekend days - defaults to ['saturday', 'sunday']
>
> ##### `weekends.enabled`
>
> **enabled**?: `boolean`
>
> Boolean flag that enables/disables weekend highlighting
>
> ###### Default
>
> ```ts
> false
> ```
>
> ##### `weekends.hideValues`
>
> **hideValues**?: `boolean`
>
> Whether to hide values in tooltip for weekend days
>
> ###### Default
>
> ```ts
> false
> ```
>
>

***

### width

> **width**?: `number`

Total width of the component, which is considered in the following order of priority:

1. Value passed to this property (in pixels)
2. Width of the container wrapping this component
3. Default value of 400px
