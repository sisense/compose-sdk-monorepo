---
title: QueryByWidgetIdQueryParams
---

# Type alias QueryByWidgetIdQueryParams

> **QueryByWidgetIdQueryParams**: `object`

Query parameters constructed over either a chart widget or pivot table widget. This is returned as part of the query state [QueryByWidgetIdState](type-alias.QueryByWidgetIdState.md).

## Type declaration

### `pivotQuery`

**pivotQuery**: [`ExecutePivotQueryParams`](../interfaces/interface.ExecutePivotQueryParams.md) \| `undefined`

Query parameters constructed over the pivot table widget

***

### `query`

**query**: [`ExecuteQueryParams`](../interfaces/interface.ExecuteQueryParams.md) \| `undefined`

Query parameters constructed over the chart widget
