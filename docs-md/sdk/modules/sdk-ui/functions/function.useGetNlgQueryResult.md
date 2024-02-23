---
title: useGetNlgQueryResult
---

# Function useGetNlgQueryResult <Badge type="beta" text="Beta" />

> **useGetNlgQueryResult**(...`args`): `object`

React hook that fetches an analysis of the provided JAQL using natural language generation (NLG).

Note that in the example below, this hook expects `metadata` to be in standard JAQL syntax.

::: warning Note
This hook is currently under private beta for selected customers and is subject to change as we make fixes and improvements.
:::

## Parameters

| Parameter | Type |
| :------ | :------ |
| ...`args` | [[`UseGetNlgQueryResultParams`](../interfaces/interface.UseGetNlgQueryResultParams.md)] |

## Returns

Response object containing a text summary

### `data`

**data**: `undefined` \| `string`

### `fetchStatus`

**fetchStatus**: `FetchStatus`

### `isError`

**isError**: `boolean`

### `isLoading`

**isLoading**: `boolean`

### `isSuccess`

**isSuccess**: `boolean`

### `refetch`

**refetch**: () => `void`

#### Returns

`void`

## Example

```ts
import { SisenseContextProvider } from '@sisense/sdk-ui';
import { AiContextProvider, useGetNlgQueryResult } from '@sisense/sdk-ui/ai';

function Page() {
  const { data } = useGetNlgQueryResult({
    dataSource: 'Sample ECommerce',
    metadata: [
      {
        jaql: {
          column: 'Date',
          datatype: 'datetime',
          dim: '[Commerce.Date]',
          firstday: 'mon',
          level: 'years',
          table: 'Commerce',
          title: 'Date',
        },
        format: {
          mask: {
            days: 'shortDate',
            isdefault: true,
            minutes: 'HH:mm',
            months: 'MM/yyyy',
            quarters: 'yyyy Q',
            weeks: 'ww yyyy',
            years: 'yyyy',
          },
        },
      },
      {
        jaql: {
          agg: 'sum',
          column: 'Revenue',
          datatype: 'numeric',
          dim: '[Commerce.Revenue]',
          table: 'Commerce',
          title: 'total of Revenue',
        },
      },
    ],
  });
  return (
    <>
      <h1>Summary</h1>
      <p>{data}</p>
    </>
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
