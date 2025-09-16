---
title: LegendItemsOptions
---

# Interface LegendItemsOptions

Configuration for individual legend items

## Properties

### distance

> **distance**?: `number`

Distance between legend items in pixels

***

### layout

> **layout**?: `"horizontal"` \| `"proximate"` \| `"vertical"`

Layout direction for legend items

Can be one of 'horizontal' or 'vertical' or 'proximate'.
When 'proximate', the legend items will be placed as close as possible to the graphs they're representing, except in inverted charts or when the legend position doesn't allow it.

***

### marginBottom

> **marginBottom**?: `number`

Bottom margin applied to each legend item, in pixels

***

### marginTop

> **marginTop**?: `number`

Top margin applied to each legend item, in pixels

***

### textStyle

> **textStyle**?: [`TextStyle`](../type-aliases/type-alias.TextStyle.md)

Styling for legend items text

***

### width

> **width**?: `number`

Width of legend items, in pixels.

#### Default

```ts
undefined
```
