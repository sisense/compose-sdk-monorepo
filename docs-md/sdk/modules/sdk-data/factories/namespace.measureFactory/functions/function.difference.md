---
title: difference
---

# Function difference

> **difference**(`measure`, `name`?): [`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

Creates a calculated measure that calculates the difference between this period's data
and the data from the previous period for the given measure.

The time resolution is determined by the minimum date level of the date dimension in the query
that uses the returned measure.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `measure` | [`Measure`](../../../interfaces/interface.Measure.md) | Measure to apply difference to |
| `name`? | `string` | Name for the new measure |

## Returns

[`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

A calculated measure instance

## Example

Calculate the difference between this period's total cost and the previous period's total cost
from the Sample Ecommerce data model.
```ts
measureFactory.difference(measureFactory.sum(DM.Commerce.Cost))
```
