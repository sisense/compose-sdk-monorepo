---
title: forecast
---

# Function forecast

> **forecast**(
  `measure`,
  `name`?,
  `options`?): [`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

Calculates Forecast leveraging advanced autoML techniques to generate
a forecast for a given measure.

This function offers flexibility with auto-selection of the best
statistical model or user-selected models, and it also provides control
over the time period used for training the model, as well as options to
improve forecast accuracy by supplying expected lower and upper limits.

In addition to forecast, upper and lower confidence interval is returned
with the name of the new measure and a suffix of _upper and _lower
respectively.

Forecast requires a Sisense instance version of L2023.6.0 or greater.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `measure` | [`Measure`](../../../interfaces/interface.Measure.md) | Measure to apply the forecast logic to |
| `name`? | `string` | Name for the new measure |
| `options`? | [`ForecastFormulaOptions`](../../../type-aliases/type-alias.ForecastFormulaOptions.md) | Forecast options |

## Returns

[`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

A Calculated Measure instance
