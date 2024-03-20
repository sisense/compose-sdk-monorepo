---
title: trend
---

# Function trend

> **trend**(
  `measure`,
  `name`?,
  `options`?): [`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

Creates a calculated measure that computes a specified trend type for a given measure.

The trend types include linear (the default), logarithmic, advanced smoothing, and local estimates.
You can also opt to automatically identify and ignore anomalous values in the series.

Trend requires a Sisense instance version of L2023.6.0 or greater.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `measure` | [`Measure`](../../../interfaces/interface.Measure.md) | Measure to apply the trend logic to |
| `name`? | `string` | Name for the new measure |
| `options`? | [`TrendFormulaOptions`](../../../type-aliases/type-alias.TrendFormulaOptions.md) | Trend options |

## Returns

[`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

A calculated measure instance

## Example

Calculate the trend in total cost from the Sample Ecommerce data model.
```ts
measureFactory.trend(
  measureFactory.sum(DM.Commerce.Cost),
  'Total Cost Trend',
  {
    modelType: 'advancedSmoothing',
    ignoreAnomalies: true,
  }
)
```
