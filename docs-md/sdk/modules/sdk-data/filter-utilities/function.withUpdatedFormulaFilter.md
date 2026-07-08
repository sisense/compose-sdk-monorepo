---
title: withUpdatedFormulaFilter
---

# Function withUpdatedFormulaFilter <Badge type="beta" text="Beta" />

> **withUpdatedFormulaFilter**(`match`, `updateFn`): [`CalculatedMeasureTransformer`](../type-aliases/type-alias.CalculatedMeasureTransformer.md)

Returns a transformer that functionally updates the filter(s) matching the target, keeping the
same context key so the formula expression is left untouched.

Useful for tweaks such as narrowing a filter's members. Returns the measure unchanged when
nothing matches.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `match` | [`FormulaFilterMatcher`](../type-aliases/type-alias.FormulaFilterMatcher.md) | How to target the filter to update. See [FormulaFilterMatcher](../type-aliases/type-alias.FormulaFilterMatcher.md). |
| `updateFn` | (`filter`) => [`Filter`](../interfaces/interface.Filter.md) | Maps the matched filter to its replacement. |

## Returns

[`CalculatedMeasureTransformer`](../type-aliases/type-alias.CalculatedMeasureTransformer.md)

A transformer producing the updated calculated measure.

## Example

Narrow the existing filter's members to a fixed set:
```ts
const narrowed = withUpdatedFormulaFilter(DM.Category.Category, () =>
  filterFactory.members(DM.Category.Category, ['Cell Phones', 'Laptops']),
)(revenue);
```
