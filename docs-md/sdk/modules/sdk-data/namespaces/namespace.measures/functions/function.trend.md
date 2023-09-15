---
title: trend
---

# Function trend

> **trend**(
  `measure`,
  `name`?,
  `options`?): [`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

Fits a specified trend type to your measure. The trend types include linear,
logarithmic, advanced smoothing, and local estimates. It allows for an optional
feature to automatically identify and ignore anomalous values in the series.

Trend requires a Sisense instance version of L2023.6.0 or greater.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `measure` | [`Measure`](../../../interfaces/interface.Measure.md) | Measure to apply the trend logic to |
| `name`? | `string` | Name for the new measure |
| `options`? | [`TrendFormulaOptions`](../../../type-aliases/type-alias.TrendFormulaOptions.md) | Trend options |

## Returns

[`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

A Calculated Measure instance
