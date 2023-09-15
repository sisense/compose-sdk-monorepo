---
title: growthRate
---

# Function growthRate

> **growthRate**(`measure`, `name`?): [`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

Calculates growth rate over time. The time dimension to be used is determined by the time resolution in the query.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `measure` | [`Measure`](../../../interfaces/interface.Measure.md) | Measure to apply the Growth rate |
| `name`? | `string` | Name for the new measure |

## Returns

[`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

A Calculated Measure instance

## Example

```ts
If this month your value is 12, and last month it was 10, your Growth Rate for this month is 12/10 = 120% (1.2).

Calculation: `12 / 10 = 1.2`

If this year your value is 80, and last year it was 100, your Growth for this year is 80/100 = 80% ( 0.8).

Calculation: `80 / 100 = 0.8`
```
