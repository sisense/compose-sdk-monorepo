---
title: useGetNlgQueryResult
---

# Function useGetNlgQueryResult <Badge type="beta" text="Beta" />

> **useGetNlgQueryResult**(...`args`): [`UseGetNlgQueryResultState`](../interfaces/interface.UseGetNlgQueryResultState.md)

React hook that fetches an analysis of the provided query using natural language generation (NLG).
Specifying a query is similar to providing parameters to a [useExecuteQuery](../queries/function.useExecuteQuery.md) hook, using dimensions, measures, and filters.

::: warning Note
This hook is currently under beta release for our managed cloud customers on version L2024.2 or above. It is subject to changes as we make fixes and improvements.
:::

## Parameters

| Parameter | Type |
| :------ | :------ |
| ...`args` | [[`UseGetNlgQueryResultParams`](../interfaces/interface.UseGetNlgQueryResultParams.md)] |

## Returns

[`UseGetNlgQueryResultState`](../interfaces/interface.UseGetNlgQueryResultState.md)

Response object containing a text summary

## Example

```ts
const { data, isLoading } = useGetNlgQueryResult({
  dataSource: 'Sample ECommerce',
  dimensions: [DM.Commerce.Date.Years],
  measures: [measureFactory.sum(DM.Commerce.Revenue)],
});

if (isLoading) {
  return <div>Loading...</div>;
}

return <p>{data}</p>;
```
