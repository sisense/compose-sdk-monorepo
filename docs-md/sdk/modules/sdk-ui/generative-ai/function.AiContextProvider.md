---
title: AiContextProvider
---

# Function AiContextProvider <Badge type="beta" text="Beta" />

> **AiContextProvider**(`__namedParameters`): `Element`

React component that wraps all generative AI components and hooks.

::: warning Note
This component is currently under private beta for selected customers and is subject to change as we make fixes and improvements.
:::

## Parameters

| Parameter | Type |
| :------ | :------ |
| `__namedParameters` | [`AiContextProviderProps`](../type-aliases/type-alias.AiContextProviderProps.md) |

## Returns

`Element`

## Example

```ts
import { SisenseContextProvider } from '@sisense/sdk-ui';
import { AiContextProvider, Chatbot } from '@sisense/sdk-ui/ai';

function App() {
  return (
    <SisenseContextProvider {...sisenseContextProps}>
      <AiContextProvider>
        <Chatbot />
      </AiContextProvider>
    </SisenseContextProvider>
  );
}
```
