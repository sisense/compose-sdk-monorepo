---
title: SeriesLabelsBase
---

# Type alias SeriesLabelsBase

> **SeriesLabelsBase**: `object`

## Type declaration

### `backgroundColor`

**backgroundColor**?: `"auto"` \| [`GradientColor`](type-alias.GradientColor.md) \| `string`

Background color of the labels. `auto` uses the same color as the data point

***

### `borderColor`

**borderColor**?: [`GradientColor`](type-alias.GradientColor.md) \| `string`

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

### `enabled`

**enabled**: `boolean`

Boolean flag that defines if series labels should be shown on the chart

***

### `padding`

**padding**?: `number`

Padding of the series labels, in pixels

***

### `prefix`

**prefix**?: `string`

Text to be shown before the series labels

***

### `rotation`

**rotation**?: `number`

Rotation of series labels (in degrees)
Note that due to a more complex structure, backgrounds, borders and padding will be lost on a rotated data label

***

### `suffix`

**suffix**?: `string`

Text to be shown after the series labels

***

### `textStyle`

**textStyle**?: [`SeriesLabelsTextStyle`](type-alias.SeriesLabelsTextStyle.md)

Styling for labels text

***

### `xOffset`

**xOffset**?: `number`

Horizontal offset of the labels in pixels, relative to its horizontal alignment specified via `align`

#### Default

```ts
0
```

***

### `yOffset`

**yOffset**?: `number`

Vertical offset of the labels in pixels, relative to its vertical alignment specified via `verticalAlign`

#### Default

```ts
0
```
