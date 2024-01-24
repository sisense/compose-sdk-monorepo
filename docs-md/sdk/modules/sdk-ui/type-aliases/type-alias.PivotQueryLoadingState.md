---
title: PivotQueryLoadingState
---

# Type alias PivotQueryLoadingState

> **PivotQueryLoadingState**: `object`

State of a query execution that is loading.

## Type declaration

### `data`

**data**: [`PivotQueryResultData`](../../sdk-data/interfaces/interface.PivotQueryResultData.md) \| `undefined`

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

**isLoading**: `true`

Whether the query is loading

***

### `isSuccess`

**isSuccess**: `false`

Whether the query has succeeded

***

### `status`

**status**: `"loading"`

The status of the query execution
