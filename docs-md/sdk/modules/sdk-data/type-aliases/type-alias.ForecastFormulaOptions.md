---
title: ForecastFormulaOptions
---

# Type alias ForecastFormulaOptions

> **ForecastFormulaOptions**: `object`

Forecast formula options.

## Type declaration

### `confidenceInterval`

**confidenceInterval**?: `number`

Confidence interval showing the probabilistic upper and lower limits of the
forecasted series according to the uncertainty level. The valid range is (0.8 <= X < 1).

#### Default Value

0.8

***

### `endDate`

**endDate**?: `string` \| `Date`

End date of the time series data that the forecasting model will be
trained on. This parameter can be used to discard the end of the series.
Specify a ISO 8601 date string or Date object.

***

### `forecastHorizon`

**forecastHorizon**: `number`

Number of data points to be predicted.
The accepted value range is between 1-1,000

#### Default Value

3

***

### `lowerBound`

**lowerBound**?: `number`

Expected lower limit to improve the forecast accuracy when reaching
the limit. Note that values in the confidence interval can exceed
this limit.

***

### `modelType`

**modelType**?: `"auto"` \| `"autoArima"` \| `"holtWinters"` \| `"prophet"`

Forecasting model type. The 'auto' option automatically
fits the best combination of models.

#### Default Value

"auto"

***

### `roundToInt`

**roundToInt**?: `boolean`

Boolean flag to round the predicted result to an integer if set to true.
Otherwise, the predicted result is left as a float

#### Default Value

false

***

### `startDate`

**startDate**?: `string` \| `Date`

Start date of the time series data that the forecasting model will
be trained on. This parameter can be used to discard the beginning of
the series. Specify a ISO 8601 date string or Date object.

***

### `upperBound`

**upperBound**?: `number`

Expected upper limit to improve the forecast accuracy when reaching
the limit. Note that values in the confidence interval can exceed
this limit.
