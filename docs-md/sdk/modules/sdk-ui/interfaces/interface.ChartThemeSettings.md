---
title: ChartThemeSettings
---

# Interface ChartThemeSettings

Chart theme settings

## Properties

### animation

> **animation**?: `object`

Animation options

#### Type declaration

> ##### `animation.init`
>
> **init**?: `object`
>
> Chart initialization animation options
>
> > ###### `init.duration`
> >
> > **duration**?: `"auto"` \| `number`
> >
> > Animation duration in milliseconds.
> > If not specified, the default value, `auto`, will be used with a different default value applied per chart type.
> >
> >
>
> ##### `animation.redraw`
>
> **redraw**?: `object`
>
> Chart redraw animation options
>
> > ###### `redraw.duration`
> >
> > **duration**?: `"auto"` \| `number`
> >
> > Animation duration in milliseconds.
> > If not specified, the default value, `auto`, will be used with a different default value applied per chart type.
> >
> >
>
>

***

### backgroundColor

> **backgroundColor**?: `string`

Background color

***

### secondaryTextColor

> **secondaryTextColor**?: `string`

Secondary text color - e.g., for the indicator chart's secondary value title

***

### textColor

> **textColor**?: `string`

Text color
