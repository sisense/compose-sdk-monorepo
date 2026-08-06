---
title: ColumnChart
---

# Function ColumnChart

> **ColumnChart**(`props`): `Promise`\< `ReactNode` \> \| `ReactNode`

A React component representing categorical data with vertical rectangular bars
whose heights are proportional to the values that they represent.

The chart can include multiple values on both the X and Y-axis, as well as a break down by categories displayed on the Y-axis.

## Example

Column chart displaying total revenue per year, broken down by condition, from the Sample ECommerce data model.

<iframe
 src='https://csdk-playground.sisense.com/?example=charts%2Fcolumn-chart&mode=docs'
 width='100%'
 height='870'
 style='max-width:800px; border:none;'
/>

Additional Column Chart examples:

- [Stacked Column Chart](https://www.sisense.com/developers/playground/?example=charts%2Fcolumn-chart-stacked)
- [Stacked Percentage Column Chart](https://www.sisense.com/developers/playground/?example=charts%2Fcolumn-chart-stacked100)

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `props` | [`ColumnChartProps`](../interfaces/interface.ColumnChartProps.md) | Column chart properties |

## Returns

`Promise`\< `ReactNode` \> \| `ReactNode`

Column Chart component
