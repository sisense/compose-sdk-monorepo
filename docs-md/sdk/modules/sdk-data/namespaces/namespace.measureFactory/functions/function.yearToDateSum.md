---
title: yearToDateSum
---

# Function yearToDateSum

> **yearToDateSum**(`measure`, `name`?): [`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

Creates a calculated measure that calculates the running total starting from the beginning
of the year up to the current day, week, month, or quarter.

The time resolution is determined by the minimum date level of the date dimension in the query
that uses the returned measure.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `measure` | [`Measure`](../../../interfaces/interface.Measure.md) | Measure to apply the YTD Sum to |
| `name`? | `string` | Name for the new measure |

## Returns

[`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

A calculated measure instance

## Example

Calculate the running total of total cost from the Sample Ecommerce data model, starting from the
beginning of the year up to the current day, week, month, or quarter.
```ts
measureFactory.yearToDateSum(measureFactory.sum(DM.Commerce.Cost))
```
