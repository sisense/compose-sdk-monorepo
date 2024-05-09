---
title: AreamapChart
---

# Function AreamapChart <Badge type="beta" text="Beta" />

> **AreamapChart**(`props`, `deprecatedLegacyContext`?): `null` \| `ReactElement`\< `any`, `any` \>

A React component for visualizing geographical data as colored polygons on a map.

For another way do display data on a map, see [ScattermapChart](function.ScattermapChart.md).

## Example

Areamap chart displaying total revenue per country from the Sample ECommerce data model. The total revenue amount is indicated by the colors on the map.

<iframe
 src='https://csdk-playground.sisense.com/?example=charts%2Fmap-area&mode=docs'
 width=800
 height=870
 style='border:none;'
/>

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `props` | [`AreamapChartProps`](../interfaces/interface.AreamapChartProps.md) | Areamap chart properties |
| `deprecatedLegacyContext`? | `any` | ::: warning Deprecated<br /><br />:::<br /><br />**See**<br /><br />[React Docs](https://legacy.reactjs.org/docs/legacy-context.html#referencing-context-in-lifecycle-methods) |

## Returns

`null` \| `ReactElement`\< `any`, `any` \>

Areamap Chart component
