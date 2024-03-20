---
title: useExecuteQuery
---

# Function useExecuteQuery

> **useExecuteQuery**(...`args`): [`QueryState`](../type-aliases/type-alias.QueryState.md)

React hook that executes a data query.
This approach, which offers an alternative to [ExecuteQuery](function.ExecuteQuery.md) component, is similar to React Query's `useQuery` hook.

## Parameters

| Parameter | Type |
| :------ | :------ |
| ...`args` | [[`ExecuteQueryParams`](../interfaces/interface.ExecuteQueryParams.md)] |

## Returns

[`QueryState`](../type-aliases/type-alias.QueryState.md)

Query state that contains the status of the query execution, the result data, or the error if any occurred

## Example

```ts
 const { data, isLoading, isError } = useExecuteQuery({
   dataSource: DM.DataSource,
   dimensions: [DM.Commerce.AgeRange],
   measures: [measureFactory.sum(DM.Commerce.Revenue)],
   filters: [filterFactory.greaterThan(DM.Commerce.Revenue, 1000)],
 });
 if (isLoading) {
   return <div>Loading...</div>;
 }
 if (isError) {
   return <div>Error</div>;
 }
 if (data) {
   return <div>{`Total Rows: ${data.rows.length}`}</div>;
 }
 return null;
```

See also hook [useExecuteQueryByWidgetId](../fusion-assets/function.useExecuteQueryByWidgetId.md), which extracts data from an existing widget in the Sisense instance.

See [this blog post]( https://www.sisense.com/blog/take-control-of-your-data-visualizations/) for examples
of using the hook to fetch data from Sisense for third-party charts.
