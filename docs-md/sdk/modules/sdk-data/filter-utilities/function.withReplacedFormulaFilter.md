---
title: withReplacedFormulaFilter
---

# Function withReplacedFormulaFilter <Badge type="beta" text="Beta" />

> **withReplacedFormulaFilter**(`match`, `newFilter`): [`CalculatedMeasureTransformer`](../type-aliases/type-alias.CalculatedMeasureTransformer.md)

Returns a transformer that replaces the filter(s) matching the target with a new filter, keeping
the same context key so the formula expression is left untouched.

Returns the measure unchanged when nothing matches; use [withFormulaFilterFor](function.withFormulaFilterFor.md) when you
want a missing filter to be added instead.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `match` | [`FormulaFilterMatcher`](../type-aliases/type-alias.FormulaFilterMatcher.md) | How to target the filter to replace. See [FormulaFilterMatcher](../type-aliases/type-alias.FormulaFilterMatcher.md). |
| `newFilter` | [`Filter`](../interfaces/interface.Filter.md) | The replacement filter. |

## Returns

[`CalculatedMeasureTransformer`](../type-aliases/type-alias.CalculatedMeasureTransformer.md)

A transformer producing the updated calculated measure.

## Example

Swap the filter for an attribute, keeping the formula expression unchanged:
```ts
const forLaptops = withReplacedFormulaFilter(
  DM.Category.Category,
  filterFactory.members(DM.Category.Category, ['Laptops']),
)(revenue);
```
