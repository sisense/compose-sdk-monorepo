---
title: PivotTableStyleOptions
---

# Interface PivotTableStyleOptions

Configuration options that define functional style of the various elements of the PivotTable component.

## Properties

### alternatingColumnsColor

> **alternatingColumnsColor**?: `boolean`

Boolean flag whether to apply background color to alternate columns

***

### alternatingRowsColor

> **alternatingRowsColor**?: `boolean`

Boolean flag whether to apply background color to alternate rows.

***

### headersColor

> **headersColor**?: `boolean`

Boolean flag whether to fill header cells with background color

***

### height

> **height**?: `number`

Total height of the component, which is considered in the following order of priority:

1. Value passed to this property (in pixels).
2. Height of the container wrapping this component
3. Default value of 500px (for component without header) or 525px (for component with header).

***

### highlightColor

> **highlightColor**?: `string`

Color of highlighted cells. If not specified, default value is light yellow (`#ffff9c`).

***

### isAutoContentWidth

> **isAutoContentWidth**?: `boolean`

Boolean flag whether the widths of each vertical column of table cells should be automatically calculated
to fit the width of the component, which defaults to '100%' if `width` is not specified.

If `true`, all vertical columns of table cells will be resized to fit within the component width without requiring horizontal scroll.
If a width is also specified in the `dataOptions` item, this will be used to calculate the width in proportion to the total width of the component.
Using `isAutoContentWidth: true` with a large number of columns displayed may result in very narrow columns, and is not recommended.

If `false`, each vertical column of table cells will be calculated to fit the contents, or if specified, the width provided in the corresponding `dataOptions` item.
Horizontal scroll will be shown automatically if required.

#### Default

```ts
false
```

***

### isAutoHeight

> **isAutoHeight**?: `boolean`

Boolean flag whether the height of the component should be automatically adjusted to fit the content

***

### membersColor

> **membersColor**?: `boolean`

Boolean flag whether to fill row members cells with background color

***

### rowHeight

> **rowHeight**?: `number`

Manual height of each row (default is 25px)

***

### rowsPerPage

> **rowsPerPage**?: `number`

Number of rows per page

Default value is 25

***

### totalsColor

> **totalsColor**?: `boolean`

Boolean flag whether to fill totals and subtotals cells with background color

***

### width

> **width**?: `number`

Total width of the component, which is considered in the following order of priority:

1. Value passed to this property (in pixels)
2. Width of the container wrapping this component
3. Default value of 400px
