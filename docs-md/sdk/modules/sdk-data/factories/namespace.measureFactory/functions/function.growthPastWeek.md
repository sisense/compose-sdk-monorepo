---
title: growthPastWeek
---

# Function growthPastWeek

> **growthPastWeek**(`measure`, `name`?): [`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

Creates a calculated measure that calculates the growth from the previous week to the current week.

The date dimension will be dynamically taken from the query that uses the returned measure.

Growth is calculated using the following formula: `(currentWeek – previousWeek) / previousWeek`.

For example, if this week the value is 12 and the previous week's value was 10, the growth for
this week is 20%, returned as '0.2' (calculation: `(12 – 10) / 10 = 0.2`).

If the previous week's value is greater than the current week, the growth will be negative.

For example, if this week the value is 80, and the previous week's was 100, the growth for
this week is -20%, returned as `-0.2` (calculation: `(80 – 100) / 100 = -0.2`).

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `measure` | [`Measure`](../../../interfaces/interface.Measure.md) | Measure to apply growth to |
| `name`? | `string` | Name for the new measure |

## Returns

[`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

A calculated measure instance

## Example

Calculate the growth in total cost this week in comparison to the previous week from the Sample
Ecommerce data model.
```ts
measureFactory.growthPastWeek(measureFactory.sum(DM.Commerce.Cost))
```
