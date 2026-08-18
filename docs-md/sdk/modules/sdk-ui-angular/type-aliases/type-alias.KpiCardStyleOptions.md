---
title: KpiCardStyleOptions
---

# Type alias KpiCardStyleOptions

> **KpiCardStyleOptions**: `object`

Configuration that defines styling of the KPI card container.

## Type declaration

### `backgroundColor`

**backgroundColor**?: `string`

Card background color.

When the color is given as a hex string and is dark enough that white text reads better
against it, the headline text and the sparkline switch to white automatically. Colors in
other notations (named colors, `rgb()`, `hsl()`) are applied as given, without that switch.

#### Default

the theme's `chart.backgroundColor`

***

### `cornerRadius`

**cornerRadius**?: `number`

Corner radius of the card in pixels.

#### Default

```ts
8
```

***

### `showBorder`

**showBorder**?: `boolean`

Boolean flag that defines whether the card border is shown.

#### Default

```ts
false
```

***

### `textAlign`

**textAlign**?: `"center"` \| `"left"` \| `"right"`

Horizontal alignment of the card text.

#### Default

```ts
'left'
```
