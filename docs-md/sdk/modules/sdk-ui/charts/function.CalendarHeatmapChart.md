---
title: CalendarHeatmapChart
---

# Function CalendarHeatmapChart

> **CalendarHeatmapChart**(`props`): `ReactElement`\< `any`, `any` \> \| `null`

A React component that visualizes values over days in a calendar-like view,
making it easy to identify daily patterns or anomalies

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `props` | [`CalendarHeatmapChartProps`](../interfaces/interface.CalendarHeatmapChartProps.md) | Calendar Heatmap chart properties |

## Returns

`ReactElement`\< `any`, `any` \> \| `null`

Calendar Heatmap Chart component

## Example

```ts
<CalendarHeatmapChart
  dataSet={DM.DataSource}
  dataOptions={{
    date: DM.Commerce.Date.Days,
    value: measureFactory.sum(DM.Commerce.Cost)
  }}
  styleOptions={{
    width: 800,
    height: 600,
    viewType: 'quarter'
  }}
/>
```
