---
title: measureBetween
---

# Function measureBetween

> **measureBetween**(
  `measure`,
  `valueA`,
  `valueB`): [`Filter`](../../../interfaces/interface.Filter.md)

Creates a filter on all measure values within a range.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `measure` | [`BaseMeasure`](../../../interfaces/interface.BaseMeasure.md) | Measure to filter by |
| `valueA` | `number` | Min value |
| `valueB` | `number` | Max value |

## Returns

[`Filter`](../../../interfaces/interface.Filter.md)

A filter representing the "between" logic
