---
title: hasFormulaFilter
---

# Function hasFormulaFilter <Badge type="beta" text="Beta" />

> **hasFormulaFilter**(`measure`, `match`): `boolean`

Checks whether a calculated measure formula contains a filter matching the given target.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `measure` | `Readonly`\< [`CalculatedMeasure`](../interfaces/interface.CalculatedMeasure.md) \> | The calculated measure to check. |
| `match` | [`FormulaFilterMatcher`](../type-aliases/type-alias.FormulaFilterMatcher.md) | How to target the filter. See [FormulaFilterMatcher](../type-aliases/type-alias.FormulaFilterMatcher.md). |

## Returns

`boolean`

`true` when a matching filter is present.

## Example

```ts
hasFormulaFilter(revenue, DM.Category.Category); // true
hasFormulaFilter(revenue, DM.Commerce.Country); // false
```
