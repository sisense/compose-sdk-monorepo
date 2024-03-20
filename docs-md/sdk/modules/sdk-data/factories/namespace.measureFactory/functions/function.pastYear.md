---
title: pastYear
---

# Function pastYear

> **pastYear**(`measure`, `name`?): [`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

Creates a calculated measure that calculates the value for the same day, week, month, or quarter in the previous year.

The time resolution is determined by the minimum date level of the date dimension in the query
that uses the returned measure.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `measure` | [`Measure`](../../../interfaces/interface.Measure.md) | Measure to apply past value to |
| `name`? | `string` | Name for the new measure |

## Returns

[`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

A calculated measure instance

## Example

Calculate total cost for the corresponding day, week, month, or quarter one year ago from the
Sample Ecommerce data model.
```ts
measureFactory.pastYear(measureFactory.sum(DM.Commerce.Cost))
```
