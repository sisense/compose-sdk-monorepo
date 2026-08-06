---
title: Chart
---

# Function Chart

> **Chart**(`props`): `Promise`\< `ReactNode` \> \| `ReactNode`

A React component used for easily switching chart types or rendering multiple series of different chart types.

## Example

A chart component displaying total revenue per quarter from the Sample ECommerce data model. The component is currently set to show the data in a column chart.

<iframe
 src='https://csdk-playground.sisense.com/?example=charts/chart&mode=docs'
 width='100%'
 height='870'
 style='max-width:800px; border:none;'
/>

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `props` | [`ChartProps`](../interfaces/interface.ChartProps.md) | Chart properties |

## Returns

`Promise`\< `ReactNode` \> \| `ReactNode`

Chart component representing a chart type as specified in `ChartProps.`[chartType](../interfaces/interface.ChartProps.md#charttype)
