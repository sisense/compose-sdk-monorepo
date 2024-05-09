---
title: AreaChart
---

# Function AreaChart

> **AreaChart**(`props`, `deprecatedLegacyContext`?): `null` \| `ReactElement`\< `any`, `any` \>

A React component similar to a [LineChart](function.LineChart.md),
but with filled in areas under each line and an option to display them as stacked.

## Example

Area chart displaying total revenue per quarter from the Sample ECommerce data model.

<iframe
 src='https://csdk-playground.sisense.com/?example=charts%2Farea-chart&mode=docs'
 width=800
 height=870
 style='border:none;'
/>

Additional Area Chart examples:

- [Stacked Area Chart](https://www.sisense.com/platform/compose-sdk/playground/?example=charts%2Farea-chart-stacked)
- [Stacked Percentage Area Chart](https://www.sisense.com/platform/compose-sdk/playground/?example=charts%2Farea-chart-stacked100)

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `props` | [`AreaChartProps`](../interfaces/interface.AreaChartProps.md) | Area chart properties |
| `deprecatedLegacyContext`? | `any` | ::: warning Deprecated<br /><br />:::<br /><br />**See**<br /><br />[React Docs](https://legacy.reactjs.org/docs/legacy-context.html#referencing-context-in-lifecycle-methods) |

## Returns

`null` \| `ReactElement`\< `any`, `any` \>

Area Chart component
