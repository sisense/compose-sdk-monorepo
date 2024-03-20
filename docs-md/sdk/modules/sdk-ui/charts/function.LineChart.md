---
title: LineChart
---

# Function LineChart

> **LineChart**(`props`, `context`?): `null` \| `ReactElement`\< `any`, `any` \>

A React component displaying data as a series of points connected by a line. Used to show trends or changes over time.
See [Line Chart](https://docs.sisense.com/main/SisenseLinux/line-chart.htm) for more information.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `props` | [`LineChartProps`](../interfaces/interface.LineChartProps.md) | Line chart properties |
| `context`? | `any` | - |

## Returns

`null` \| `ReactElement`\< `any`, `any` \>

Line Chart component

## Example

An example of using the component to visualize the `Sample ECommerce` data source:
```ts
<LineChart
  dataSet={DM.DataSource}
  dataOptions={{
    category: [DM.Commerce.Date.Years],
    value: [measureFactory.sum(DM.Commerce.Revenue)],
    breakBy: [DM.Commerce.Gender],
  }}
  filters={[filterFactory.greaterThan(DM.Commerce.Revenue, 1000)]}
  onDataPointClick= {(point, nativeEvent) => {
    console.log('clicked', point, nativeEvent);
  }}
/>
```

<img src="../../../img/line-chart-example-1.png" width="800px" />
