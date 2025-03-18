---
title: Chatbot
---

# Function Chatbot <Badge type="beta" text="Beta" />

> **Chatbot**(`props`): `ReactElement`\< `any`, `any` \> \| `null`

React component that renders a chatbot with data topic selection. You can optionally provide `width` and/or `height`.

::: warning Note
This component is currently under beta release for our managed cloud customers on version L2024.2 or above. It is subject to changes as we make fixes and improvements.
:::

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `props` | [`ChatbotProps`](../interfaces/interface.ChatbotProps.md) | [ChatbotProps](../interfaces/interface.ChatbotProps.md) |

## Returns

`ReactElement`\< `any`, `any` \> \| `null`

## Example

```ts
import { SisenseContextProvider } from '@sisense/sdk-ui';
import { AiContextProvider, Chatbot } from '@sisense/sdk-ui/ai';

function App() {
  return (
    <SisenseContextProvider {...sisenseContextProps}>
      <AiContextProvider>
        <Chatbot width={1000} height={800} />
      </AiContextProvider>
    </SisenseContextProvider>
  );
}
```
