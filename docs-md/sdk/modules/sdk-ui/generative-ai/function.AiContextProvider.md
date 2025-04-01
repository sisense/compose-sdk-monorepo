---
title: AiContextProvider
---

# Function AiContextProvider <Badge type="beta" text="Beta" />

> **AiContextProvider**(`__namedParameters`): `Element`

React component that wraps all generative AI components and hooks.

::: warning Note
This component is currently under beta release for our managed cloud customers on version L2024.2 or above. It is subject to changes as we make fixes and improvements.
:::

## Parameters

| Parameter | Type |
| :------ | :------ |
| `__namedParameters` | [`AiContextProviderProps`](../interfaces/interface.AiContextProviderProps.md) |

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
