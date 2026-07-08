---
title: withoutFormulaFilter
---

# Function withoutFormulaFilter <Badge type="beta" text="Beta" />

> **withoutFormulaFilter**(`match`): [`CalculatedMeasureTransformer`](../type-aliases/type-alias.CalculatedMeasureTransformer.md)

Returns a transformer that removes the filter(s) matching the target from a calculated measure formula,
dropping them from both the context and the expression.

Removal only happens for filters in a measured-value position (the `(measure, [filter])`
pattern); a filter in an operator position (or whose removal would leave a degenerate
expression) is left in place rather than corrupting the formula. Returns the measure unchanged
when nothing is removed.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `match` | [`FormulaFilterMatcher`](../type-aliases/type-alias.FormulaFilterMatcher.md) | How to target the filter to remove. See [FormulaFilterMatcher](../type-aliases/type-alias.FormulaFilterMatcher.md). |

## Returns

[`CalculatedMeasureTransformer`](../type-aliases/type-alias.CalculatedMeasureTransformer.md)

A transformer producing the updated calculated measure.

## Example

```ts
const unscoped = withoutFormulaFilter(DM.Category.Category)(revenue);
```
