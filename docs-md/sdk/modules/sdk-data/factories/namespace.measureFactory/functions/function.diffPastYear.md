---
title: diffPastYear
---

# Function diffPastYear

> **diffPastYear**(`measure`, `name`?): [`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

Creates a calculated measure that calculates the difference between this year's data
and the data from the previous year for the given measure.

The date dimension will be dynamically taken from the query that uses the returned measure.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `measure` | [`Measure`](../../../interfaces/interface.Measure.md) | Measure to apply difference to |
| `name`? | `string` | Name for the new measure |

## Returns

[`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

A calculated measure instance

## Example

Calculate the difference between this year's total cost and the previous year's total cost from
the Sample Ecommerce data model.
```ts
measureFactory.diffPastYear(measureFactory.sum(DM.Commerce.Cost))
```
