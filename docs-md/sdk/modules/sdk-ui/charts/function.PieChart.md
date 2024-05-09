---
title: PieChart
---

# Function PieChart

> **PieChart**(`props`, `deprecatedLegacyContext`?): `null` \| `ReactElement`\< `any`, `any` \>

A React component representing data in a circular graph with the data shown as slices of a whole,
with each slice representing a proportion of the total.

## Example

Pie chart displaying total revenue per age range from the Sample ECommerce data model.

<iframe
 src='https://csdk-playground.sisense.com/?example=charts%2Fpie-chart&mode=docs'
 width=800
 height=870
 style='border:none;'
/>

Additional Pie Chart examples:

- [Donut Pie Chart](https://www.sisense.com/platform/compose-sdk/playground/?example=charts%2Fpie-chart-donut)
- [Ring Pie Chart](https://www.sisense.com/platform/compose-sdk/playground/?example=charts%2Fpie-chart-ring)

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `props` | [`PieChartProps`](../interfaces/interface.PieChartProps.md) | Pie chart properties |
| `deprecatedLegacyContext`? | `any` | ::: warning Deprecated<br /><br />:::<br /><br />**See**<br /><br />[React Docs](https://legacy.reactjs.org/docs/legacy-context.html#referencing-context-in-lifecycle-methods) |

## Returns

`null` \| `ReactElement`\< `any`, `any` \>

Pie Chart component
