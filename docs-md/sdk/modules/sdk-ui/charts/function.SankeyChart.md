---
title: SankeyChart
---

# Function SankeyChart <Badge type="beta" text="Beta" />

> **SankeyChart**(`props`): `ReactElement`\< `any`, `any` \> \| `null`

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
| `props` | [`SankeyChartProps`](interface.SankeyChartProps.md) | Sankey chart properties |

## Returns

`ReactElement`\< `any`, `any` \> \| `null`

Sankey Chart component
