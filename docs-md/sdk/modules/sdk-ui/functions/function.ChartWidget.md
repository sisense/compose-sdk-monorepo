---
title: ChartWidget
---

# Function ChartWidget

> **ChartWidget**(`props`, `context`?): `null` \| `ReactElement`\< `any`, `any` \>

The Chart Widget component extending the [Chart](function.Chart.md) component to support widget style options.
It can be used along with the [DrilldownWidget](function.DrilldownWidget.md) component to support advanced data drilldown.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `props` | [`ChartWidgetProps`](../interfaces/interface.ChartWidgetProps.md) | ChartWidget properties |
| `context`? | `any` | - |

## Returns

`null` \| `ReactElement`\< `any`, `any` \>

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
