---
title: growth
---

# Function growth

> **growth**(`measure`, `name`?): [`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

Creates a calculated measure that calculates growth over a period of time.

The time resolution is determined by the minimum date level of the date dimension in the query
that uses the returned measure.

Growth is calculated using the following formula: `(currentPeriod – previousPeriod) / previousPeriod`.

For example, if this period the value is 12 and the previous period's value was 10, the growth for
this period is 20%, returned as '0.2' (calculation: `(12 – 10) / 10 = 0.2`).

If the previous period's value is greater than the current period, the growth will be negative.

For example, if this period the value is 80, and the previous period's was 100, the growth for
this period is -20%, returned as `-0.2` (calculation: `(80 – 100) / 100 = -0.2`).

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `measure` | [`Measure`](../../../interfaces/interface.Measure.md) | Measure to apply growth to |
| `name`? | `string` | Name for the new measure |

## Returns

[`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

A calculated measure instance

## Example

Calculate the growth in total cost this period in comparison to the previous period from the
Sample Ecommerce data model.
```ts
measureFactory.growth(measureFactory.sum(DM.Commerce.Cost))
```
