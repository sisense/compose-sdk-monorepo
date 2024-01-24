---
title: PivotQueryErrorState
---

# Type alias PivotQueryErrorState

> **PivotQueryErrorState**: `object`

State of a query execution that has failed.

## Type declaration

### `data`

**data**: `undefined`

The result data if the query has succeeded

***

### `error`

**error**: `Error`

The error if any occurred

***

### `isError`

**isError**: `true`

Whether the query has failed

***

### `isLoading`

**isLoading**: `false`

Whether the query is loading

***

### `isSuccess`

**isSuccess**: `false`

Whether the query has succeeded

***

### `status`

**status**: `"error"`

The status of the query execution
