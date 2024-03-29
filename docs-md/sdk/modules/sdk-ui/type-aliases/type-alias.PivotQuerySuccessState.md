---
title: PivotQuerySuccessState
---

# Type alias PivotQuerySuccessState

> **PivotQuerySuccessState**: `object`

State of a query execution that has succeeded.

## Type declaration

### `data`

**data**: [`PivotQueryResultData`](../../sdk-data/interfaces/interface.PivotQueryResultData.md)

The result data if the query has succeeded

***

### `error`

**error**: `undefined`

The error if any occurred

***

### `isError`

**isError**: `false`

Whether the query has failed

***

### `isLoading`

**isLoading**: `false`

Whether the query is loading

***

### `isSuccess`

**isSuccess**: `true`

Whether the query has succeeded

***

### `status`

**status**: `"success"`

The status of the query execution
