---
title: contribution
---

# Function contribution

> **contribution**(`measure`, `name`?): [`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

Creates a calculated contribution measure.

A contribution measure calculates the contribution, in percentage, of a measure towards the total.
Percentages are expressed as a number between 0 and 1 (e.g. 42% is `0.42`).

For example, using the Sample Ecommerce data model you can retrieve the total cost of products
categorized by age range. Using a contribution measure you can calculate how much each age range's
total cost contributes to the total cost across all age ranges. So, the total cost for the 35-44
age range is 23.64M, which is 22% of the 107.27M of all age ranges together. Therefore, the
contribution of the 35-44 age range is `.22`.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `measure` | [`Measure`](../../../interfaces/interface.Measure.md) | Measure to apply the Contribution logic to |
| `name`? | `string` | Name for the new measure |

## Returns

[`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

A calculated measure instance

## Example

Calculates the percentage of the total cost across all categories for items in a category from the
Sample Ecommerce data model.
```ts
measureFactory.contribution(measureFactory.sum(DM.Commerce.Cost))
```

Contribution values from the Sample Ecommerce data model when categorizing by age range.
| AgeRange | Cost | Contribution |
| --- | --- | --- |
| 0-18 | 4.32M | 0.04 |
| 19-24 | 8.66M | 0.08 |
| 25-34 | 21.19M | 0.2 |
| 35-44 | 23.64M | 0.22 |
| 45-54 | 20.39M | 0.19 |
| 55-64 | 11.82M | 0.11 |
| 65+ | 17.26M | 0.16 |
