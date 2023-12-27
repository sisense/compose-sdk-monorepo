---
title: growthPastMonth
---

# Function growthPastMonth

> **growthPastMonth**(`measure`, `name`?): [`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

Creates a calculated measure that calculates the growth from the previous month to the current month.

The date dimension will be dynamically taken from the query that uses the returned measure.

Growth is calculated using the following formula: `(currentMonth – previousMonth) / previousMonth`.

For example, if this month the value is 12 and the previous month's value was 10, the growth for
this month is 20%, returned as '0.2' (calculation: `(12 – 10) / 10 = 0.2`).

If the previous month's value is greater than the current month, the growth will be negative.

For example, if this month the value is 80, and the previous month's was 100, the growth for
this month is -20%, returned as `-0.2` (calculation: `(80 – 100) / 100 = -0.2`).

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `measure` | [`Measure`](../../../interfaces/interface.Measure.md) | Measure to apply growth to |
| `name`? | `string` | Name for the new measure |

## Returns

[`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

A calculated measure instance

## Example

Calculate the growth in total cost this month in comparison to the previous month from the Sample
Ecommerce data model.
```ts
measureFactory.growthPastMonth(measureFactory.sum(DM.Commerce.Cost))
```
