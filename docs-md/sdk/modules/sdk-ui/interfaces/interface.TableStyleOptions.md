---
title: TableStyleOptions
---

# Interface TableStyleOptions

Configuration options that define functional style of the various elements of the Table Component

## Properties

### alternatingColumnsColor

> **alternatingColumnsColor**?: `boolean`

Boolean flag whether to apply background color to alternate columns

::: warning Deprecated
Use [TableStyleOptions.columns.alternatingColor](interface.TableStyleOptions.md#columns) instead.
:::

***

### alternatingRowsColor

> **alternatingRowsColor**?: `boolean`

Boolean flag whether to apply background color to alternate rows.

::: warning Deprecated
Use [TableStyleOptions.rows.alternatingColor](interface.TableStyleOptions.md#rows) instead.
:::

***

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
> ##### `columns.width`
>
> **width**?: `"auto"` \| `"content"`
>
> Modes of columns width
> 'auto' - all columns will have the same width and fit the table width (no horizontal scroll)
> 'content' - columns width will be based on content (default option)
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

### headersColor

> **headersColor**?: `boolean`

Boolean flag whether to fill header cells with background color

::: warning Deprecated
Use [TableStyleOptions.header.color](interface.TableStyleOptions.md#header) instead.
:::

***

### height

> **height**?: `number`

Total height of the component, which is considered in the following order of priority:

1. Value passed to this property (in pixels).
2. Height of the container wrapping this component
3. Default value of 500px (for component without header) or 525px (for component with header).

***

### paddingHorizontal

> **paddingHorizontal**?: `number`

Horizontal padding around whole table
Default value is 20px

***

### paddingVertical

> **paddingVertical**?: `number`

Vertical padding around whole table
Default value is 20px

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
