---
title: useGetNlgInsights
---

# Function useGetNlgInsights

> **useGetNlgInsights**(...`args`): [`UseGetNlgInsightsState`](../interfaces/interface.UseGetNlgInsightsState.md)

React hook that fetches an analysis of the provided query using natural language generation (NLG).
Specifying a query is similar to providing parameters to a [useExecuteQuery](../queries/function.useExecuteQuery.md) hook, using dimensions, measures, and filters.

## Parameters

| Parameter | Type |
| :------ | :------ |
| ...`args` | [[`UseGetNlgInsightsParams`](../interfaces/interface.UseGetNlgInsightsParams.md)] |

## Returns

[`UseGetNlgInsightsState`](../interfaces/interface.UseGetNlgInsightsState.md)

Response object containing a text summary

## Example

```ts
const { data, isLoading } = useGetNlgInsights({
  dataSource: 'Sample ECommerce',
  dimensions: [DM.Commerce.Date.Years],
  measures: [measureFactory.sum(DM.Commerce.Revenue)],
});

if (isLoading) {
  return <div>Loading...</div>;
}

return <p>{data}</p>;
```
