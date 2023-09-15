---
title: aggregate
---

# Function aggregate

> **aggregate**(
  `attribute`,
  `aggregationType`,
  `name`?,
  `format`?): [`BaseMeasure`](../../../interfaces/interface.BaseMeasure.md)

Creates a basic aggregated measure.
This is a base function to build other aggregation functions (e.g., `sum`, `average`, etc)
as listed in [AggregationTypes](../../../variables/variable.AggregationTypes.md).

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `attribute` | [`Attribute`](../../../interfaces/interface.Attribute.md) | Attribute to aggregate |
| `aggregationType` | `string` | Aggregation type. See [AggregationTypes](../../../variables/variable.AggregationTypes.md) |
| `name`? | `string` | Optional name for the new measure |
| `format`? | `string` | Numeric formatting to apply |

## Returns

[`BaseMeasure`](../../../interfaces/interface.BaseMeasure.md)

A Measure instance
