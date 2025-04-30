---
title: useGetQueryRecommendations
---

# Function useGetQueryRecommendations <Badge type="beta" text="Beta" />

> **useGetQueryRecommendations**(...`args`): [`UseGetQueryRecommendationsState`](../interfaces/interface.UseGetQueryRecommendationsState.md)

React hook that fetches recommended questions for a data model or perspective.

This hook includes the same code that fetches the initial suggested questions in the chatbot.

## Parameters

| Parameter | Type |
| :------ | :------ |
| ...`args` | [[`UseGetQueryRecommendationsParams`](../interfaces/interface.UseGetQueryRecommendationsParams.md)] |

## Returns

[`UseGetQueryRecommendationsState`](../interfaces/interface.UseGetQueryRecommendationsState.md)

An array of objects, each containing recommended question text and its corresponding `widgetProps`

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
