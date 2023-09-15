---
title: runningSum
---

# Function runningSum

> **runningSum**(
  `measure`,
  `_continuous`?,
  `name`?): [`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

Returns the running total of the measure by the defined dimension
according to the current sorting order in the query.

By default, `RSUM` accumulates a measure by the sorting order of the dimension.
To accumulate by another order, the relevant measure should be added as an additional column and sorted.

Note: Filtering the `RSUM` column by Values,
filters the dimensions and recalculates the `RSUM` from the first filtered value.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `measure` | [`Measure`](../../../interfaces/interface.Measure.md) | Measure to apply the Running Sum to |
| `_continuous`? | `boolean` | Boolean flag whether to accumulate the sum continuously<br />when there are two or more dimensions. The default value is False. |
| `name`? | `string` | Name for the new measure |

## Returns

[`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

A Calculated Measure instance
