---
title: DataSourceDimensionsErrorState
---

# Type alias DataSourceDimensionsErrorState

> **DataSourceDimensionsErrorState**: `object`

State of a data source dimensions load that has failed.

## Type declaration

### `dimensions`

**dimensions**: `undefined`

Dimensions, if the load succeeded

***

### `error`

**error**: `Error`

Error, if one occurred

***

### `isError`

**isError**: `true`

Whether the dimensions load has failed

***

### `isLoading`

**isLoading**: `false`

Whether the dimensions are loading

***

### `isSuccess`

**isSuccess**: `false`

Whether the dimensions load has succeeded

***

### `status`

**status**: `"error"`

Loading status
