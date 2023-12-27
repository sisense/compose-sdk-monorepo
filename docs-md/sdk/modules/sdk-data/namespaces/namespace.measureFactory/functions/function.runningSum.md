---
title: runningSum
---

# Function runningSum

> **runningSum**(
  `measure`,
  `_continuous`?,
  `name`?): [`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

Creates a calculated measure that calculates the running total of a given measure.

The running sum is calculated using the current sort order of the query it's used in.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `measure` | [`Measure`](../../../interfaces/interface.Measure.md) | Measure to apply the running sum to |
| `_continuous`? | `boolean` | Boolean flag whether to accumulate the sum continuously<br />when there are two or more dimensions. The default value is false. |
| `name`? | `string` | Name for the new measure |

## Returns

[`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

A calculated measure instance

## Example

Calculate the running sum of the total cost from the Sample Ecommerce data model across all categories.
```ts
measureFactory.runningSum(measureFactory.sum(DM.Commerce.Cost)),
```

Running sum values from the Sample Ecommerce data model when categorizing by age range.
| AgeRange | Cost | Running Cost |
| --- | --- | --- |
| 0-18 | 4.32M | 4.32M |
| 19-24 | 8.66M | 12.98M |
| 25-34 | 21.19M | 34.16M |
| 35-44 | 23.64M | 57.8M |
| 45-54 | 20.39M | 78.19M |
| 55-64 | 11.82M | 90.01M |
| 65+ | 17.26M | 107.27M |
