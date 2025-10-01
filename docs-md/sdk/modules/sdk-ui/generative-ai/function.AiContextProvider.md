---
title: AiContextProvider
---

# Function AiContextProvider

> **AiContextProvider**(`props`): `Element`

React component that wraps all generative AI components and hooks.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `props` | [`AiContextProviderProps`](../interfaces/interface.AiContextProviderProps.md) | AI Context Provider Props |

## Returns

`Element`

An AI Context Provider Component

## Example

```ts
import { SisenseContextProvider } from '@ethings-os/sdk-ui';
import { AiContextProvider, Chatbot } from '@ethings-os/sdk-ui/ai';

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
