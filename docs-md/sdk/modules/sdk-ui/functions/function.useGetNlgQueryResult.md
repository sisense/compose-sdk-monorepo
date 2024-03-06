---
title: useGetNlgQueryResult
---

# Function useGetNlgQueryResult <Badge type="beta" text="Beta" />

> **useGetNlgQueryResult**(...`args`): [`UseGetNlgQueryResultState`](../interfaces/interface.UseGetNlgQueryResultState.md)

React hook that fetches an analysis of the provided JAQL using natural language generation (NLG).

Note that in the example below, this hook expects `metadata` to be in standard JAQL syntax.

::: warning Note
This hook is currently under private beta for selected customers and is subject to change as we make fixes and improvements.
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
