---
title: getFormulaFilterEntries
---

# Function getFormulaFilterEntries <Badge type="beta" text="Beta" />

> **getFormulaFilterEntries**(`measure`): `ReadonlyArray`\< *readonly* [`string`, [`Filter`](../interfaces/interface.Filter.md)] \>

Returns the `[contextKey, filter]` entries of a calculated measure formula's context.

The context key is the bracketed token (e.g. `[categoryFilter]`) used to reference the filter
from the formula expression.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `measure` | `Readonly`\< [`CalculatedMeasure`](../interfaces/interface.CalculatedMeasure.md) \> | The calculated measure to read filters from. |

## Returns

`ReadonlyArray`\< *readonly* [`string`, [`Filter`](../interfaces/interface.Filter.md)] \>

The bracketed-key/filter pairs present in the formula context.

## Example

```ts
getFormulaFilterEntries(revenue).forEach(([key, filter]) => {
  // '[categoryFilter]'  '[Category.Category]'
  console.log(key, filter.attribute.expression);
});
```
