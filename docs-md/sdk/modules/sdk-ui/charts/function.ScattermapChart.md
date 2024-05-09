---
title: ScattermapChart
---

# Function ScattermapChart <Badge type="beta" text="Beta" />

> **ScattermapChart**(`props`, `deprecatedLegacyContext`?): `null` \| `ReactElement`\< `any`, `any` \>

A React component that allows to visualize geographical data as data points on a map.

## Example

Scatter map chart displaying cost and revenue rank from the Sample ECommerce data model. The cost is indicated by size of each point and the revenue rank is indicated by the point's size.

<iframe
 src='https://csdk-playground.sisense.com/?example=charts%2Fmap-scatter&mode=docs'
 width=1000
 height=900
 style='border:none;'
/>

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `props` | [`ScattermapChartProps`](../interfaces/interface.ScattermapChartProps.md) | Scattermap chart properties |
| `deprecatedLegacyContext`? | `any` | ::: warning Deprecated<br /><br />:::<br /><br />**See**<br /><br />[React Docs](https://legacy.reactjs.org/docs/legacy-context.html#referencing-context-in-lifecycle-methods) |

## Returns

`null` \| `ReactElement`\< `any`, `any` \>

Scattermap Chart component
