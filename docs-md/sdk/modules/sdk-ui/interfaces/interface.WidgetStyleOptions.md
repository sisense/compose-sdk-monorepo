---
title: WidgetStyleOptions
---

# Interface WidgetStyleOptions

Style settings defining the look and feel of widget itself and widget header

## Properties

### backgroundColor

> **backgroundColor**?: `string`

Widget background color

Affects chart background color as well

***

### border

> **border**?: `boolean`

Widget container border toggle

***

### borderColor

> **borderColor**?: `string`

Widget container border color

***

### cornerRadius

> **cornerRadius**?: `"Medium"` \| `"Large"` \| `"Small"`

Corner radius of the widget container

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

***

### shadow

> **shadow**?: `"Light"` \| `"Medium"` \| `"Dark"`

Shadow level of the widget container

Effective only when spaceAround is defined

***

### spaceAround

> **spaceAround**?: `"Medium"` \| `"Large"` \| `"Small"`

Space between widget container edge and the chart
