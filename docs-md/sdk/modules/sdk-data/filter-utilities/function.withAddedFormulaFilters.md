---
title: withAddedFormulaFilters
---

# Function withAddedFormulaFilters <Badge type="beta" text="Beta" />

> **withAddedFormulaFilters**(`filters`): [`CalculatedMeasureTransformer`](../type-aliases/type-alias.CalculatedMeasureTransformer.md)

Returns a transformer that adds multiple filters to a calculated measure formula, scoping the whole formula
by each of them.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `filters` | [`Filter`](../interfaces/interface.Filter.md)[] | The filters to add. |

## Returns

[`CalculatedMeasureTransformer`](../type-aliases/type-alias.CalculatedMeasureTransformer.md)

A transformer producing the updated calculated measure.

## Example

```ts
const scoped = withAddedFormulaFilters([
  filterFactory.members(DM.Commerce.AgeRange, ['19-24', '25-34']),
  filterFactory.members(DM.Commerce.Gender, ['Female']),
])(revenue);
```
