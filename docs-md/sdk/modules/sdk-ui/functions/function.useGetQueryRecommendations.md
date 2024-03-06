---
title: useGetQueryRecommendations
---

# Function useGetQueryRecommendations <Badge type="beta" text="Beta" />

> **useGetQueryRecommendations**(...`args`): [`UseGetQueryRecommendationsState`](../interfaces/interface.UseGetQueryRecommendationsState.md)

React hook that fetches recommended questions for a data model or perspective.

This hook includes the same code that fetches the initial suggested questions in the chatbot.

::: warning Note
This hook is currently under private beta for selected customers and is subject to change as we make fixes and improvements.
:::

## Parameters

| Parameter | Type |
| :------ | :------ |
| ...`args` | [[`UseGetQueryRecommendationsParams`](../interfaces/interface.UseGetQueryRecommendationsParams.md)] |

## Returns

[`UseGetQueryRecommendationsState`](../interfaces/interface.UseGetQueryRecommendationsState.md)

An array of objects, each containing recommended question text and its corresponding JAQL

## Example

```ts
const { data, isLoading } = useGetQueryRecommendations({
  contextTitle: 'Sample ECommerce',
});

if (isLoading) {
  return <div>Loading recommendations</div>;
}

return (
  <ul>
    {data.map((item, index) => (
      <li key={index}>{item.nlqPrompt}</li>
    ))}
  </ul>
);
```
