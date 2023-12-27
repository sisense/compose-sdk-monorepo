---
title: growthRate
---

# Function growthRate

> **growthRate**(`measure`, `name`?): [`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

Creates a calculated measure that calculates growth rate over a period of time.

The time resolution is determined by the minimum date level of the date dimension in the query
that uses the returned measure.

Growth rate is calculated using the following formula: `currentPeriod / previousPeriod`.

For example, if this period the value is 12 and the previous period's value was 10, the growth rate for
this period is 120%, returned as '1.2' (calculation: `12 / 10 = 1.2`).

If the previous period's value is greater than the current period, the growth rate will be less than one.

For example, if this period the value is 80, and the previous period's was 100, the growth for
this period is 80%, returned as `0.8` (calculation: `80 / 100 = .8`).

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `measure` | [`Measure`](../../../interfaces/interface.Measure.md) | Measure to apply the Growth rate |
| `name`? | `string` | Name for the new measure |

## Returns

[`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

A calculated measure instance

## Example

Calculate the growth rate in total cost this period in comparison to the previous period from the
Sample Ecommerce data model.
```ts
measureFactory.growthRate(measureFactory.sum(DM.Commerce.Cost))
```
