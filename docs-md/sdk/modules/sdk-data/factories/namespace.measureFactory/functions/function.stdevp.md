---
title: stdevp
---

# Function stdevp

> **stdevp**(
  `attribute`,
  `name`?,
  `format`?): [`BaseMeasure`](../../../interfaces/interface.BaseMeasure.md)

Calculates the standard deviation of the given numeric attribute based on the entire population (all items).

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `attribute` | [`Attribute`](../../../interfaces/interface.Attribute.md) | Attribute to aggregate |
| `name`? | `string` | Optional name for the new measure |
| `format`? | `string` | Optional numeric formatting to apply using a Numeral.js format string. Format only applies to queries, visualizations (e.g charts) may apply their own formatting to query results. |

## Returns

[`BaseMeasure`](../../../interfaces/interface.BaseMeasure.md)

A measure instance

## Example

Calculate the standard deviation (population) of the cost attribute.
```ts
measureFactory.stdevp(DM.Commerce.Cost)
```
