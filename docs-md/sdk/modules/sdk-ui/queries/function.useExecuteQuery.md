---
title: useExecuteQuery
---

# Function useExecuteQuery

> **useExecuteQuery**(...`args`): [`ExecuteQueryResult`](../type-aliases/type-alias.ExecuteQueryResult.md)

React hook that executes a data query.

This approach, which offers an alternative to the [ExecuteQuery](function.ExecuteQuery.md) component, is similar to React Query's `useQuery` hook.

## Example

Execute a query to retrieve revenue per country per year from the Sample ECommerce data model. Then display the data in a table and column chart.

<iframe
 src='https://csdk-playground.sisense.com/?example=queries%2Fuse-execute-query-sorting&mode=docs'
 width=800
 height=870
 style='border:none;'
/>

Additional `useExecuteQuery()` examples:

- [Query with Sorting](https://www.sisense.com/platform/compose-sdk/playground/?example=queries%2Fuse-execute-query-sorting)
- [Take Control of Your Data Visualizations]( https://www.sisense.com/blog/take-control-of-your-data-visualizations/) blog post with examples of using the hook to fetch data to display in third-party charts.

## Parameters

| Parameter | Type |
| :------ | :------ |
| ...`args` | [[`ExecuteQueryParams`](../interfaces/interface.ExecuteQueryParams.md)] |

## Returns

[`ExecuteQueryResult`](../type-aliases/type-alias.ExecuteQueryResult.md)

Query state that contains the status of the query execution, the result data, or the error if any occurred
