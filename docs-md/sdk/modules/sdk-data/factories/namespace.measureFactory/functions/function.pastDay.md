---
title: pastDay
---

# Function pastDay

> **pastDay**(`measure`, `name`?): [`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

Creates a calculated measure that calculates the value for the previous day.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `measure` | [`Measure`](../../../interfaces/interface.Measure.md) | Measure to apply past value to |
| `name`? | `string` | Name for the new measure |

## Returns

[`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

A calculated measure instance

## Example

Calculate total cost for the previous day from the Sample Ecommerce data model.
```ts
measureFactory.pastDay(measureFactory.sum(DM.Commerce.Cost))
```
