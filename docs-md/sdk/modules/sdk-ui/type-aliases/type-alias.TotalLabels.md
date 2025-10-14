---
title: TotalLabels
---

# Type alias TotalLabels

> **TotalLabels**: `object`

Configuration options for total labels in stacked charts.

Total labels display the sum of all series values at each data point in stacked charts.
This configuration allows you to customize the appearance and positioning of these labels.

## Type declaration

### `align`

**align**?: `"center"` \| `"left"` \| `"right"`

The horizontal alignment of the total label compared to the point

***

### `backgroundColor`

**backgroundColor**?: `"auto"` \| `string`

Background color of the labels. `auto` uses the same color as the data point

***

### `borderColor`

**borderColor**?: `string`

Color of the labels border

***

### `borderRadius`

**borderRadius**?: `number`

Border radius in pixels applied to the labels border, if visible

#### Default

```ts
0
```

***

### `borderWidth`

**borderWidth**?: `number`

Border width of the series labels, in pixels

***

### `delay`

**delay**?: `number`

The animation delay time in milliseconds. Set to 0 to render the data labels immediately

***

### `enabled`

**enabled**: `boolean`

Boolean flag that defines if total labels should be shown on the chart
Total labels are only supported for stacked chart subtypes (Column, Bar, Area)

***

### `prefix`

**prefix**?: `string`

Text to be shown before the total label

***

### `rotation`

**rotation**?: `number`

Rotation of total labels (in degrees)

***

### `suffix`

**suffix**?: `string`

Text to be shown after the total label

***

### `textStyle`

**textStyle**?: [`TotalLabelsTextStyle`](type-alias.TotalLabelsTextStyle.md)

Styling for labels text

***

### `verticalAlign`

**verticalAlign**?: `"bottom"` \| `"middle"` \| `"top"`

The vertical alignment of the total label compared to the point

***

### `xOffset`

**xOffset**?: `number`

Horizontal offset of the total label in pixels, relative to its horizontal alignment specified via `align`

***

### `yOffset`

**yOffset**?: `number`

Vertical offset of the total label in pixels, relative to its vertical alignment specified via `verticalAlign`
