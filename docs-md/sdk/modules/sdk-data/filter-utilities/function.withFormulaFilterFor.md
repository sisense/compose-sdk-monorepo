---
title: withFormulaFilterFor
---

# Function withFormulaFilterFor <Badge type="beta" text="Beta" />

> **withFormulaFilterFor**(`attribute`, `filter`): [`CalculatedMeasureTransformer`](../type-aliases/type-alias.CalculatedMeasureTransformer.md)

Returns a transformer that sets the calculated measure formula's filter for an attribute: upserts the
filter when one is provided (replacing any existing filter on the same attribute, otherwise
adding it), or removes it when `filter` is `null`.

This is the convenient primitive for driving a formula filter from a filter tile.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `attribute` | [`Attribute`](../interfaces/interface.Attribute.md) | The attribute the filter targets. |
| `filter` | [`Filter`](../interfaces/interface.Filter.md) \| `null` | The filter to set, or `null` to remove the attribute's filter. |

## Returns

[`CalculatedMeasureTransformer`](../type-aliases/type-alias.CalculatedMeasureTransformer.md)

A transformer producing the updated calculated measure.

## Example

Drive a formula filter from a filter tile — upsert on select, remove on clear:
```ts
// given a <MemberFilterTile> for DM.Category.Category and a `revenue` measure in state:
const onChange = (filter: Filter | null) =>
  setRevenue(withFormulaFilterFor(DM.Category.Category, filter)(revenue));
```
