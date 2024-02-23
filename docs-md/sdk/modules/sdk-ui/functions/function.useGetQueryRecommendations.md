---
title: useGetQueryRecommendations
---

# Function useGetQueryRecommendations <Badge type="beta" text="Beta" />

> **useGetQueryRecommendations**(...`args`): `object`

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

An array of objects, each containing recommended question text and its corresponding JAQL

### `data`

**data**: [`QueryRecommendationResponse`](../type-aliases/type-alias.QueryRecommendationResponse.md)

### `isLoading`

**isLoading**: `boolean`

## Example

```ts
import { SisenseContextProvider } from '@sisense/sdk-ui';
import { AiContextProvider, useGetQueryRecommendations } from '@sisense/sdk-ui/ai';

function Page() {
  const { data } = useGetQueryRecommendations({
    contextTitle: 'Sample ECommerce',
  });

  if (!data) {
    return <div>Loading recommendations</div>;
  }

  return (
    <ul>
      {data.map((item, index) => (
        <li key={index}>{item.nlqPrompt}</li>
      ))}
    </ul>
  );
}

function App() {
  return (
    <SisenseContextProvider {...sisenseContextProps}>
      <AiContextProvider>
        <Page />
      </AiContextProvider>
    </SisenseContextProvider>
  );
}
```
