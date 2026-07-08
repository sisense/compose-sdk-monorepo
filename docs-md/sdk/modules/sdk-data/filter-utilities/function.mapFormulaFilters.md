---
title: mapFormulaFilters
---

# Function mapFormulaFilters <Badge type="beta" text="Beta" />

> **mapFormulaFilters**(`mapFn`): [`CalculatedMeasureTransformer`](../type-aliases/type-alias.CalculatedMeasureTransformer.md)

Returns a transformer that maps over every filter in a calculated measure formula's context, keeping each
filter's context key.

Returns the measure unchanged when the mapping produces no new filter reference.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `mapFn` | (`filter`, `key`) => [`Filter`](../interfaces/interface.Filter.md) | Maps each filter (and its bracketed context key) to its replacement. |

## Returns

[`CalculatedMeasureTransformer`](../type-aliases/type-alias.CalculatedMeasureTransformer.md)

A transformer producing the updated calculated measure.

## Example

Apply the same transform to every filter in the formula:
```ts
const reselected = mapFormulaFilters((filter) =>
  filterFactory.members(filter.attribute, ['Cell Phones']),
)(revenue);
```
