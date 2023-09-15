---
title: growth
---

# Function growth

> **growth**(`measure`, `name`?): [`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

Calculates growth over time. The time dimension to be used is determined by the time resolution in the query.

Formula: `(current value – compared value) / compared value`.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `measure` | [`Measure`](../../../interfaces/interface.Measure.md) | Measure to apply growth to |
| `name`? | `string` | Name for the new measure |

## Returns

[`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

A Calculated Measure instance

## Example

```ts
If this month your value is 12, and last month it was 10, your Growth for this month is 20% (0.2).

Calculation: `(12 – 10) / 10 = 0.2`

If this year your value is 80, and last year it was 100, your Growth for this year is -20% ( -0.2).

Calculation: `(80 – 100) / 100 = -0.2`
```
