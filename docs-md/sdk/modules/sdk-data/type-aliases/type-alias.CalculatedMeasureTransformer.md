---
title: CalculatedMeasureTransformer
---

# Type alias CalculatedMeasureTransformer <Badge type="beta" text="Beta" />

> **CalculatedMeasureTransformer**: (`measure`) => [`CalculatedMeasure`](../interfaces/interface.CalculatedMeasure.md)

A pure transformer over a calculated measure.

Takes a read-only measure, returns a new one, and never mutates the input, so transformers
compose with `flow` from `lodash-es/flow`.

## Example

Build a calculated measure scoped by a filter, then retarget that filter by composing
transformers with `flow`:
```ts
import flow from 'lodash-es/flow';

const revenue = measureFactory.customFormula('Filtered Revenue', '([rev], [categoryFilter])', {
  rev: measureFactory.sum(DM.Commerce.Revenue),
  categoryFilter: filterFactory.members(DM.Category.Category, ['Cell Phones']),
});

const retarget: CalculatedMeasureTransformer = flow(
  withoutFormulaFilter(DM.Category.Category),
  withAddedFormulaFilter(filterFactory.members(DM.Category.Category, ['Laptops'])),
);
const revenueForLaptops = retarget(revenue);
```

## Parameters

| Parameter | Type |
| :------ | :------ |
| `measure` | `Readonly`\< [`CalculatedMeasure`](../interfaces/interface.CalculatedMeasure.md) \> |

## Returns

[`CalculatedMeasure`](../interfaces/interface.CalculatedMeasure.md)
