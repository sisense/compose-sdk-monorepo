---
title: SunburstStyleOptions
---

# Interface SunburstStyleOptions

Configuration options that define functional style of the various elements of [SunburstChart](../classes/class.SunburstChart.md)

## Extends

- `BaseStyleOptions`

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

### labels

> **labels**?: `object`

Labels options object

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

> **legend**?: [`Legend`](../type-aliases/type-alias.Legend.md)

Configuration for legend - a key that provides information about the data series or colors used in chart

#### Inherited from

BaseStyleOptions.legend

***

### tooltip

> **tooltip**?: `object`

Tooltip options object

#### Type declaration

> ##### `tooltip.mode`
>
> **mode**?: `"value"` \| `"contribution"`
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

#### Inherited from

BaseStyleOptions.width
