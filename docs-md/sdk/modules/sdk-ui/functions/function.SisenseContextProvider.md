---
title: SisenseContextProvider
---

# Function SisenseContextProvider

> **SisenseContextProvider**(`props`, `context`?): `null` \| `ReactElement`\< `any`, `any` \>

Sisense Context Provider Component allowing you to connect to
a Sisense instance and provide that context
to all Compose SDK components in your application.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `props` | `PropsWithChildren`\< [`SisenseContextProviderProps`](../interfaces/interface.SisenseContextProviderProps.md) \> | Sisense context provider props |
| `context`? | `any` | - |

## Returns

`null` \| `ReactElement`\< `any`, `any` \>

A Sisense Context Provider Component

## Example

Add SisenseContextProvider to the main component of your app as below and then wrap
other SDK components inside this component.

```ts
import { Chart, SisenseContextProvider } from '@sisense/sdk-ui';
import * as DM from './sample-ecommerce';
import { measures } from '@sisense/sdk-data';

function App() {
  return (
    <>
      <SisenseContextProvider
        url="<instance url>" // replace with the URL of your Sisense instance
        token="<api token>" // replace with the API token of your user account
      >
        <OtherComponent1/>
        <OtherComponent2/>
      </SisenseContextProvider>
    </>
  );
}

export default App;
```
