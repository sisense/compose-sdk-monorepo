---
title: Chatbot
---

# Function Chatbot <Badge type="beta" text="Beta" />

> **Chatbot**(`props`, `context`?): `null` \| `ReactElement`\< `any`, `any` \>

React component that renders a chatbot with data topic selection. You can optionally provide `width` and/or `height`.

::: warning Note
This component is currently under private beta for selected customers and is subject to change as we make fixes and improvements.
:::

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `props` | [`ChatbotProps`](../type-aliases/type-alias.ChatbotProps.md) | [ChatbotProps](../type-aliases/type-alias.ChatbotProps.md) |
| `context`? | `any` | - |

## Returns

`null` \| `ReactElement`\< `any`, `any` \>

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
