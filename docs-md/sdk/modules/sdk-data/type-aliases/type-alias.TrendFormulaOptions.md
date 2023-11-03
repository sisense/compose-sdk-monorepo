---
title: TrendFormulaOptions
---

# Type alias TrendFormulaOptions

> **TrendFormulaOptions**: `object`

Trend formula options.

## Type declaration

### `ignoreAnomalies`

**ignoreAnomalies**?: `boolean`

Boolean flag that enables the function to automatically identify and ignore
anomalous values in the series. This can be particularly useful when you want
to maintain the integrity of your analysis by avoiding potential outliers.

#### Default Value

```ts
false
```

***

### `modelType`

**modelType**?: `"linear"` \| `"logarithmic"` \| `"advancedSmoothing"` \| `"localEstimates"`

Trend analysis model type to be used for the operation.

#### Default Value

```ts
"linear"
```
