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

Note: For date attributes, only `count`, `countDistinct`, `min`, and `max` are supported, and
`min` and `max` only at levels from years to days.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `attribute` | [`Attribute`](../../../interfaces/interface.Attribute.md) | Attribute to aggregate |
| `aggregationType` | `string` | Aggregation type. See [AggregationTypes](../../../variables/variable.AggregationTypes.md) |
| `name`? | `string` | Optional name for the new measure |
| `format`? | `string` | Optional formatting to apply. A Numeral.js format string for a numeric result, or a date-fns format string when the result is a date, as a `min` or `max` over a date column is. A numeric format can only be used for explicit queries, not in charts, tables, etc. A date format is also sent with the query, so a CSV or Excel download uses it; to change what a chart or table shows, set `dateFormat` on the column. |

## Returns

[`BaseMeasure`](../../../interfaces/interface.BaseMeasure.md)

A measure instance

## Example

Calculate the total cost across all items in a category from the Sample Ecommerce data model.
```ts
measureFactory.aggregate(DM.Commerce.Cost, 'sum'),
```
