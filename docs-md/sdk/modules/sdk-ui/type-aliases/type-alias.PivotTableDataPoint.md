---
title: PivotTableDataPoint
---

# Type alias PivotTableDataPoint

> **PivotTableDataPoint**: `object`

Data point in a PivotTable.

## Type declaration

### `entries`

**entries**: `object`

A collection of data point entries that represents values for all related `dataOptions`.

> #### `entries.columns`
>
> **columns**?: [`DataPointEntry`](type-alias.DataPointEntry.md)[]
>
> Data point entries for the `columns` data options
>
> #### `entries.rows`
>
> **rows**?: [`DataPointEntry`](type-alias.DataPointEntry.md)[]
>
> Data point entries for the `rows` data options
>
> #### `entries.values`
>
> **values**?: [`DataPointEntry`](type-alias.DataPointEntry.md)[]
>
> Data point entries for the `values` data options
>
>

***

### `isCaptionCell`

**isCaptionCell**: `boolean`

Boolean flag that defines if the data point is a caption cell

***

### `isDataCell`

**isDataCell**: `boolean`

Boolean flag that defines if the data point is a data cell

***

### `isTotalCell`

**isTotalCell**: `boolean`

Boolean flag that defines if the data point is a total cell (subtotal or grandtotal)
