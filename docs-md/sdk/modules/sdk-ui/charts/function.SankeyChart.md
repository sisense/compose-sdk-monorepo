---
title: SankeyChart
---

# Function SankeyChart <Badge type="beta" text="Beta" />

> **SankeyChart**(`props`): `Promise`\< `ReactNode` \> \| `ReactNode`

A React component that visualizes flow and volume between nodes using a Sankey diagram.
Node width represents the total flow through that node; link width represents the flow
between two connected nodes.

## Example

```ts
<SankeyChart
  dataSet={DM.DataSource}
  dataOptions={{
    category: [DM.Commerce.Gender, DM.Commerce.AgeRange],
    value: measureFactory.sum(DM.Commerce.Revenue),
  }}
  styleOptions={{
    orientation: 'horizontal',
    nodeAlignment: 'top',
  }}
/>
```

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `props` | [`SankeyChartProps`](../interfaces/interface.SankeyChartProps.md) | Sankey chart properties |

## Returns

`Promise`\< `ReactNode` \> \| `ReactNode`

Sankey Chart component
