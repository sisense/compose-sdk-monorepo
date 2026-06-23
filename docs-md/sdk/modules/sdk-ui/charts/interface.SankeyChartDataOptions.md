---
title: SankeyChartDataOptions
---

# Interface SankeyChartDataOptions <Badge type="beta" text="Beta" />

Configuration for how to query aggregate data and assign data
to a [Sankey chart](../type-aliases/type-alias.SankeyChartType.md).

## Example

```ts
<SankeyChart
  dataSet={dataSource}
  dataOptions={{
    category: [DM.Commerce.Gender, DM.Commerce.AgeRange],
    value: measureFactory.sum(DM.Commerce.Revenue),
  }}
/>
```

## Properties

### category

> **category**: ([`CalculatedColumn`](../../sdk-data/interfaces/interface.CalculatedColumn.md) \| [`Column`](../../sdk-data/interfaces/interface.Column.md) \| [`StyledColumn`](../interfaces/interface.StyledColumn.md))[]

Columns (or attributes) representing the nodes in each stage of the flow.
Must contain at least 2 items to define source and target nodes.
When more than 2 items are provided the chart displays multi-stage flows.

***

### seriesToColorMap

> **seriesToColorMap**?: [`MultiColumnValueToColorMap`](../type-aliases/type-alias.MultiColumnValueToColorMap.md) \| [`ValueToColorMap`](../type-aliases/type-alias.ValueToColorMap.md)

Optional mapping of node names to colors.

***

### value

> **value**: [`CalculatedMeasureColumn`](../../sdk-data/interfaces/interface.CalculatedMeasureColumn.md) \| [`MeasureColumn`](../../sdk-data/interfaces/interface.MeasureColumn.md) \| [`StyledMeasureColumn`](../interfaces/interface.StyledMeasureColumn.md)

Measure column whose aggregated values determine the flow weight between nodes.
Use a styled measure column to apply [number formatting](../interfaces/interface.StyledMeasureColumn.md#numberformatconfig).
