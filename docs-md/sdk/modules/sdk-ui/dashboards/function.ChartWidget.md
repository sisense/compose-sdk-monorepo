---
title: ChartWidget
---

# Function ChartWidget

> **ChartWidget**(`props`): `ReactElement`\< `any`, `any` \> \| `null`

The Chart Widget component extending the [Chart](../charts/function.Chart.md) component to support widget style options.
It can be used along with the [DrilldownWidget](../drilldown/function.DrilldownWidget.md) component to support advanced data drilldown.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `props` | [`ChartWidgetProps`](../interfaces/interface.ChartWidgetProps.md) | ChartWidget properties |

## Returns

`ReactElement`\< `any`, `any` \> \| `null`

ChartWidget component representing a chart type as specified in `ChartWidgetProps.`[chartType](../interfaces/interface.ChartWidgetProps.md#charttype)

## Example

Example of using the `ChartWidget` component to
plot a bar chart of the `Sample ECommerce` data source hosted in a Sisense instance.
```ts
<ChartWidget
  dataSource={DM.DataSource}
  chartType="bar"
  dataOptions={{
    category: [DM.Category.Category],
    value: [measureFactory.sum(DM.Commerce.Revenue)],
    breakBy: [],
  }}
/>
```

<img src="../../../img/chart-widget-with-drilldown-example-1.png" width="800px" />
