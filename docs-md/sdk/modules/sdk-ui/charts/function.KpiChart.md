---
title: KpiChart
---

# Function KpiChart <Badge type="beta" text="Beta" />

> **KpiChart**(`props`): `Promise`\< `ReactNode` \> \| `ReactNode`

A React component that displays a KPI card: primary value with an optional
sparkline trend and a comparison readout — previous period, another measure,
or a target.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `props` | [`KpiChartProps`](../interfaces/interface.KpiChartProps.md) | KPI chart properties |

## Returns

`Promise`\< `ReactNode` \> \| `ReactNode`

KPI Chart component

## Example

```ts
<KpiChart
  dataSet={DM.DataSource}
  dataOptions={{
    value: measureFactory.sum(DM.Commerce.Revenue),
    trend: DM.Commerce.Date.Months,
  }}
/>
```
