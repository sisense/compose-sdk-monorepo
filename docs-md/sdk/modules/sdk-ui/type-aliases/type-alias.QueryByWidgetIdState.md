---
title: QueryByWidgetIdState
---

# Type alias QueryByWidgetIdState

> **QueryByWidgetIdState**: [`QueryState`](type-alias.QueryState.md) & [`QueryByWidgetIdQueryParams`](type-alias.QueryByWidgetIdQueryParams.md) & \{
  `rowCount`: `number`;
 }

State of a query execution retrieving data of Fusion widget.

> ## `QueryByWidgetIdState.rowCount`
>
> **rowCount**?: `number`
>
> Total row count of the query result, ignoring the `count` and `offset` paging.
>
> Populated only when [ExecuteQueryByWidgetIdParams.includeRowCount](../interfaces/interface.ExecuteQueryByWidgetIdParams.md#includerowcount) is enabled and
> the Sisense instance supports the row count API; `undefined` otherwise.
>
>
