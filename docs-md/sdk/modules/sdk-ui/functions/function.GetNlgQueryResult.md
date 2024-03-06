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
| `props` | [`GetNlgQueryResultProps`](../interfaces/interface.GetNlgQueryResultProps.md) | [GetNlgQueryResultProps](../interfaces/interface.GetNlgQueryResultProps.md) |
| `context`? | `any` | - |

## Returns

`null` \| `ReactElement`\< `any`, `any` \>

Collapsible container wrapping a text summary

## Example

```ts
<GetNlgQueryResult
  dataSource="Sample ECommerce"
  dimensions={[DM.Commerce.Date.Years]}
  measures={[measureFactory.sum(DM.Commerce.Revenue)]}
/>
```
