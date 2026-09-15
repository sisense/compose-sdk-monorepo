---
title: ExecuteQueryResult
---

# Type alias ExecuteQueryResult

> **ExecuteQueryResult**: [`QueryState`](type-alias.QueryState.md) & \{
  `refetch`: () => `void`;
  `rowCount?`: `number`;
 }

Result of a query execution.

This is the return type of [useExecuteQuery](../queries/function.useExecuteQuery.md) — see that hook's documentation for a
usage example.

> ## `ExecuteQueryResult.refetch`
>
> **refetch**: () => `void`
>
> Function to refetch the query
>
> ### Returns
>
> `void`
>
>
>
> ## `ExecuteQueryResult.rowCount`
>
> **rowCount**?: `number`
>
> Total row count of the query result, ignoring the `count` and `offset` paging.
>
> Populated only when [ExecuteQueryParams.includeRowCount](../interfaces/interface.ExecuteQueryParams.md#includerowcount) is enabled and
> the Sisense instance supports the row count API; `undefined` otherwise.
>
>
