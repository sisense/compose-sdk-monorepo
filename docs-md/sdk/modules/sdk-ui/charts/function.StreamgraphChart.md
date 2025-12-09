---
title: StreamgraphChart
---

# Function StreamgraphChart

> **StreamgraphChart**(`props`): `ReactElement`\< `any`, `any` \> \| `null`

A React component that displays a streamgraph chart.

A streamgraph is a type of stacked area chart where areas are displaced around
a central axis. It is particularly effective for displaying volume across
different categories or over time with a relative scale that emphasizes
overall patterns and trends.

## Example

Streamgraph displaying revenue by category over time.

```ts
import { StreamgraphChart } from '@sisense/sdk-ui';
import { measureFactory } from '@sisense/sdk-data';
import * as DM from './sample-ecommerce';

function RevenueByCategoryStreamgraph() {
  return (
    <StreamgraphChart
      dataSet={DM.DataSource}
      dataOptions={{
        category: [DM.Commerce.Date.Quarters],
        value: [measureFactory.sum(DM.Commerce.Revenue, 'Revenue')],
        breakBy: [DM.Category.Category],
      }}
      styleOptions={{
        width: 1200,
        height: 500,
      }}
    />
  );
}
```

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `props` | [`StreamgraphChartProps`](../interfaces/interface.StreamgraphChartProps.md) | Streamgraph chart properties |

## Returns

`ReactElement`\< `any`, `any` \> \| `null`

Streamgraph Chart component
