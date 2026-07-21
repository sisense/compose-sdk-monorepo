---
title: KpiValueStyleOptions
---

# Type alias KpiValueStyleOptions <Badge type="beta" text="Beta" />

> **KpiValueStyleOptions**: `object`

Configuration that defines styling of the KPI headline value.

To color the headline value, set a color (uniform or conditional) on the value measure in
[KpiChartDataOptions.value](../interfaces/interface.KpiChartDataOptions.md#value) -- the standard measure-coloring mechanism used across the
SDK.

## Type declaration

### `conditionalIcons`

**conditionalIcons**?: [`KpiIconCondition`](type-alias.KpiIconCondition.md)[]

Condition-driven icons shown next to the headline value;
the first matching condition wins.

***

### `noDataText`

**noDataText**?: `string`

Text shown in place of the headline when the value is null,
keeping the card title and styling. When omitted, the standard
no-results overlay is shown instead.

***

### `textSize`

**textSize**?: [`KpiTextSize`](type-alias.KpiTextSize.md)

Text size of the headline value: `'auto'` to scale it to the card, or a fixed size in px.

#### Default Value

```ts
'auto'
```
