---
title: AreamapChart
---

# Function AreamapChart

> **AreamapChart**(`props`, `context`?): `null` \| `ReactElement`\< `any`, `any` \>

A React component for visualizing geographical data as polygons on a map.
See [Areamap Chart](https://docs.sisense.com/main/SisenseLinux/area-map.htm) for more information.

This component is still in beta.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `props` | [`AreamapChartProps`](../interfaces/interface.AreamapChartProps.md) | Areamap chart properties |
| `context`? | `any` | - |

## Returns

`null` \| `ReactElement`\< `any`, `any` \>

Areamap Chart component

## Example

An example of using the component to visualize the `Sample ECommerce` data source:
```ts
<AreamapChart
  dataSet={DM.DataSource}
  dataOptions={{
    geo: [DM.Country.Country],
    color: measureFactory.sum(DM.Commerce.Cost, 'Total Cost'),
  }}
  styleOptions={{
    mapType: 'world',
  }}
/>
```
