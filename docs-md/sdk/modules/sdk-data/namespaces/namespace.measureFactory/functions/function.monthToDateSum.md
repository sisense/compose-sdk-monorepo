---
title: monthToDateSum
---

# Function monthToDateSum

> **monthToDateSum**(`measure`, `name`?): [`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

Creates a calculated measure that calculates the running total starting from the beginning
of the month up to the current day or week.

The time resolution is determined by the minimum date level of the date dimension in the query
that uses the returned measure.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `measure` | [`Measure`](../../../interfaces/interface.Measure.md) | Measure to apply the MTD Sum to |
| `name`? | `string` | Name for the new measure |

## Returns

[`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

A calculated measure instance

## Example

Calculate the running total of total cost from the Sample Ecommerce data model, starting from the
beginning of the month up to the current day or week.
```ts
measureFactory.monthToDateSum(measureFactory.sum(DM.Commerce.Cost))
```
