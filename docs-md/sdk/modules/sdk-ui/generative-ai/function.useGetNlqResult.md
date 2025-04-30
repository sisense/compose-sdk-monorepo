---
title: useGetNlqResult
---

# Function useGetNlqResult <Badge type="beta" text="Beta" />

> **useGetNlqResult**(...`args`): [`UseGetNlqResultState`](../interfaces/interface.UseGetNlqResultState.md)

React hook that enables natural language query (NLQ) against a data model or perspective.

## Parameters

| Parameter | Type |
| :------ | :------ |
| ...`args` | [[`UseGetNlqResultParams`](../interfaces/interface.UseGetNlqResultParams.md)] |

## Returns

[`UseGetNlqResultState`](../interfaces/interface.UseGetNlqResultState.md)

NLQ load state that contains the status of the execution, the result (data) as WidgetProps

## Example

```ts
const { data, isLoading } = useGetNlqResult({
   dataSource: 'Sample ECommerce',
   query: 'Show me total revenue by age range'
});

if (isLoading) {
  return <div>Loading...</div>;
}

return (
  {
     data &&
     <Widget {...data} />
  }
);
```
