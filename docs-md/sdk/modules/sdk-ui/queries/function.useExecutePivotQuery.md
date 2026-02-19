---
title: useExecutePivotQuery
---

# Function useExecutePivotQuery

> **useExecutePivotQuery**(...`args`): [`PivotQueryState`](../type-aliases/type-alias.PivotQueryState.md)

React hook that executes a data query for a pivot table.
This approach is similar to React Query's `useQuery` hook.

## Example

Execute a pivot query on the Sample ECommerce data model and display the results in a table.

<iframe
 src='https://csdk-playground.sisense.com/?example=queries%2Fuse-execute-pivot-query&mode=docs'
 width=800
 height=870
 style='border:none;'
/>

## Parameters

| Parameter | Type |
| :------ | :------ |
| ...`args` | [[`ExecutePivotQueryParams`](../interfaces/interface.ExecutePivotQueryParams.md)] |

## Returns

[`PivotQueryState`](../type-aliases/type-alias.PivotQueryState.md)

Query state that contains the status of the query execution, the result data, or the error if any occurred
