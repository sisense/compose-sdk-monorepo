---
title: withAddedFormulaFilter
---

# Function withAddedFormulaFilter <Badge type="beta" text="Beta" />

> **withAddedFormulaFilter**(`filter`): [`CalculatedMeasureTransformer`](../type-aliases/type-alias.CalculatedMeasureTransformer.md)

Returns a transformer that adds a filter to a calculated measure formula, scoping the whole formula by it.

Always appends the filter as a measured-value argument and references it from the expression —
it does not replace an existing filter on the same attribute. Use [withFormulaFilterFor](function.withFormulaFilterFor.md)
for upsert semantics.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `filter` | [`Filter`](../interfaces/interface.Filter.md) | The filter to add. |

## Returns

[`CalculatedMeasureTransformer`](../type-aliases/type-alias.CalculatedMeasureTransformer.md)

A transformer producing the updated calculated measure.

## Example

Scope the whole formula by an additional filter (appended as a measured-value argument):
```ts
const highValue = withAddedFormulaFilter(
  filterFactory.greaterThan(DM.Commerce.Revenue, 1000),
)(revenue);
```
