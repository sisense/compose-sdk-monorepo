---
title: PieStyleOptions
---

# Interface PieStyleOptions

Configuration options that define functional style of the various elements of Pie chart

## Properties

### convolution

> **convolution**?: [`Convolution`](../type-aliases/type-alias.Convolution.md)

Configuration that defines the ability of the Pie chart to collapse (convolve) and
hide part of the data under the single category "Others".

***

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

> **labels**?: [`Labels`](../type-aliases/type-alias.Labels.md)

Configuration that defines behavior of data labels on Pie chart

***

### legend

> **legend**?: [`LegendOptions`](../../sdk-ui/type-aliases/type-alias.LegendOptions.md)

Configuration for legend - a key that provides information about the data series or colors used in chart

***

### subtype

> **subtype**?: [`PieSubtype`](../type-aliases/type-alias.PieSubtype.md)

Subtype of Pie chart

***

### width

> **width**?: `number`

Total width of the component, which is considered in the following order of priority:

1. Value passed to this property (in pixels)
2. Width of the container wrapping this component
3. Default value of 400px
