---
title: Chart
---

# Function Chart

> **Chart**(`props`, `deprecatedLegacyContext`?): `null` \| `ReactElement`\< `any`, `any` \>

A React component used for easily switching chart types or rendering multiple series of different chart types.

## Example

A chart component displaying total revenue per quarter from the Sample ECommerce data model. The component is currently set to show the data in a column chart.

<iframe
 src='https://csdk-playground.sisense.com/?example=charts/chart&mode=docs'
 width=800
 height=870
 style='border:none;'
/>

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `props` | [`ChartProps`](../interfaces/interface.ChartProps.md) | Chart properties |
| `deprecatedLegacyContext`? | `any` | ::: warning Deprecated<br /><br />:::<br /><br />**See**<br /><br />[React Docs](https://legacy.reactjs.org/docs/legacy-context.html#referencing-context-in-lifecycle-methods) |

## Returns

`null` \| `ReactElement`\< `any`, `any` \>

Chart component representing a chart type as specified in `ChartProps.`[chartType](../interfaces/interface.ChartProps.md#charttype)
