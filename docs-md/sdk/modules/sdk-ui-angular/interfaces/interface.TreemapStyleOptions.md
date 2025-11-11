---
title: TreemapStyleOptions
---

# Interface TreemapStyleOptions

Configuration options that define functional style of the various elements of TreemapChart

## Properties

### dataLimits

> **dataLimits**?: [`DataLimits`](interface.DataLimits.md)

Data limit for series or categories that will be plotted

***

### height

> **height**?: `number`

Total height of the component, which is considered in the following order of priority:

1. Value passed to this property (in pixels).
2. Height of the container wrapping this component
3. Default value of 400px (for component without header) or 425px (for component with header).

***

### labels

> **labels**?: `object`

Labels options object

::: warning Deprecated
Please use `seriesLabels` instead
:::

#### Type declaration

> ##### `labels.category`
>
> **category**?: \{
> `enabled`: `boolean`;
> }[]
>
> Array with single label options objects (order of items relative to dataOptions.category)
>
>

***

### legend

> **legend**?: [`LegendOptions`](../../sdk-ui/type-aliases/type-alias.LegendOptions.md)

Configuration for legend - a key that provides information about the data series or colors used in chart

***

### seriesLabels

> **seriesLabels**?: [`TreemapSeriesLabels`](../../sdk-ui/type-aliases/type-alias.TreemapSeriesLabels.md)

Configuration for series labels - titles/names identifying data series in a chart

***

### tooltip

> **tooltip**?: `object`

Tooltip options object

#### Type declaration

> ##### `tooltip.mode`
>
> **mode**?: `"contribution"` \| `"value"`
>
> Define mode of data showing
>
>

***

### width

> **width**?: `number`

Total width of the component, which is considered in the following order of priority:

1. Value passed to this property (in pixels)
2. Width of the container wrapping this component
3. Default value of 400px
