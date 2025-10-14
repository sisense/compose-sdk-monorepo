---
title: LegendOptions
---

# Type alias LegendOptions

> **LegendOptions**: `object`

Options that define legend - a key that provides information about the data series or colors used in chart.

## Type declaration

### `align`

**align**?: `"center"` \| `"left"` \| `"right"`

Horizontal alignment of the legend

***

### `backgroundColor`

**backgroundColor**?: `string`

Background color of the legend

***

### `borderColor`

**borderColor**?: `string`

Color of the legend border

***

### `borderRadius`

**borderRadius**?: `number`

Border radius in pixels applied to the legend border, if visible.

#### Default

```ts
0
```

***

### `borderWidth`

**borderWidth**?: `number`

Width of the legend border in pixels

***

### `enabled`

**enabled**: `boolean`

Boolean flag that defines if legend should be shown on the chart

***

### `floating`

**floating**?: `boolean`

If `true`, the legend can float over the chart.

#### Default

```ts
false
```

***

### `items`

**items**?: [`LegendItemsOptions`](../interfaces/interface.LegendItemsOptions.md)

Configuration for legend items

***

### `margin`

**margin**?: `number`

Margin in pixels between the legend and the axis labels or plot area

***

### `maxHeight`

**maxHeight**?: `number`

Maximum height of the legend in pixels.
When the maximum height is exceeded by the number of items in the legend, scroll navigation arrows will appear

***

### `padding`

**padding**?: `number`

Padding inside the legend, in pixels

***

### `position`

**position**?: [`LegendPosition`](type-alias.LegendPosition.md)

Position of the legend

::: warning Deprecated
Please use `align`, `verticalAlign` and `items.layout` properties instead
:::

***

### `reversed`

**reversed**?: `boolean`

If `true`, the order of legend items is reversed.

#### Default

```ts
false
```

***

### `rtl`

**rtl**?: `boolean`

If `true`, legend items are displayed right-to-left.

#### Default

```ts
false
```

***

### `shadow`

**shadow**?: `boolean`

Whether to show shadow on the legend

***

### `symbols`

**symbols**?: [`LegendSymbolsOptions`](../interfaces/interface.LegendSymbolsOptions.md)

Configuration for legend symbols in pixels

***

### `title`

**title**?: [`LegendTitleOptions`](../interfaces/interface.LegendTitleOptions.md)

Configuration for the legend title

***

### `verticalAlign`

**verticalAlign**?: `"bottom"` \| `"middle"` \| `"top"`

Vertical alignment of the legend

***

### `width`

**width**?: `number` \| `string`

Width of the legend, specified in pixels e.g. `200` or percentage of the chart width e.g. `'30%'`

***

### `xOffset`

**xOffset**?: `number`

Horizontal offset of the legend in pixels, relative to its horizontal alignment specified via `align`.

#### Default

```ts
0
```

***

### `yOffset`

**yOffset**?: `number`

Vertical offset of the legend in pixels, relative to its vertical alignment specified via `verticalAlign`.

#### Default

```ts
0
```
