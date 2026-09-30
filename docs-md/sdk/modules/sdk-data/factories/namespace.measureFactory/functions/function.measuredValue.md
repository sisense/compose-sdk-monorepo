---
title: measuredValue
---

# Function measuredValue

> **measuredValue**(
  `measure`,
  `filters`,
  `name`?,
  `format`?): [`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

Creates a measured value with the given measure and set of filters.

A measured value only includes values from items that match the provided filters.

For example you can use a measured value to get a total cost for all items where the cost is greater than 100.

Note that the filters on the measured value override the filters on the query, chart, or table the
measured value is used in.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `measure` | [`Measure`](../../../interfaces/interface.Measure.md) | Measure to filter |
| `filters` | [`Filter`](../../../interfaces/interface.Filter.md)[] | Filters to apply to the measure |
| `name`? | `string` | Optional name for the new measure |
| `format`? | `string` | Optional formatting to apply. A Numeral.js format string for a numeric result, or a date-fns format string when `measure` is a date measure. A numeric format can only be used for explicit queries, not in charts, tables, etc. A date format is also sent with the query, so a CSV or Excel download uses it; to change what a chart or table shows, set `dateFormat` on the column. |

## Returns

[`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

A calculated measure instance

## Example

Calculate the total cost across all items in a category from the Sample Ecommerce data model,
where the cost is greater than 100. Additional filtering on the cost will not affect this measure.
```ts
measureFactory.measuredValue(
  measureFactory.sum(DM.Commerce.Cost),
  [filterFactory.greaterThan(DM.Commerce.Cost, 100)],
  'Cost Greater Than 100'
),
```
