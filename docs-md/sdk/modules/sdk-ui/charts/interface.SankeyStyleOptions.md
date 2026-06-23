---
title: SankeyStyleOptions
---

# Interface SankeyStyleOptions <Badge type="beta" text="Beta" />

Configuration options that define functional style of the various elements of a SankeyChart.

## Example

```ts
<SankeyChart
  dataSet={dataSource}
  dataOptions={{
    category: [DM.Commerce.Gender, DM.Category.Category],
    value: [DM.Measures.SumRevenue],
  }}
  styleOptions={{
    orientation: 'vertical',
    nodePadding: 12,
  }}
/>
```

## Properties

### curveFactor

> **curveFactor**?: `number`

Curve factor of links between Sankey nodes. 0 makes the lines straight.

#### Default

```ts
0.33
```

***

### dataLimits

> **dataLimits**?: [`DataLimits`](../interfaces/interface.DataLimits.md)

Data limit for series or categories that will be plotted

***

### height

> **height**?: `number`

Total height of the component, which is considered in the following order of priority:

1. Value passed to this property (in pixels).
2. Height of the container wrapping this component
3. Default value of 400px (for component without header) or 425px (for component with header).

***

### legend

> **legend**?: [`LegendOptions`](../type-aliases/type-alias.LegendOptions.md)

Configuration for legend - a key that provides information about the data series or colors used in chart

***

### linkOpacity

> **linkOpacity**?: `number`

Opacity of the links between Sankey nodes.

#### Default

```ts
0.5
```

***

### nodeAlignment

> **nodeAlignment**?: `"bottom"` \| `"center"` \| `"top"`

Determines which side of the chart the nodes are aligned to.
In vertical mode `'top'` aligns to the left and `'bottom'` to the right.

***

### nodePadding

> **nodePadding**?: `number`

Vertical padding between Sankey nodes in pixels (horizontal padding in vertical mode).

#### Default

```ts
10
```

***

### nodeWidth

> **nodeWidth**?: `number`

Width of Sankey nodes in pixels (or height in vertical mode).

#### Default

```ts
20
```

***

### orientation

> **orientation**?: `"horizontal"` \| `"vertical"`

Whether the diagram flows horizontally (left-to-right) or vertically (top-to-bottom).
Highcharts renders vertical flow by inverting the chart.

#### Default

```ts
'horizontal'
```

***

### width

> **width**?: `number`

Total width of the component, which is considered in the following order of priority:

1. Value passed to this property (in pixels)
2. Width of the container wrapping this component
3. Default value of 400px
