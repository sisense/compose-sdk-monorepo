---
title: countDistinct
---

# Function countDistinct

> **countDistinct**(
  `attribute`,
  `name`?,
  `format`?): [`BaseMeasure`](../../../interfaces/interface.BaseMeasure.md)

Creates a count distinct aggregation measure over the given attribute.

To count all values in the given attribute, use [count](function.count.md).

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

Calculate the number of distinct brands from the Sample Ecommerce data model.
```ts
measureFactory.countDistinct(DM.Brand.BrandID)
```
