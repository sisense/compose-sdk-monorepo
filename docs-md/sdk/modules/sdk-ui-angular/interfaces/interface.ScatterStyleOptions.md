---
title: ScatterStyleOptions
---

# Interface ScatterStyleOptions

Configuration options that define functional style of the various elements of ScatterChart

## Extends

- `BaseStyleOptions`.`BaseAxisStyleOptions`

## Properties

### dataLimits

> **dataLimits**?: [`DataLimits`](interface.DataLimits.md)

Data limit for series or categories that will be plotted

#### Inherited from

BaseStyleOptions.dataLimits

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

### legend

> **legend**?: [`Legend`](../type-aliases/type-alias.Legend.md)

Configuration for legend - a key that provides information about the data series or colors used in chart

#### Inherited from

BaseStyleOptions.legend

***

### markerSize

> **markerSize**?: [`ScatterMarkerSize`](../type-aliases/type-alias.ScatterMarkerSize.md)

***

### markers

> **markers**?: [`Markers`](../type-aliases/type-alias.Markers.md)

Configuration for markers - symbols or data points that highlight specific values

#### Inherited from

BaseAxisStyleOptions.markers

***

### navigator

> **navigator**?: [`Navigator`](../type-aliases/type-alias.Navigator.md)

Configuration for navigator - zoom/pan tool for large datasets in a chart

#### Inherited from

BaseAxisStyleOptions.navigator

***

### subtype

> **subtype**?: `undefined`

Subtype of ScatterChart

***

### width

> **width**?: `number`

Total width of the component, which is considered in the following order of priority:

1. Value passed to this property (in pixels)
2. Width of the container wrapping this component
3. Default value of 400px

#### Inherited from

BaseStyleOptions.width

***

### xAxis

> **xAxis**?: [`AxisLabel`](../type-aliases/type-alias.AxisLabel.md)

Configuration for X axis

#### Inherited from

BaseAxisStyleOptions.xAxis

***

### y2Axis

> **y2Axis**?: [`AxisLabel`](../type-aliases/type-alias.AxisLabel.md)

Configuration for second Y axis

#### Inherited from

BaseAxisStyleOptions.y2Axis

***

### yAxis

> **yAxis**?: [`AxisLabel`](../type-aliases/type-alias.AxisLabel.md)

Configuration for Y axis

#### Inherited from

BaseAxisStyleOptions.yAxis
