---
title: getFormulaFilters
---

# Function getFormulaFilters <Badge type="beta" text="Beta" />

> **getFormulaFilters**(`measure`): [`Filter`](../interfaces/interface.Filter.md)[]

Returns all filters referenced in a calculated measure formula's context.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `measure` | `Readonly`\< [`CalculatedMeasure`](../interfaces/interface.CalculatedMeasure.md) \> | The calculated measure to read filters from. |

## Returns

[`Filter`](../interfaces/interface.Filter.md)[]

The filters present in the formula context.

## Example

```ts
const revenue = measureFactory.customFormula('Filtered Revenue', '([rev], [categoryFilter])', {
  rev: measureFactory.sum(DM.Commerce.Revenue),
  categoryFilter: filterFactory.members(DM.Category.Category, ['Cell Phones']),
});

getFormulaFilters(revenue); // [ members filter on [Category.Category] ]
```
