---
title: average
---

# Function average

> **average**(
  `attribute`,
  `name`?,
  `format`?): [`BaseMeasure`](../../../interfaces/interface.BaseMeasure.md)

Creates an average aggregation measure over the given attribute.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `attribute` | [`Attribute`](../../../interfaces/interface.Attribute.md) | Attribute to aggregate |
| `name`? | `string` | Optional name for the new measure |
| `format`? | `string` | Optional numeric formatting to apply using a Numeral.js format string. Can only be used for explicit queries. Cannot be used in charts, tables, etc. |

## Returns

[`BaseMeasure`](../../../interfaces/interface.BaseMeasure.md)

A measure instance

## Example

Calculate the average cost across all items in a category from the Sample Ecommerce data model.
```ts
measureFactory.average(DM.Commerce.Cost)
```
