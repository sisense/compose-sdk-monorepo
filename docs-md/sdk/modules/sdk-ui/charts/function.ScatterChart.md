---
title: ScatterChart
---

# Function ScatterChart

> **ScatterChart**(`props`): `null` \| `ReactElement`\< `any`, `any` \>

A React component displaying the distribution of two variables on an X-Axis, Y-Axis,
and two additional fields of data that are shown as colored circles scattered across the chart.

**Point**: A field that for each of its members a scatter point is drawn. The maximum amount of data points is 500.

**Size**: An optional field represented by the size of the circles.
If omitted, all scatter points are equal in size. If used, the circle sizes are relative to their values.

## Example

Scatter chart displaying total revenue per category, broken down by gender, from the Sample ECommerce data model.

<iframe
 src='https://csdk-playground.sisense.com/?example=charts%2Fscatter-chart&mode=docs'
 width=800
 height=870
 style='border:none;'
/>

Additional Scatter Chart examples:

- [Bubble Scatter Chart](https://www.sisense.com/platform/compose-sdk/playground/?example=charts/scatter-chart-bubble)

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `props` | [`ScatterChartProps`](../interfaces/interface.ScatterChartProps.md) | Scatter chart properties |

## Returns

`null` \| `ReactElement`\< `any`, `any` \>

Scatter Chart component
