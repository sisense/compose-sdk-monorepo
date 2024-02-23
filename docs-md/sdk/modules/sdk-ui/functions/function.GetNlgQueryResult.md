---
title: GetNlgQueryResult
---

# Function GetNlgQueryResult <Badge type="beta" text="Beta" />

> **GetNlgQueryResult**(`props`, `context`?): `null` \| `ReactElement`\< `any`, `any` \>

React component that fetches and displays a collapsible analysis of the provided JAQL using natural language generation (NLG).

This takes the same props as [useGetNlgQueryResult](function.useGetNlgQueryResult.md) and makes the same API call but presents the result in a collapsible container.

::: warning Note
This component is currently under private beta for selected customers and is subject to change as we make fixes and improvements.
:::

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `props` | [`GetNlgQueryResultRequest`](../interfaces/interface.GetNlgQueryResultRequest.md) | [GetNlgQueryResultProps](../type-aliases/type-alias.GetNlgQueryResultProps.md) |
| `context`? | `any` | - |

## Returns

`null` \| `ReactElement`\< `any`, `any` \>

Collapsible container wrapping a text summary

## Example

```ts
import { SisenseContextProvider } from '@sisense/sdk-ui';
import { AiContextProvider, GetNlgQueryResult } from '@sisense/sdk-ui/ai';

function Page() {
  return (
    <GetNlgQueryResult
      dataSource="Sample ECommerce"
      metadata={[
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
      ]}
    />
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
