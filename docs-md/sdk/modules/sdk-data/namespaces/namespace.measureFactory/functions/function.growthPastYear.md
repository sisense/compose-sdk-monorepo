---
title: growthPastYear
---

# Function growthPastYear

> **growthPastYear**(`measure`, `name`?): [`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

Creates a calculated measure that calculates the growth from the previous year to the current year.

The date dimension will be dynamically taken from the query that uses the returned measure.

Growth is calculated using the following formula: `(currentYear – previousYear) / previousYear`.

For example, if this year the value is 12 and the previous year's value was 10, the growth for
this year is 20%, returned as '0.2' (calculation: `(12 – 10) / 10 = 0.2`).

If the previous year's value is greater than the current year, the growth will be negative.

For example, if this year the value is 80, and the previous year's was 100, the growth for
this year is -20%, returned as `-0.2` (calculation: `(80 – 100) / 100 = -0.2`).

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `measure` | [`Measure`](../../../interfaces/interface.Measure.md) | Measure to apply growth to |
| `name`? | `string` | Name for the new measure |

## Returns

[`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

A calculated measure instance

## Example

Calculate the growth in total cost this year in comparison to the previous year from the Sample
Ecommerce data model.
```ts
measureFactory.growthPastYear(measureFactory.sum(DM.Commerce.Cost))
```
