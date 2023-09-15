---
title: measuredValue
---

# Function measuredValue

> **measuredValue**(
  `measure`,
  `filters`,
  `name`?,
  `format`?): [`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

Creates a measured value with the given measure and set of filters.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `measure` | [`Measure`](../../../interfaces/interface.Measure.md) | Measure to filter |
| `filters` | [`Filter`](../../../interfaces/interface.Filter.md)[] | Filters to apply to the measure |
| `name`? | `string` | Optional name for the new measure |
| `format`? | `string` | Optional numeric formatting to apply |

## Returns

[`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

A Calculated Measure instance
