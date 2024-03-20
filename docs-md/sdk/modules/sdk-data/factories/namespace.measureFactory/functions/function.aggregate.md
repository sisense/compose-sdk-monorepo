---
title: aggregate
---

# Function aggregate

> **aggregate**(
  `attribute`,
  `aggregationType`,
  `name`?,
  `format`?): [`BaseMeasure`](../../../interfaces/interface.BaseMeasure.md)

Creates an aggregated measure.

This is a base function to build other aggregation functions (e.g., `sum`, `average`, etc.)
as listed in [AggregationTypes](../../../variables/variable.AggregationTypes.md).

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `attribute` | [`Attribute`](../../../interfaces/interface.Attribute.md) | Attribute to aggregate |
| `aggregationType` | `string` | Aggregation type. See [AggregationTypes](../../../variables/variable.AggregationTypes.md) |
| `name`? | `string` | Optional name for the new measure |
| `format`? | `string` | Optional numeric formatting to apply using a Numeral.js format string. Can only be used for explicit queries. Cannot be used in charts, tables, etc. |

## Returns

[`BaseMeasure`](../../../interfaces/interface.BaseMeasure.md)

A measure instance

## Example

Calculate the total cost across all items in a category from the Sample Ecommerce data model.
```ts
measureFactory.aggregate(DM.Commerce.Cost, 'sum'),
```
