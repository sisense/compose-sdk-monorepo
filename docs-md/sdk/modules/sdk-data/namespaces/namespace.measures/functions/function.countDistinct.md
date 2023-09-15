---
title: countDistinct
---

# Function countDistinct

> **countDistinct**(
  `attribute`,
  `name`?,
  `format`?): [`BaseMeasure`](../../../interfaces/interface.BaseMeasure.md)

Creates a count distinct aggregation over the given attribute.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `attribute` | [`Attribute`](../../../interfaces/interface.Attribute.md) | Attribute to aggregate |
| `name`? | `string` | Optional name for the new measure |
| `format`? | `string` | Optional numeric formatting to apply |

## Returns

[`BaseMeasure`](../../../interfaces/interface.BaseMeasure.md)

A Measure instance
