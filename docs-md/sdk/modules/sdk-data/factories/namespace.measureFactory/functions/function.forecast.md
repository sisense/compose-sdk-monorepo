---
title: forecast
---

# Function forecast

> **forecast**(
  `measure`,
  `name`?,
  `options`?): [`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

Creates a calculated measure that generates a forecast based on a specified measure employing
advanced autoML techniques.

This function offers flexible options allowing you to:
+ Let the function auto-select the best statistical model or explicitly choose a preferred model
+ Control the time period used for training the model
+ Set additional options to improve forecast accuracy by supplying expected lower and upper limits.

In addition to the forecast, upper and lower confidence intervals are returned
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

A calculated measure instance

## Example

Calculate a forecast for total cost from the Sample Ecommerce data model from the Sample
Ecommerce data model.
```ts
measureFactory.forecast(
  measureFactory.sum(DM.Commerce.Cost),
  'Total Cost Forecast',
  {
    modelType: 'prophet',
    roundToInt: true,
  }
)
```
