---
title: ThemeSettings
---

# Interface ThemeSettings

Theme settings defining the look and feel of components.

## Properties

### chart

> **chart**?: `object`

Chart theme settings

#### Type declaration

> ##### `chart.backgroundColor`
>
> **backgroundColor**?: `string`
>
> Background color
>
> ##### `chart.secondaryTextColor`
>
> **secondaryTextColor**?: `string`
>
> Secondary text color - e.g., for the indicator chart's secondary value title
>
> ##### `chart.textColor`
>
> **textColor**?: `string`
>
> Text color
>
>

***

### general

> **general**?: `object`

General theme settings

#### Type declaration

> ##### `general.backgroundColor`
>
> **backgroundColor**?: `string`
>
> Background color used for elements like tiles, etc.
>
> ##### `general.brandColor`
>
> **brandColor**?: `string`
>
> Main color used for various elements like primary buttons, switches, etc.
>
> ##### `general.primaryButtonHoverColor`
>
> **primaryButtonHoverColor**?: `string`
>
> Hover color for primary buttons
>
> ##### `general.primaryButtonTextColor`
>
> **primaryButtonTextColor**?: `string`
>
> Text color for primary buttons
>
>

***

### palette

> **palette**?: [`ColorPaletteTheme`](../type-aliases/type-alias.ColorPaletteTheme.md)

Collection of colors used to color various elements

***

### typography

> **typography**?: `object`

Text theme settings

#### Type declaration

> ##### `typography.fontFamily`
>
> **fontFamily**?: `string`
>
> Font family name to style component text
>
> ##### `typography.primaryTextColor`
>
> **primaryTextColor**?: `string`
>
> ##### `typography.secondaryTextColor`
>
> **secondaryTextColor**?: `string`
>
>
