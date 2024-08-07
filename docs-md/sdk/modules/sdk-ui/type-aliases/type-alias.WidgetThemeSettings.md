---
title: WidgetThemeSettings
---

# Type alias WidgetThemeSettings

> **WidgetThemeSettings**: `object`

Widget theme settings

## Type declaration

### `border`

**border**?: `boolean`

Widget container border toggle

***

### `borderColor`

**borderColor**?: `string`

Widget container border color

***

### `cornerRadius`

**cornerRadius**?: [`RadiusSizes`](type-alias.RadiusSizes.md)

Corner radius of the widget container

***

### `header`

**header**?: `object`

Widget header styles

> #### `header.backgroundColor`
>
> **backgroundColor**?: `string`
>
> Header background color
>
> #### `header.dividerLine`
>
> **dividerLine**?: `boolean`
>
> Toggle of the divider line between widget header and chart
>
> #### `header.dividerLineColor`
>
> **dividerLineColor**?: `string`
>
> Divider line color
>
> #### `header.titleAlignment`
>
> **titleAlignment**?: [`AlignmentTypes`](type-alias.AlignmentTypes.md)
>
> Header title alignment
>
> #### `header.titleTextColor`
>
> **titleTextColor**?: `string`
>
> Header title text color
>
>

***

### `shadow`

**shadow**?: [`ShadowsTypes`](type-alias.ShadowsTypes.md)

Shadow level of the widget container

Effective only when spaceAround is defined

***

### `spaceAround`

**spaceAround**?: [`SpaceSizes`](type-alias.SpaceSizes.md)

Space between widget container edge and the chart
