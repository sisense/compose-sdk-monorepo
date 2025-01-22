---
title: GetNlgInsights
---

# Function GetNlgInsights <Badge type="beta" text="Beta" />

> **GetNlgInsights**(`props`): `ReactElement`\< `any`, `any` \> \| `null`

React component that fetches and displays a collapsible analysis of the provided query using natural language generation (NLG).
Specifying a query is similar to providing parameters to a [useExecuteQuery](../queries/function.useExecuteQuery.md) hook, using dimensions, measures, and filters.

::: warning Note
This component is currently under beta release for our managed cloud customers on version L2024.2 or above. It is subject to changes as we make fixes and improvements.
:::

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `props` | [`GetNlgInsightsProps`](../interfaces/interface.GetNlgInsightsProps.md) | [GetNlgInsightsProps](../interfaces/interface.GetNlgInsightsProps.md) |

## Returns

`ReactElement`\< `any`, `any` \> \| `null`

Collapsible container wrapping a text summary

## Example

```ts
<GetNlgInsights
  dataSource="Sample ECommerce"
  dimensions={[DM.Commerce.Date.Years]}
  measures={[measureFactory.sum(DM.Commerce.Revenue)]}
/>
```
