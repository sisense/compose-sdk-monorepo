---
title: ScatterChart
---

# Function ScatterChart

> **ScatterChart**(`props`, `context`?): `null` \| `ReactElement`\< `any`, `any` \>

A React component displaying the distribution of two variables on an X-Axis, Y-Axis,
and two additional fields of data that are shown as colored circles scattered across the chart.

**Point**: A field that for each of its members a scatter point is drawn. The maximum amount of data points is 500.

**Size**: An optional field represented by the size of the circles.
If omitted, all scatter points are equal in size. If used, the circle sizes are relative to their values.

See [Scatter Chart](https://docs.sisense.com/main/SisenseLinux/scatter-chart.htm) for more information.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `props` | [`ScatterChartProps`](../interfaces/interface.ScatterChartProps.md) | Scatter chart properties |
| `context`? | `any` | - |

## Returns

`null` \| `ReactElement`\< `any`, `any` \>

Scatter Chart component

## Example

An example of using the component to visualize the `Sample ECommerce` data source.

The chart shows top Categories by Total Revenue on the x-axis, and Total Quantity on the y-axis in logarithmic scale
with Gender breakdown by color and Total Cost encoded by the size of the bubbles.
```ts
<ScatterChart
  dataSet={DM.DataSource}
  filters={[filters.greaterThan(DM.Commerce.Revenue, 10)]}
  dataOptions={{
    x: measures.sum(DM.Commerce.Revenue),
    y: measures.sum(DM.Commerce.Quantity),
    breakByPoint: DM.Category.Category,
    breakByColor: DM.Commerce.Gender,
    size: measures.sum(DM.Commerce.Cost),
  }}
  styleOptions={{
    xAxis: {
      enabled: true,
      gridLines: true,
      isIntervalEnabled: false,
      labels: {
        enabled: true,
      },
      logarithmic: true,
      title: {
        enabled: true,
        text: 'Total Revenue',
      },
    },
    yAxis: {
      enabled: true,
      gridLines: true,
      isIntervalEnabled: false,
      labels: {
        enabled: true,
      },
      logarithmic: true,
      title: {
        enabled: true,
        text: 'Total Quantity',
      },
    },
  }}
  onDataPointClick={(point, nativeEvent) => {
    console.log('clicked', point, nativeEvent);
  }}
/>
```

<img src="../../../img/scatter-chart-example-1.png" width="800px" />
