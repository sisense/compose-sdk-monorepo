---
title: KpiComparisonStyleOptions
---

# Type alias KpiComparisonStyleOptions <Badge type="beta" text="Beta" />

> **KpiComparisonStyleOptions**: `object`

Configuration that defines styling of the KPI comparison readout.

## Type declaration

### `color`

**color**?: [`DataColorOptions`](type-alias.DataColorOptions.md)

Color of the delta readout. Conditions evaluate against `deltaPercent`
('delta' / 'previous-period' comparisons) or `percentOfTarget` ('target').
Not applicable to the 'value' comparison (colored by its own measure).

#### Default Value

```ts
sign-based: positive delta green, negative red
```

#### Example

```ts
color: {
  type: 'conditional',
  conditions: [
    { color: '#2ecc71', expression: '0', operator: '<' },
    { color: '#e74c3c', expression: '0', operator: '>' },
  ],
}
```

***

### `conditionalIcons`

**conditionalIcons**?: [`KpiIconCondition`](type-alias.KpiIconCondition.md)[]

Condition-driven icons next to the comparison readout; first match wins.

***

### `display`

**display**?: `"both"` \| `"percent"` \| `"value"`

Which numeric form(s) of the comparison to render.

For delta-shaped comparisons ('delta' / 'previous-period'): percent change, absolute
difference, or both in one line.

For 'target' comparisons: 'percent' shows only the percent-of-goal line
(`percentOfTarget`), 'value' shows only the amount-to-go line (`toGo`), and 'both' shows
the percent line with the amount-to-go beneath it.

#### Default Value

```ts
'percent'
```

***

### `label`

**label**?: `string`

Caption next to the delta, e.g. 'vs last year'. Defaults to an i18n label inferred from context.

***

### `showIcon`

**showIcon**?: `boolean`

Whether the up/down arrow is shown next to the delta.

#### Default Value

```ts
true
```
