---
title: findFormulaFilter
---

# Function findFormulaFilter <Badge type="beta" text="Beta" />

> **findFormulaFilter**(`measure`, `match`): [`Filter`](../interfaces/interface.Filter.md) \| `undefined`

Finds the first filter in a calculated measure formula matching the given target.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `measure` | `Readonly`\< [`CalculatedMeasure`](../interfaces/interface.CalculatedMeasure.md) \> | The calculated measure to search. |
| `match` | [`FormulaFilterMatcher`](../type-aliases/type-alias.FormulaFilterMatcher.md) | How to target the filter. See [FormulaFilterMatcher](../type-aliases/type-alias.FormulaFilterMatcher.md). |

## Returns

[`Filter`](../interfaces/interface.Filter.md) \| `undefined`

The matching filter, or `undefined` when none matches.

## Example

Target a filter by attribute, by predicate, or by the filter instance:
```ts
findFormulaFilter(revenue, DM.Category.Category);
findFormulaFilter(revenue, (filter) => filter.attribute.expression === '[Category.Category]');
```
