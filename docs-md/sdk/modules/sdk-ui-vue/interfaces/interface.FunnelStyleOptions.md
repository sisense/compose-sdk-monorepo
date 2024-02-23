---
title: FunnelStyleOptions
---

# Interface FunnelStyleOptions

Configuration options that define functional style of the various elements of [FunnelChart](../classes/class.FunnelChart.md)

## Extends

- `BaseStyleOptions`

## Properties

### dataLimits

> **dataLimits**?: [`DataLimits`](interface.DataLimits.md)

Data limit for series or categories that will be plotted

#### Inherited from

BaseStyleOptions.dataLimits

***

### funnelDirection

> **funnelDirection**?: `"regular"` \| `"inverted"`

Direction of [FunnelChart](../classes/class.FunnelChart.md) narrowing

***

### funnelSize

> **funnelSize**?: `"wide"` \| `"regular"` \| `"narrow"`

Visual size of the lowest slice (degree of funnel narrowing from highest to lowest slices)

***

### funnelType

> **funnelType**?: `"regular"` \| `"pinched"`

Visual type of the lowest slice of [FunnelChart](../classes/class.FunnelChart.md)

***

### height

> **height**?: `number`

Total height of the component, which is considered in the following order of priority:

1. Value passed to this property (in pixels).
2. Height of the container wrapping this component
3. Default value of 400px (for component without header) or 425px (for component with header).

#### Inherited from

BaseStyleOptions.height

***

### labels

> **labels**?: [`Labels`](../type-aliases/type-alias.Labels.md)

Configuration that defines behavior of data labels on [FunnelChart](../classes/class.FunnelChart.md)

***

### legend

> **legend**?: [`Legend`](../type-aliases/type-alias.Legend.md)

Configuration for legend - a key that provides information about the data series or colors used in chart

#### Inherited from

BaseStyleOptions.legend

***

### subtype

> **subtype**?: `undefined`

Subtype of [FunnelChart](../classes/class.FunnelChart.md)

***

### width

> **width**?: `number`

Total width of the component, which is considered in the following order of priority:

1. Value passed to this property (in pixels)
2. Width of the container wrapping this component
3. Default value of 400px

#### Inherited from

BaseStyleOptions.width
