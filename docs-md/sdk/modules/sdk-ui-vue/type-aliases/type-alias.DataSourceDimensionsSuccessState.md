---
title: DataSourceDimensionsSuccessState
---

# Type alias DataSourceDimensionsSuccessState

> **DataSourceDimensionsSuccessState**: `object`

State of a data source dimensions load that has succeeded.

## Type declaration

### `dimensions`

**dimensions**: [`Dimension`](../../sdk-data/interfaces/interface.Dimension.md)[]

Dimensions, if the load succeeded

***

### `error`

**error**: `undefined`

Error, if one occurred

***

### `isError`

**isError**: `false`

Whether the dimensions load has failed

***

### `isLoading`

**isLoading**: `false`

Whether the dimensions are loading

***

### `isSuccess`

**isSuccess**: `true`

Whether the dimensions load has succeeded

***

### `status`

**status**: `"success"`

Loading status
