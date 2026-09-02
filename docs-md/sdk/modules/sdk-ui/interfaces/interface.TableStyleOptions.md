---
title: TableStyleOptions
---

# Interface TableStyleOptions

Configuration options that define functional style of the various elements of the Table Component

## Properties

### columns

> **columns**?: `object`

Columns options

#### Type declaration

> ##### `columns.alternatingColor`
>
> **alternatingColor**?: [`TableColorOptions`](../type-aliases/type-alias.TableColorOptions.md)
>
> Alternating color for columns
>
> ##### `columns.maxWidth`
>
> **maxWidth**?: `number`
>
> Maximum column width in pixels when resizing.
> Default value is 350.
>
> ##### `columns.minWidth`
>
> **minWidth**?: `number`
>
> Minimum column width in pixels when resizing.
> Default value is 120.
>
> ##### `columns.resizable`
>
> **resizable**?: `boolean`
>
> Enables interactive resizing of column widths by dragging the column border.
> Default value is `true`. Set to `false` to disable.
>
> Ignored when `width` is `'auto'`, where resizing is always disabled.
>
> ##### `columns.width`
>
> **width**?: `"auto"` \| `"content"`
>
> Modes of columns width
> 'auto' - all columns will have the same width and fit the table width (no horizontal scroll)
> 'content' - columns width will be based on content (default option)
>
> In `'auto'` mode the even column width takes precedence over any per-column `width` set in
> `dataOptions`, and interactive resizing is disabled regardless of `resizable` configuration.
>
>

***

### header

> **header**?: `object`

Header options

#### Type declaration

> ##### `header.color`
>
> **color**?: [`TableColorOptions`](../type-aliases/type-alias.TableColorOptions.md)
>
> Color of header
>
>

***

### height

> **height**?: `number`

Total height of the component, which is considered in the following order of priority:

1. Value passed to this property (in pixels).
2. Height of the container wrapping this component
3. Default value of 500px (for component without header) or 525px (for component with header).

***

### isAutoHeight

> **isAutoHeight**?: `boolean`

Boolean flag whether the height of the component should be automatically adjusted to fit the content

When enabled, the table grows to fit all rows of the current page without an inner vertical
scrollbar, and reports its height to the containing dashboard row.

Default value is `false`. Widgets loaded from a Fusion dashboard instead follow the dashboard's
own setting.

***

### paddingHorizontal

> **paddingHorizontal**?: `number`

Horizontal padding around whole table
Default value is 8px

***

### paddingVertical

> **paddingVertical**?: `number`

Vertical padding around whole table
Default value is 8px

***

### rows

> **rows**?: `object`

Rows options

#### Type declaration

> ##### `rows.alternatingColor`
>
> **alternatingColor**?: [`TableColorOptions`](../type-aliases/type-alias.TableColorOptions.md)
>
> Alternating color for rows
>
>

***

### rowsPerPage

> **rowsPerPage**?: `number`

Number of rows per page

Default value is 25

***

### width

> **width**?: `number`

Total width of the component, which is considered in the following order of priority:

1. Value passed to this property (in pixels)
2. Width of the container wrapping this component
3. Default value of 400px
