---
title: KpiComparisonStyleOptions
---

# Type alias KpiComparisonStyleOptions

> **KpiComparisonStyleOptions**: `object`

Configuration that defines styling of the KPI comparison readout.

## Type declaration

### `color`

**color**?: [`DataColorOptions`](type-alias.DataColorOptions.md)

Color of the delta readout. Conditions evaluate against `deltaPercent`
('delta' / 'previous-period' comparisons) or `percentOfTarget` ('target').
Not applicable to the 'value' comparison (colored by its own measure).

#### Default

sign-based: positive delta `green`, negative `red`

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

#### Default

```ts
'percent'
```

***

### `label`

**label**?: `string`

Caption under a delta-shaped comparison ('delta' / 'previous-period'), replacing the default
verbatim — no baseline value is appended, e.g. 'vs last year'. For a 'target' comparison it
renames the goal in `{{goal}}` templates; for a 'value' comparison it replaces the label.

#### Default

localized relation to the baseline plus its value, e.g. `'vs Total Cost (107.27M)'`

***

### `ofGoalText`

**ofGoalText**?: `string`

Template for the 'target' comparison's percent-of-goal readout, replacing the localized
default. `{{percent}}` interpolates the formatted percent (e.g. '82%'), `{{goalValue}}` the
target formatted with the comparison's number format (e.g. '$1M'), and `{{goal}}` the
target's display label (the target measure's title, or the plain number for a fixed target).

#### Default

localized `'{{percent}} of goal ({{goalValue}})'`

#### Example

```ts
comparison: { ofGoalText: '{{percent}} of {{goal}} target' }
```

***

### `showIcon`

**showIcon**?: `boolean`

Whether the up/down arrow is shown next to the delta.

#### Default

```ts
true
```

***

### `textStyle`

**textStyle**?: [`KpiTextStyle`](type-alias.KpiTextStyle.md)

Typography of the comparison's primary readout line (the delta, percent-of-goal, or
comparison value). Does not apply to the label line beneath it.

#### Default

```ts
{ fontWeight: '600', fontStyle: 'normal', textTransform: 'none' } with the theme font
```

***

### `toGoText`

**toGoText**?: `string`

Template for the 'target' comparison's amount-to-go readout, replacing the localized
default. `{{value}}` interpolates the formatted remaining amount (e.g. '$250K').

#### Default

localized `'{{value}} to go'`

#### Example

```ts
comparison: { toGoText: '{{value}} remaining' }
```
