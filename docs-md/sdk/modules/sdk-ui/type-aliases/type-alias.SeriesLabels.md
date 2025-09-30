---
title: SeriesLabels
---

# Type alias SeriesLabels

> **SeriesLabels**: `object`

Options that define series labels - titles/names identifying data series in a chart.

## Type declaration

### `align`

**align**?: `"center"` \| `"left"` \| `"right"`

The horizontal alignment of the data label compared to the point

***

### `alignInside`

**alignInside**?: `boolean`

If `true`, series labels appear inside bars/columns instead of at the datapoints. Not applicable for some chart types e.g. line, area

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

### `showPercentage`

**showPercentage**?: `boolean`

Boolean flag that defines if percentage should be shown in series labels
(only applicable for subtypes that support percentage, like "stacked100")

***

### `showValue`

**showValue**?: `boolean`

Boolean flag that defines if value should be shown in series labels
(if not specified, value will be shown by default)

***

### `suffix`

**suffix**?: `string`

Text to be shown after the series labels

***

### `textStyle`

**textStyle**?: [`SeriesLabelsTextStyle`](type-alias.SeriesLabelsTextStyle.md)

Styling for labels text

***

### `verticalAlign`

**verticalAlign**?: `"bottom"` \| `"middle"` \| `"top"`

The vertical alignment of the data label

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
