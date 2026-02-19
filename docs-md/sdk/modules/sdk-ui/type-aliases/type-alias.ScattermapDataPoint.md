---
title: ScattermapDataPoint
---

# Type alias ScattermapDataPoint

> **ScattermapDataPoint**: `object`

Data point in an Scattermap chart.

## Type declaration

### `categories`

**categories**: `string`[]

Array with categories strings used for location definition

***

### `coordinates`

**coordinates**: [`Coordinates`](type-alias.Coordinates.md)

Location coordinates

***

### `displayName`

**displayName**: `string`

Location name displayed on marker

***

### `entries`

**entries**?: `object`

A collection of data point entries that represents values for all related `dataOptions`.

> #### `entries.colorBy`
>
> **colorBy**?: [`DataPointEntry`](type-alias.DataPointEntry.md)
>
> Data point entry for the `colorBy` data options
>
> #### `entries.details`
>
> **details**?: [`DataPointEntry`](type-alias.DataPointEntry.md)
>
> Data point entry for the `details` data options
>
> #### `entries.geo`
>
> **geo**: [`DataPointEntry`](type-alias.DataPointEntry.md)[]
>
> Data point entries for the `geo` data options
>
> #### `entries.size`
>
> **size**?: [`DataPointEntry`](type-alias.DataPointEntry.md)
>
> Data point entry for the `size` data options
>
>

***

### `value`

**value**: `number`

Numeric measure value
