---
title: min
---

# Function min

> **min**(
  `attribute`,
  `name`?,
  `format`?): [`BaseMeasure`](../../../interfaces/interface.BaseMeasure.md)

Creates a min aggregation measure over the given attribute.

Note: Numeric and date attributes are supported. For date attributes, only levels from years to
days are supported.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `attribute` | [`Attribute`](../../../interfaces/interface.Attribute.md) | Attribute to aggregate |
| `name`? | `string` | Optional name for the new measure |
| `format`? | `string` | Optional formatting to apply. A Numeral.js format string for a numeric result, or a date-fns format string when the result is a date, as a `min` or `max` over a date column is. A numeric format can only be used for explicit queries, not in charts, tables, etc. A date format is also sent with the query, so a CSV or Excel download uses it; to change what a chart or table shows, set `dateFormat` on the column. |

## Returns

[`BaseMeasure`](../../../interfaces/interface.BaseMeasure.md)

A measure instance

## Example

Calculate the minimum cost across all items in a category from the Sample Ecommerce data model.
```ts
measureFactory.min(DM.Commerce.Cost)
```
