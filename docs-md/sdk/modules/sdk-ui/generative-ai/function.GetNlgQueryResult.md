---
title: GetNlgQueryResult
---

# Function GetNlgQueryResult <Badge type="beta" text="Beta" />

> **GetNlgQueryResult**(`props`, `deprecatedLegacyContext`?): `null` \| `ReactElement`\< `any`, `any` \>

React component that fetches and displays a collapsible analysis of the provided query using natural language generation (NLG).
Specifying a query is similar to providing parameters to a [useExecuteQuery](../queries/function.useExecuteQuery.md) hook, using dimensions, measures, and filters.

::: warning Note
This component is currently under private beta for selected customers and is subject to change as we make fixes and improvements.
:::

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `props` | [`GetNlgQueryResultProps`](../interfaces/interface.GetNlgQueryResultProps.md) | [GetNlgQueryResultProps](../interfaces/interface.GetNlgQueryResultProps.md) |
| `deprecatedLegacyContext`? | `any` | ::: warning Deprecated<br /><br />:::<br /><br />**See**<br /><br />[React Docs](https://legacy.reactjs.org/docs/legacy-context.html#referencing-context-in-lifecycle-methods) |

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
