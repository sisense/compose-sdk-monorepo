---
title: CalendarHeatmapCellLabels
---

# Type alias CalendarHeatmapCellLabels

> **CalendarHeatmapCellLabels**: `object`

Configuration for day numbers (1-31) labels in calendar-heatmap cells

## Type declaration

### `enabled`

**enabled**?: `boolean`

Boolean flag that defines if calendar day numbers should be shown in cells

#### Default

```ts
true
```

***

### `style`

**style**?: `Omit`\< [`TextStyle`](type-alias.TextStyle.md), `"color"` \> & \{
  `color`: `"contrast"` \| `string`;
 }

Style configuration for calendar day numbers in cells

::: warning Deprecated
Please use `textStyle` instead
:::

> #### `style.color`
>
> **color**?: `"contrast"` \| `string`
>
> Color of the labels text
>
> The "contrast" color applies the maximum contrast between the background and the text
>
>

***

### `textStyle`

**textStyle**?: `Omit`\< [`TextStyle`](type-alias.TextStyle.md), `"color"` \> & \{
  `color`: `"contrast"` \| `string`;
 }

Style configuration for calendar day numbers in cells

> #### `textStyle.color`
>
> **color**?: `"contrast"` \| `string`
>
> Color of the labels text
>
> The "contrast" color applies the maximum contrast between the background and the text
>
>
