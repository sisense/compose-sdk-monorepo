---
title: count
---

# Function count

> **count**(
  `attribute`,
  `name`?,
  `format`?): [`BaseMeasure`](../../../interfaces/interface.BaseMeasure.md)

Creates a count aggregation measure over the given attribute.

To count distinct values in the given attribute, use [countDistinct](function.countDistinct.md).

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

Counts the number of Commerce items from the Sample Ecommerce data model.
```ts
measureFactory.count(DM.Commerce.BrandID)
```
