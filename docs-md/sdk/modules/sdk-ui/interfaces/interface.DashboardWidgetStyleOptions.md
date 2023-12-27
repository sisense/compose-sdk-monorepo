---
title: DashboardWidgetStyleOptions
---

# Interface DashboardWidgetStyleOptions

Style settings defining the look and feel of [DashboardWidget](../functions/function.DashboardWidget.md)

## Extends

- [`WidgetStyleOptions`](interface.WidgetStyleOptions.md)

## Properties

### backgroundColor

> **backgroundColor**?: `string`

Widget background color

Affects chart background color as well

#### Inherited from

[`WidgetStyleOptions`](interface.WidgetStyleOptions.md).[`backgroundColor`](interface.WidgetStyleOptions.md#backgroundcolor)

***

### border

> **border**?: `boolean`

Widget container border toggle

#### Inherited from

[`WidgetStyleOptions`](interface.WidgetStyleOptions.md).[`border`](interface.WidgetStyleOptions.md#border)

***

### borderColor

> **borderColor**?: `string`

Widget container border color

#### Inherited from

[`WidgetStyleOptions`](interface.WidgetStyleOptions.md).[`borderColor`](interface.WidgetStyleOptions.md#bordercolor)

***

### cornerRadius

> **cornerRadius**?: `"Large"` \| `"Medium"` \| `"Small"`

Corner radius of the widget container

#### Inherited from

[`WidgetStyleOptions`](interface.WidgetStyleOptions.md).[`cornerRadius`](interface.WidgetStyleOptions.md#cornerradius)

***

### header

> **header**?: `object`

Widget header styles

#### Type declaration

> ##### `header.backgroundColor`
>
> **backgroundColor**?: `string`
>
> Header background color
>
> ##### `header.dividerLine`
>
> **dividerLine**?: `boolean`
>
> Toggle of the divider line between widget header and chart
>
> ##### `header.dividerLineColor`
>
> **dividerLineColor**?: `string`
>
> Divider line color
>
> ##### `header.hidden`
>
> **hidden**?: `boolean`
>
> Header visibility toggle
>
> ##### `header.titleAlignment`
>
> **titleAlignment**?: `"Left"` \| `"Center"`
>
> Header title alignment
>
> ##### `header.titleTextColor`
>
> **titleTextColor**?: `string`
>
> Header title text color
>
>

#### Inherited from

[`WidgetStyleOptions`](interface.WidgetStyleOptions.md).[`header`](interface.WidgetStyleOptions.md#header)

***

### height

> **height**?: `number`

Total height of the component, which is considered in the following order of priority:

1. Value passed to this property (in pixels).
2. Height of the container wrapping this component
3. Default value as specified per chart type

***

### shadow

> **shadow**?: `"Medium"` \| `"Light"` \| `"Dark"`

Shadow level of the widget container

Effective only when spaceAround is defined

#### Inherited from

[`WidgetStyleOptions`](interface.WidgetStyleOptions.md).[`shadow`](interface.WidgetStyleOptions.md#shadow)

***

### spaceAround

> **spaceAround**?: `"Large"` \| `"Medium"` \| `"Small"`

Space between widget container edge and the chart

#### Inherited from

[`WidgetStyleOptions`](interface.WidgetStyleOptions.md).[`spaceAround`](interface.WidgetStyleOptions.md#spacearound)

***

### width

> **width**?: `number`

Total width of the component, which is considered in the following order of priority:

1. Value passed to this property (in pixels)
2. Width of the container wrapping this component
3. Default value as specified per chart type
