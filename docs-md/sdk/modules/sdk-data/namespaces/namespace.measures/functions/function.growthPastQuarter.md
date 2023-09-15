---
title: growthPastQuarter
---

# Function growthPastQuarter

> **growthPastQuarter**(`measure`, `name`?): [`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

Calculates the growth from past quarter of the given measure.
Date dimension will be dynamically taken from the query.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `measure` | [`Measure`](../../../interfaces/interface.Measure.md) | Measure to apply growth to |
| `name`? | `string` | Name for the new measure |

## Returns

[`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

A Calculated Measure instance
