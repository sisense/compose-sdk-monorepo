---
title: BoxplotDataPoint
---

# Type alias BoxplotDataPoint

> **BoxplotDataPoint**: `object`

Data point in a Boxplot chart.

## Type declaration

### `boxMax`

**boxMax**?: `number`

Value of the box maximum

***

### `boxMedian`

**boxMedian**?: `number`

Value of the box median

***

### `boxMin`

**boxMin**?: `number`

Value of the box minimum

***

### `categoryDisplayValue`

**categoryDisplayValue**?: `string`

Display value of category of the data point

***

### `categoryValue`

**categoryValue**?: `number` \| `string`

Value of the category for the data point

***

### `entries`

**entries**?: `object`

A collection of data point entries that represents values for all related `dataOptions`.

> #### `entries.category`
>
> **category**: [`DataPointEntry`](type-alias.DataPointEntry.md)[]
>
> Data point entries for the `category` data options
>
> #### `entries.outliers`
>
> **outliers**: [`DataPointEntry`](type-alias.DataPointEntry.md)[]
>
> Data point entries for the `outliers` data options
>
> #### `entries.value`
>
> **value**: [`DataPointEntry`](type-alias.DataPointEntry.md)[]
>
> Data point entries for the `value` data options
>
>

***

### `outlier`

**outlier**?: `number`

Value of the outlier

***

### `whiskerMax`

**whiskerMax**?: `number`

Value of the box maximal whisker

***

### `whiskerMin`

**whiskerMin**?: `number`

Value of the box minimal whisker
