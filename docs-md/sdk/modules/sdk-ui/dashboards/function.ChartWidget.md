---
title: ChartWidget
---

# Function ChartWidget

> **ChartWidget**(`props`): `Promise`\< `ReactNode` \> \| `ReactNode`

The Chart Widget component extending the [Chart](../charts/function.Chart.md) component to support widget style options.
It can be used along with the [DrilldownWidget](../drilldown/function.DrilldownWidget.md) component to support advanced data drilldown.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `props` | [`ChartWidgetProps`](../interfaces/interface.ChartWidgetProps.md) | ChartWidget properties |

## Returns

`Promise`\< `ReactNode` \> \| `ReactNode`

ChartWidget component representing a chart type as specified in `ChartWidgetProps.`[chartType](../interfaces/interface.ChartWidgetProps.md#charttype)

## Example

```ts
import { ChartWidget } from '@sisense/sdk-ui';
import { measureFactory } from '@sisense/sdk-data';
import * as DM from './sample-ecommerce';

const CodeExample = () => (
  <ChartWidget
    title="Revenue by Quarter"
    description="This chart shows the total revenue by quarter."
    chartType="column"
    dataSource={DM.DataSource}
    dataOptions={{
      category: [DM.Commerce.Date.Quarters],
      value: [measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')],
      breakBy: [],
    }}
  />
);

export default CodeExample;
```

<img src="../../../img/chart-widget-example-1.png" width="700px" />
