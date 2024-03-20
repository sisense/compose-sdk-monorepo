---
title: ScattermapStyleOptions
---

# Interface ScattermapStyleOptions

Configuration options that define functional style of the various elements of ScattermapChart

## Properties

### height

> **height**?: `number`

Total height of the component, which is considered in the following order of priority:

1. Value passed to this property (in pixels).
2. Height of the container wrapping this component
3. Default value of 400px (for component without header) or 425px (for component with header).

***

### markers

> **markers**?: [`ScattermapMarkers`](../type-aliases/type-alias.ScattermapMarkers.md)

***

### subtype

> **subtype**?: `undefined`

***

### width

> **width**?: `number`

Total width of the component, which is considered in the following order of priority:

1. Value passed to this property (in pixels)
2. Width of the container wrapping this component
3. Default value of 400px
